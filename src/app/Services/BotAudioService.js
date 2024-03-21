require("dotenv").config();

const { convertTextToSpeech } = require("../Utils/openai");

const { throwError, formatDate } = require("../Utils/index");
const { getById } = require("./CommonService");

module.exports = {
  convertTextToAudio: async ({ input, host, accountId }) => {
    try {
      const content = await convertTextToSpeech({ accountId, input });
      const result = {
        role: "assistant",
        audio: `${host}/${content}`,
        createdAt: formatDate(new Date(), true),
      };
      return result;
    } catch (error) {
      throw error;
    }
  },
};
