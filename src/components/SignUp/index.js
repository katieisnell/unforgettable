import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { Button, Form, Grid, Header, Icon, Message, Modal, Segment } from 'semantic-ui-react'

import '../App/App.css';

import Tape from '../Tape';

import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';
import * as ROLES from '../../constants/roles';

const SignUpPage = () => (
  <div className="App">
    <div className="App-content">
      <div className='App-header'>
        <Tape text={'Sign Up'}/>
        <SignUpForm />
      </div>
    </div>
  </div>
);

const INITIAL_STATE = {
  username: '',
  email: '',
  passwordOne: '',
  passwordTwo: '',
  isAdmin: false,
  error: null,
  modalOpen: false
};

class SignUpFormBase extends Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  onChangeCheckbox = event => {
    this.setState({ [event.target.name]: event.target.checked });
  };

  onSubmit = event => {
    const { username, email, passwordOne, isAdmin } = this.state;
    const roles = {};

    if (isAdmin) {
      roles[ROLES.ADMIN] = ROLES.ADMIN;
    }

    this.props.firebase
      .doCreateUserWithEmailAndPassword(email, passwordOne)
      .then(authUser => {
        // Create a user in the realtime database
        return this.props.firebase
          .user(authUser.user.uid)
          .set({
            username,
            email,
            roles
          });
      })
      .then(authUser => {
        this.setState({ ...INITIAL_STATE });
        this.props.history.push(ROUTES.USER_UPLOADED_DASHBOARD);
      })
      .catch(error => {
        this.setState({ error });
      });
    event.preventDefault();
  }

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleClose = () => this.setState({ modalOpen: false, error: null })

  render() {
    const {
      username,
      email,
      passwordOne,
      passwordTwo,
      error
    } = this.state;

    const isInvalid =
      passwordOne !== passwordTwo ||
      passwordOne === '' ||
      email === '' ||
      username === '';

    return (
      <>
      <Grid textAlign='center' verticalAlign='middle'>
        <Grid.Column style={{ minWidth: 290, maxWidth: 450 }}>
          <Form size='huge' onSubmit={this.onSubmit}>
            <Segment >
              <Form.Input 
                fluid icon='user' 
                iconPosition='left' 
                name="username"
                value={username}
                onChange={this.onChange}
                type="text"
                placeholder="Full name"
              />
              <Form.Input 
                fluid icon='mail' 
                iconPosition='left' 
                name="email"
                value={email}
                onChange={this.onChange}
                type="text"
                placeholder="Email address"
              />
              <Form.Input 
                fluid icon='lock' 
                iconPosition='left' 
                name="passwordOne"
                value={passwordOne}
                onChange={this.onChange}
                type="password"
                placeholder="Password"
              />
              <Form.Input
                fluid
                icon='lock'
                iconPosition='left'
                name="passwordTwo"
                value={passwordTwo}
                onChange={this.onChange}
                type="password"
                placeholder="Confirm password"
              />
              <Button disabled={isInvalid} type="submit" fluid size='large'>
                  Sign up
              </Button>
            </Segment>
          </Form>
        </Grid.Column>
      </Grid>
      <Modal
        centered={false}
        open={error !== null}
        onClose={this.handleClose}
        size='small'
        dimmer={'blurring'}
      >
        <Header icon='exclamation triangle' content='Error entering details' />
          <Modal.Content>
            <p>
              {error && error.message}
            </p>
          </Modal.Content>
          <Modal.Actions>
          <Button color='green' onClick={this.handleClose} inverted>
            <Icon name='checkmark' /> Got it!
          </Button>
        </Modal.Actions>
      </Modal>
      </>
    );
  }
}

const SignUpForm = compose(
  withRouter,
  withFirebase,
) (SignUpFormBase);

const SignUpLink = () => (
  <Message>
    Don't have an account? <a href={ROUTES.SIGN_UP}>Sign Up</a> <span role="img" aria-label="content-face">😌</span>
  </Message>
);

export default SignUpPage;
export { SignUpForm, SignUpLink };