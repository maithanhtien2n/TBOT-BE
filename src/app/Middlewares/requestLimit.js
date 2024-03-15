const rateLimit = require("express-rate-limit");

module.exports = {
  requestLimit: (controllerName) => {
    let maxLimit = 0;
    switch (controllerName) {
      case "bot-audio":
        maxLimit = 13;
        break;
      case "bot-image":
        maxLimit = 5;
        break;
      case "bot-versatile":
        maxLimit = 15;
        break;
      case "document":
        maxLimit = 20;
        break;
      case "notification":
        maxLimit = 20;
        break;
      case "question":
        maxLimit = 20;
        break;
      case "user":
        maxLimit = 20;
        break;
      case "virtual-assistant":
        maxLimit = 15;
        break;
      default:
        maxLimit = 20;
    }
    return rateLimit({
      windowMs: 60 * 1000, // 1 phút
      max: maxLimit, // Số lần yêu cầu tối đa trong 1 phút
      message: "Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau một chút.",
    });
  },
};
