"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Message = function Message(_ref) {
  var message = _ref.message,
      user_id = _ref.user_id;

  var fromMe = message.sender.userId === user_id;

  return _react2.default.createElement(
    "div",
    { className: "message " + (fromMe ? "from-me" : "from-support") },
    _react2.default.createElement(
      "div",
      { className: "text" },
      message.event.content.body
    )
  );
};

exports.default = Message;