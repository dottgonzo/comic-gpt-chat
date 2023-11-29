import { TPanel } from "../interfaces";
import { paint } from "../libs/paint";

export async function paintOne() {
  const chat: TPanel = {
    background: "Catania - Piazza Duomo",
    usersChats: [
      {
        character: "Mammut",
        memberId: "123",
        contents: [
          {
            text: "Update Milano?",
            datetime: new Date(),
          },
        ],
      },
      {
        memberId: "124",
        character: "Walrus",
        contents: [
          {
            text: "Subito Bedda!!!",
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
