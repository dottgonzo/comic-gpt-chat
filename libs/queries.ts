import { TPanel, TPanelUserChat } from "../interfaces";
import { db } from "./db/index";
export async function getLastPanel(storyId: string) {
  const panel = await db.panels
    .find({ story: storyId })
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
      content: usersChat.contents,
      datetime: new Date(),
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
    member: usersChat.memberId,
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

export async function getStoryConversation(storyId: string) {
  // const story = await getStoryById(storyId);
  const panels = await db.panels.find({ story: storyId });
  const panelImages: { datetime: Date; imageUrl: string }[] = [];
  for (const panel of panels) {
    panelImages.push({ datetime: panel.datetime, imageUrl: panel.image });
  }
  return panelImages;
}

export async function getStoryById(storyId: string) {
  const story = await db.stories.findById(storyId);
  if (!story) {
    throw new Error("Story not found");
  }
  return story;
}
export async function createStory(background: string) {
  const story = await db.stories.create({
    background,
    datetime: new Date(),
    language: "en",
  });
  return story;
}

export async function getPanelConversation(panelId: string) {
  const messages = await db.messages.find({ panel: panelId });
  if (!messages) {
    throw new Error("Panel not found");
  }

  const usersChats: TPanelUserChat[] = [];
  for (const message of messages) {
    const userChat = usersChats.find((c) => c.memberId === message.member);
    if (!userChat) {
      usersChats.push({
        character: message.character,
        contents: [{ text: message.text, datetime: message.datetime }],
        memberId: message.member,
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
