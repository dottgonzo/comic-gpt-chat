import { TPanel } from "../interfaces";
import { paint } from "../libs/paint";

export async function paintOne() {
  const chat: TPanel = {
    background: "Lisboa",
    usersChats: [
      {
        character: "yellow chick",
        memberId: "123",
        contents: [
          {
            text: "fai puzza!",
            datetime: new Date(),
          },
        ],
      },
      {
        memberId: "124",

        character: "pinguino",
        contents: [
          {
            text: "oggi non mi sono lavato...",
            datetime: new Date(),
          },
        ],
      },
    ],
  };
  const painted = await paint(chat);
  console.log("painted: ", painted.image_url);
}
paintOne().catch((e) => console.log("error: ", e));
