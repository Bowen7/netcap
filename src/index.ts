import puppeteer from "puppeteer";
import fs from "node:fs";

const width = 1920;
const height = 1080;

function later(delay) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

export const run = async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      //   "--no-sandbox",
      //   // "--start-fullscreen",
      //   "--disable-gpu",
      `--window-size=${width},${height}`,
      //   "--disable-setuid-sandbox",
      //   `--ozone-override-screen-size=${width},${height}`,
      //   "--headless=new",
      "--start-maximized",
    ],
  });
  const page = await browser.newPage();
  page.setViewport({ width, height, deviceScaleFactor: 1 });
  console.log(page.viewport());
  await page.goto("https://developer.mozilla.org/en-US/docs/Web/CSS/animation");

  const client = await page.target().createCDPSession();

  client.on("Page.screencastFrame", async (frameObject) => {
    // Do what you want with frame, ex write to file on disk
    const buff = Buffer.from(frameObject.data, "base64");
    fs.writeFileSync(Date.now() + ".png", buff);
    await client.send("Page.screencastFrameAck", {
      sessionId: frameObject.sessionId,
    });
  });

  // When you want to start
  await client.send("Page.startScreencast", {
    format: "jpeg",
    quality: 100,
    maxWidth: 1920,
    maxHeight: 1280,
    everyNthFrame: 1,
  });

  await later(5000);

  await client.send("Page.stopScreencast");
  await browser.close();
};
