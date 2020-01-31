"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _matrixJsSdk = require("matrix-js-sdk");

var sdk = _interopRequireWildcard(_matrixJsSdk);

var _uuidv = require("uuidv4");

var _Message = require("./Message");

var _Message2 = _interopRequireDefault(_Message);

require("./chat.scss");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MATRIX_SERVER_ADDRESS = "https://matrix.rhok.space";
var FACILITATOR_USERNAME = "@anonymouscat:rhok.space";
var CHATROOM_NAME = "Support Chat";

var ChatBox = function (_React$Component) {
  _inherits(ChatBox, _React$Component);

  function ChatBox(props) {
    _classCallCheck(this, ChatBox);

    var _this = _possibleConstructorReturn(this, (ChatBox.__proto__ || Object.getPrototypeOf(ChatBox)).call(this, props));

    _this.leaveRoom = function () {
      if (_this.state.room_id) {
        _this.state.client.leave(_this.state.room_id).then(function (data) {
          console.log("Left room", data);
        });
      }
    };

    _this.createRoom = function () {
      return _this.state.client.createRoom({
        room_alias_name: "private-support-chat-" + (0, _uuidv.uuid)(),
        invite: [FACILITATOR_USERNAME], // TODO: create bot user to add
        visibility: 'private',
        name: CHATROOM_NAME
      }).then(function (data) {
        _this.setState({ room_id: data.room_id });
      });
    };

    _this.sendMessage = function () {
      var content = {
        "body": _this.state.inputValue,
        "msgtype": "m.text"
      };

      _this.state.client.sendEvent(_this.state.room_id, "m.room.message", content, "").then(function (res) {
        _this.setState({ inputValue: "" });
        _this.chatboxInput.current.focus();
      }).catch(function (err) {
        console.log(err);
      });
    };

    _this.handleInputChange = function (e) {
      _this.setState({ inputValue: e.currentTarget.value });
    };

    _this.handleSubmit = function (e) {
      e.preventDefault();
      if (!Boolean(_this.state.inputValue)) return null;

      if (!_this.state.room_id) {
        return _this.createRoom().then(_this.sendMessage);
      }

      _this.sendMessage();
    };

    var client = sdk.createClient(MATRIX_SERVER_ADDRESS);
    _this.state = {
      client: client,
      ready: false,
      rooms: { chunk: [] },
      access_token: null,
      user_id: null,
      messages: [],
      inputValue: ""
    };
    _this.chatboxInput = _react2.default.createRef();
    return _this;
  }

  _createClass(ChatBox, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this2 = this;

      // empty registration request to get session
      this.state.client.registerRequest({}).then(function (data) {
        console.log("Empty registration request to get session", data);
      }).catch(function (err) {
        // actual registration request with randomly generated username and password
        var username = (0, _uuidv.uuid)();
        var password = (0, _uuidv.uuid)();
        _this2.state.client.registerRequest({
          auth: { session: err.data.session, type: "m.login.dummy" },
          inhibit_login: false,
          password: password,
          username: username,
          x_show_msisdn: true
        }).then(function (data) {
          console.log("Registered user", data);
          _this2.setState({
            access_token: data.access_token,
            user_id: data.user_id,
            username: username,
            client: sdk.createClient({
              baseUrl: MATRIX_SERVER_ADDRESS,
              accessToken: data.access_token,
              userId: data.user_id
            })
          });
        }).catch(function (err) {
          console.log("Registration error", err);
        });
      });
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps, prevState) {
      var _this3 = this;

      if (prevState.client !== this.state.client) {
        this.state.client.startClient();

        this.state.client.once('sync', function (state, prevState, res) {
          if (state === "PREPARED") {
            _this3.setState({ ready: true });
          }
        });

        this.state.client.on("Room.timeline", function (event, room, toStartOfTimeline) {
          if (event.getType() === "m.room.message") {
            var messages = [].concat(_toConsumableArray(_this3.state.messages));
            messages.push(event);
            _this3.setState({ messages: messages });
          }
        });
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.leaveRoom();
    }
  }, {
    key: "render",
    value: function render() {
      var _state = this.state,
          ready = _state.ready,
          messages = _state.messages,
          inputValue = _state.inputValue,
          user_id = _state.user_id;


      if (!ready) {
        return _react2.default.createElement(
          "div",
          { className: "loader" },
          "loading..."
        );
      }

      return _react2.default.createElement(
        "div",
        { id: "ocrcc-chatbox" },
        _react2.default.createElement(
          "div",
          { className: "message-window" },
          messages.map(function (message, index) {
            return _react2.default.createElement(_Message2.default, { key: message.event.event_id, message: message, user_id: user_id });
          })
        ),
        _react2.default.createElement(
          "div",
          { className: "input-window" },
          _react2.default.createElement(
            "form",
            { onSubmit: this.handleSubmit },
            _react2.default.createElement("input", {
              type: "text",
              onChange: this.handleInputChange,
              value: inputValue,
              autoFocus: true,
              ref: this.chatboxInput
            }),
            _react2.default.createElement("input", { type: "submit", value: "Send" })
          )
        )
      );
    }
  }]);

  return ChatBox;
}(_react2.default.Component);

;

ChatBox.propTypes = {};

ChatBox.defaultProps = {};

exports.default = ChatBox;