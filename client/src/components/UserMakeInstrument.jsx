// Tones
import React, { Component } from 'react';
import { MembraneSynth } from "tone";
import { Link } from 'react-router';
// Components
import Divider from 'material-ui/Divider';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import UserOwnInstrument from './UserOwnInstrument';


// Utils
import { types, animateInst, paperStyle, keys, notes, octaves, pd, showErrorMessage, mapIdsToKeys, mapKeysToIds, envelopeValue, mapPianoKeyPress, buttonStyles } from '../utils/helperFunctions';

class UserMakeInstrument extends Component {

  constructor(props) {
    super(props);
    this.handleNoteChange=this.handleNoteChange.bind(this);
    this.handleKeyChange=this.handleKeyChange.bind(this);
    this.handleOctaveChange=this.handleOctaveChange.bind(this);
    this.handlePDChange=this.handlePDChange.bind(this);
    this.handleTypeChange=this.handleTypeChange.bind(this);
    this.deleteKey = this.deleteKey.bind(this);
    this.mapThat = this.mapThat.bind(this);
    this.changeInst = this.changeInst.bind(this);
    this.killKeypress = this.killKeypress.bind(this);
    this.addKeypress = this.addKeypress.bind(this);
    this.logIn = this.props.logIn.bind(this);
    this.makeInstrument = this.makeInstrument.bind(this);
    this.state = {
      noteValue: "A",
      keyValue: "A",
      octaveValue: 1,
      PDValue: 0.1,
      typeValue: "sine",
      inMemObject: {},
      instrument: "MembraneSynth",
      tryingToName: true,

    };
  }


  componentDidMount() {

     $.get("/isLoggedIn", (resp, err) => {
      if (resp==="continue"){
        console.log('you should be here!!!')
      } else {
        this.context.router.push("login");
      }
    });

  }

  componentWillUnmount() {
    $(document).off();
  }

  keyHelper(ID) {
    const keyMapped = this.state.inMemObject[mapIdsToKeys[ID]];
    if (!this.state.tryingToName && keyMapped) {
      console.log(keyMapped);
      const keyInfo = JSON.parse(keyMapped);
      this.setState({
        noteValue: keyInfo[1],
        octaveValue: keyInfo[2],
        PDValue: keyInfo[3],
        typeValue: keyInfo[4],
      });

      this.sampleSound();
      animateInst(ID, "black", "white", 20);
    }
  }

  sampleSound() {
    const combo = `${this.state.noteValue}${this.state.octaveValue}`;
    const config = {
      pitchDecay: this.state.PDValue||0.1,
      octaves: 7,
      oscillator: {
        type: this.state.typeValue,
      },
      envelope: envelopeValue
    };
    const zimit = new MembraneSynth(config).toMaster();
    zimit.triggerAttackRelease(combo, '8n');
  }

  mapThat() {
   console.log(this.state.noteValue);
    const par1 = this.state.noteValue
    const par2 = this.state.octaveValue
    const par3 = this.state.PDValue;
    const par4 =  this.state.typeValue;
    const key = this.state.keyValue;
    const inst = "N/A";
    const currentInMemObj = this.state.inMemObject;
    currentInMemObj[key] = JSON.stringify([inst, par1, par2, par3, par4]);
    if (!par1&&!par2&&!par3&&!par4) {
     // console.log('please make a proper mapping');
      showErrorMessage("#makeInstErrorMessages", 'Please make a Proper Mapping', 'propMapError');
    } else {
      this.setState({
        noteValue: "A",
        octaveValue: 1,
        PDValue: 0.1,
        typeValue: "sine",
        inMemObject: currentInMemObj
      });
      console.log(currentInMemObj);
      const idToAdd = mapKeysToIds[key];
      $(idToAdd).css("border", "5px solid blue");
    }
  }


  makeInstrument() {
    const name = this.refs.instName.getValue();
    const currentInMemObj = this.state.inMemObject;
    currentInMemObj.instrumentName = name;
    currentInMemObj.userName = this.props.user;
    let empty = true;

    const keysForInst = Object.keys(currentInMemObj);
    for (let i = 0; i < keysForInst.length; i++) {
      if (keysForInst[i].length === 1) {
        empty = false;
      }
    }

    if (!name.length) {
      showErrorMessage("#nameInstErrMessage", 'Pls name your instrument', 'npo');
    } else if (empty) {
      showErrorMessage("#nameInstErrMessage", 'Pls map some keys', 'npi');
    } else if (/\W/.test(name)===true) {
      showErrorMessage("#nameInstErrMessage", 'Letters and numbers only please!', 'regexErr');
    } else {
      this.setState({
        inMemObject: {}
      });
      empty = true;
      this.props.socket.emit('newInstCreated', currentInMemObj);
      console.log(`youve created ${currentInMemObj}`);
      const final = this.props.userInstruments.concat([currentInMemObj]);
      this.props.updateUserInstrument(final);
      showErrorMessage("#nameInstErrMessage", 'Instrument Made!', 'makeThat');
      $("#par1").val("A");
      $("#par2").val("1");
      $("#par3").val("0.1");
      $("#par4").val("sine");
      $(".key").css("border", "2px solid black");
    }
  }

