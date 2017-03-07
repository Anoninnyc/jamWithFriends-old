// Modules

import React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

// Material.UI
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

const email = (address) => {
  window.open(`mailto:someone@example.com?subject=Let's jam!&body= Join here: ${address}!`);
};


const Invite = ({ open, onRequestClose }) => (
  <Dialog
    title="Share!"
    open={open}
    onRequestClose={onRequestClose}
  >
    Copy this link and send it to a friend so they can play with you!<br />
    {window.location.href}
    <CopyToClipboard
      text={window.location.href}
      onCopy={onRequestClose}
    >
      <FlatButton label="Copy" />
    </CopyToClipboard>
    <a onClick = {( )=> email(window.location.href)}><FlatButton label="Mail!" /></a>
  </Dialog>
);

Invite.propTypes = {
  open: React.PropTypes.bool.isRequired,
  onRequestClose: React.PropTypes.func
};

export default Invite;
