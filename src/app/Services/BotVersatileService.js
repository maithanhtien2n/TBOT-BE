require("dotenv").config();

const { botVersatile, calculateCost } = require("../Utils/openai");

const {
  throwError,
  convertToStringKeySearch,
  cloneObjectWithoutFields,
} = require("../Utils/index");
const { getById, uploadFile } = require("./CommonService");

const { BotVersatile } = require("../Models/BotVersatile");

module.exports = {
  sendMessage: async ({ botVersatileId, messages, accountId }) => {
    try {
      return getById(botVersatileId, BotVersatile, "mẫu bot", async (value) => {
        const result = await botVersatile({
          accountId,
          messages: [
            ...[{ role: "system", content: value.content }],
            ...messages,
          ],
        });

        return result;
      });
    } catch (error) {
      throw error;
    }
  },

  getAll: async ({ tab = "ALL", keySearch = "" }) => {
    try {
      const all = (await BotVersatile.find()).reverse();
      const active = all.filter(({ status }) => status === "ACTIVE");
      const draft = all.filter(({ status }) => status === "DRAFT");
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
            active,
            draft,
            locked,
          };
        case "ACTIVE":
          return {
            all,
            active: active.filter(({ name, content }) =>
              onFilter(name, content, keySearch)
            ),
            draft,
            locked,
          };
        case "DRAFT":
          return {
            all,
            active,
            draft: draft.filter(({ name, content }) =>
              onFilter(name, content, keySearch)
            ),
            locked,
          };
        case "LOCKED":
          return {
            all,
            active,
            draft,
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
      const fieldImage = "image";
      let infoData = { ...data };
      if (
        !data[fieldImage] ||
        !data[fieldImage]?.base64 ||
        data[fieldImage]?.base64?.includes("https")
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

  getDropdown: async () => {
    try {
      const dropdown = (await BotVersatile.find()).map((item) => ({
        _id: item?._id,
        image: item?.image,
        name: item?.name,
        createdAt: item?.createdAt,
        updatedAt: item?.updatedAt,
      }));
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
