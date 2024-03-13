const format = require("./format");
const render = require("./render");
const { ObjectId } = require("mongodb");
const speech = require("@google-cloud/speech");

process.env.GOOGLE_APPLICATION_CREDENTIALS =
  __dirname + "/tbotai-415510-74840224582b.json";

module.exports = {
  ...format,
  ...render,

  onResponse: (res, result) => ({
    ok: (success) => {
      return res.status(200).json({
        success: true,
        statusCode: 200,
        statusValue: success?.sttValue || "OK!",
        executeDate: new Date(),
        data: result || null,
      });
    },
    badRequest: (fail) => {
      return res.status(fail?.sttCode && fail?.sttValue ? 400 : 500).json({
        success: false,
        statusCode: fail?.sttCode || "EXCEPTION",
        statusValue: fail?.sttValue || `Call api thất bại (${fail})`,
        executeDate: new Date(),
        data: null,
      });
    },
  }),

  checkNullRequest: (data, arrValue) => {
    let keys = [];

    for (const key of arrValue) {
      if (!data[key]) {
        keys.push(key);
      }
    }

    if (keys.length > 0) {
      throw {
        sttCode: "MISSING_REQUIRED_FIELDS",
        sttValue: `Lỗi thiếu trường bắt buộc: ${keys}`,
      };
    }

    return data;
  },

  throwError: (sttCode, sttValue) => {
    throw { sttCode, sttValue };
  },

  isObjectId: (value) => {
    try {
      new ObjectId(value);
      return true;
    } catch (error) {
      return false;
    }
  },

  cloneObjectWithoutFields: (originalObject, fieldsToRemove) => {
    const cloneUser = { ...originalObject };

    let data = {};

    for (const item of Object.keys(cloneUser._doc)) {
      if (!fieldsToRemove.includes(item)) {
        data[item] = originalObject[item];
      }
    }

    return data;
  },

  isValidEmail: (email) => {
    // Sử dụng biểu thức chính quy để kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(email);
  },

  audioToText: async (base64String) => {
    const client = new speech.SpeechClient();

    // Tạo một buffer từ base64 string
    const audioBytes = Buffer.from(base64String, "base64");

    try {
      // Gửi yêu cầu nhận dạng âm thanh
      const [response] = await client.recognize({
        audio: {
          content: audioBytes,
        },
        config: {
          encoding: "LINEAR16",
          sampleRateHertz: 16000,
          languageCode: "vi-VN",
        },
      });

      // Lấy kết quả và trả về văn bản
      const transcription = response.results
        .map((result) => result.alternatives[0].transcript)
        .join("\n");

      return transcription;
    } catch (error) {
      console.log(error);
      return null;
    }
  },
};
