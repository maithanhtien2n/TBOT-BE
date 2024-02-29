const fs = require("fs");
require("dotenv").config();
const OpenAI = require("openai");
const { throwError } = require("./index");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY.replace(/@/g, ""),
});

const onRenderPath = (folder, fileName) => {
  return `uploads/${folder}/${Date.now()}$${fileName}`;
};

const convertTimestampToDateTimeString = (timestamp) => {
  // Tạo đối tượng Date từ timestamp (được nhân với 1000 để chuyển đổi sang đơn vị mili giây)
  const date = new Date(timestamp * 1000);

  // Lấy thông tin ngày, tháng, năm, giờ, phút, giây
  const day = date.getDate();
  const month = date.getMonth() + 1; // Tháng trong đối tượng Date bắt đầu từ 0
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();

  // Format thành chuỗi ngày tháng năm giờ phút giây
  const formattedString = `${day}/${month}/${year} ${hours}:${minutes}`;

  // Trả về chuỗi ngày tháng năm giờ phút giây
  return formattedString;
};

module.exports = {
  chatBot: async ({ threadId, userMessage, assistantId }) => {
    try {
      await openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: userMessage,
      });

      const run = await openai.beta.threads.runs.create(threadId, {
        assistant_id: assistantId,
      });

      let status = await openai.beta.threads.runs.retrieve(threadId, run.id);

      // Kiểm tra xem "run" đã hoàn thành chưa
      while (status.status === "in_progress") {
        // Đợi một khoảng thời gian trước khi kiểm tra lại
        await new Promise((resolve) => setTimeout(resolve, 1000));
        status = await openai.beta.threads.runs.retrieve(threadId, run.id);
      }

      const messages = await openai.beta.threads.messages.list(threadId);

      return messages.data.map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content[0].text.value,
        createdAt: convertTimestampToDateTimeString(message.created_at),
      }));
    } catch (error) {
      throw error;
    }
  },

  getAssistant: async (id) => {
    try {
      if (!id) {
        throwError("ID_REQUIRED_ASSISTANT", "Yêu cầu id Assistant!");
      }

      const assistant = await openai.beta.assistants.retrieve(id);

      return assistant;
    } catch (error) {
      throw error;
    }
  },

  saveAssistant: async ({ id = null, name, instructions, files = [] }) => {
    try {
      let assistant;
      let fileIds = [];

      if (files.length) {
        for (const item of files) {
          const path = onRenderPath("file", item.name);

          if (item.base64.split("-")[0] === "file") {
            fileIds.push(item.base64);
          } else {
            fs.writeFileSync(path, Buffer.from(item.base64, "base64"));

            try {
              const file = await openai.files.create({
                file: fs.createReadStream(path),
                purpose: "assistants",
              });

              fileIds.push(file.id);
            } catch (fileCreationError) {
              throwError("ERROR_CREATION_FILE", "Lỗi khi tạo tệp tin!");
            } finally {
              // Xóa tệp tin sau khi tạo
              fs.unlinkSync(path);
            }
          }
        }
      }

      if (id) {
        try {
          const assistants = await openai.beta.assistants.retrieve(id);
          const deleteFileIds = assistants.file_ids.filter(
            (fileId) => !fileIds.includes(fileId)
          );

          if (deleteFileIds.length) {
            for (const fileId of deleteFileIds) {
              try {
                await openai.files.del(fileId);
              } catch (deleteFileError) {
                throwError("ERROR_DELETING_FILE", "Lỗi khi xóa tệp tin!");
              }
            }
          }
        } catch (error) {
          throw error;
        }

        try {
          assistant = await openai.beta.assistants.update(id, {
            name,
            instructions,
            tools: [{ type: "code_interpreter" }],
            model: "gpt-3.5-turbo",
            file_ids: fileIds,
          });
        } catch (error) {
          throw error;
        }
      } else {
        try {
          assistant = await openai.beta.assistants.create({
            name,
            instructions,
            tools: [{ type: "code_interpreter" }],
            model: "gpt-3.5-turbo",
            file_ids: fileIds,
          });
        } catch (error) {
          throw error;
        }
      }

      return assistant;
    } catch (error) {
      throw error;
    }
  },

  getThread: async (id) => {
    try {
      const messages = await openai.beta.threads.messages.list(id);

      return messages.data.map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content[0].text.value,
        createdAt: convertTimestampToDateTimeString(message.created_at),
      }));
    } catch (error) {
      throw error;
    }
  },

  createThread: async () => {
    try {
      const thread = await openai.beta.threads.create();

      return thread;
    } catch (error) {
      throw error;
    }
  },

  deleteThread: async (id) => {
    try {
      if (!id) {
        throwError("ID_REQUIRED_THREAD", "Yêu cầu id Thread!");
      }
      const thread = await openai.beta.threads.del(id);

      return thread;
    } catch (error) {
      throw error;
    }
  },

  getFileInfo: async (fileIds) => {
    const fileInfoArray = [];

    for (const fileId of fileIds) {
      try {
        const file = await openai.files.retrieve(fileId);
        fileInfoArray.push({
          name: file.filename.split("$")[1],
          base64: file.id,
        });
      } catch (error) {
        console.error(`Lỗi khi lấy thông tin file với id ${fileId}:`, error);
      }
    }

    return fileInfoArray;
  },

  createImage: async (prompt) => {
    try {
      const response = await openai.images.generate({
        model: "dall-e-2",
        prompt,
        n: 2,
        size: "1024x1024",
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  convertTextToSpeech: async (input, voice = "alloy") => {
    try {
      const speechFile = onRenderPath("audio", "speech.mp3");

      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice, // alloy, echo, fable, onyx, nova, and shimmer
        input,
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      await fs.promises.writeFile(speechFile, buffer);

      return speechFile;
    } catch (error) {
      throw error;
    }
  },
};
