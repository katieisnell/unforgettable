import React, { Component } from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import { compose } from 'recompose';

import '../App/App.css';

import Tape from '../Tape';

import { withFirebase } from '../Firebase';
import { AuthUserContext, withAuthorisation } from '../Session';

import * as ROUTES from '../../constants/routes';
import * as ROLES from '../../constants/roles';

const AdminPage = () => (
  <AuthUserContext.Consumer>
    {authUser => (
      <div className="App">
        <div className="App-content">
          <div className='App-header'>  
            <Tape text={'Admin area'}/>
            <p>
              The Admin area is accessible by every signed in admin user.
            </p>
            <Switch>
              <Route exact path={ROUTES.ADMIN_DETAILS} component={UserItem} />
              <Route exact path={ROUTES.ADMIN} component={UserList} />
            </Switch>
          </div>
        </div>
      </div>
    )}
  </AuthUserContext.Consumer>
);

class UserListBase extends Component {
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
      <div>
        {loading && <div>Loading ...</div>}
        {users && users.length && 
          users.map(user => (
            <div key={user.uid}>
              <hr/>
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
              <br/>
              <span>
                <Link
                  to={{
                    pathname: `${ROUTES.ADMIN}/${user.uid}`,
                    state: { user },
                  }}
                >                  
                  Details
                </Link>
              </span>
            </div>
          ))}
      </div>
    );
  }
}

class UserItemBase extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      user: null,
      ...props.location.state,
    };
  }

  componentDidMount() {
    if (this.state.user) {
      return;
    }

    this.setState({ loading: true });
    this.props.firebase
      .user(this.props.match.params.id)
      .on('value', snapshot => {
        this.setState({
          user: snapshot.val(),
          loading: false,
        });
      });
  }

  componentWillUnmount() {
    this.props.firebase.user(this.props.match.params.id).off();
  }

  render() {
    const { user, loading } = this.state;
    return (
      <div>
        <h2>User ({this.props.match.params.id})</h2>
        {loading && <div>Loading ...</div>}
        {user && (
          <div>
            <span>
              <strong>ID:</strong> {user.uid}
            </span>
            <br/>
            <span>
              <strong>Email:</strong> {user.email}
            </span>
            <br/>
            <span>
              <strong>Username:</strong> {user.username}
            </span>
          </div>
        )}
      </div>
    );  }
}

const UserList = withFirebase(UserListBase);
const UserItem = withFirebase(UserItemBase);

const condition = authUser =>
  authUser && !!authUser.roles[ROLES.ADMIN];

export default compose(
  withAuthorisation(condition),
  withFirebase,
)(AdminPage);