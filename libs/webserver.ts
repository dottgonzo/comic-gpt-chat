import express, { Request } from "express";
import { TPanel, TMessageContent } from "../interfaces";

import { paint } from "./paint";
import {
  createPanel,
  getLastPanel,
  getPanelById,
  updatePanel,
} from "./queries";

export const webserver = express();

webserver.get("/ping", (req, res) => {
  res.json({ pong: true });
});

webserver.use(express.json());

// webserver.post("/story/paint-one", async (req, res) => {
//   const { chat } = req.body as {
//     chat: TPanel;
//   };
//   const image = await paint(chat);
//   res.json({ image: image.image_url });
// });
webserver.post("/story", async (req: Request, res) => {
  res.json({ id: "" });
});
webserver.get("/story/{storyId}", async (req: Request, res) => {
  res.json({ id: "" });
});
webserver.post("/story/{storyId}", async (req: Request, res) => {
  const character = (req as any).user.character;

  const msg = req.body as TMessageContent;
  const message = { text: msg.text, timestamp: new Date() };
  const storyId = req.params.storyId;
  let panel = await getLastPanel(storyId);
  let isSamePanel = true;
  let imageUri = "";
  if (!panel || !isSamePanel) {
    panel = {
      background: "the Roman Colosseum",
      chat: [{ nickname: character, content: [message] }],
    };
    const image = await paint(panel);
    imageUri = image.image_url;

    await createPanel(panel, image.image_url);
  } else {
    const userMessages = panel.chat.find((c) => c.nickname === character);
    if (!userMessages) {
      panel.chat.push({ nickname: character, content: [message] });
    } else {
      for (const chat of panel.chat) {
        if (chat.nickname === character) {
          chat.content.push(message);
        }
      }
      const image = await paint(panel);
      imageUri = image.image_url;
      await updatePanel(panel, imageUri);
    }
  }

  res.json({ imageUri });
});
