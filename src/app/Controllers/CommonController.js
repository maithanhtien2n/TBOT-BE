module.exports = (app, io) => {
  const { onResponse, checkNullRequest } = require("../Utils/index");
  const { onRouteCustom } = require("../Middlewares/index");

  const controllerName = "user";
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

  // Socket.io -------------------------------------------

  io.on("connection", (socket) => {
    console.log("Đã kết nối socket!");

    socket.on(`isNewData`, async (data) => {
      await io.emit(`isNewData`, data);
    });
  });
};
