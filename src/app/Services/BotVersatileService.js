require("dotenv").config();

const { botVersatile, calculateCost } = require("../Utils/openai");

const { throwError, formatDate } = require("../Utils/index");
const { getById } = require("./CommonService");

module.exports = {
  sendMessage: async ({ botVersatileId, messages, accountId }) => {
    try {
      const system = [
        {
          role: "system",
          content:
            "You will be provided with statements, and your task is to convert them to standard English.",
        },
      ];

      const result = await botVersatile({
        accountId,
        messages: [...system, ...messages],
      });

      return result;
    } catch (error) {
      throw error;
    }
  },
};
