import { config } from "../local";
import dayjs from "dayjs";
export async function storePanelImage(
  imageBuffer: Buffer,
  storyId: String,
  storyDateTime: Date
) {
  const newDate = new Date();
  const destFile = `/gcchat/${dayjs(storyDateTime).format(
    "YYYY/MM/DD"
  )}/${storyId}/${newDate.valueOf()}.image.png`;

  await config.storage.uploadBuffer({
    data: imageBuffer,
    destFile,
  });

  console.info("site stored on " + destFile);
  return destFile;
}
