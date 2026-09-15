import { promises as dns } from "dns";

const hasMailServer = async (email: string): Promise<boolean> => {
  const domain = email.split("@")[1];

  if (!domain) {
    return false;
  }

  try {
    const mxRecords = await dns.resolveMx(domain);

    return mxRecords.length > 0;
  } catch {
    return false;
  }
};

export { hasMailServer };