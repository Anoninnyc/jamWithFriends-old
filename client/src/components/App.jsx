// Modules
import React, { Component } from 'react';
import io from 'socket.io-client';

// Material.UI
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

// Components
import Nav from '../components/Nav';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
      user: "",
      userInstruments: []
    };
    this.logIn = this.logIn.bind(this);
    this.logOut = this.logOut.bind(this);
    this.updateUserInstrument = this.updateUserInstrument.bind(this);
  }

  getChildContext() {
    return { muiTheme: getMuiTheme(baseTheme) };
  }

  componentWillMount() {
    $.get("/getUserInfo", (resp, err) => {
    // console.log('this the the resp to userloggedintomakeinst', resp);
      if (resp[0] === null) {
     // console.log('youre not logged in!');
      } else {
        this.logIn(JSON.stringify(resp[0]), resp[1]);
      }
    });

    // $.get("/fbLoggedIn", (response, err) => {
    //   if (response !== "false") {
    //     console.log(response[0], typeof response[0], 'here!!!');
    //     this.logIn(response[0], response[1]);
    //   } else {
    //     console.log('not logged to fb');
    //   }
    // });
  }

  updateUserInstrument(totalInstruments) {
    this.setState({
      userInstruments: totalInstruments,
    });
  }

  logIn(userName, userInstruments) {
    this.setState({
      loggedIn: true,
      user: userName,
      userInstruments,
    });
  }

  logOut() {
    this.setState({
      loggedIn: false,
      user: "",
      userInstruments: [],
    });
  }

  render() {
    const children = React.Children.map(this.props.children, child => (
       React.cloneElement(child, {
         loggedIn: this.state.loggedIn,
         logIn: this.logIn,
         logOut: this.logOut,
         user: this.state.user,
         userInstruments: this.state.userInstruments,
         updateUserInstrument: this.updateUserInstrument,
         socket: io()
       })
    ));
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <Nav userInstruments={this.state.userInstruments} logIn={this.logIn} logOut={this.logOut} user={this.state.user} loggedIn={this.state.loggedIn} title={'tbd'} />
       {
          this.props.children ?
            <section className="child">
              {children}
            </section> :
            null
        }
      </div>
    );
  }
}

App.propTypes = {
  children: React.PropTypes.element
};

// For material ui
App.childContextTypes = {
  muiTheme: React.PropTypes.object.isRequired,
};

export default App;
