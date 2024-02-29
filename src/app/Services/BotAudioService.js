require("dotenv").config();

const { convertTextToSpeech } = require("../Utils/openai");

const { throwError, formatDate } = require("../Utils/index");
const { getById } = require("./CommonService");

const { Account } = require("../Models/Account");

module.exports = {
  convertTextToAudio: async ({ input, host, accountId }) => {
    try {
      const content = await convertTextToSpeech(input);

      const result = {
        role: "assistant",
        content: `http://${host}/${content}`,
        createdAt: formatDate(new Date(), true),
      };

      await Account.updateOne(
        { _id: accountId },
        { $inc: { moneyBalance: -200 } }
      );

      return result;
    } catch (error) {
      throw error;
    }
  },
};
