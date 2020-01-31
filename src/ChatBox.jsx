import React from "react"
import PropTypes from "prop-types"
import * as sdk from "matrix-js-sdk";
import {uuid} from "uuidv4"

import Message from "./Message";

import "./chat.scss"

const matrixServerAddress = "https://matrix.rhok.space"


class ChatBox extends React.Component {
  constructor(props) {
    super(props)
    const client = sdk.createClient(matrixServerAddress)
    this.state = {
      client: client,
      ready: false,
      rooms: { chunk: [] },
      access_token: null,
      user_id: null,
      messages: [],
      inputValue: "",
    }
  }

  componentDidMount() {
    // empty registration request to get session
    console.log("this.state", this.state)
    this.state.client.registerRequest({}).then(data => {
      console.log("Empty registration request to get session", data)
    }).catch(err => {
      // actual registration request with randomly generated username and password
      const username = uuid()
      const password = uuid()
      this.state.client.registerRequest({
        auth: {session: err.data.session, type: "m.login.dummy"},
        inhibit_login: false,
        password: password,
        username: username,
        x_show_msisdn: true,
      }).then(data => {
        console.log("Registration data", data)
        this.setState({
          access_token: data.access_token,
          user_id: data.user_id,
          username: username,
          client: sdk.createClient({
            baseUrl: matrixServerAddress,
            accessToken: data.access_token,
            userId: data.user_id
          })
        })
      }).catch(err => {
        console.log("registration error", err)
      })
    })
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.client !== this.state.client) {
      this.state.client.startClient()
      this.state.client.createRoom({
        room_alias_name: `private-support-chat-${uuid()}`,
        invite: ["@anonymouscat:rhok.space"], // TODO: create bot user to add
        visibility: 'private',
        name: 'Support Chat'
      }).then(data => {
        this.setState({ room_id: data.room_id })
      })

      this.state.client.once('sync', (state, prevState, res) => {
        if (state === "PREPARED") {
          this.setState({ ready: true })
        }
      });

      this.state.client.on("Room.timeline", (event, room, toStartOfTimeline) => {
        if (event.getType() === "m.room.message") {
          const messages = [...this.state.messages]
          messages.push(event)
          this.setState({ messages })
        }
      });
    }
  }

  handleInputChange = e => {
    this.setState({ inputValue: e.currentTarget.value })
  }

  handleSubmit = e => {
    e.preventDefault()
    const content = {
      "body": this.state.inputValue,
      "msgtype": "m.text"
    };

    this.state.client.sendEvent(this.state.room_id, "m.room.message", content, "").then((res) => {
      this.setState({ inputValue: "" })
    }).catch((err) => {
      console.log(err);
    })
  }

  render() {
    const { ready, messages, inputValue, user_id } = this.state;

    if (!ready) {
      return (
        <div>loading...</div>
      )
    }

    return (
      <div id="ocrcc-chatbox">
        <div className="message-window">
          {
            messages.map((message, index) => {
              return(
                <Message key={message.event.event_id} message={message} user_id={user_id} />
              )
            })
          }
        </div>
        <div className="input-window">
          <form onSubmit={this.handleSubmit}>
            <input type="text" onChange={this.handleInputChange} value={inputValue} autoFocus={true} />
            <input type="submit" />
          </form>
        </div>
      </div>
    );
  }
};

ChatBox.propTypes = {

}

ChatBox.defaultProps = {

}

export default ChatBox;

