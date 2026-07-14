import morgan from "morgan";
import { env } from "@/config";

// Custom token for response body size
morgan.token("body-size", (req: any) => {
  return req.headers["content-length"] || "0";
});

// Development format
const devFormat = ":method :url :status :response-time ms - :res[content-length]";

// Production format
const prodFormat = ":remote-addr - :remote-user [:date[clf]] \":method :url HTTP/:http-version\" :status :res[content-length] \":referrer\" \":user-agent\"";

const requestLogger = env.NODE_ENV === "development" 
  ? morgan(devFormat)
  : morgan(prodFormat);

export default requestLogger;
