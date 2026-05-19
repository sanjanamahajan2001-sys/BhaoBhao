import fs from "fs";
import path from "path";

const logFile = path.resolve("debug.log");

export const debugLog = (message, data = null) => {
  const logEntry = `[${new Date().toISOString()}] ${message} ${
    data ? JSON.stringify(data, null, 2) : ""
  }\n`;
  fs.appendFileSync(logFile, logEntry, "utf8");
};
