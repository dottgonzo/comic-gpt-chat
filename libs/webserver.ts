import express, { Request } from "express";
import { TPanel, TMessageContent } from "../interfaces";

import { storePanelImage } from "./storage";

import { paint } from "./paint";
import {
  createPanel,
  getLastPanel,
  getPanelConversation,
  getStoryById,
  updatePanel,
  createStory,
  getStoryConversation,
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
webserver.get("/friends", async (req: Request, res) => {
  const stories = await getFriends();
  res.json({ stories });
});

webserver.post("/friends", async (req: Request, res) => {
  const stories = await addFriend();
  res.json({ stories });
});
webserver.delete("/friends", async (req: Request, res) => {
  const stories = await deleteFriend();
  res.json({ stories });
});

webserver.get("/me", async (req: Request, res) => {
  const stories = await getMe();
  res.json({ stories });
});

webserver.patch("/me", async (req: Request, res) => {
  const stories = await patchMe();
  res.json({ stories });
});

webserver.get("/stories/withme", async (req: Request, res) => {
  const stories = await getMyStories();
  res.json({ stories });
});

webserver.delete("/stories/withme", async (req: Request, res) => {
  const stories = await removeMeFromStory();
  res.json({ stories });
});

webserver.post("/story", async (req: Request, res) => {
  const story = await createStory(req.body.background);
  res.json({ id: story._id.toString() });
});
webserver.get("/story/{storyId}", async (req: Request, res) => {
  const storyConversation = await getStoryConversation(req.params.storyId);
  res.json({ conversation: storyConversation });
});
webserver.post("/story/{storyId}", async (req: Request, res) => {
  const character = (req as any).member.character;
  const memberId = (req as any).member.memberId;
  const storyId = req.params.storyId;
  if (!storyId) {
    throw new Error("StoryId not provided");
  }
  const msg = req.body as TMessageContent;
  const story = await getStoryById(storyId);
  if (!story) {
    throw new Error("Story not found");
  }

  const message = { text: msg.text, datetime: new Date() };
  const panel = await getLastPanel(storyId);
  let isSamePanel = true;
  let imageUri = "";
  if (!panel || !isSamePanel) {
    // create new panel
    const userChat = {
      character: character,
      contents: [message],
      memberId,
    };
    const conversation = {
      background: story.background,
      usersChats: [userChat],
    };
    const image = await paint(conversation);
    const imageStoredUrl = await storePanelImage(
      image.buffer,
      storyId,
      story.datetime
    );

    await createPanel(storyId, imageStoredUrl, userChat);
    imageUri = imageStoredUrl;
  } else {
    imageUri = panel.image;
    const panelMessages = await getPanelConversation(panel._id.toString());
    const userMessages = panelMessages.find((c) => c.memberId === memberId);
    if (!userMessages) {
      panelMessages.push({ character, memberId, contents: [message] });
    } else if (
      !userMessages.contents.find((c) => c.datetime === message.datetime)
    ) {
      userMessages.contents.push(message);
      const conversation = {
        background: story.background,
        usersChats: panelMessages,
      };
      const image = await paint(conversation);
      const imageStoredUrl = await storePanelImage(
        image.buffer,
        storyId,
        story.datetime
      );
      await updatePanel(storyId, panel._id.toString(), imageStoredUrl, {
        memberId,
        character,
        contents: [message],
      });
      imageUri = imageStoredUrl;
    }
  }

  res.json({ imageUri });
});
