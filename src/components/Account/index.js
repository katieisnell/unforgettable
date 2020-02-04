import React from 'react';

import '../App/App.css';
import logo from '../../assets/logo.png'
import desktopImage from '../../assets/paper-desktop.jpg';

import Tape from '../Tape';

import { AuthUserContext, withAuthorisation } from '../Session';

const imageUrl = desktopImage;

const AccountPage = () => (
  <AuthUserContext.Consumer>
    {authUser => (
      <div className="App" style={{backgroundImage: `url(${imageUrl})` }}>
        <div className="App-content">
          <a href='/'>
            <img src={logo} className="App-logo" alt="logo" />
          </a>
          <div className='App-header'>
            <Tape text={'Your Account'}/>
            <p>Welcome {authUser.email}</p>
          </div>
        </div>
      </div>
    )}
  </AuthUserContext.Consumer>
);

const condition = authUser => !!authUser;

export default withAuthorisation(condition)(AccountPage);