import React from 'react';
import { Link } from 'react-router-dom';

import '../App/App.css';

import { AuthUserContext } from '../Session';

import SignOutButton from '../SignOut';
import * as ROUTES from '../../constants/routes';
import * as ROLES from '../../constants/roles';

const Navigation = () => (
  <div className="Navigation">
    <AuthUserContext.Consumer>
      {authUser =>
        authUser ? <NavigationAuth authUser={authUser} /> : <NavigationNotAuth />
      }
    </AuthUserContext.Consumer>
  </div>
);

const NavigationAuth = ({ authUser }) => (
  <div>
    <button>
      <Link to={ROUTES.HOME}>Home</Link>
    </button>
    <button>
      <Link to={ROUTES.DASHBOARD}>Dashboard</Link>
    </button>
    <button>
      <Link to={ROUTES.ACCOUNT}>Account</Link>
    </button>
    {!!authUser.roles[ROLES.ADMIN] && (
      <button>
        <Link to={ROUTES.ADMIN}>Admin</Link>
      </button>
    )}
    <SignOutButton />
  </div>
)

const NavigationNotAuth = () => (
  <div>
    <button>
      <Link to={ROUTES.HOME}>Home</Link>
    </button>
    <button>
      <Link to={ROUTES.SIGN_IN}>Sign In</Link>
    </button>
  </div>
)

export default Navigation;