  deleteKey() {
    const keyToDelete = this.state.keyValue;
    // console.log( "you want to delete"+ $(".selectKey option:selected").text());
    const newInMemObj = this.state.inMemObject;
    delete newInMemObj[keyToDelete];
    this.setState({
      inMemObject: newInMemObj,
    });

    const idToClear = mapKeysToIds[keyToDelete];
  //  console.log('idToAdd', idToClear);
    $(idToClear).css("border", "2px solid black");
  }

  handleNoteChange(event, index, value) {
    console.log(value);
    this.setState({ noteValue: value });
  }
  handleKeyChange(event, index, value) {
    console.log(value);
    this.setState({ keyValue: value });
  }

  handleOctaveChange(event, index, value) {
    console.log(value);
    this.setState({ octaveValue: value });
  }
  handleTypeChange(event, index, value) {
    console.log(value);
    this.setState({ typeValue: value });
  }

  handlePDChange(event, index, value) {
    console.log(value);
    this.setState({ PDValue: value });
  }

  killKeypress() {
    console.log("keypress should be killed");
    $(document).off();
    this.setState({
      tryingToName: true,
    });
  }

  addKeypress() {
    console.log("Keypress should be enabled");
    if (this.state.tryingToName) {
      $(document).keypress((e) => {
        if (mapPianoKeyPress[e.which]) {
          this.keyHelper(mapPianoKeyPress[e.which]);
        }
      });
      this.setState({
        tryingToName: false,
      });
    }
  }

  changeInst() {
    console.log("inst changed");
    $(".par").val("");
    const inst = $(".selectInst option:selected").text();
    this.setState({
      instrument: inst
    });
  }

  render() {
    return (
      <div id="roomContainer">
        <div id="UserMakeInstrumentRoom">
          <Paper
            id="uMIPaper"
            style={paperStyle}
            zDepth={3}
          >
            <br />
            <h1 id="UMIHeader">Make Instrument Here!</h1>
            <Divider />
            <h2 className="step">Step One: Select a Key To Map To </h2>
            <DropDownMenu
              id="stepOneMenu"
              value={this.state.keyValue}
              onChange={this.handleKeyChange}
              autoWidth={false}
            >
              {keys.map(key => (
                <MenuItem key={key} value={key} primaryText={key} />
                ))}
            </DropDownMenu>
            <div id="deleteKey"> <RaisedButton label="Delete Key Mapping" onClick={this.deleteKey} /></div>
            <h2 className="step">Step Two: Set Your Parameters</h2>
            <div id="UMIParams">

            Note
              <DropDownMenu
                value={this.state.noteValue}
                onChange={this.handleNoteChange}
                autoWidth={false}
              >
              {notes.map(note => (
                <MenuItem key={note} value={note} primaryText={note} />
                ))}
              </DropDownMenu>

            Octave
              <DropDownMenu
                value={this.state.octaveValue}
                onChange={this.handleOctaveChange}
                autoWidth={false}
              >

              {octaves.map(num => (
                <MenuItem key={num} value={num} primaryText={num} />
                ))}

              </DropDownMenu>

            Pitch Decay
              <DropDownMenu
                value={this.state.PDValue}
                onChange={this.handlePDChange}
                autoWidth={false}
              >

              {pd.map(num => (
                <MenuItem key={num} value={num} primaryText={num} />
                ))}

              </DropDownMenu>

            Sound Type
              <DropDownMenu
                value={this.state.typeValue}
                onChange={this.handleTypeChange}
                autoWidth={false}
              >
              {types.map(type => (
                <MenuItem key={type} value={type} primaryText={type} />
                ))}
              </DropDownMenu>

            </div> <br /><br />
            <div id="s3c"><text id="step3" >Step Three: </text>
              <RaisedButton id="mapSToKey" label="Map Sound to Key" onClick={this.mapThat} /><br />
            </div>
            <div id="instNames">
              <TextField
                onClick={this.killKeypress}
                ref={"instName"}
                hintText="Only Letters and Numbers Please"
                floatingLabelText="Name your Instrument"
              />
              <br />
              <div id="nameInstErrMessage" />
              <RaisedButton label="Make the instrument" style={{ postion: "absolute", top: "50%" }} onClick={this.makeInstrument} /><br /><br />
                <Link to="/createorjoin">
            <RaisedButton id="goToCreate"
              label="Start Jamming!"
              style={{ postion: "absolute", top: "50%" }}
            />
            </Link>
            </div>
            
           
           
            <h2 className="step">Click your instrument to play!</h2>
            <div id="testPiano" onClick={this.addKeypress} >
              <UserOwnInstrument />
            </div>
            <div id="makeInstErrorMessages" />
          </Paper>
        </div>
      </div>
    );
  }
}

UserMakeInstrument.propTypes = {
  params: React.PropTypes.object,
  socket: React.PropTypes.object,
  userInstruments: React.PropTypes.array,
  logIn: React.PropTypes.func,
  updateUserInstrument: React.PropTypes.func,
  user: React.PropTypes.string,
};

UserMakeInstrument.contextTypes = {
  router: React.PropTypes.object
};


UserMakeInstrument.childContextTypes = {
  muiTheme: React.PropTypes.object.isRequired,
};
export default UserMakeInstrument;
