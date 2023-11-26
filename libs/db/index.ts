import type { ConnectOptions } from "mongoose";

import initMongo from "nodemongooselib";
import stories from "./stories";
import panels from "./panels";
import members from "./members";
import messages from "./messages";
export let db: {
  stories: typeof stories;
  members: typeof members;
  panels: typeof panels;
  messages: typeof messages;
};

export async function initDb(config: {
  uri?: string;
  options?: ConnectOptions;
}) {
  await initMongo(config);
  if (!db)
    db = {
      stories,
      members,
      panels,
      messages,
    };
}
