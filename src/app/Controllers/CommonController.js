module.exports = (app, io) => {
  const { onResponse, checkNullRequest } = require("../Utils/index");
  const { onRouteCustom } = require("../Middlewares/index");

  const controllerName = "common";
  const onRoute = (method, route, handler, accuracy) => {
    onRouteCustom(app, controllerName, method, route, handler, accuracy);
  };

  // Service import
  const commonService = require("../Services/CommonService");

  // API mở file ảnh hoặc video
  const onApiOpenFile = (folderName = "") => {
    app.get(`/uploads${folderName}/:name`, (req, res) => {
      const fileName = req.params.name;
      const options = {
        root: `uploads${folderName}`,
        headers: {
          "Content-Type": getFileContentType(fileName),
        },
      };
      res.sendFile(fileName, options, (error) => {
        if (error) {
          onResponse(res, null).badRequest(error);
        }
      });
    });
  };

  const getFileContentType = (fileName) => {
    const fileExtension = fileName.split(".").pop().toLowerCase();

    switch (fileExtension) {
      case "mp4":
        return "video/mp4";
      case "mp3":
        return "audio/mpeg";
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
        return "image";
      default:
        return "application/octet-stream";
    }
  };

  // Register routes for different folders
  onApiOpenFile("/avatar");
  onApiOpenFile("/image");
  onApiOpenFile("/notification");
  onApiOpenFile("/audio");
  onApiOpenFile("/bot-versatile");

  // Api lấy danh sách name file audio
  onRoute(
    "get",
    "/file-name-audio",
    async (req, res) => {
      try {
        // Hàm xử lý logic và trả ra kết quả
        const result = await commonService.getAllFileNameAudio();

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({ sttValue: "Lấy dữ liệu thành công!" });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
    "NO_AUTH"
  );

  // Api lấy danh sách name file audio
  onRoute(
    "delete",
    "/file-name-audio",
    async (req, res) => {
      try {
        // Hàm xử lý logic và trả ra kết quả
        const result = await commonService.deleteAllFileNameAudio();

        // Hàm trả về response cho người dùng
        onResponse(res, result).ok({ sttValue: "Xóa dữ liệu thành công!" });
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    },
    "NO_AUTH"
  );

  // Socket.io -------------------------------------------

  io.on("connection", (socket) => {
    console.log("Đã kết nối socket!");

    socket.on(`isNewData`, async (data) => {
      await io.emit(`isNewData`, data);
    });
  });
};
