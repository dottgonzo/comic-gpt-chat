import { config } from "../local";
import dayjs from "dayjs";
export async function storePanelImage(
  imageBuffer: Buffer,
  storyId: String,
  storyDateTime: Date,
  panelId: String
) {
  const destFile = `/gcchat/${dayjs(storyDateTime).format(
    "YYYY/MM/DD"
  )}/${storyId}/${panelId}.image.png`;

  await config.storage.uploadBuffer({
    data: imageBuffer,
    destFile,
  });

  console.info("site stored on " + destFile);
}
