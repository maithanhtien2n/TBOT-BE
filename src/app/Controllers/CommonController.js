module.exports = (app, io) => {
  const { onResponse, checkNullRequest } = require("../Utils/index");
  const { onRouteCustom } = require("../Middlewares/index");

  const controllerName = "common";
  const onRoute = (method, route, handler, accuracy) => {
    onRouteCustom(app, controllerName, method, route, handler, accuracy);
  };

  // Service import
  const commonService = require("../Services/CommonService");

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

      try {
        res.sendFile(fileName, options);
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    });
  };

  // Register routes for different folders
  onApiOpenFile("/avatar");
  onApiOpenFile("/image");
  onApiOpenFile("/notification");
  onApiOpenFile("/audio");
  onApiOpenFile("/bot-versatile");
  onApiOpenFile("/video");

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

  // API lấy danh sách mẫu bot đa năng cho người dùng
  onRoute("put", "/bot-versatile", async (req, res) => {
    try {
      // Hàm xử lý logic và trả ra kết quả
      const result = await commonService.botVersatile();

      // Hàm trả về response cho người dùng
      onResponse(res, result).ok({ sttValue: "Lấy dữ liệu thành công!" });
    } catch (error) {
      onResponse(res, null).badRequest(error);
    }
  });

  // Api lấy chi tiết bot mẫu cho người dùng
  onRoute("put", "/bot-versatile-detail", async (req, res) => {
    try {
      // Hàm xử lý logic và trả ra kết quả
      const result = await commonService.botVersatileDetail(req.query.id);

      // Hàm trả về response cho người dùng
      onResponse(res, result).ok({ sttValue: "Lấy dữ liệu thành công!" });
    } catch (error) {
      onResponse(res, null).badRequest(error);
    }
  });

  // Socket.io -------------------------------------------

  io.on("connection", (socket) => {
    console.log("Đã kết nối socket!");

    socket.on(`isNewData`, async (data) => {
      await io.emit(`isNewData`, data);
    });
  });
};
