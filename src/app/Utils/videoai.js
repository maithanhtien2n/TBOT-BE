require("dotenv").config();
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffprobePath = require("@ffprobe-installer/ffprobe").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);
var videoshow = require("videoshow");
const { throwError, onRenderPath, formatDate } = require("./index");
const { downloadImages, deleteFiles } = require("./dowload");

const { botVersatile, createImage, convertTextToSpeech } = require("./openai");

const HOST = process.env.HOST_BE;

module.exports = {
  renderVideo: async ({ accountId, messages, systemBotVideo }) => {
    try {
      const contentResult = await botVersatile({
        accountId,
        messages: [
          ...[{ role: "system", content: systemBotVideo }],
          ...messages,
        ],
        dateTime: false,
      });

      const convertContentToArray = contentResult.result.content.split("$");

      const imageUrls = await createImage({
        accountId,
        prompt: convertContentToArray[3],
        quantity: 4,
      });

      const audioPath = await convertTextToSpeech({
        accountId,
        input: convertContentToArray[convertContentToArray.length - 1].includes(
          ":"
        )
          ? convertContentToArray[convertContentToArray.length - 1].split(
              ":"
            )[1]
          : convertContentToArray[convertContentToArray.length - 1],
      });

      const images = await downloadImages(imageUrls.map(({ url }) => url));
      const outputFilePath = onRenderPath("video", "video.mp4");

      const videoOptions = {
        fps: 25,
        loop: 7, // seconds
        transition: true,
        transitionDuration: 1, // seconds
        videoBitrate: 1024,
        videoCodec: "libx264",
        size: "640x?",
        audioBitrate: "128k",
        audioChannels: 2,
        format: "mp4",
        pixelFormat: "yuv420p",
      };

      await new Promise((resolve, reject) => {
        videoshow(images, videoOptions)
          .audio(audioPath)
          .save(outputFilePath)
          .on("start", function (command) {})
          .on("error", function (err, stdout, stderr) {
            console.error("Error during video creation", err);
            reject(err);
          })
          .on("end", function (output) {
            resolve(output);
          });
      });

      await deleteFiles(images);

      const result = {
        type: "VIDEO",
        result: {
          role: "assistant",
          content: convertContentToArray[1] + convertContentToArray[2],
          video: `${HOST}/${outputFilePath}`,
          createdAt: formatDate(new Date(), true),
        },
      };

      return result;
    } catch (error) {
      throw error;
    }
  },
};
