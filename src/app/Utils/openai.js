const fs = require("fs");
require("dotenv").config();
const OpenAI = require("openai");
const {
  throwError,
  formatDate,
  onRenderPath,
  convertTimestampToDateTimeString,
} = require("./index");

const { Account } = require("../Models/Account");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY.replace(/@/g, ""),
});

const GPT_VERSION = "gpt-3.5-turbo";

const AI_ERROR = {
  sttCode: "AI_ERROR",
  sttValue: "AI đã bị kiệt sức, vui lòng thử lại trong giây lác!",
};

const calculateCost = async ({ accountId, text, pricePerToken = 2 }) => {
  try {
    const tokens = text.split(/\s+/);
    const numTokens = tokens.length;
    const cost = numTokens * pricePerToken;

    await Account.updateOne(
      { _id: accountId },
      { $inc: { moneyBalance: -cost } }
    );
  } catch (error) {
    throw error;
  }
};

module.exports = {
  chatBot: async ({ accountId, threadId, userMessage, assistantId }) => {
    try {
      if (!accountId || !threadId || !userMessage || !assistantId) {
        return null;
      }

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

      const result = messages.data.map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content[0].text.value,
        createdAt: convertTimestampToDateTimeString(message.created_at),
      }));

      await calculateCost({
        accountId,
        text: userMessage,
        pricePerToken: 1,
      });
      await calculateCost({
        accountId,
        text: result[0].content,
      });

      return result;
    } catch (error) {
      throw AI_ERROR;
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
      throw AI_ERROR;
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
            model: GPT_VERSION,
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
            model: GPT_VERSION,
            file_ids: fileIds,
          });
        } catch (error) {
          throw error;
        }
      }

      return assistant;
    } catch (error) {
      throw AI_ERROR;
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
      throw AI_ERROR;
    }
  },

  createThread: async () => {
    try {
      const thread = await openai.beta.threads.create();

      return thread;
    } catch (error) {
      throw AI_ERROR;
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
      throw AI_ERROR;
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
        throw {
          sttCode: "AI_ERROR",
          sttValue: "AI đã bị kiệt sức, vui lòng thử lại trong giây lác!",
        };
      }
    }

    return fileInfoArray;
  },

  createImage: async ({ accountId, prompt }) => {
    try {
      if (!accountId || !prompt) {
        return null;
      }

      const response = await openai.images.generate({
        model: "dall-e-2",
        prompt,
        n: 2,
        size: "1024x1024",
      });

      await Account.updateOne(
        { _id: accountId },
        { $inc: { moneyBalance: -100 } }
      );

      return response.data;
    } catch (error) {
      throw AI_ERROR;
    }
  },

  convertTextToSpeech: async ({
    accountId = null,
    input = null,
    voice = "alloy",
  }) => {
    try {
      if (!accountId || !input) {
        return null;
      }

      const speechFile = onRenderPath("audio", "speech.mp3");

      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice, // alloy, echo, fable, onyx, nova, and shimmer
        input,
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      await fs.promises.writeFile(speechFile, buffer);

      await calculateCost({
        accountId,
        text: input,
      });

      return speechFile;
    } catch (error) {
      throw AI_ERROR;
    }
  },

  botVersatile: async ({ accountId = null, messages = [] }) => {
    try {
      if (!accountId || !messages.length) {
        return null;
      }

      const response = await openai.chat.completions.create({
        model: GPT_VERSION,
        messages,
        temperature: 0.7,
        max_tokens: 3000,
        top_p: 1,
      });

      await calculateCost({
        accountId,
        text: messages[messages.length - 1].content,
        pricePerToken: 1,
      });
      await calculateCost({
        accountId,
        text: response.choices[0].message.content,
      });

      const result = {
        ...response.choices[0].message,
        createdAt: formatDate(new Date(), true),
      };

      return result;
    } catch (error) {
      throw AI_ERROR;
    }
  },
};
