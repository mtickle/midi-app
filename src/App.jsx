import { useState, useEffect } from 'react'
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'
import context from 'react-bootstrap/esm/AccordionContext';

function App() {

  const [midiAccess, setMidiAccess] = useState(null);
  const [messages, setMessages] = useState([]);
  const [noteName, setNoteName] = useState([]);
  const [noteCount, setNoteCount] = useState([]);
  const [chordType, setChordType] = useState([]);
  const [chordNotes, setChordNotes] = useState([]);
  const [chordName, setChordName] = useState([]);
  const [chordIntervals, setChordIntervals] = useState([]);

  useEffect(() => {
    navigator.requestMIDIAccess()
      .then((access) => {
        setMidiAccess(access);
        for (let input of access.inputs.values()) {
          //input.onmidimessage = handleMIDIMessage;
          input.onmidimessage = processMIDIMessage;
        }
      })
      .catch((err) => console.error("MIDI Access Error:", err));
  }, []);


  function processMIDIMessage(message) {

    //--- Get the MIDI message data.
    const command = message.data[0];
    const note = message.data[1];
    const velocity = (message.data.length > 2) ? message.data[2] : 0;

    //--- Translate and show the actual note name.
    //setNoteName(getMidiNoteName(note));

    if (command === 144 && velocity > 0) { // Note on
      noteOn(note);
    } else if (command === 128 || (command === 144 && velocity === 0)) { // Note off
      noteOff(note);
    }
  }

  //--- Create a Set to hold the pressed notes.
  let pressedNotes = new Set();

  //--- Handle the note ON event. Add the note to the set and detect the chord.
  function noteOn(note) {
    setNoteName(getMidiNoteName(note));
    pressedNotes.add(note);
    processChord();
  }

  //--- Handle the note OFF event. Remove the note to the set and detect the chord.
  function noteOff(note) {
    setNoteName("");
    pressedNotes.delete(note);
    processChord();
  }


  function processChord() {

    //--- Show the number of pressed notes.
    setNoteCount(pressedNotes.size);

    if (pressedNotes.size != 3) {
      return; // Not enough notes for a chord
    }

    

    const notes = Array.from(pressedNotes).sort((a, b) => a - b);
    const intervals = notes.map(note => note % 12); // Get note intervals within an octave
    console.log("Intervals:", intervals);
    let chordName = "Unknown";

    //Basic chord detection logic
    if (intervals.includes(0) && intervals.includes(4) && intervals.includes(7)) {
      chordName = "Major";
    } else if (intervals.includes(0) && intervals.includes(3) && intervals.includes(7)) {
      chordName = "Minor";
    }

    setChordName(chordName);
    setChordNotes(notes);
    setChordIntervals(intervals);
    // Add more chord patterns as needed

    console.log("Chord:", chordName, notes);
  }



  function handleMIDIMessage(event) {
    const [status, note, velocity] = event.data;
    const type = status === 144 ? "Note On" : status === 128 ? "Note Off" : "Other";
    setNoteName(getMidiNoteName(note));
    //const noteName = getMidiNoteName(note);
    const newMessage = { type, note, velocity };
    setMessages((prev) => [newMessage, ...prev.slice(0, 9)]);
  }

  function getMidiNoteName(note) {
    const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const name = noteNames[note % 12];
    const octave = Math.floor(note / 12) - 1;
    return `${name}${octave}`;
  }


  return (
    <>

      <h1>MIDI-APP</h1>


      {/* <div className="card">
<div className="piano-container">
            <ul className="piano-keys-list">
                <li className="piano-keys white-key" data-key="01"></li>
                <li className="piano-keys black-key" data-key="02"></li>
                <li className="piano-keys white-key" data-key="03"></li>
                <li className="piano-keys black-key" data-key="04"></li>
                <li className="piano-keys white-key" data-key="05"></li>
                <li className="piano-keys white-key" data-key="05"></li>
                <li className="piano-keys black-key" data-key="06"></li>
                <li className="piano-keys white-key" data-key="07"></li>
                <li className="piano-keys black-key" data-key="08"></li>
                <li className="piano-keys white-key" data-key="09"></li>
                <li className="piano-keys black-key" data-key="10"></li>
                <li className="piano-keys white-key" data-key="11"></li>
                <li className="piano-keys white-key" data-key="12"></li>
                <li className="piano-keys black-key" data-key="13"></li>
                <li className="piano-keys white-key" data-key="14"></li>
                <li className="piano-keys black-key" data-key="15"></li>
                <li className="piano-keys white-key" data-key="16"></li>
                <li className="piano-keys white-key" data-key="17"></li>
                <li className="piano-keys black-key" data-key="18"></li>
                <li className="piano-keys white-key" data-key="19"></li>
                <li className="piano-keys black-key" data-key="20"></li>
                <li className="piano-keys white-key" data-key="21"></li>
                <li className="piano-keys black-key" data-key="22"></li>
                <li className="piano-keys white-key" data-key="23"></li>
            </ul>
        </div>

</div> */}

      <div className="card">
      <InputGroup className="mb-3">
        <InputGroup.Text id="basic-addon1">Note pressed: </InputGroup.Text>
        <Form.Control  value={noteName} onChange={setNoteName}/>
      </InputGroup>

      <InputGroup className="mb-3">
        <InputGroup.Text id="basic-addon1">Number of notes pressed: </InputGroup.Text>
        <Form.Control  value={noteCount} onChange={setNoteCount}/>
      </InputGroup>

      <InputGroup className="mb-3">
        <InputGroup.Text id="basic-addon1">Notes in chord: </InputGroup.Text>
        <Form.Control  value={chordNotes} onChange={setChordNotes}/>
      </InputGroup>

      <InputGroup className="mb-3">
        <InputGroup.Text id="basic-addon1">Chord name: </InputGroup.Text>
        <Form.Control  value={chordName} onChange={setChordName}/>
      </InputGroup>
        
      <InputGroup className="mb-3">
        <InputGroup.Text id="basic-addon1">Chord intervals: </InputGroup.Text>
        <Form.Control  value={chordIntervals} onChange={setChordIntervals}/>
      </InputGroup>

      </div>


      <div className="card">

        {midiAccess ? (
          <p className="mb-4">MIDI Connected! Listening for messages...</p>
        ) : (
          <p className="mb-4">Waiting for MIDI access...</p>
        )}



        {/* <ul className="border border-gray-600 p-2 rounded">
          {messages.map((msg, index) => (
            <li key={index} className="py-1">
              <strong>{msg.type}</strong> - Note: {msg.note} | Velocity: {msg.velocity}
            </li>
          ))}
        </ul> */}
      </div>



    </>
  )
}

export default App
