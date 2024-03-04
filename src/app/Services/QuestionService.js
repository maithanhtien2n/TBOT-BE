require("dotenv").config();

const {} = require("../Utils/openai");

const {
  throwError,
  formatDate,
  convertToStringKeySearch,
} = require("../Utils/index");
const { getById } = require("./CommonService");

const { Question } = require("../Models/Question");
const { User } = require("../Models/User");
const { Account } = require("../Models/Account");
const { Notification } = require("../Models/Notification");

module.exports = {
  getAllAdmin: async ({ tab = "ALL", keySearch = "" }) => {
    try {
      const questions = (
        await Question.find()
          .populate({
            path: "accountId",
            model: Account,
            select: "email",
          })
          .populate({
            path: "userId",
            model: User,
            select: "avatar fullName",
          })
      ).reverse();

      const all = questions.map((item) => ({
        _id: item?._id,
        accountId: item?.accountId,
        question: {
          email: item?.accountId?.email,
          avatar: item?.userId?.avatar,
          fullName: item?.userId?.fullName,
          content: item?.question.split("$")[1],
          sentDate: item?.question.split("$")[0],
        },
        answer: item?.answer
          ? {
              content: item?.answer.split("$")[1],
              sentDate: item?.answer.split("$")[0],
            }
          : null,
        createdAt: "2024-02-22T08:53:48.483Z",
        updatedAt: "2024-02-22T08:53:48.483Z",
      }));
      const notAnswered = all.filter(({ answer }) => !answer);
      const answered = all.filter(({ answer }) => answer);

      const onFilter = (question, answer, search) => {
        return (
          convertToStringKeySearch(question?.content)?.includes(
            convertToStringKeySearch(search)
          ) ||
          convertToStringKeySearch(answer?.content)?.includes(
            convertToStringKeySearch(search)
          )
        );
      };

      switch (tab) {
        case "ALL":
          return {
            all: all.filter(({ question, answer }) =>
              onFilter(question, answer, keySearch)
            ),
            notAnswered,
            answered,
          };
        case "NOT_ANSWERED":
          return {
            all,
            notAnswered: notAnswered.filter(({ question, answer }) =>
              onFilter(question, answer, keySearch)
            ),
            answered,
          };
        case "ANSWERED":
          return {
            all,
            notAnswered,
            answered: answered.filter(({ question, answer }) =>
              onFilter(question, answer, keySearch)
            ),
          };
      }
    } catch (error) {
      throw error;
    }
  },

  getAll: async ({ accountId, scope }) => {
    try {
      let request = {};

      if (scope === "PERSONAL") {
        request.accountId = accountId;
      }

      const questions = await Question.find(request)
        .populate({
          path: "userId",
          model: User,
          select: "avatar fullName",
        })
        .populate({
          path: "accountId",
          model: Account,
          select: "email",
        });

      const result = questions.map((item) => ({
        _id: item?._id,
        accountId: item?.accountId,
        question: {
          avatar: item?.userId?.avatar,
          fullName: item?.userId?.fullName || item?.accountId?.email,
          content: item?.question.split("$")[1],
          sentDate: item?.question.split("$")[0],
        },
        answer: item?.answer
          ? {
              content: item?.answer.split("$")[1],
              sentDate: item?.answer.split("$")[0],
            }
          : null,
        createdAt: "2024-02-22T08:53:48.483Z",
        updatedAt: "2024-02-22T08:53:48.483Z",
      }));

      return result.reverse();
    } catch (error) {
      throw error;
    }
  },

  create: async ({ accountId, question }) => {
    try {
      return getById(accountId, Account, "tài khoản", async (value) => {
        if (question.includes("$")) {
          throwError("INVALID_CHARACTERS", "Ký tự $ không được cho phép!");
        }

        const user = await User.findOne({ accountId: value?._id });

        const sentDate = formatDate(new Date(), true);

        const result = await Question.create({
          accountId,
          userId: user?._id,
          question: `${sentDate}$${question}`,
        });

        return result;
      });
    } catch (error) {
      throw error;
    }
  },

  update: async ({ questionId, answer, host }) => {
    try {
      return getById(questionId, Question, "câu hỏi", async (value) => {
        const sentDate = formatDate(new Date(), true);

        const result = await Question.updateOne(
          { _id: value?._id },
          { answer: `${sentDate}$${answer}` }
        );

        if (!value?.answer) {
          await Notification.create({
            accountId: value?.accountId,
            sendType: "PERSONAL",
            image: `https://${host}/uploads/image/avatar-admin.jpg`,
            title: `Quản trị viên vừa trả lời câu hỏi của bạn!`,
            content: `<p>Bạn: ${
              value?.question?.split("$")[1]
            }</p><p>Quản trị viên: ${answer}</p><p><br></p><p>Xem chi tiết tại <a href="${
              process.env.HOST_FE
            }" rel="noopener noreferrer" target="_blank">góc thắc mắc</a>!</p>`,
          });
        }

        return result;
      });
    } catch (error) {
      throw error;
    }
  },

  delete: async (questionId) => {
    try {
      return getById(questionId, Question, "câu hỏi", async (value) => {
        const result = await Question.deleteOne(value);

        return result;
      });
    } catch (error) {
      throw error;
    }
  },
};
