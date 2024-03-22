require("dotenv").config();

const { createImage } = require("../Utils/openai");

const { throwError, formatDate } = require("../Utils/index");
const { getById } = require("./CommonService");

const { Account } = require("../Models/Account");

module.exports = {
  createImage: async ({ accountId, prompt }) => {
    try {
      let model = null;
      const account = await Account.findById(accountId);
      if (account.isUpgrade) {
        model = "dall-e-3";
      } else {
        model = "dall-e-2";
      }

      const resultImages = await createImage({ accountId, prompt, model });
      const result = {
        role: "assistant",
        images: resultImages,
        createdAt: formatDate(new Date(), true),
      };
      return result;
    } catch (error) {
      throw error;
    }
  },
};
