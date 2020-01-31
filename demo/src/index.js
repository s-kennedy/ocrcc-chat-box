import React from 'react';
import { render } from 'react-dom';

import ChatBox from '../../src/ChatBox';

import "./index.scss"


class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }


  render() {
    return (
      <div>
        <div className="wrapper">
          <div className="flex-container">
            <div className="flex-item desc">
              <h1>OCRCC Chatbox Demo</h1>
            </div>
          </div>

          <div className="flex-container">
            <div className="flex-item">
              <ChatBox
              />
            </div>
          </div>
        </div>

        <footer>
          <small>Created by <a href="https://www.nomadiclabs.ca">Nomadic Labs</a></small>
        </footer>

      </div>
    )
  }

}

render(<App />, document.getElementById("root"));