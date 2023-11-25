import { TPanel } from "../interfaces";
import { paint } from "../libs/paint";

export async function paintOne() {
  const chat: TPanel = {
    background: "Lisboa",
    chat: [
      {
        nickname: "yellow chick",
        content: [
          {
            text: "fai puzza!",
            timestamp: new Date(),
          },
        ],
      },
      {
        nickname: "pinguino",
        content: [
          {
            text: "oggi non mi sono lavato...",
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
