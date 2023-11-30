import { TPanel } from "../interfaces";
import { config } from "../local";

export async function paint(panel: TPanel) {
  console.info("painting panel", panel);
  let prompt = `Draw a single panel of a comic. The background of the panel is ${panel.background}. In this single panel you have to represent the following dialogue only between these nearby expressive actors using balloons:\n\n`;

  for (const message of panel.usersChats) {
    // prompt += `${message.nickname} (${message.content[0].lang}): ${message.content[0].text}\n`;
    prompt += `${message.character}: ${message.contents[0].text}\n`;
  }

  const createImageResponse = await config.ai.openAi.images.generate({
    model: config.ai.imageModel,
    prompt,
    n: 1,
    size: "1024x1024",
  });
  const image_url = createImageResponse.data[0].url;

  if (!image_url) {
    throw new Error("image_url not found");
  }

  // image to base64
  const response = await fetch(image_url, {
    method: "GET",
    mode: "cors",
  });
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const contentType = response.headers.get("content-type");

  console.info("image painted", image_url);

  return { image_url, contentType, buffer };
}
