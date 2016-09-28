// Modules
import React, { Component } from 'react';
import shortid from 'shortid';
import $ from 'jquery';

// Material UI
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import { Table, TableBody, TableFooter, TableHeader,
        TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import Divider from 'material-ui/Divider';
import Dialog from 'material-ui/Dialog';
import Paper from 'material-ui/Paper';

// Helper
import { paperStyle } from '../utils/helperFunctions';

class CreateOrJoin extends Component {
  constructor(props) {
    super(props);

    this.state = {
      createRoomVal: '',
      createPrivRoomVal: '',
      showValidateError: false,
      showRoomTakenMessage: false,
      rooms: [],
      privateRooms: [],
      openPrivRoomMenu: false,
      togglePrivateRoom: false,
      radioButtonVal: 'public',
      showMustBeLoggedIn: false,
    };
    // Create room form logic
    this.handleCreateRoomSubmit = this.handleCreateRoomSubmit.bind(this);
    this.handleCreateRoomChange = this.handleCreateRoomChange.bind(this);
    this.handleCreatePrivateRoomSubmit = this.handleCreatePrivateRoomSubmit.bind(this);
    this.handleCreatePrivateRoomChange = this.handleCreatePrivateRoomChange.bind(this);
    this.showRoomTakenErrorMessage = this.showRoomTakenErrorMessage.bind(this);
    // Create a private room
    this.handleSendToPrivRoom = this.handleSendToPrivRoom.bind(this);
    // Toggle create public/private rooms
    this.handlePrivateRoomToggle = this.handlePrivateRoomToggle.bind(this);

    // Join a room on click
    this.handleRowClick = this.handleRowClick.bind(this);

    // Needed to remove socket event listeners
    this.updateRooms = this.updateRooms.bind(this);
    this.checkErrorStates = this.checkErrorStates.bind(this);

    // Material UI popover logic
    this.handleTapPrivRoom = this.handleTapPrivRoom.bind(this);
    this.handleTapPrivRoomClose = this.handleTapPrivRoomClose.bind(this);

    // Error for not logged in
    this.handleCloseMustBeLoggedIn = this.handleCloseMustBeLoggedIn.bind(this);
    // navigate to login from error dialogue
    this.navigateToLogin = this.navigateToLogin.bind(this);
  }

  componentDidMount() {
    this.props.socket.on('room created', (roomName) => {
      this.context.router.push(`/room/${roomName}`);
    });

    this.props.socket.on('room name taken', this.showRoomTakenErrorMessage);

    // on refresh, componentDidMount may fire before socket has connected to server
    // resulting in an undefined socket.id and bug where the information needed for
    // the open room table is not loaded.  Fixed by checking for socket.id and waiting
    // for connection if socket.id is undefined
    if (this.props.socket.id) {
      this.props.socket.emit('get rooms info', this.props.socket.id);
    } else {
      this.props.socket.on('connected', () => this.props.socket.emit('get rooms info', this.props.socket.id));
    }

    this.props.socket.on('give rooms info', this.updateRooms);

    // get private rooms from server/db if user is logged in
    if (this.props.loggedIn) {
      $.get('/getprivaterooms')
        .then((privateRooms) => {
          console.log(privateRooms);
          this.setState({
            privateRooms,
          });
        });
    }
  }

  componentWillUnmount() {
    this.props.socket.removeListener('room name taken', this.showErrorMessage);
    this.props.socket.removeListener('give rooms info', this.updateRooms);
  }

  showRoomTakenErrorMessage() {
    this.setState({
      showRoomTakenMessage: true,
    });

    setTimeout(() => {
      this.setState({
        showRoomTakenMessage: false,
      });
    }, 5000);
  }

  updateRooms(rooms) {
    this.setState({
      rooms,
    });
  }

  handleCreateRoomSubmit(e) {
    e.preventDefault();
    let roomName;
    if (this.state.showValidateError) {
      return;
    }
    if (this.state.createRoomVal === '') {
      roomName = shortid.generate();
    } else {
      roomName = this.state.createRoomVal;
    }
    const data = {
      roomId: roomName,
      isPrivate: false,
    };
    this.props.socket.emit('create room', data);
  }
  // match nothing: ^(?![\s\S])
  handleCreateRoomChange(e) {
    if (e.target.value.match(/[^a-zA-Z1-9]+/g)) {
      this.setState({
        showValidateError: true,
        createRoomVal: e.target.value,
      });
    } else if (this.state.showValidateError && e.target.value.match(/[^a-zA-Z1-9]+/g) === null) {
      this.setState({
        createRoomVal: e.target.value,
        showValidateError: false,
      });
    } else {
      this.setState({
        createRoomVal: e.target.value,
      });
    }
  }

  handleCreatePrivateRoomSubmit(e) {
    e.preventDefault();
    if (this.state.showValidateError) {
      return;
    }
    let roomName;
    if (this.state.createPrivRoomVal !== '') {
      roomName = `${shortid.generate()}-${this.state.createPrivRoomVal}`;
    } else {
      roomName = `${shortid.generate()}-${shortid.generate()}`;
    }
    // send server the roomname.  Username is taken from session
    $.post('/makeprivateroom', { roomName }, (res) => {
      if (res !== 'OK') {
        console.log(res);
      } else {
        console.log('SUCCESS!!!');
        const data = {
          roomId: roomName,
          isPrivate: true,
        };
        this.props.socket.emit('create room', data);
      }
    });
  }

  handleCreatePrivateRoomChange(e) {
    if (e.target.value.match(/[^a-zA-Z1-9]+/g)) {
      this.setState({
        showValidateError: true,
        createPrivRoomVal: e.target.value,
      });
    } else if (this.state.showValidateError && e.target.value.match(/[^a-zA-Z1-9]+/g) === null) {
      this.setState({
        createPrivRoomVal: e.target.value,
        showValidateError: false,
      });
    } else {
      this.setState({
        createPrivRoomVal: e.target.value,
      });
    }
  }

  handleRowClick(rowNum, colNum) {
    // fix to check if room is full first
    this.context.router.push(`/room/${this.state.rooms[rowNum].roomName}`);
  }

  handleTapPrivRoom(e) {
    e.preventDefault();
    this.setState({
      openPrivRoomMenu: true,
      anchorEl: e.currentTarget,
    });
  }

  handleTapPrivRoomClose() {
    this.setState({
      openPrivRoomMenu: false,
    });
  }

  checkErrorStates() {
    if (this.state.showValidateError) {
      return 'Room names can only contain letters or numbers';
    } else if (this.state.showRoomTakenMessage) {
      return 'Room name is taken';
    } else {
      return false;
    }
  }

  handleSendToPrivRoom(e, menuItem, index) {
    e.preventDefault();

    const data = {
      roomId: this.state.privateRooms[index],
      // userName: this.props.user,
      isPrivate: true,
    };

    const roomName = this.state.privateRooms[index];
    this.props.socket.emit('create room', data);
  }

  handlePrivateRoomToggle(e, value) {
    e.preventDefault();
    if (value === 'private' && !this.props.loggedIn) {
      this.setState({
        togglePrivateRoom: false,
        radioButtonVal: 'public',
        showMustBeLoggedIn: true,
      });
      console.log('You must be logged in, dingus');
    } else if (value === 'public') {
      this.setState({
        togglePrivateRoom: false,
        radioButtonVal: 'public',
      });
    } else {
      this.setState({
        togglePrivateRoom: true,
        radioButtonVal: 'private',
      });
    }
  }

  handleCloseMustBeLoggedIn() {
    this.setState({
      showMustBeLoggedIn: false,
    });
  }

  navigateToLogin() {
    this.context.router.push('/login');
  }

  render() {
    return (
      <div className="lobby-container">
        <Paper
          style={paperStyle}
          zDepth={3}
        >
          <div className="greeting">Green Room</div>
          <section className="divider green-room-divider">
            <Divider />
          </section>
          <div
            id="create-room-view"
            style={{
              width: '80%',
              position: 'relative',
              margin: '0 auto',
              textAlign: 'center',
            }}
          >
            {
              !this.state.togglePrivateRoom
              ?
                <div className="create-public-room" style={{ margin: '1% auto' }}>
                  <form onSubmit={this.handleCreateRoomSubmit}>
                    <TextField
                      hintText="Enter a Room Name..."
                      onChange={this.handleCreateRoomChange}
                      errorText={this.checkErrorStates()}
                    />
                    <RaisedButton
                      onClick={this.handleCreateRoomSubmit}
                      label="Create Public Room"
                    />
                  </form>
                </div>
              :
                <div className="create-private-room" style={{ margin: '1% auto' }}>
                  <form onSubmit={this.handleCreatePrivateRoomSubmit}>
                    <TextField
                      hintText="Enter a Private Room Name..."
                      onChange={this.handleCreatePrivateRoomChange}
                      errorText={this.checkErrorStates()}
                    />
                    <RaisedButton
                      onClick={this.handleCreatePrivateRoomSubmit}
                      label="Create Private Room"
                    />
                  </form>
                </div>
            }
            <RadioButtonGroup
              name="shipSpeed"
              onChange={this.handlePrivateRoomToggle}
              style={{ width: '50%', margin: '0 auto', display: 'flex' }}
              valueSelected={this.state.radioButtonVal}
            >
              <RadioButton
                value="public"
                label="Public"
                style={{ width: '45%', margin: '0 auto', marginBottom: 16 }}
              />
              <RadioButton
                value="private"
                label="Private"
                style={{ width: '45%', margin: '0 auto', marginBottom: 16 }}
              />
            </RadioButtonGroup>
            {
              !this.state.togglePrivateRoom
              ?
                <div>
                  This room is open to the public for anyone to join.
                    It will be displayed in the "Open Room" table below.
                    If you can't think of a good room name,
                     just click "Create Public Room" and we'll provide you with a random room name.
                </div>
              :
                <div>
                No one will be able to join this room unless you give them the link personally.
                  We'll store the URL, and you can reuse the room so long as you're signed in.
                    Name it anything you want!
                </div>
            }
            {
              this.props.loggedIn
              ?
                <div className="old-private-rooms" style={{ margin: '2% auto' }}>
                  <RaisedButton
                    onTouchTap={this.handleTapPrivRoom}
                    label="Click to view your old private rooms"
                  />
                  <Popover
                    open={this.state.openPrivRoomMenu}
                    anchorEl={this.state.anchorEl}
                    anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                    targetOrigin={{ horizontal: 'left', vertical: 'top' }}
                    onRequestClose={this.handleTapPrivRoomClose}
                  >
                    <Menu onItemTouchTap={this.handleSendToPrivRoom}>
                      {
                        this.state.privateRooms.map((room, key) => (
                          <MenuItem value={room.slice(9)} primaryText={room.slice(9)} key={key} />
                        ))
                      }
                    </Menu>
                  </Popover>
                </div>
              : null
            }
            {
              this.state.showMustBeLoggedIn
              ?
                <Dialog
                  title="You must be logged in to use this feature!"
                  open={this.state.showMustBeLoggedIn}
                  onRequestClose={this.handleCloseMustBeLoggedIn}
                >
                  Click outside the box to close thise window or click here to go to login page <RaisedButton
                    onClick={this.navigateToLogin}
                    label="Login"
                  />
                </Dialog>
              :
                null
            }
          </div>
          <div
            id="join-room-view"
            style={{
              position: 'relative',
              margin: '0 auto',
              textAlign: 'center',
              padding: '0 10%',
              marginTop: '10%',
            }}
          >
            <div>
              Have a link already?  Just paste it into your url bar!
              Otherwise, checkout the open rooms below.  Click a row to join!
            </div>
            <div id="join-view-room">
              <Table
                fixedHeader
                fixedFooter
                selectable
                onCellClick={this.handleRowClick}
                multiSelectable={false}
              >
                <TableHeader
                  displaySelectAll={false}
                  adjustForCheckbox={false}
                  enableSelectAll={false}
                >
                  <TableRow>
                    <TableHeaderColumn colSpan="4" tooltip="Join Open Room" style={{ textAlign: 'center' }}>
                      Join Open Room
                    </TableHeaderColumn>
                  </TableRow>
                  <TableRow>
                    <TableHeaderColumn>ID</TableHeaderColumn>
                    <TableHeaderColumn>Room Name</TableHeaderColumn>
                    <TableHeaderColumn>Number Of People</TableHeaderColumn>
                    <TableHeaderColumn>Instruments Being Played</TableHeaderColumn>
                  </TableRow>
                </TableHeader>
                <TableBody
                  displayRowCheckbox={false}
                  deselectOnClickaway
                  showRowHover
                  stripedRows={false}
                >
                  {
                    this.state.rooms.map((row, index) => (
                      <TableRow key={index} selected={row.selected}>
                        <TableRowColumn>{index + 1}</TableRowColumn>
                        <TableRowColumn>{row.roomName}</TableRowColumn>
                        <TableRowColumn>{`${row.numPeople} out of 4`}</TableRowColumn>
                        <TableRowColumn>{row.instruments.join(', ')}</TableRowColumn>
                      </TableRow>
                    ))
                  }
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableRowColumn colSpan="4" style={{ textAlign: 'center' }}>
                      Click on a row to join!
                    </TableRowColumn>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </div>
        </Paper>
      </div>
    );
  }
}

CreateOrJoin.propTypes = {
  socket: React.PropTypes.object,
  loggedIn: React.PropTypes.bool,
  userInstruments: React.PropTypes.array,
};

CreateOrJoin.contextTypes = {
  router: React.PropTypes.object
};

export default CreateOrJoin;
