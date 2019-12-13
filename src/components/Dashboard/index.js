import React, { Component } from 'react';

import '../App/App.css';
import './Dashboard.css';
import logo from '../../assets/logo.png'
import desktopImage from '../../assets/paper-desktop.jpg';

import  { FirebaseContext, withFirebase } from '../Firebase';
import { AuthUserContext, withAuthorisation } from '../Session';

class Dashboard extends React.Component {
  constructor() {
    super();
    this.state = {
      name: 'Unknown user'
    };
  }

  render() {
    const imageUrl = desktopImage;

    return (
      <div className="App" style={{backgroundImage: `url(${imageUrl})` }}>
        <div className="App-content">
          <a href='/'>
            <img src={logo} className="App-logo" alt="logo" />
          </a>
          <div className='App-header'>
            <h1>Dashboard</h1>
            <FirebaseContext.Consumer>
              {firebase => {
                return <div>The Dashboard is accessible to every signed in user, congrats <span role="img" aria-label="content-face">😌</span></div>;
              }}
            </FirebaseContext.Consumer>
            <Messages />
          </div>
        </div>
      </div>
    );
  }
}

class MessagesBase extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      loading: false,
      messages: [],
    };
  }

  onChangeText = event => {
    this.setState({ text: event.target.value });
  };

  onCreateMessage = (event, authUser) => {
    this.props.firebase.messages().push({
      text: this.state.text,
      userId: authUser
    });

    this.setState({ text: '' });
    event.preventDefault();
  };

  componentDidMount() {
    this.setState({ loading: true });

    this.props.firebase.messages().on('value', snapshot => {
      if (snapshot.exists()) {
        const messageObject = snapshot.val();

        if (messageObject) {
          // Convert message list from snapshot
          const messageList = Object.keys(messageObject).map(key => ({
            ...messageObject[key],
            uid: key,
          }));

          this.setState({
            messages: messageList,
            loading: false
          });
        } else {
          this.setState({ messages: null, loading: false });
        }
      } else {
        console.log('Firebase Snapshot does not exist');
        this.setState({
          loading: false
        });
      }
    });
  }

  componentWillUnmount() {
    this.props.firebase.messages().off();
  }

  render() {
    const { text, messages, loading } = this.state;

    return (
      <AuthUserContext.Consumer>
        {authUser => (
          <div>
            {loading && <div>Loading ...</div>}
            {messages ? (
              <MessageList messages={messages} authUser={authUser}/>
            ) : (
              <div>There are no messages ...</div>
            )}

            <form onSubmit={event => this.onCreateMessage(event, authUser)}>
              <input
                type="text"
                value={text}
                onChange={this.onChangeText}
              />
              <button type="submit">Send</button>
            </form>
          </div>
        )}
      </AuthUserContext.Consumer>
    );
  }
}

const MessageList = ({ messages, authUser }) => (
  <ul>
    {messages.map(message => (
      <MessageItem key={message.uid} message={message} authUser={authUser} />
    ))}
  </ul>
);

const MessageItem = ({ message, authUser }) => (
  (message.userId.username === authUser.username) ? 
    <SentMessageItem message={message} /> : <ReceivedMessageItem message={message} />
);

const SentMessageItem = ({ message }) => (
  <div className="message-sent message-container message-border message-round-xlarge">
    {message.text} <strong>{message.userId.username}</strong> 
  </div>
);

const ReceivedMessageItem = ({ message }) => (
  <div className="message-received message-container message-border message-round-xlarge">
    <strong>{message.userId.username}</strong> {message.text} 
  </div>
);

const Messages = withFirebase(MessagesBase);

const condition = authUser => !!authUser;

export default withAuthorisation(condition)(Dashboard);
