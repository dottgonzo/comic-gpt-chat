import express, { Request } from "express";
import { TPanel, TMessageContent, TToken } from "../interfaces";

import { storePanelImage } from "./storage";
import { config } from "../local";
import cors from "cors";

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
  getPanel4MemberById,
} from "./queries";

export const webserver = express();
webserver.options("*", cors());
webserver.use(
  cors({
    credentials: true,
    origin: "*",
  })
);
webserver.get("/ping", (req, res) => {
  res.json({ pong: true });
});

webserver.use(express.json());

webserver.use(async (req: any, res, next) => {
  let authorization = req.headers.authorization;
  if (authorization) {
    if (authorization.split(" ").length === 2) {
      authorization = req.headers.authorization?.split?.(" ")?.[1];
    }
  } else {
    authorization = req.query?.authorization;
  }

  if (authorization) {
    try {
      const tokenContent = (await config.jwt.verify(authorization)) as TToken;
      req.member = { member_id: tokenContent.member_id };
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
  const member_id = (req as any).member.member_id;

  const stories = await getPublicStories(member_id);
  res.json({ stories });
});
webserver.get("/stories/withme", async (req: Request, res) => {
  const member_id = (req as any).member.member_id;

  const stories = await getMyStories(member_id);
  res.json({ stories });
});

webserver.post("/story", async (req: Request, res) => {
  const member_id = (req as any).member.member_id;
  const { character, background } = req.body as {
    character: string;
    background: string;
  };

  const story = await createStory(member_id, character, background);
  res.json({ id: story._id.toString() });
});

webserver.post("/story/:storyId/join", async (req: Request, res) => {
  const member_id = (req as any).member.member_id;
  const { character } = req.body;
  await joinStory(req.params.storyId, member_id, character);
  res.json({ ok: true });
});

webserver.delete("/story/:storyId", async (req: Request, res) => {
  const member_id = (req as any).member.member_id;
  const { storyId } = req.body;
  await removeMeFromStory(storyId, member_id);
  res.json({ ok: true });
});

webserver.get("/story/:storyId", async (req: Request, res) => {
  try {
    const storyConversation = await getStoryConversation(req.params.storyId);
    res.json({ conversation: storyConversation });
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});
webserver.post("/story/:storyId/panel", async (req: Request, res) => {
  const member_id = (req as any).member.member_id;
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
  const storyMember = storyMembers.find(
    (m) => m.member.toString() === member_id
  );
  if (!storyMember) {
    throw new Error("Member not in story");
  }

  const message = { text: msg.text, datetime: new Date() };
  const panel = await getLastPanel(storyId);
  let isSamePanel = false;
  let imageUri = "";
  if (!panel || !isSamePanel) {
    // create new panel
    const userChat = {
      character: storyMember.character,
      contents: [message],
      member_id,
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
    const userMessages = panelMessages.find((c) => c.member_id === member_id);
    if (!userMessages) {
      panelMessages.push({
        character: storyMember.character,
        member_id,
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
        member_id,
        character: storyMember.character,
        contents: [message],
      });
      imageUri = imageStoredUrl;
    }
  }

  res.json({ imageUri });
});
webserver.get(
  "/story/:storyId/panels/:panelId/image",
  async (req: Request, res) => {
    const member_id = (req as any).member.member_id;
    const panel = await getPanel4MemberById(req.params.panelId, member_id);

    const presign = await config.storage.getPresigned({
      path: panel.image,
    });

    res.redirect(presign.presignedUrl);
  }
);
