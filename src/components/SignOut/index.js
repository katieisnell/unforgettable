import React from 'react';
import { Menu } from 'semantic-ui-react'

import { withFirebase } from '../Firebase';

const SignOutButton = ({ firebase }) => (
  <Menu.Item
    name='logout'
    onClick={firebase.doSignOut}
  />
);

export default withFirebase(SignOutButton);