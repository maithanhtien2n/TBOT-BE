const fs = require("fs");
require("dotenv").config();
const OpenAI = require("openai");
const {
  throwError,
  formatDate,
  audioToText,
  onRenderPath,
  convertTimestampToDateTimeString,
} = require("./index");

const { Account } = require("../Models/Account");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY.replace(/@/g, ""),
});

const GPT_DEFAULT = "gpt-3.5-turbo";
const DALL_DEFAULT = "dall-e-2";
const TTS_DEFAULT = "tts-1";

const AI_ERROR = {
  sttCode: "AI_ERROR",
  sttValue: "AI đã bị kiệt sức, vui lòng thử lại trong giây lác!",
};

const calculateCost = async ({
  accountId = null,
  text = "",
  model = "gpt-3.5-turbo",
  type = "output",
}) => {
  try {
    let totalAmount = 0;

    const tokens = text.split(/\s+/);
    const numTokens = tokens.length;

    switch (model) {
      case "gpt-3.5-turbo":
      case "tts-1":
        totalAmount = type === "input" ? 0.5 : 1 * numTokens;
        break;
      case "dall-e-2":
        totalAmount = 1000;
        break;
      case "gpt-4-vision-preview":
        totalAmount = type === "input" ? 1 : 2 * numTokens;
        break;
      case "dall-e-3":
        totalAmount = 2000;
        break;
    }

    console.log(totalAmount);

    await Account.updateOne(
      { _id: accountId },
      { $inc: { moneyBalance: -totalAmount } }
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
        model: run.model,
        type: "input",
      });
      await calculateCost({
        accountId,
        text: result[0].content,
        model: run.model,
        type: "output",
      });

      return result;
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
      throw AI_ERROR;
    }
  },

  saveAssistant: async ({
    id = null,
    name,
    instructions,
    files = [],
    model = GPT_DEFAULT,
  }) => {
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
            model,
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
            model,
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

  createImage: async ({
    accountId,
    model = DALL_DEFAULT,
    prompt = "",
    quality = "standard",
    quantity = 1,
  }) => {
    try {
      if (!accountId || !prompt) {
        return null;
      }

      const response = await openai.images.generate({
        model,
        prompt,
        quality,
        n: quantity,
        size: "1024x1024",
      });

      await calculateCost({ accountId, model });

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  convertTextToSpeech: async ({
    accountId = null,
    model = TTS_DEFAULT,
    voice = "alloy",
    input = "",
  }) => {
    try {
      if (!accountId || !input) {
        return null;
      }

      const speechFile = onRenderPath("audio", "speech.mp3");

      const mp3 = await openai.audio.speech.create({
        model,
        voice, // alloy, echo, fable, onyx, nova, and shimmer
        input,
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      await fs.promises.writeFile(speechFile, buffer);

      await calculateCost({
        accountId,
        text: input,
        model,
        type: "output",
      });

      return speechFile;
    } catch (error) {
      throw error;
    }
  },

  botVersatile: async ({
    accountId = null,
    model = GPT_DEFAULT,
    messages = [],
    typeResponse = "TEXT",
    host,
    dateTime = true,
  }) => {
    try {
      if (!accountId || !messages.length) {
        return null;
      }

      let result = null;
      let messagesClone = [];

      // Xử lý đầu vào
      if (typeResponse === "TEXT") {
        messagesClone = messages;
      } else if (typeResponse === "AUDIO") {
        const base64Data = messages[messages.length - 1]?.content
          .split(";base64,")
          .pop();
        const transcription = await audioToText(base64Data);
        messagesClone = messages.map((item, i, arr) => {
          if (i === arr.length - 1) {
            return {
              role: item.role,
              content: transcription || "",
            };
          } else {
            return item;
          }
        });
      }
      // ---------------------------------

      const response = await openai.chat.completions.create({
        model,
        messages: messagesClone,
        temperature: 0.7,
        max_tokens: 3000,
        top_p: 1,
      });

      await calculateCost({
        accountId,
        text: messages[messages.length - 1].content,
        model,
        type: "input",
      });
      await calculateCost({
        accountId,
        text: response.choices[0].message.content,
        model,
        type: "output",
      });

      // Xử lý đầu ra
      if (typeResponse === "TEXT") {
        result = {
          type: typeResponse,
          result: { ...response.choices[0].message },
        };
        if (dateTime) result.result.createdAt = formatDate(new Date(), true);
      } else if (typeResponse === "AUDIO") {
        const speechFile = onRenderPath("audio", "speech.mp3");
        const input = response.choices[0].message.content;

        const mp3 = await openai.audio.speech.create({
          model: "tts-1",
          voice: "alloy", // alloy, echo, fable, onyx, nova, and shimmer
          input,
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());
        await fs.promises.writeFile(speechFile, buffer);

        await calculateCost({
          accountId,
          text: input,
          model,
          type: "input",
        });

        result = [
          {
            type: "TEXT",
            result: messagesClone.pop(),
          },
          {
            type: typeResponse,
            result: {
              role: "assistant",
              content: `${host}/${speechFile}`,
            },
          },
        ];
      }
      // ---------------------------------

      return result;
    } catch (error) {
      throw error;
    }
  },
};
