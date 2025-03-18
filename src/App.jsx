import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import JZZ from 'jzz'

function App() {
  const [noteNumberValue, setnoteNumberValue] = useState("");
  const [deviceNameValue, setdeviceNameValue] = useState("");
  const [noteState, setnoteState] = useState("");

  JZZ().or('Cannot start MIDI engine!')
    .openMidiOut().or('Cannot open MIDI Out port!')
    .wait(500).send([0x90, 60, 127]) // note on
    .wait(500).send([0x80, 60, 0]);  // note off
  JZZ().openMidiIn().or('Cannot open MIDI In port!')
    .and(function () { 
      //console.log('MIDI-In: ', this.name()); 
      setdeviceNameValue(this.name());
    })
    .connect(function (msg) { 
      console.log(msg.toString()); 
      //console.log(JZZ.MIDI.noteName(msg[1]), msg[0] == 0x90 ? 'pressed' : 'released');
      //setInputValue(JZZ.MIDI.noteName(msg[1]));
      setnoteNumberValue(msg[1]);
      //setnoteState(msg[1] == 0x90 ? 'pressed' : 'released');
      setnoteState(msg[1] == 0x90 ? 'pressed' : 'OFF');
      
    })
    .wait(10000).close();


// JZZ().openMidiIn().or('Cannot open MIDI In port!')
// .and(function () { console.log('MIDI-In: ', this.name()); })
// .connect(function (msg) { 
//   console.log(msg.toString()); 
  
//   //console.log(JZZ.MIDI.noteName(msg[1]), msg[0] == 0x90 ? 'pressed' : 'released');
// })
// .wait(10000).close();

    

  return (
    <>
  
      <h1>MIDI-APP</h1>
      <div className="card">
      <input type="text" value={deviceNameValue} />
      <br/>
      <input type="text" value={noteNumberValue} />
      <input type="text" value={noteState} />
      
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      
    </>
  )
}

export default App
