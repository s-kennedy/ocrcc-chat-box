'use strict';

var _reactDom = require('react-dom');

var _ChatBox = require('./ChatBox');

var _ChatBox2 = _interopRequireDefault(_ChatBox);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(function () {
  var chatboxRoot = document.createElement('div');
  chatboxRoot.id = "ocrcc-chatbox";
  chatboxRoot.style.cssText = 'position:fixed;bottom:10px;right:10px;width:50px;height:50px;z-index:100;background:#000;';
  document.body.appendChild(chatboxRoot);

  (0, _reactDom.render)(React.createElement(_ChatBox2.default, null), chatboxRoot);
})();