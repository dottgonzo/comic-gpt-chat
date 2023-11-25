import { TPanel } from "../interfaces";
import { config } from "../local";

export async function paint(panel: TPanel) {
  let prompt = `Draw a single panel of a comic. The background of the panel is ${panel.background}. In this single panel you have to represent the following dialogue only between these nearby expressive actors using balloons:\n\n`;

  for (const message of panel.chat) {
    // prompt += `${message.nickname} (${message.content[0].lang}): ${message.content[0].text}\n`;
    prompt += `${message.nickname}: ${message.content[0].text}\n`;
  }

  const createImageResponse = await config.openAi.images.generate({
    model: "dall-e-3",
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

  return { image_url, contentType, buffer };
}
