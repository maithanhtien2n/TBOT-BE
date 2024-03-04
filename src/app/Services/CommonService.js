const fs = require("fs");
require("dotenv").config();

const { throwError } = require("../Utils/index");
const { default: mongoose } = require("mongoose");

function readDirectory(directoryPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
}

module.exports = {
  uploadFile: async (
    Model,
    file = { field: "", location: "" },
    id = null,
    value = {}
  ) => {
    try {
      let path = "";
      if (value[file.field] && value[file.field].base64) {
        path = `uploads/${file.location}${Date.now()}$${
          value[file.field].name
        }`;
      }

      let body = { ...value };

      if (value[file.field] && value[file.field]?.base64) {
        body[file.field] = `https://${body.host}/${path}`;
      } else {
        delete body[file.field];
      }

      if (id && id !== "null") {
        const data = await Model.findOne({ _id: id });

        if (!data) {
          throwError(201, "Không tồn tại bản ghi: " + id);
        }

        if (
          data[file.field] &&
          value[file.field] &&
          value[file.field]?.base64
        ) {
          // Kiểm tra nếu tồn tại file trong database & có file gửi lên thì thực hiện xóa
          // Lấy ra tên file
          const fileName = data[file.field].split("/").pop();

          const filePath = `uploads/${file.location}${fileName}`;

          // Thực hiện xóa file
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }

        // Sau khi xóa file nếu không gặp lỗi gì thì thực hiện cập nhật
        const result = await Model.updateOne({ _id: id }, { ...body });

        // Sau đó lưu file
        if (value[file.field] && value[file.field]?.base64) {
          fs.writeFileSync(
            path,
            Buffer.from(value[file.field].base64?.split(",")[1], "base64")
          );
        }

        return result;
      } else {
        const result = await Model.create({ ...body });

        if (value[file.field] && value[file.field]?.base64) {
          fs.writeFileSync(
            path,
            Buffer.from(value[file.field]?.base64?.split(",")[1], "base64")
          );
        }

        return result;
      }
    } catch (error) {
      throw error;
    }
  },

  getById: async (id, model, msg, next = () => {}) => {
    if (mongoose.Types.ObjectId.isValid(id)) {
      const tool = await model.findById(id);
      if (tool) {
        return next(tool);
      } else {
        throwError("NOT_FOUND", `Không tìm thấy ${msg} có id là: ${id}`);
      }
    } else {
      throwError("ID_INVALID", `ID không hợp lệ: ${id}`);
    }
  },

  getAllFileNameAudio: async () => {
    try {
      const directoryPath = "uploads/audio";
      const files = await readDirectory(directoryPath);
      return files;
    } catch (error) {
      throw error;
    }
  },

  deleteAllFileNameAudio: async () => {
    try {
      const directoryPath = "uploads/audio";
      const files = await readDirectory(directoryPath);
      for (const file of files) {
        const path = `${directoryPath}/${file}`;
        if (file !== "file-test.txt") {
          fs.unlinkSync(path);
        }
      }
      return "Đã xóa tất cả file audio!";
    } catch (error) {
      throw error;
    }
  },
};
