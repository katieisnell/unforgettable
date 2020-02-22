import React from 'react';

import '../App/App.css';

import Tape from '../Tape';

import { AuthUserContext, withAuthorisation } from '../Session';

const AccountPage = () => (
  <AuthUserContext.Consumer>
    {authUser => (
      <div className="App">
        <div className="App-content">
          <div className='App-header'>
            <Tape text={'Your Account'}/>
          </div>
          <p>Welcome {authUser.email}</p>
        </div>
      </div>
    )}
  </AuthUserContext.Consumer>
);

const condition = authUser => !!authUser;

export default withAuthorisation(condition)(AccountPage);