import { TPanel } from "../interfaces";
export async function getLastPanel(panelId: string): Promise<TPanel | null> {
  const panel: TPanel = {
    background: "the Roman Colosseum",
    chat: [
      {
        nickname: "bat",
        content: [
          {
            text: "ciao mbare!",
            timestamp: new Date(),
          },
        ],
      },
      {
        nickname: "horse",
        content: [
          {
            text: "bello vederti, ma oggi sono triste...",
            timestamp: new Date(),
          },
        ],
      },
    ],
  };

  return panel;
}
export async function getPanelById(panelId: string) {
  const panel: TPanel = {
    background: "the Roman Colosseum",
    chat: [
      {
        nickname: "bat",
        content: [
          {
            text: "ciao mbare!",
            timestamp: new Date(),
          },
        ],
      },
      {
        nickname: "horse",
        content: [
          {
            text: "bello vederti, ma oggi sono triste...",
            timestamp: new Date(),
          },
        ],
      },
    ],
  };

  return panel;
}
export async function createPanel(panel: any, image_url: string) {
  //
}

export async function updatePanel(panel: any, image_url: string) {
  //
}

export async function getStoryById(storyId: string) {
  //
}
export async function createStory() {
  //
}
