require("dotenv").config();

const { throwError, convertToStringKeySearch } = require("../Utils/index");
const { getById, uploadFile } = require("./CommonService");

const { Notification } = require("../Models/Notification");
const { TopUpHistory } = require("../Models/TopUpHistory");
const { Account } = require("../Models/Account");

module.exports = {
  getAllNotificationAdmin: async ({ tab = "ALL", keySearch = "" }) => {
    try {
      const all = (await Notification.find()).reverse();

      const everyBody = all.filter(({ sendType }) => sendType === "EVERY_BODY");
      const personal = all.filter(({ sendType }) => sendType === "PERSONAL");
      const joined = all.filter(({ sendType }) => sendType === "JOINED");

      const onFilter = (title, content, search) => {
        return (
          convertToStringKeySearch(title)?.includes(
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
            all: all.filter(({ title, content }) =>
              onFilter(title, content, keySearch)
            ),
            everyBody,
            personal,
            joined,
          };
        case "EVERY_BODY":
          return {
            all,
            everyBody: everyBody.filter(({ title, content }) =>
              onFilter(title, content, keySearch)
            ),
            personal,
            joined,
          };
        case "PERSONAL":
          return {
            all,
            everyBody,
            personal: personal.filter(({ title, content }) =>
              onFilter(title, content, keySearch)
            ),
            joined,
          };
        case "JOINED":
          return {
            all,
            everyBody,
            personal,
            joined: joined.filter(({ title, content }) =>
              onFilter(title, content, keySearch)
            ),
          };
      }
    } catch (error) {
      throw error;
    }
  },

  getAllNotificationUser: async (accountId) => {
    try {
      let queryOr = [{ accountId }, { sendType: "EVERY_BODY" }];

      const account = await Account.findById(accountId);
      const topUpHistoryToAccount = await TopUpHistory.findOne({ accountId });
      const notification = await Notification.findOne({
        accountId,
        sendType: "PERSONAL",
      });

      if (topUpHistoryToAccount) {
        queryOr.push({ sendType: "JOINED" });
      }

      const notifications = (
        await Notification.find({
          $or: queryOr,
          $and: [
            { status: "ACTIVE" },
            { createdAt: { $gt: account?.createdAt } },
          ],
        })
      ).reverse();

      const result = {
        result: notifications.filter(
          (item) =>
            item.sendType !== "JOINED" ||
            (item.sendType === "JOINED" &&
              item.createdAt > notification.createdAt)
        ),
        newNotification: notifications.filter(
          ({ isNewNotification }) => isNewNotification
        ).length,
      };

      return result;
    } catch (error) {
      throw error;
    }
  },

  getOneNotification: async ({ accountId, notificationId }) => {
    try {
      return getById(
        notificationId,
        Notification,
        "thông báo",
        async (value) => {
          let query = { _id: value._id };

          if (value.sendType === "PERSONAL") {
            query.accountId = accountId;
          }

          const result = await Notification.findOne(query);

          if (result.isNewNotification) {
            await Notification.updateOne(
              { _id: notificationId },
              { isNewNotification: false }
            );
          }

          return result;
        }
      );
    } catch (error) {
      throw error;
    }
  },

  saveNotification: async (notificationId, data) => {
    try {
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
        Notification,
        { field: fieldImage, location: "notification/" },
        notificationId,
        infoData
      );

      return result;
    } catch (error) {
      throw error;
    }
  },

  addNotificationTopUp: async (data) => {
    try {
      for (const accountId of data.accountIds) {
        await Notification.create({
          accountId: accountId,
          sendType: data?.sendType,
          image: `${data.host}/uploads/image/top-up.webp`,
          title: data?.title,
          content: data?.content,
        });
      }

      return null;
    } catch (error) {
      throw error;
    }
  },

  updateStatusNotification: async ({ ids, status }) => {
    try {
      if (!ids.length) {
        return ids.length + " dòng";
      }

      for (const id of ids) {
        await Notification.updateOne({ _id: id }, { status });
      }

      return ids.length + " dòng";
    } catch (error) {
      throw error;
    }
  },
};
