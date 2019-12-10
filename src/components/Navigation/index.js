import React from 'react';
import { Link } from 'react-router-dom';

import '../App/App.css';

import { AuthUserContext } from '../Session';

import SignOutButton from '../SignOut';
import * as ROUTES from '../../constants/routes';

const Navigation = () => (
  <div className="Navigation">
    <AuthUserContext.Consumer>
      {authUser =>
        authUser ? <NavigationAuth /> : <NavigationNotAuth />
      }
    </AuthUserContext.Consumer>
  </div>
);

const NavigationAuth = () => (
  <div className="Navigation">
    <Link to={ROUTES.HOME}>Home</Link>
    <Link to={ROUTES.DASHBOARD}>Dashboard</Link>
    <Link to={ROUTES.ACCOUNT}>Account</Link>
    <Link to={ROUTES.ADMIN}>Admin</Link>
    <SignOutButton />
  </div>
)

const NavigationNotAuth = () => (
  <div className="Navigation">
    <Link to={ROUTES.HOME}>Home</Link>
    <Link to={ROUTES.SIGN_IN}>Sign In</Link>
  </div>
)

export default Navigation;