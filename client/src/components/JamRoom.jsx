import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';

import Piano from './Piano';
import UserOwnInstrument from './UserOwnInstrument';
import Drums from './Drums';
import PeerBar from './PeerBar';
import Invite from './Invite';
import SelectInstrument from './SelectInstrument';
import { instruments } from '../instruments/store';

class JamRoom extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showInviteView: false,
      showSelectView: false
    };
    this.toggleInviteView = this.toggleInviteView.bind(this);
    this.toggleSelectView = this.toggleSelectView.bind(this);
  }

  toggleInviteView() {
    this.setState({ showInviteView: !this.state.showInviteView });
  }

  toggleSelectView() {
    this.setState({ showSelectView: !this.state.showSelectView });
  }

  render() {
    return (
      <div id="jamroom">
        <div className="instrumentContainer">
          {this.props.instrument === 'drums' ? <Drums /> : null}
          {this.props.instrument === 'piano' ? <Piano /> : null}
          {
            this.props.instrument === 'laserbells' ?
              <div id="laser">
                <img src="/assets/laser.svg" alt="laserbells" style={{ height: '100%' }} />
              </div> :
              null
          }
          {this.props.instrument.slice(0, 4) === "Your"? <div id="UOIInRoom"><UserOwnInstrument /></div> :null}
        </div>
        <PeerBar
          extraInstruments={this.props.extraInstruments}
          peers={this.props.peers}
          toggleInviteView={this.toggleInviteView}
          toggleSelectView={this.toggleSelectView}
        />
        <Invite open={this.state.showInviteView} onRequestClose={this.toggleInviteView} />
        <Dialog
          open={this.state.showSelectView}
          onRequestClose={this.toggleSelectView}
        >
          <SelectInstrument
            extraInstruments={this.props.extraInstruments}
            handleSelect={
              index => {
                this.setState({
                  mapping: this.props.extraInstruments.map(a => (
                    {
                      A: typeof a === 'string'?JSON.parse(a.A): a.A,
                      S: typeof a === 'string'?JSON.parse(a.S): a.S,
                      D: typeof a === 'string'?JSON.parse(a.D): a.D,
                      F: typeof a === 'string'?JSON.parse(a.F): a.F,
                      G: typeof a === 'string'?JSON.parse(a.G): a.G,
                      H: typeof a === 'string'?JSON.parse(a.H): a.H,
                      J: typeof a === 'string'?JSON.parse(a.J): a.J,
                      K: typeof a === 'string'?JSON.parse(a.K): a.K,
                      L: typeof a === 'string'?JSON.parse(a.L): a.L,
                    }
                  ))[index - 3],
                  instrument: instruments.concat(this.props.extraInstruments.map(a => (
                     `Your Instrument: ${a.instrumentName||a.name}`
                  )))[index]
                });
              }
            }
            handleSelect={this.props.onReselect}
            handleClick={this.toggleSelectView}
            size="inset"
            ownInstrument={this.props.instrument}
          />
        </Dialog>
      </div>
    );
  }
}

JamRoom.propTypes = {
  instrument: React.PropTypes.string.isRequired,
  peers: React.PropTypes.array.isRequired,
  onReselect: React.PropTypes.func.isRequired,
  extraInstruments: React.PropTypes.array
};

export default JamRoom;
