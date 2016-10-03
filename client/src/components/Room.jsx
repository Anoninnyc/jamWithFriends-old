// Modules
import React from 'react';
import { MembraneSynth } from "tone";

// Components
import SelectInstrument from './SelectInstrument';
import JamRoom from './JamRoom';
import Help from './Help';

// Util
import connectionManager from '../rtc';
import { store, instruments } from '../instruments/store';
import { animateInst, mapKeysToIds, mapPianoKeysToIds, mapBlackPianoKeysToIds, soundConfig } from '../utils/helperFunctions';

class Room extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      connected: connectionManager.isConnected(),
      instrument: instruments[0],
      mapping: [],
      startJam: false,
      peers: [],
      showPopover: false
    };

    this.updateConnection = this.updateConnection.bind(this);
    this.handleKeypress = this.handleKeypress.bind(this);
    this.handleStart = this.handleStart.bind(this);
    this.handlePeerInfo = this.handlePeerInfo.bind(this);
    this.handleHelp = this.handleHelp.bind(this);
    this.selectInstrument = this.selectInstrument.bind(this);
  }

  componentDidMount() {
    connectionManager.setup(this.props.params.roomId);
    connectionManager.onStatusChange(this.updateConnection);
    console.log("tpui",this.props.userInstruments);//
    // this will update uniue user instruments with those made in the same session.
    // event listener for keypress
    window.addEventListener('keypress', this.handleKeypress);
    this.props.socket.emit('add as listener', this.props.params.roomId);
  }

  componentWillUnmount() {
    connectionManager.offStatusChange(this.updateConnection);
    window.removeEventListener('keypress', this.handleKeypress);
    connectionManager.closeConnection();
    this.props.socket.removeListener('receive peer info', this.handlePeerInfo);
  }

  setSocketListeners() {
    this.props.socket.on('invalid room', () => {
      this.context.router.push('/invalid');
    });

    connectionManager.peerSocket().on('remove connection', id => {
      const dummyArr = this.state.peers.slice();
      for (let i = 0; i < dummyArr.length; i++) {
        if (dummyArr[i].peerId === id) {
          dummyArr.splice(i, 1);
          break;
        }
      }
      this.setState({
        peers: dummyArr,
      });
    });
  }

  handleKeypress(e) {
    if (store[this.state.instrument]) {
      console.log('e.key', e.key);
      store[this.state.instrument](e.key);

      const keyBlack=e.key.toUpperCase();

      if (mapPianoKeysToIds[keyBlack]) {
        animateInst(mapPianoKeysToIds[keyBlack], "black", "white", 20);
      }

      if (mapBlackPianoKeysToIds[keyBlack]) {
        animateInst(mapBlackPianoKeysToIds[keyBlack], "white", "black", 20);
      }


      if (this.state.startJam) {
        connectionManager.sendMessage(JSON.stringify({
          instrument: this.state.instrument,
          keyPressed: e.key,
          notesToPlay: [null, null, null],
        }));
      }
    } else {
      const instMap = this.state.mapping;
      const keyPressed = e.key.toUpperCase();
      const sequence = JSON.parse(instMap[keyPressed]);
      const note = sequence[1];
      const octave = sequence[2];
      const pd = sequence[3];
      const type = sequence[4];
      const combo = `${note}${octave}`;
      // console.log(sequence, note, octave, pd, type, combo);
      const config = soundConfig(type, pd);
      // console.log(instMap, keyPressed, note, octave, pd, type, combo);

      const zimit = new MembraneSynth(config).toMaster();
      zimit.triggerAttackRelease(combo, '8n');
      console.log('e info', e.which, e.key);

      const keyBlack=e.key.toUpperCase();

      animateInst(mapKeysToIds[keyBlack], "black", "white", 20);

      if (this.state.startJam) {
        console.log('gonna send them keyInfo');
        connectionManager.sendMessage(JSON.stringify({
          instrument: this.state.instrument,
          keyPressed: e.key,
          notesToPlay: [combo, pd, type],
        }));
      }
    }
  }

  handleStart() {
    this.setState({ startJam: true });
    connectionManager.onMessage(data => {
      console.log('data!!', data);
      data = JSON.parse(data);
      if (store[data.instrument]) {
        data.instrument==='drums'?store.drums(data.idToPlay):store[data.instrument](data.keyPressed);
      } else {
        console.log('received the following!', data.notesToPlay);
        const info = data.notesToPlay;
        const combo = info[0];
        const config = soundConfig(info[2], info[1]);
        const zimit = new MembraneSynth(config).toMaster();
        zimit.triggerAttackRelease(combo, '8n');
      }
    });

    this.props.socket.emit('select instrument', {
      roomId: this.props.params.roomId,
      id: connectionManager.id(),
      instrument: this.state.instrument
    });
    // this.setSocketListeners();
  }

  updateConnection() {
    this.setState({ connected: connectionManager.isConnected() });

    // get instrument info of everyone in room
    this.props.socket.emit('request peer info', {
      roomId: this.props.params.roomId,
      socketId: this.props.socket.id
    });

    this.props.socket.on('receive peer info', this.handlePeerInfo);
  }

  handlePeerInfo(data) {
    data = JSON.parse(data);
    // move self to beginning of peers array
    let index = 0;
    while ((index < data.length) && (data[index].peerId !== connectionManager.id())) {
      index++;
    }
    const selfInfo = data.splice(index, 1);
    this.setState({
      peers: selfInfo.concat(data)
    });
  }

  handleHelp(event) {
    event.preventDefault();
    this.setState({
      showPopover: true,
      anchorEl: event.target
    });
  }

  selectInstrument(index) {
    console.log("logging this to reduce parsing!",this.props.userInstruments);
    // this.setState({ instrument: instruments[index] });
    this.setState({
      mapping: this.props.userInstruments[index - 3],
      instrument: instruments.concat(this.props.userInstruments.map(a => (
         `Your Instrument: ${a.instrumentName||a.name}`
      )))[index]
    });
    //console.log(instruments[index]);
    if (this.state.connected) {
      this.props.socket.emit('select instrument', {
        roomId: this.props.params.roomId,
        id: connectionManager.id(),
        instrument: instruments.concat(this.props.userInstruments.map(a => (
         `Your Instrument: ${a.instrumentName||a.name}`
        )))[index]
      });
    }
  }

  render() {
    const uiNames=this.props.userInstruments.map(a => (a.instrumentName));
    //console.log('what you want', uiNames, 'tsi', 'current instrument', this.state.instrument);

    return (
      <div>
        <Help
          handleOpen={this.handleHelp}
          showPopover={this.state.showPopover}
          anchorEl={this.state.anchorEl}
          handleClose={() => { this.setState({ showPopover: false }); }}
        />
        {
          this.state.startJam ?
            <JamRoom
              extraInstruments={this.props.userInstruments}
              instrument={this.state.instrument}
              peers={this.state.peers}
              onReselect={this.selectInstrument}
            /> :
            <SelectInstrument
              extraInstruments={this.props.userInstruments}
              handleSelect={
                index => {
                  this.setState({
                    mapping: this.props.userInstruments[index - 3],
                    instrument: instruments.concat(this.props.userInstruments.map(a => (
                       `Your Instrument: ${a.instrumentName||a.name}`
                    )))[index]
                  });
                }
              }

              handleClick={this.handleStart}
              size="normal"
            />
        }
      </div>
    );
  }
}

Room.propTypes = {
  params: React.PropTypes.object,
  userInstruments: React.PropTypes.array,
  socket: React.PropTypes.object,
  logIn: React.PropTypes.func
};

Room.contextTypes = {
  router: React.PropTypes.object
};

export default Room;
