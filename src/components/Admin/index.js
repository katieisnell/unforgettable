import React, { Component } from 'react';

import '../App/App.css';
import desktopImage from '../../assets/paper-desktop.jpg';

import { withFirebase } from '../Firebase';

const imageUrl = desktopImage;

class AdminPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      users: {},
    };
  }

  componentDidMount() {
    this.setState({ loading: true });

    this.props.firebase.users().on('value', snapshot => {

      if (snapshot.exists()) {
        const usersObject = snapshot.val();

        const usersList = Object.keys(usersObject).map(key => ({
          ...usersObject[key],
          uid: key,
        }));
  
        this.setState({
          users: usersList,
          loading: false
        });
      } else {
        console.log('Firebase Snapshot does not exist');
        this.setState({
          loading: false
        });
      }
    });
  }

  componentWillUnmount() {
    this.props.firebase.users().off();
  }

  render() {
    const { users, loading } = this.state;

    return (
      <div className="App" style={{backgroundImage: `url(${imageUrl})` }}>
        <div className="App-content">
          <div className='App-header'>        
            <h1>Admin area (temporary)</h1>
            {loading && <div>Loading ...</div>}
            {users && users.length && <UserList users={users} />}
        </div>
      </div>
    </div>
    );
  }
}

const UserList = ({ users }) => (
  users.map(user => (
    <div key={user.uid}>
      <span>
        <strong>ID</strong> - {user.uid}
      </span>
      <br/>
      <span>
        <strong>Email</strong> - {user.email}
      </span>
      <br/>
      <span>
        <strong>Username</strong> - {user.username}
      </span>
    </div>
  ))
);

export default withFirebase(AdminPage);