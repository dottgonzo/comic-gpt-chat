import dayjs from "dayjs";
import { TPanel, TPanelUserChat } from "../interfaces";
import { db } from "./db/index";
export async function getLastPanel(storyId: string) {
  const panel = await db.panels
    .find({
      story: storyId,
      datetime: { $gte: dayjs().subtract(90, "seconds") },
    })
    .limit(1)
    .sort({ datetime: -1 });

  return panel?.[0];
}

export async function createPanel(
  storyId: string,
  image_url: string,
  usersChat: TPanelUserChat
) {
  const newPanel = await db.panels.create({
    story: storyId,
    image: image_url,
    datetime: new Date(),
  });
  try {
    await db.messages.create({
      member: usersChat.member_id,
      text: usersChat.contents[0].text,
      datetime: usersChat.contents[0].datetime,
      character: usersChat.character,
      story: storyId,
      panel: newPanel._id,
    });
  } catch (e: any) {
    await db.panels.findByIdAndDelete(newPanel._id);
    throw e;
  }
  return newPanel;
}

export async function updatePanel(
  storyId: string,
  panelId: string,
  image_url: string,
  usersChat: TPanelUserChat
) {
  await db.messages.create({
    text: usersChat.contents[0].text,
    datetime: new Date(),
    story: storyId,
    panel: panelId,
    member: usersChat.member_id,
    character: usersChat.character,
  });
  const updatedPAnel = await db.panels.findByIdAndUpdate(
    panelId,
    { $set: { image_url } },
    { new: true }
  );
  if (!updatedPAnel) {
    throw new Error("Panel not found");
  }

  return updatedPAnel;
}

export async function removeMeFromStory(storyId: string, memberId: string) {
  await db.storyMembers.findOneAndDelete({
    story: storyId,
    member: memberId,
  });
  const storyMembers = await db.storyMembers.find({ story: storyId }).lean();
  if (!storyMembers?.length) {
    await db.stories.findByIdAndDelete(storyId);
  }

  return true;
}
export async function getPublicStories(opts?: {
  limit?: number;
  take?: number;
  sort?: string;
}) {
  const storyMembers = await db.storyMembers.find({}).lean();
  const stories = await db.stories
    .find({
      public: true,
    })
    .sort({ [opts?.sort || "datetime"]: -1 })
    .limit(opts?.limit || 10)
    .lean();
  for (const story of stories) {
    const panels = await db.panels
      .find({ story: story._id }, { _id: true })
      .lean();
    if (panels[0]) {
      (story as unknown as any).image =
        `/stories/${story._id}/panels/${panels[0]._id}/image`;
    }
    (story as unknown as any).panelsCount = panels.length;
  }
  return stories;
}
export async function getMyStories(
  memberId: string,
  opts?: { limit?: number; take?: number; sort?: string }
) {
  const storyMembers = await db.storyMembers.find({ member: memberId }).lean();
  const stories = await db.stories
    .find({
      _id: { $in: storyMembers.map((sm) => sm.story) },
    })
    .sort({ [opts?.sort || "datetime"]: -1 })
    .limit(opts?.limit || 10)
    .lean();
  for (const story of stories) {
    const panels = await db.panels
      .find({ story: story._id }, { _id: true })
      .lean();
    if (panels[0]) {
      (story as unknown as any).image =
        `/stories/${story._id}/panels/${panels[0]._id}/image`;
    }
    (story as unknown as any).panelsCount = panels.length;
  }
  return stories;
}

export async function getStoryConversation(storyId: string) {
  // const story = await getStoryById(storyId);
  if (!storyId || storyId.length < 24) {
    throw new Error("StoryId not provided");
  }
  const panels = await db.panels.find({ story: storyId }).lean();
  const panelImages: { datetime: Date; imageUrl: string; _id: string }[] = [];
  for (const panel of panels) {
    panelImages.push({
      datetime: panel.datetime,
      imageUrl: panel.image,
      _id: panel._id.toString(),
    });
  }
  return panelImages;
}

export async function getStoryMembers(storyId: string) {
  const storyMembers = await db.storyMembers.find({ story: storyId }).lean();
  if (!storyMembers?.length) {
    throw new Error("storyMembers not found");
  }
  return storyMembers;
}

export async function getStoryById(storyId: string) {
  const story = await db.stories.findById(storyId).lean();
  if (!story) {
    throw new Error("Story not found");
  }
  return story;
}
export async function createStory(
  memberId: string,
  character: string,
  background: string
) {
  const story = await db.stories.create({
    background,
    datetime: new Date(),
    language: "en",
  });
  await db.storyMembers.create({
    member: memberId,
    story: story._id,
    datetime: new Date(),
    character,
  });
  return story;
}
export async function joinStory(
  storyId: string,
  memberId: string,
  character: string
) {
  await db.storyMembers.create({
    member: memberId,
    story: storyId,
    datetime: new Date(),
    character,
  });
  return true;
}
export async function getPanelConversation(panelId: string) {
  const messages = await db.messages.find({ panel: panelId }).lean();
  if (!messages) {
    throw new Error("Panel not found");
  }

  const usersChats: TPanelUserChat[] = [];
  for (const message of messages) {
    const userChat = usersChats.find((c) => c.member_id === message.member);
    if (!userChat) {
      usersChats.push({
        character: message.character,
        contents: [{ text: message.text, datetime: message.datetime }],
        member_id: message.member,
      });
    } else {
      if (!userChat.contents.find((c) => c.datetime === message.datetime)) {
        userChat.contents.push({
          text: message.text,
          datetime: message.datetime,
        });
      }
    }
  }

  return usersChats;
}

export async function getPanel4MemberById(panelId: string, member_id: string) {
  const panel = await db.panels.findById(panelId).lean();
  if (!panel) {
    throw new Error("Panel not found");
  }
  const story = await db.stories.findById(panel.story).lean();
  if (!story) {
    throw new Error("Story not found");
  }
  if (!story.public) {
    const storyMember = await db.storyMembers
      .findOne({ story: panel.story, member: member_id })
      .lean();
    if (!storyMember) {
      throw new Error("Story not found");
    }
  }

  if (!panel) {
    throw new Error("Panel not found");
  }

  return panel;
}
