import React from 'react';
import { Link } from 'react-router-dom';

import '../App/App.css';

import SignOutButton from '../SignOut';
import * as ROUTES from '../../constants/routes';

const Navigation = () => (
  <div className="Navigation">
    <Link to={ROUTES.HOME}>Home</Link>
    <Link to={ROUTES.DASHBOARD}>Dashboard</Link>
    <Link to={ROUTES.ACCOUNT}>Account</Link>
    <Link to={ROUTES.ADMIN}>Admin</Link>
    <Link to={ROUTES.SIGN_IN}>Sign In</Link>
    <SignOutButton />
  </div>
);

export default Navigation;