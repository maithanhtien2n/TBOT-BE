require("dotenv").config();

const { botVersatile } = require("../Utils/openai");
const { renderVideo } = require("../Utils/videoai");

const {
  throwError,
  convertToStringKeySearch,
  cloneObjectWithoutFields,
} = require("../Utils/index");
const { getById, uploadFile } = require("./CommonService");

const { BotVersatile } = require("../Models/BotVersatile");
const { Account } = require("../Models/Account");

module.exports = {
  sendMessage: async ({ botVersatileId, messages, accountId, host }) => {
    try {
      return getById(botVersatileId, BotVersatile, "mẫu bot", async (value) => {
        let result = null;
        let model = null;
        const account = await Account.findById(accountId);
        if (account.isUpgrade) {
          model = "gpt-4-vision-preview";
        } else {
          model = "gpt-3.5-turbo";
        }

        if (["TEXT", "AUDIO"].includes(value?.type)) {
          result = await botVersatile({
            accountId,
            messages: [
              ...[{ role: "system", content: value.content }],
              ...messages,
            ],
            model,
            typeResponse: value?.type,
            host,
          });
        }

        if (["VIDEO"].includes(value?.type)) {
          result = await renderVideo({
            accountId,
            messages,
            systemBotVideo: value?.content,
          });
        }

        return result;
      });
    } catch (error) {
      throw error;
    }
  },

  getAll: async ({ tab = "ALL", keySearch = "" }) => {
    try {
      const all = (await BotVersatile.find()).reverse();
      const draft = all.filter(({ status }) => status === "DRAFT");
      const active = all.filter(({ status }) => status === "ACTIVE");
      const locked = all.filter(({ status }) => status === "LOCKED");

      const onFilter = (name, content, search) => {
        return (
          convertToStringKeySearch(name)?.includes(
            convertToStringKeySearch(search)
          ) ||
          convertToStringKeySearch(content)?.includes(
            convertToStringKeySearch(search)
          )
        );
      };

      switch (tab) {
        case "ALL":
          return {
            all: all.filter(({ name, content }) =>
              onFilter(name, content, keySearch)
            ),
            draft,
            active,
            locked,
          };
        case "DRAFT":
          return {
            all,
            draft: draft.filter(({ name, content }) =>
              onFilter(name, content, keySearch)
            ),
            active,
            locked,
          };
        case "ACTIVE":
          return {
            all,
            draft,
            active: active.filter(({ name, content }) =>
              onFilter(name, content, keySearch)
            ),
            locked,
          };
        case "LOCKED":
          return {
            all,
            draft,
            active,
            locked: locked.filter(({ name, content }) =>
              onFilter(name, content, keySearch)
            ),
          };
      }
    } catch (error) {
      throw error;
    }
  },

  getOne: async (id) => {
    try {
      return getById(id, BotVersatile, "mẫu bot", async (value) => {
        return value;
      });
    } catch (error) {
      throw error;
    }
  },

  save: async (id, data) => {
    try {
      if (!["TEXT", "AUDIO", "VIDEO"].includes(data.type)) {
        throwError("ERROR_FORMAT", "Lỗi code không đúng định dạng!");
      }

      const fieldImage = "image";
      let infoData = { ...data };
      if (
        !data[fieldImage] ||
        !data[fieldImage]?.base64 ||
        data[fieldImage]?.base64?.includes("http")
      ) {
        infoData.image = null;
      }

      const result = await uploadFile(
        BotVersatile,
        { field: fieldImage, location: "bot-versatile/" },
        id,
        infoData
      );

      return result;
    } catch (error) {
      throw error;
    }
  },

  delete: async ({ ids }) => {
    try {
      const result = await BotVersatile.deleteMany({ _id: { $in: ids } });
      return result.deletedCount + " dòng";
    } catch (error) {
      throw error;
    }
  },

  updateStatus: async ({ ids, status }) => {
    try {
      if (!["DRAFT", "ACTIVE", "LOCKED"].includes(status)) {
        throwError(
          "ERROR_FORMAT_STATUS_CODE",
          "Lỗi mã trạng thái không đúng định dạng!"
        );
      }
      if (!ids.length) {
        return ids.length + " dòng";
      }

      const result = await BotVersatile.updateMany(
        { _id: { $in: ids } },
        { $set: { status } }
      );

      return result.matchedCount + " dòng";
    } catch (error) {
      throw error;
    }
  },

  getDropdown: async () => {
    try {
      const dropdown = (await BotVersatile.find({ status: "ACTIVE" })).map(
        (item) => ({
          _id: item?._id,
          image: item?.image,
          name: item?.name,
          createdAt: item?.createdAt,
          updatedAt: item?.updatedAt,
        })
      );
      return dropdown;
    } catch (error) {
      throw error;
    }
  },

  getDetail: async (id) => {
    try {
      return getById(id, BotVersatile, "mẫu bot", async (value) => {
        const result = cloneObjectWithoutFields(value, [
          "content",
          "status",
          "__v",
        ]);
        return result;
      });
    } catch (error) {
      throw error;
    }
  },
};
