import React, { Component } from "react";
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import $ from "jquery";
import { Link } from 'react-router';
import Paper from 'material-ui/Paper';
import { showErrorMessage, paperStyle } from '../utils/helperFunctions';

class Signup extends Component {

  constructor({login}){
    super({login});

  }
  helperSignup() {
    const user = $('#UserNameSignUp').val();
    const pass = $('#UserNamePass').val();
    if (user.length<7) {
      showErrorMessage("#SIMessages", 'Username must be 7+ characters', "notLongEnough");
    } else if (pass.length<7) {
      showErrorMessage("#SIMessages", 'Pass must be 7+ characters', "passNotLongEnough");
    } else if (/\W/.test(user) === true || /\W/.test(pass) === true) {
      showErrorMessage("#SIMessages", 'Letters and Numbers Only!', "regexError");
    } else {
      $.post("/signup", { user, pass }, resp => {
        if (resp === "SuccessSignup") {
          this.props.logIn(user, []);
          this.context.router.push('/');
        } else {
          showErrorMessage("#SIMessages", 'Username Taken', "badSignUp");
        }
      });
    }
  }


  render() {
    return (
      <div id="signupContent">
        <Paper
          style={paperStyle}
          zDepth={3}
        >
          <div id="SIFields">
            <TextField floatingLabelText="UserName" hintText="Must be 7+ characters" id="UserNameSignUp" type="text" /><br />
            <TextField floatingLabelText="Password" hintText="Must be 7+ characters" id="UserNamePass" type="password" /><br />
            <RaisedButton label="Signup" onClick={() => { this.helperSignup(); }} />
            <Link to="/login" ><RaisedButton label="Click to Login Instead" /> </Link >
            <div id="SIMessages"><br /> </div>
          </div>
        </Paper>
      </div>
    );
  }
}

Signup.contextTypes = {
  router: React.PropTypes.object
};

Signup.propTypes = {
  logIn: React.PropTypes.func,
};

Signup.childContextTypes = {
  muiTheme: React.PropTypes.object.isRequired,
};

export default Signup;
