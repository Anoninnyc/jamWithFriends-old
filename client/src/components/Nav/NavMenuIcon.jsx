// Modules

import React from 'react';
import { Link } from 'react-router';

// Material.UI

import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';

// How to wrap `MenuItem` components inside of `Link` components without warnings?
// https://github.com/callemall/material-ui/issues/4899
const NavMenuIcon = ({ loggedIn, FBAuth, clearSessions }) => (
  <IconMenu
    iconButtonElement={
      <IconButton>
        <MoreVertIcon />
      </IconButton>
    }

    targetOrigin={{ horizontal: 'right', vertical: 'top' }}
    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    className="menu"
    menuStyle={{ backgroundColor: 'rgba(184, 225, 255, 0.5)', color: '#6F8695' }}
  >


    {!loggedIn?
      <div>
        <MenuItem
          primaryText="Login"
          containerElement={<Link to="/login" />}
        />
        <MenuItem
          primaryText="Sign up"
          containerElement={<Link to="/signup" />}
        />
      </div>
    :
      <div>
        <MenuItem
          onClick={clearSessions}
          primaryText="Signout"
          containerElement={<Link to="/" />}
        />
        <MenuItem
          primaryText="Make your own instrument"
          containerElement={<Link to="/MakeInstrument" />}
        />
      </div>}
  </IconMenu>
);

NavMenuIcon.propTypes = {
  loggedIn: React.PropTypes.bool,
  FBAuth: React.PropTypes.func,
  clearSessions: React.PropTypes.func,
};

export default NavMenuIcon;
