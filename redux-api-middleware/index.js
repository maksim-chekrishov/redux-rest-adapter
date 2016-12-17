var regeneratorRuntime = require('babel-runtime/regenerator');

// Fix issue https://github.com/agraboso/redux-api-middleware/issues/83
if (!regeneratorRuntime.default) {
  regeneratorRuntime.default = regeneratorRuntime;
}
module.exports = require('redux-api-middleware');
