require("dotenv").config();

const {
  throwError,
  cloneObjectWithoutFields,
  formatToVND,
} = require("../Utils/index");
const { uploadFile, getById } = require("./CommonService");

const { Document } = require("../Models/Document");

module.exports = {
  getAll: async () => {
    try {
      const document = await Document.find();

      const result = document.map((item) => ({
        _id: item?._id,
        application: {
          video: item?.application?.split("$")[0],
          content: item?.application?.split("$")[1],
        },
        topUp: item?.topUp,
        createdAt: item?.createdAt,
        updatedAt: item?.updatedAt,
      }))[0];

      return result;
    } catch (error) {
      throw error;
    }
  },

  save: async ({ documentId, application, topUp }) => {
    try {
      const document = await Document.find();
      if (!document.length) {
        const result = await Document.create({ application, topUp });
        return result;
      } else {
        return getById(documentId, Document, "tài liệu", async (value) => {
          await Document.deleteOne(value);
          const result = await Document.create({ application, topUp });
          return result;
        });
      }
    } catch (error) {
      throw error;
    }
  },
};
