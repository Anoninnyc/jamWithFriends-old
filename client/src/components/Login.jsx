// Modules
import React, { Component } from 'react';
import { Link } from 'react-router';
import $ from 'jquery';
import { showErrorMessage, paperStyle } from '../utils/helperFunctions';

// Material.UI
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Paper from 'material-ui/Paper';

class Login extends Component {

  FBAuth(e) {
    e.preventDefault();
    const linkTag = $('<a href="/auth/facebook"></a>');
    linkTag[0].click();
  }

  helperLogin() {
    const user=$('#UserNameLogin').val();
    const pass= $('#UserNamePass').val();
    $.post("/login", { user, pass, }, (resp) => {
      console.log(typeof resp, resp, 'resp!');
      if (typeof resp !=='string') {
        console.log(resp, this.props.updateUserInstrument);
        this.props.logIn(user, resp);
        this.context.router.push('/');
      } else {
        showErrorMessage("#LIMessages", 'Bad login', "badLogin");
      }
    });
  }

  render() {
    return (
      <div id="loginContent">
        <Paper
          style={paperStyle}
          zDepth={3}
        >
          <div id="LIFields">
            <TextField floatingLabelText="UserName" hintText="Watch caps lock" id="UserNameLogin" /><br />
            <TextField floatingLabelText="Password" hintText="Watch caps lock" id="UserNamePass" type="password" /><br />
            <RaisedButton label="Login" onClick={this.helperLogin} / >
            <Link to="signup"><RaisedButton label="Click to signup" /></Link>
            <RaisedButton id="FBLogin" onClick={this.FBAuth} label="Login with Facebook" />
            <div id="LIMessages"><br /></div>
          </div>
        </Paper>
      </div>
    );
  }
}

Login.propTypes = {
  params: React.PropTypes.object,
  updateUserInstrument: React.PropTypes.func,
  logIn: React.PropTypes.func,
};

Login.contextTypes = {
  router: React.PropTypes.object
};

Login.childContextTypes = {
  muiTheme: React.PropTypes.object.isRequired,
};
export default Login;
