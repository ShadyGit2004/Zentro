export interface RegisterPayload {
  displayName: string;
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  data: {
    _id: string;
    email: string;
    username: string;
    displayName: string;
    authProviders: string[];
  };
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;
    user: {
      _id: string;
      email: string;
      username: string;
      displayName: string;
      profileImage?: string;
    };
  };
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  data: {
    message: string;
  };
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  data: {
    message: string;
  };
}