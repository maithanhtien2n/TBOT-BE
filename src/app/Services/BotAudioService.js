require("dotenv").config();

const { convertTextToSpeech, calculateCost } = require("../Utils/openai");

const { throwError, formatDate } = require("../Utils/index");
const { getById } = require("./CommonService");

const { Account } = require("../Models/Account");

module.exports = {
  convertTextToAudio: async ({ input, host, accountId }) => {
    try {
      const content = await convertTextToSpeech(input);

      const result = {
        role: "assistant",
        content: `https://${host}/${content}`,
        createdAt: formatDate(new Date(), true),
      };

      await Account.updateOne(
        { _id: accountId },
        { $inc: { moneyBalance: calculateCost(input) } }
      );

      return result;
    } catch (error) {
      throw error;
    }
  },
};
