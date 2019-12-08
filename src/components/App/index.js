import React, { Component } from 'react';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';

import './App.css';

import { withFirebase } from '../Firebase';

import AccountPage from '../Account';
import AdminPage from '../Admin';
import DashboardPage from '../Dashboard';
import HomePage from '../Home';
import Navigation from '../Navigation';
import NotFoundPage from '../NotFound';
import PasswordForgetPage from '../PasswordForget';
import SignInPage from '../SignIn';
import SignUpPage from '../SignUp';
import * as ROUTES from '../../constants/routes';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authUser: null,
    };
  }

  componentDidMount() {
    this.props.firebase.auth.onAuthStateChanged(authUser => {
      authUser
        ? this.setState({ authUser })
        : this.setState({ authUser: null });
    });
  }

  componentWillUnmount() {
    this.listener();
  }

  render() {
    return (
      <Router>
        <Navigation authUser={this.state.authUser} />
    
        <Switch>
          <Route exact path={ROUTES.HOME} component={HomePage} />
          <Route path={ROUTES.SIGN_UP} component={SignUpPage} />
          <Route path={ROUTES.SIGN_IN} component={SignInPage} />
          <Route path={ROUTES.PASSWORD_FORGET} component={PasswordForgetPage} />
          <Route path={ROUTES.DASHBOARD} component={DashboardPage} />
          <Route path={ROUTES.ACCOUNT} component={AccountPage} />
          <Route path={ROUTES.ADMIN} component={AdminPage} />
          <Route component={NotFoundPage} />
        </Switch>
      </Router>
    );
  }
}

export default withFirebase(App);
