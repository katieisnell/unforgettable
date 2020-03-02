import React from 'react';

import '../App/App.css';

import Tape from '../Tape';

import { AuthUserContext, withAuthorisation } from '../Session';

const AccountPage = () => (
  <AuthUserContext.Consumer>
    {authUser => (
      <div className='App'>
        <div className='App-content'>
          <div className='App-header'>
            <Tape text={'Your Account'}/>
          </div>
          <p>Welcome {authUser.username} <span role='img' aria-label='wave'>👋</span></p>
          <p><span role='img' aria-label='mail'>✉️</span> {authUser.email}</p>
        </div>
      </div>
    )}
  </AuthUserContext.Consumer>
);

const condition = authUser => !!authUser;

export default withAuthorisation(condition)(AccountPage);