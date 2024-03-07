require("dotenv").config();

const { createImage } = require("../Utils/openai");

const { throwError, formatDate } = require("../Utils/index");
const { getById } = require("./CommonService");

module.exports = {
  createImage: async ({ accountId, prompt }) => {
    try {
      const content = await createImage({ accountId, prompt });
      const result = {
        role: "assistant",
        content,
        createdAt: formatDate(new Date(), true),
      };
      return result;
    } catch (error) {
      throw error;
    }
  },
};
