import React, { Component } from 'react'
import { Link } from 'react-router-dom';
import { Menu } from 'semantic-ui-react'

import '../App/App.css';

import { AuthUserContext } from '../Session';

import SignOutButton from '../SignOut';
import * as ROUTES from '../../constants/routes';
import * as ROLES from '../../constants/roles';

class Navigation extends Component {
  state = { activeItem: 'home' }

  handleItemClick = (e, { name }) => this.setState({ activeItem: name })

  render() {
    const { activeItem } = this.state

    return (
      <div className='Navigation'>
        <AuthUserContext.Consumer>
          {authUser =>
            <Menu secondary size='huge'>
            <Menu.Item
              name='home'
              active={activeItem === 'home'}
              as={Link}
              to={ROUTES.HOME}
              onClick={this.handleItemClick}
            />
            {authUser && (
              <>
              <Menu.Item
                name='userMoments'
                active={activeItem === 'userMoments'}
                as={Link}
                to={ROUTES.USER_UPLOADED_DASHBOARD}
                onClick={this.handleItemClick}
              />
              <Menu.Item
                name='instagramMedia'
                active={activeItem === 'instagramMedia'}
                as={Link}
                to={ROUTES.INSTA_UPLOADED_DASHBOARD}
                onClick={this.handleItemClick}
              />
              <Menu.Item
                name='account'
                active={activeItem === 'account'}
                as={Link}
                to={ROUTES.ACCOUNT}
                onClick={this.handleItemClick}
              />
              {!!authUser.roles[ROLES.ADMIN] && (
                <Menu.Item
                  name='admin'
                  active={activeItem === 'admin'}
                  as={Link}
                  to={ROUTES.ADMIN}
                  onClick={this.handleItemClick}
                />
              )}
              </>
            )}
            <Menu.Menu position='right'>
              {authUser ? (
                  <SignOutButton />
                ) : (
                  <Menu.Item
                    name='signIn'
                    active={activeItem === 'signIn'}
                    as={Link}
                    to={ROUTES.SIGN_IN}
                    onClick={this.handleItemClick}
                  />
                )}
            </Menu.Menu>
          </Menu>
          }
        </AuthUserContext.Consumer>
      </div>
    )
  }
}

export default Navigation;