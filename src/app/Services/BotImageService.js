require("dotenv").config();

const { createImage } = require("../Utils/openai");

const { throwError, formatDate } = require("../Utils/index");
const { getById } = require("./CommonService");

const { Account } = require("../Models/Account");

module.exports = {
  createImage: async ({ prompt, accountId }) => {
    try {
      const content = await createImage(prompt);

      const result = {
        role: "assistant",
        content,
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
