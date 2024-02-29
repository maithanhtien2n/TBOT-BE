require("dotenv").config();

const {
  chatBot,
  getAssistant,
  saveAssistant,
  getThread,
  createThread,
  deleteThread,
  getFileInfo,
} = require("../Utils/openai");

const { throwError } = require("../Utils/index");
const { getById } = require("./CommonService");

const { VirtualAssistant } = require("../Models/VirtualAssistant");
const { User } = require("../Models/User");
const { Account } = require("../Models/Account");

module.exports = {
  chat: async (data) => {
    try {
      return getById(data.accountId, Account, "tài khoản", async (value) => {
        const assistant = await VirtualAssistant.findOne({
          accountId: value._id,
        });

        if (!assistant) {
          throwError(401, "Bot chưa được cấu hình!");
        }

        const result = await chatBot({
          threadId: data.threadId,
          userMessage: data.content,
          assistantId: assistant.assistantId,
        });

        await Account.updateOne(
          { _id: value._id },
          { $inc: { moneyBalance: -200 } }
        );

        return result.reverse();
      });
    } catch (error) {
      throw error;
    }
  },

  getTrain: async (accountId) => {
    try {
      return getById(accountId, Account, "tài khoản", async (value) => {
        const assistant = await VirtualAssistant.findOne({
          accountId: value._id,
        });

        if (!assistant) {
          return null;
        }

        const assistantResult = await getAssistant(assistant.assistantId);

        const assistantResultMap = [{ ...assistantResult }].map(
          async (item) => ({
            id: item.id,
            name: item.name,
            instructions: item.instructions,
            files: (await getFileInfo(item.file_ids)).reverse(),
          })
        )[0];

        return assistantResultMap;
      });
    } catch (error) {
      throw error;
    }
  },

  saveTrain: async ({ accountId, name, instructions, files = [] }) => {
    try {
      return getById(accountId, Account, "tài khoản", async (value) => {
        let assistantResult;

        const assistant = await VirtualAssistant.findOne({
          accountId: value._id,
        });

        if (assistant) {
          const id = assistant.assistantId;
          assistantResult = await saveAssistant({
            id,
            name,
            instructions,
            files,
          });
        } else {
          assistantResult = await saveAssistant({ name, instructions, files });
          await VirtualAssistant.create({
            accountId,
            assistantId: assistantResult.id,
          });
        }

        return assistantResult;
      });
    } catch (error) {
      throw error;
    }
  },

  getChatContainer: async (id) => {
    try {
      const getThreadResult = await getThread(id);

      return getThreadResult.reverse();
    } catch (error) {
      throw error;
    }
  },

  createChatContainer: async () => {
    try {
      const createThreadResult = await createThread();

      return createThreadResult;
    } catch (error) {
      throw error;
    }
  },

  deleteChatContainer: async (id) => {
    try {
      const deleteThreadResult = await deleteThread(id);

      return deleteThreadResult;
    } catch (error) {
      throw error;
    }
  },

  checkLinkChat: async (accountId) => {
    try {
      return getById(accountId, Account, "tài khoản", async (value) => {
        const user = await User.findOne({ accountId: value._id });
        const assistant = await VirtualAssistant.findOne({
          accountId: value._id,
        });

        if (!assistant) {
          throwError("BOT_NOT_CONFIG_ERROR", "Bot chưa được cấu hình!");
        }

        return {
          email: value.email,
          fullName: user.fullName,
        };
      });
    } catch (error) {
      throw error;
    }
  },
};
