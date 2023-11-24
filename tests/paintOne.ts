import { TPanel } from "../interfaces";
import { paint } from "../libs/paint";

export async function paintOne() {
  const chat: TPanel = {
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
  const painted = await paint(chat);
  console.log("painted: ", painted.image_url);
}
paintOne().catch((e) => console.log("error: ", e));
