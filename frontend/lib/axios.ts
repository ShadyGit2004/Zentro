// import axios from "axios";

// const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL,
//   withCredentials: true, 
// });

// let accessToken: string | null = null;

// export const setAccessToken = (token: string | null) => {
//   accessToken = token;
// };

// api.interceptors.request.use((config) => {
//   if (accessToken) {
//     config.headers.Authorization = `Bearer ${accessToken}`;
//   }

//   return config;
// });

// let isRefreshing = false;

// let failedQueue: {
//   resolve: (token: string) => void;
//   reject: (error: unknown) => void;
// }[] = [];

// const processQueue = (
//   error: unknown,
//   token: string | null = null
// ) => {
//   failedQueue.forEach((request) => {
//     if (error) {
//       request.reject(error);
//     } else if (token) {
//       request.resolve(token);
//     }
//   });

//   failedQueue = [];
// };

// api.interceptors.response.use((response) => response, async (error) => {
//     const originalRequest = error.config;

//     if (
//       error.response?.status !== 401 ||
//       originalRequest?._retry ||
//       originalRequest?.url?.includes("/auth/refresh")
//     ) {
//       return Promise.reject(error);
//     }

//     if (isRefreshing) {
//       return new Promise((resolve, reject) => {
//         failedQueue.push({
//           resolve: (token) => {
//             originalRequest.headers.Authorization =
//               `Bearer ${token}`;

//             resolve(api(originalRequest));
//           },
//           reject,
//         });
//       });
//     }

//     originalRequest._retry = true;
//     isRefreshing = true;

//     try {
//       const response = await axios.post(
//         `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
//         {},
//         {
//           withCredentials: true,
//         }
//       );

//       const newToken =
//         response.data.data.accessToken;

//       setAccessToken(newToken);

//       processQueue(null, newToken);

//       originalRequest.headers.Authorization =
//         `Bearer ${newToken}`;

//       return api(originalRequest);
//     } catch (refreshError) {
//       processQueue(refreshError, null);
//       setAccessToken(null);

//       return Promise.reject(refreshError);
//     } finally {
//       isRefreshing = false;
//     }
//   }
// );

// export default api;




import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

/**
 * Single shared refresh request.
 *
 * If refresh is already running, every caller waits
 * for the same promise instead of sending another request.
 */
let refreshPromise: Promise<{
  accessToken: string;
  user: any;
}> | null = null;

let refreshFailed = false;

export const resetRefreshState = () => {
  refreshFailed = false;
};

export const refreshAccessToken = async () => {
  if (refreshFailed) {
    throw new Error("Session refresh failed");
  }

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = axios
    .post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
      {},
      {
        withCredentials: true,
      }
    )
    .then((response) => {
      const data = response.data.data;

      setAccessToken(data.accessToken);

      refreshFailed = false;

      return {
        accessToken: data.accessToken,
        user: data.user,
      };
    })
    .catch((error) => {
      refreshFailed = true;
      setAccessToken(null);

      throw error;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      originalRequest?._retry ||
      originalRequest?.url?.includes("/auth/refresh") ||
      refreshFailed
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newToken = await refreshAccessToken();

      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      setAccessToken(null);

      return Promise.reject(refreshError);
    }
  }
);

export default api;