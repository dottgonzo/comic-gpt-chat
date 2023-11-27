import express, { Request } from "express";
import { TPanel, TMessageContent, TToken } from "../interfaces";

import { storePanelImage } from "./storage";
import { config } from "../local";

import { paint } from "./paint";
import {
  createPanel,
  getLastPanel,
  getPanelConversation,
  getStoryById,
  updatePanel,
  createStory,
  getStoryConversation,
  getStoryMembers,
  getMyStories,
  removeMeFromStory,
  joinStory,
  getPublicStories,
} from "./queries";

export const webserver = express();

webserver.get("/ping", (req, res) => {
  res.json({ pong: true });
});

webserver.use(express.json());

webserver.use(async (req, res, next) => {
  const token = req.headers.authorization?.split?.(" ")?.[1];
  if (token) {
    try {
      (req as any).member = (await config.jwt.verify(token)) as TToken;
    } catch (e) {
      next(e);
    }
    next();
  } else {
    next(new Error("No token provided"));
  }
});

// webserver.get("/friends", async (req: Request, res) => {
//   const stories = await getFriends();
//   res.json({ stories });
// });

// webserver.post("/friends", async (req: Request, res) => {
//   const stories = await addFriend();
//   res.json({ stories });
// });
// webserver.delete("/friends", async (req: Request, res) => {
//   const stories = await deleteFriend();
//   res.json({ stories });
// });

// webserver.get("/me", async (req: Request, res) => {
//   const stories = await getMe();
//   res.json({ stories });
// });

// webserver.patch("/me", async (req: Request, res) => {
//   const stories = await patchMe();
//   res.json({ stories });
// });
webserver.get("/stories", async (req: Request, res) => {
  const memberId = (req as any).member.memberId;

  const stories = await getPublicStories(memberId);
  res.json({ stories });
});
webserver.get("/stories/withme", async (req: Request, res) => {
  const memberId = (req as any).member.memberId;

  const stories = await getMyStories(memberId);
  res.json({ stories });
});

webserver.post("/story", async (req: Request, res) => {
  const memberId = (req as any).member.memberId;
  const { character, background } = req.body as {
    character: string;
    background: string;
  };

  const story = await createStory(memberId, character, background);
  res.json({ id: story._id.toString() });
});

webserver.post("/story/{storyId}/join", async (req: Request, res) => {
  const memberId = (req as any).member.memberId;
  const { character } = req.body;
  await joinStory(req.params.storyId, memberId, character);
  res.json({ ok: true });
});

webserver.delete("/story/{storyId}", async (req: Request, res) => {
  const memberId = (req as any).member.memberId;
  const { storyId } = req.body;
  await removeMeFromStory(storyId, memberId);
  res.json({ ok: true });
});

webserver.get("/story/{storyId}", async (req: Request, res) => {
  const storyConversation = await getStoryConversation(req.params.storyId);
  res.json({ conversation: storyConversation });
});
webserver.post("/story/{storyId}/panel", async (req: Request, res) => {
  const memberId = (req as any).member.memberId;
  const storyId = req.params.storyId;
  if (!storyId) {
    throw new Error("StoryId not provided");
  }
  const msg = req.body as TMessageContent;
  const story = await getStoryById(storyId);
  const storyMembers = await getStoryMembers(storyId);
  if (!story) {
    throw new Error("Story not found");
  }
  const storyMember = storyMembers.find((m) => m.member === memberId);
  if (!storyMember) {
    throw new Error("Member not in story");
  }

  const message = { text: msg.text, datetime: new Date() };
  const panel = await getLastPanel(storyId);
  let isSamePanel = true;
  let imageUri = "";
  if (!panel || !isSamePanel) {
    // create new panel
    const userChat = {
      character: storyMember.character,
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
      panelMessages.push({
        character: storyMember.character,
        memberId,
        contents: [message],
      });
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
        character: storyMember.character,
        contents: [message],
      });
      imageUri = imageStoredUrl;
    }
  }

  res.json({ imageUri });
});
