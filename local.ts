import OpenAI from "openai";

export const config = {
  webserver: {
    port: process.env.PORT ? Number(process.env.PORT) : 2365,
  },
  openAi: new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  }),
  defaultModel: "GPT-4",
};
