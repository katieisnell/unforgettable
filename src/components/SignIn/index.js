import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { Button, Form, Grid, Header, Icon, Modal, Segment } from 'semantic-ui-react'

import '../App/App.css';

import Tape from '../Tape';

import { SignUpLink } from '../SignUp';
import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';

const SignInPage = () => (
  <div className='App'>
    <div className='App-content'>
      <div className='App-header'>
        <Tape text={'Sign In'}/>
      </div>
        <SignInForm />
    </div>
  </div>
);

const INITIAL_STATE = {
  email: '',
  password: '',
  error: null,
  modalOpen: false
};

class SignInFormBase extends Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  onSubmit = event => {
    const { email, password } = this.state;
    this.props.firebase
      .doSignInWithEmailAndPassword(email, password)
      .then(() => {
        this.setState({ ...INITIAL_STATE });
        this.props.history.push(ROUTES.USER_UPLOADED_DASHBOARD);
      })
      .catch(error => {
        this.setState({ error });
      });
    event.preventDefault();
  };

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleClose = () => this.setState({ modalOpen: false, error: null })

  render() {
    const { email, password, error } = this.state;
    const isInvalid = password === '' || email === '';
    return (
      <>
      <Grid textAlign='center' verticalAlign='middle'>
        <Grid.Column style={{ maxWidth: 450 }}>
          <Form size='huge' onSubmit={this.onSubmit}>
            <Segment >
              <Form.Input 
                fluid icon='mail' 
                iconPosition='left' 
                name='email'
                value={email}
                onChange={this.onChange}
                type='text'
                placeholder='Email address' 
              />
              <Form.Input
                fluid
                icon='lock'
                iconPosition='left'
                placeholder='Password'
                type='password'
                name='password'
                value={password}
                onChange={this.onChange}
              />
              <Button disabled={isInvalid} type='submit' fluid size='large'>
                  Sign In
              </Button>
              <div>OR</div>
              <Button fluid size='large'>
                <a href='http://iam-research.manchester.ac.uk/instagram/'>Sign In with Instagram</a>
              </Button>
            </Segment>
          </Form>
          <SignUpLink />
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

const SignInForm = compose(
  withRouter,
  withFirebase,
)(SignInFormBase);

export default SignInPage;
export { SignInForm };