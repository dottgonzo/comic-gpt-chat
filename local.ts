import OpenAI from "openai";
import type { ClientOptions } from "minio";
import { initStorage } from "cloud-object-storage-lib";

const storage: {
  type: "s3" | "minio";
} & ClientOptions = {
  accessKey: process.env.STORAGE_ACCESS_KEY as string,
  secretKey: process.env.STORAGE_SECRET_KEY as string,
  endPoint: process.env.STORAGE_ENDPOINT as string,
  useSSL:
    process.env.STORAGE_USE_SSL === "no" ||
    process.env.STORAGE_USE_SSL === "false"
      ? false
      : true,
  type: process.env.STORAGE_TYPE as "s3" | "minio",
  region: process.env.STORAGE_REGION,
};
if (process.env.STORAGE_PORT) {
  storage.port = Number(process.env.STORAGE_PORT);
}

export const config = {
  webserver: {
    port: process.env.PORT ? Number(process.env.PORT) : 2365,
  },
  ai: {
    openAi: new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    }),
    chatModel: "GPT-4",
    imageModel: "dall-e-3",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "n56ergrge_rgETHergTer768",

    config: Object.freeze({
      expiresIn: process.env.TOKENEXPIRESINSECONDS
        ? Number(process.env.TOKENEXPIRESINSECONDS)
        : 60 * 60 * 24,
      issuer: process.env.ISSUER,
      audience: process.env.AUDIENCE,
    }),
  },
  database: {
    uri: process.env.MONGO_URI,
    dbName: process.env.MONGO_DBNAME,
    collection: process.env.MONGO_DEVICE_COLLECTION,
  },
  storage: initStorage(storage),
};
