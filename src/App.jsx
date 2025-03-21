import { useState, useEffect } from 'react'
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Card from 'react-bootstrap/Card';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'

function App() {

  const [midiAccess, setMidiAccess] = useState(null);
  const [messages, setMessages] = useState([]);
  const [noteName, setNoteName] = useState([]);
  const [noteNames, setNoteNames] = useState([]);
  const [noteCount, setNoteCount] = useState([]);
  const [chordType, setChordType] = useState([]);
  const [chordNotes, setChordNotes] = useState([]);
  const [chordName, setChordName] = useState([]);
  const [chordIntervals, setChordIntervals] = useState([]);


  const baseChords = {
    'C': [0, 4, 7],
    'Cm': [0, 3, 7],
    'D': [2, 6, 9],
    'Dsus2': [2, 4, 9],
    'Dsus4': [2, 7, 9],
    'Dm': [2, 5, 9],
    'E': [4, 8, 11],
    'Em': [4, 7, 11],
    'F': [5, 9, 0],
    'Fm': [5, 8, 0],
    'G': [7, 11, 2],
    'Gm': [7, 10, 2],
    'A': [9, 1, 4],
    'Am': [9, 0, 4],
    'B': [11, 3, 6],
    'Bm': [11, 2, 6]
  };


  useEffect(() => {
    navigator.requestMIDIAccess()
      .then((access) => {
        setMidiAccess(access);
        for (let input of access.inputs.values()) {
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

    if (command === 144 && velocity > 0) { // Note on
      noteOn(note);
    } else if (command === 128 || (command === 144 && velocity === 0)) { // Note off
      noteOff(note);
    }
  }

  //--- Create a Set to hold the pressed notes.
  let pressedKeys = new Set();

  //--- Handle the note ON event. Add the note to the set and detect the chord.
  function noteOn(note) {
    setNoteName(getMidiNoteName(note));
    pressedKeys.add(note);
    processChord();
  }

  //--- Handle the note OFF event. Remove the note to the set and detect the chord.
  function noteOff(note) {
    setNoteName("");
    pressedKeys.delete(note);
    processChord();
  }


  function processChord() {

    //--- Show how many keys were pressed.
    setNoteCount(pressedKeys.size);

    //--- If less than 3 keys are pressed, clear the chord data and return.
    if (pressedKeys.size < 3) {
      setChordNotes("");
      setChordIntervals("");
      setChordName("");
      return;
    }

    //--- Get the notes and intervals from the pressed keys.
    const notes = Array.from(pressedKeys).sort((a, b) => a - b);
    const noteSet = new Set(notes.map(note => note % 12));

    //--- Show the notes that are pressed.
    setChordNotes(notes);
    
    //---- Show the notes names that are pressed.
    extractChordNotes(notes);

    //--- Check if the pressed notes match any of the base chords.
    for (const [chord, intervals] of Object.entries(baseChords)) {
      if (intervals.every(interval => noteSet.has(interval))) {
        setChordIntervals(intervals);
        setChordName(chord);
        
      }
    }
  }

  function extractChordNotes(noteSet) {
    //const notes = chordNotes.map(note => getMidiNoteName(note));
    //setNoteNames(chordNotes.map(note => getMidiNoteName(note)));
    //noteSet.forEach(key => getMidiNoteName(console.log(key)))
    console.log(noteSet)

    let result = "";

    Object.keys(noteSet).forEach(key => {
      result += "::" + key.toString();
    });
    
    console.log(result); // Output: "abc"

  }

  function getMidiNoteName(note) {
    const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const name = noteNames[note % 12];
    const octave = Math.floor(note / 12) - 1;
    return `${name}${octave}`;
  }


  return (
    <>

      <Card>
        <Card.Header>Chord Detector</Card.Header>
        <Card.Body>
          <InputGroup className="mb-3">
            <InputGroup.Text className="w-50" id="basic-addon1">Chord name: </InputGroup.Text>
            <Form.Control value={chordName} onChange={setChordName} />
          </InputGroup>

          <InputGroup className="mb-3">
            <InputGroup.Text className="w-50" id="basic-addon1">Notes in chord: </InputGroup.Text>
            <Form.Control value={chordNotes} onChange={setChordNotes} />
          </InputGroup>

          <InputGroup className="mb-3">
            <InputGroup.Text className="w-50" id="basic-addon1">Chord intervals: </InputGroup.Text>
            <Form.Control value={chordIntervals} onChange={setChordIntervals} />
          </InputGroup>

          <InputGroup className="mb-3">
            <InputGroup.Text className="w-50" id="basic-addon1">Note names: </InputGroup.Text>
            <Form.Control value={noteNames} onChange={setNoteNames} />
          </InputGroup>

          <InputGroup className="mb-3">
            <InputGroup.Text className="w-50" id="basic-addon1">Last note pressed: </InputGroup.Text>
            <Form.Control value={noteName} onChange={setNoteName} />
          </InputGroup>

          <InputGroup className="mb-3">
            <InputGroup.Text className="w-50" id="basic-addon1">Number of notes: </InputGroup.Text>
            <Form.Control value={noteCount} onChange={setNoteCount} />
          </InputGroup>
        </Card.Body>
      </Card>


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


    </>
  )
}

export default App
