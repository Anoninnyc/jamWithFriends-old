import React from 'react';
import { render } from 'react-dom';
import MenuItem from 'material-ui/MenuItem';
import DropDownMenu from 'material-ui/DropDownMenu'



// Utils!


function showErrorMessage(appendTo, message, id) {
  $(appendTo)
    .append('<div id='+ '"'+id+ '"' + '>'+ message+' </div>')
    .hide()
    .fadeIn(999)
    .fadeOut(999)
    .queue(next => {
      $(`#${id}`).remove();
      next();
    });
}





// UserMakeInstrument Piano & regular Piano.

const mapIdsToKeys = {
  '#1': 'A',
  '#2': 'S',
  '#3': 'D',
  '#4': 'F',
  '#5': 'G',
  '#6': 'H',
  '#7': 'J',
  '#8': 'K',
  '#9': 'L',
};

const buttonStyles = {
  color: '#6F8695',
  width: 120,
  height: 30,
  position: 'absolute',
  top: '50%',
  transform: 'translate(-50%, -50%)'
};

const mapKeysToIds = {
  'A': '#1',
  'S': '#2',
  'D': '#3',
  'F': '#4',
  'G': '#5',
  'H': '#6',
  'J': '#7',
  'K': '#8',
  'L': '#9',
};

const mapPianoKeysToIds = {
  'A': '#1',
  'S': '#2',
  'D': '#3',
  'F': '#4',
  'G': '#5',
  'H': '#6',
  'J': '#7',
  'K': '#8',
  'L': '#9',
  ';': '#10',
  "'": '#11',
};

const mapBlackPianoKeysToIds = {
  'W': '#thir',
  'E': '#fourt',
  'T': '#fift',
  'Y': '#sixt',
  'U': '#sevent',
  'O': '#eight',
  'P': '#ninet',
};

const mapPianoKeyPress = {
  97: "#1",
  115: "#2",
  100: "#3",
  102: "#4",
  103: "#5",
  104: "#6",
  106: "#7",
  107: "#8",
  108: "#9",
  59: "#10",
  39: "#11",
  13: "#12",
};

const mapBlackPianoKeyPress = {
  119: "#thir",
  101: "#fourt",
  116: "#fift",
  121: "#sixt",
  117: "#sevent",
  111: "#eight",
  112: "#ninet",
  93: "#twenty",
};

// reference arrays for piano

const oneTen = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const teens = ["thir", "fourt", "fift", "sixt", "sevent", "eight", "ninet"];

// For sound config- UMI
const envelopeValue = {
  attack: 0.001,
  decay: 0.1,
  sustain: 0.1,
  release: 2,
  attackCurve: 'linear'
};

const soundConfig = (type, PD) => (

  {
    pitchDecay: PD||0.1,
    octaves: 7,
    oscillator: {
      type,
    },
    envelope: envelopeValue
  }

 );


// Drums!

const mapDrumIDToSounds = {
  '#urC': 'm',
  '#nextC': 'l',
  '#brDrum': 'q',
  '#rsDrum': 'g',
  '#lsDrum': 'f',
  '#tomDrum': 'j',
  '#urCymbal': 'm',
  '#kickDrum': 'h',
};

const drumParts=["urC", "nextC", "brDrum", "rsDrum", "lsDrum", "tomDrum", "urCymbal", "kickDrum"];

// UserMakeInstrument Reference 

const keys = ["A", "S", "D", "F", "G", "H", "J", "K", "L"];

const notes = ["A", "B", "C", "D", "E", "F", "G"];

const octaves = [1, 2, 3, 4, 5, 6, 7];

const pd = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7];

const types = ["sine", "square", "sawtooth", "triangle"];


function display(par,pari){

  return (
    <DropDownMenu
      value={this.state[pari+'Value']}
      onChange={this['handle'+pari+'Change']}
      autoWidth={false}
    >

    par.map(
    type => (
      <MenuItem key={type} value={type} primaryText={type} />
     )
  )

  </DropDownMenu>
)

}

// paperStyle
const paperStyle = {
  width: '70%',
  margin: '0 auto',
  height: '100%',
};


const animateInst = (ID, color1, color2, ms) => {
  console.log('runHelper');
  $(ID).animate({
    backgroundColor: color1,
  }, ms).animate({
    backgroundColor: color2
  }, ms);
};


// for 


module.exports = {
  mapPianoKeysToIds,
  mapIdsToKeys,
  mapKeysToIds,
  showErrorMessage,
  mapBlackPianoKeysToIds,
  envelopeValue,
  mapDrumIDToSounds,
  soundConfig,
  mapPianoKeyPress,
  mapBlackPianoKeyPress,
  keys,
  notes,
  octaves,
  pd,
  paperStyle,
  animateInst,
  oneTen,
  teens,
  drumParts,
  types,
  buttonStyles,
  display,
};
