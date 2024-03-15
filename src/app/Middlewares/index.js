const { requestLimit } = require("./requestLimit");
const AUTH_TOKEN = require("./authenticateToken");

const onRouteCustom = (
  app,
  controllerName,
  method,
  route,
  handler,
  role = "USER"
) => {
  app[method](
    `/api/v1/${controllerName}${route}`,
    requestLimit(controllerName),
    AUTH_TOKEN(role).authenticateToken,
    handler
  );
};

module.exports = { onRouteCustom };
