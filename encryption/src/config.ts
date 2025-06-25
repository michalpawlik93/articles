import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

type Config = {
  ENCRYPTION_KEY: string;
};

function loadConfig(): Config {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  dotenv.config({ path: path.join(__dirname, ".env") });

  const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

  if (!ENCRYPTION_KEY) {
    throw new Error("ENCRYPTION_KEY environment variable is not set.");
  }

  return { ENCRYPTION_KEY };
}

export { loadConfig, Config };
