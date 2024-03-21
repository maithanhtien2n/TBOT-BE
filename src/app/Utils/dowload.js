const fs = require("fs");
const axios = require("axios");
const { throwError, onRenderPath } = require("./index");

module.exports = {
  downloadImages: async (imageUrls) => {
    // Tạo thư mục nếu nó chưa tồn tại
    if (!fs.existsSync("uploads/download")) {
      fs.mkdirSync("uploads/download");
    }

    let images = [];

    try {
      // Lặp qua mỗi URL và tải xuống hình ảnh
      for (let i = 0; i < imageUrls.length; i++) {
        const imageUrl = imageUrls[i];

        const response = await axios({
          method: "GET",
          url: imageUrl,
          responseType: "stream",
        });

        const filePath = onRenderPath("download", "file-dl.jpg");
        response.data.pipe(fs.createWriteStream(filePath));
        images.push(filePath);

        await new Promise((resolve, reject) => {
          response.data.on("end", () => {
            resolve();
          });

          response.data.on("error", (err) => {
            reject(err);
          });
        });
      }

      return images;
    } catch (error) {
      throwError("ERROR_DOWNLOAD", "Tải tệp tin thất bại!" + error);
    }
  },

  deleteFiles: async (filePaths = []) => {
    try {
      if (filePaths.length) {
        for (let i = 0; i < filePaths.length; i++) {
          const filePath = filePaths[i];
          fs.unlinkSync(filePath);
        }
      }
    } catch (error) {
      throw error;
    }
  },
};
