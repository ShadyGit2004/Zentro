import UAParser from "ua-parser-js";

const parseUserAgent = (userAgent?: string) => {
  if (!userAgent) {
    return {
      browser: "Unknown",
      os: "Unknown",
      device: "Desktop",
    };
  }

  const result = new UAParser(userAgent).getResult();

  const browser = result.browser.name
    ? result.browser.version
      ? `${result.browser.name} ${result.browser.version}`
      : result.browser.name
    : "Unknown";

  const os = result.os.name
    ? result.os.version
      ? `${result.os.name} ${result.os.version}`
      : result.os.name
    : "Unknown";

  let device = "Desktop";

  if (result.device.type === "mobile") {
    device = "Mobile";
  } else if (result.device.type === "tablet") {
    device = "Tablet";
  }

  return {
    browser,
    os,
    device,
  };
};

export default parseUserAgent;
