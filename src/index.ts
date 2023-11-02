import puppeteer from "puppeteer";
import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import { PassThrough } from "node:stream";

ffmpeg.setFfmpegPath(ffmpegPath);

const width = 1920;
const height = 1080;

function later(delay) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

export const run = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.setViewport({ width, height, deviceScaleFactor: 1 });
  const stream = new PassThrough();
  await page.goto("https://developer.mozilla.org/en-US/docs/Web/CSS/animation");

  const client = await page.target().createCDPSession();

  client.on("Page.screencastFrame", async (frameObject) => {
    const buff = Buffer.from(frameObject.data, "base64");
    stream.write(buff);
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

  stream.end();

  ffmpeg({
    source: stream,
    priority: 20,
  })
    .videoCodec("libx264")
    .size("100%")
    .aspect("4:3")
    // .autopad(this.autopad.activation, this.autopad?.color)
    .inputFormat("image2pipe")
    .inputFPS(30)
    .videoCodec("libx264")
    .output("./dist/output.mp4")
    .on("end", function () {
      console.log("File has been converted succesfully");
    })
    .on("error", function (err) {
      console.log("An error occurred: " + err.message);
    })
    .on("start", function (commandLine) {
      console.log("Spawned FFmpeg with command: " + commandLine);
    })
    .on("progress", function (progress) {
      console.log("processing: " + JSON.stringify(progress) + "% done");
    })
    .run();
};
