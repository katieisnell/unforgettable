import React from 'react';
import { Button, Grid } from 'semantic-ui-react';

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
          <Grid textAlign='center' verticalAlign='middle'>
            <Grid.Column style={{ maxWidth: 450 }}>
              <Button fluid size='large'>
                <a href={'http://127.0.0.1:8080/?userId=' + authUser.uid}>Connect with Instagram</a>
              </Button>
            </Grid.Column>
          </Grid>
        </div>
      </div>
    )}
  </AuthUserContext.Consumer>
);

const condition = authUser => !!authUser;

export default withAuthorisation(condition)(AccountPage);