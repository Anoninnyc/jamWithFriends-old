import Piano from '../components/Piano';
import AudioSynth from 'audiosynth';

const AudioContext = window.AudioContext || window.webkitAudioContext;
const context = new AudioContext();
const Synth = new AudioSynth(context);
Synth.setOscWave(1);

function playNote(keyPressed) {
  console.log(keyPressed.charCodeAt(0), keyPressed);
  keyPressed = keyPressed.charCodeAt(0);
  if (keyToNote[keyPressed]) {
    const key = keyToNote[keyPressed][0];
    const octave = keyToNote[keyPressed][1];
    Synth.playNote(Synth.noteToMIDI(key, octave), 1.0, 0.5, 0);
  }
}


const keyToNote = {
  97: ['C', 4],
  115: ['D', 4],
  100: ['E', 4],
  102: ['F', 4],
  103: ['G', 4],
  104: ['A', 5],
  106: ['B', 5],
  107: ['C', 5],
  108: ['D', 5],
  59: ['E', 5],
  13: ['G', 5],
  119: ['C#', 4],
  101: ['D#', 4],
  116: ['F#', 4],
  121: ['G#', 4],
  117: ['A#', 5],
  111: ['C#', 5],
  112: ['D#', 5],
  93: ['F#', 5],
};

export default { playNote };
