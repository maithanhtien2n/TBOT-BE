require("dotenv").config();

const { renderVideo } = require("../Utils/videoai");

const { throwError, formatDate } = require("../Utils/index");
const { getById } = require("./CommonService");

module.exports = {
  renderVideo: async ({ accountId, messages }) => {
    try {
      const result = await renderVideo({ accountId, messages });
      return result;
    } catch (error) {
      throw error;
    }
  },
};
