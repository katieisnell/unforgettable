import React from 'react';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';

import './App.css';

import { withFirebase } from '../Firebase';
import { withAuthentication } from '../Session';

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

const App = () => (
  <Router>
    <Navigation/>

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
)

export default withAuthentication(App);
