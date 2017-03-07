// Modules
import React from 'react';
import { Route, IndexRoute } from 'react-router';

// Local Imports
import App from './components/App';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Signup from './components/Signup';
import Room from './components/Room';
import CreateOrJoin from './components/CreateOrJoin';
import Invalid from './components/Invalid';
import Metronome from './components/Metronome';
import UserMakeInstrument from './components/UserMakeInstrument';
import BeatSequencer from './components/BeatSequencer';


const isLoggedIn = (x, replace, callback) => {
  $.get("/isLoggedIn", (resp, err) => {
    console.log(resp, err);
      if (resp === "continue") {
        console.log('executing cb');
        callback();
      } else {
        console.log('should force to login', replace);
        location.replace('/login');
      }
  });
};




export default (
  <Route path="/" component={App}>
    <IndexRoute component={LandingPage} />
    <Route path="login" component={Login} />
    <Route path="signup" component={Signup} />
    <Route path="room/:roomId" component={Room} />
    <Route path="createorjoin" component={CreateOrJoin} />
    <Route path="metronome" component={Metronome} />
    <Route path="MakeInstrument" component={UserMakeInstrument} onEnter = {isLoggedIn} />
    <Route path="beats" component={BeatSequencer} />
    <Route path="*" component={Invalid} />
  </Route>
);