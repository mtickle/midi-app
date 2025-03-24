import { useState, useEffect } from 'react'

//--- Bootstrap imports.
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

//--- CSS imports.
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'
import './piano.css'
import { CardBody } from 'react-bootstrap';

function App() {

  //--- Device values.
  const [deviceName, setDeviceName] = useState([]);
  const [deviceManufacturer, setDeviceManufacturer] = useState([]);
  const [midiAccess, setMidiAccess] = useState(null);

  //--- Message values.
  const [message, setMessage] = useState([]);
  const [messageName, setMessageName] = useState([]);
  const [noteNumber, setNoteNumber] = useState([]);
  const [noteName, setNoteName] = useState([]);
  const [velocity, setVelocity] = useState([]);

  //--- Processed values.
  const [octaveName, setOctaveName] = useState([]);
  const [noteNames, setNoteNames] = useState([]);
  const [noteCount, setNoteCount] = useState([]);
  const [chordType, setChordType] = useState([]);
  const [chordNotes, setChordNotes] = useState([]);
  const [chordName, setChordName] = useState([]);
  const [chordIntervals, setChordIntervals] = useState([]);

  //--- Create a Set to hold the pressed notes.
  let pressedKeys = new Set();

  //--- Define the base chords and their intervals.
  const baseChords = {
    'C5': [0, 7],
    'C': [0, 4, 7],
    'Cadd9': [0, 4, 7, 11],
    'Cm': [0, 3, 7],
    'D': [2, 6, 9],
    'Dsus2': [2, 4, 9],
    'Dsus4': [2, 7, 9],
    'Dm': [2, 5, 9],
    'Dm7': [2, 5, 9, 0],
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

  const chordsWithNotes = {
    'C': ['C E G'],
    'Cadd9': ['C', 'E', 'G', 'D'],
    'Cm': ['C', 'E♭', 'G'],
    'D': ['D', 'F#', 'A'],
    'Dsus2': ['D', 'E', 'A'],
    'Dsus4': ['D', 'G', 'A'],
    'Dm': ['D', 'F', 'A'],
    'Dm7': ['D F A C'],
    'Dm9': ['D', 'F', 'A', 'C', 'E'],
    'E': ['E', 'G#', 'B'],
    'Em': ['E', 'G', 'B'],
    'F': ['F', 'A', 'C'],
    'Fm': ['F', 'A♭', 'C'],
    'G': ['G', 'B', 'D'],
    'Gm': ['G', 'B♭', 'D'],
    'A': ['A', 'C#', 'E'],
    'Am': ['A', 'C', 'E'],
    'B': ['B', 'D#', 'F#'],
    'Bm': ['B', 'D', 'F#']
  }

  const midiMessages = {
    128: "Note Off",
    137: "Pad Off",
    144: "Note On",
    153: "Pad Hit",
    176: "Control Change",
    192: "Program Change",
    217: "Pad Full",
    224: "Pitch Bend"
  }

  const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

  //--- Request MIDI access on component mount.
  useEffect(() => {
    navigator.requestMIDIAccess()
      .then((access) => {
        setMidiAccess(access);
        for (let input of access.inputs.values()) {
          input.onmidimessage = processMIDIMessage;
          setDeviceName(input.name);
          setDeviceManufacturer(input.manufacturer);
        }
      })
      .catch((err) => console.error("MIDI Access Error:", err));
  }, []);


  function processMIDIMessage(message) {

    //--- Get the MIDI message data.
    const command = message.data[0];
    const note = message.data[1];
    const velocity = (message.data.length > 2) ? message.data[2] : 0;

    //--- Show the MIDI message data.
    //console.log("MIDI Message:", message.data);

    //--- Set these values.
    setNoteNumber(note)
    setOctaveName(getMidiOcatveName(note));
    setVelocity(velocity);
    setMessage(message.data[0]);
    setMessageName(getMidiMessageName(command));

    //--- Handle the note ON and OFF events.
    if (command === 144 && velocity > 0) { // Note on
      noteOn(note);
    } else if (command === 128 || (command === 144 && velocity === 0)) { // Note off
      noteOff(note);
    }
  }

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
    // if (pressedKeys.size < 3) {
       setChordNotes("");
       setChordIntervals("");
       setChordName("");
       setNoteNames("");
    //   return;
    // }

    //--- Get the notes and intervals from the pressed keys.
    const notes = Array.from(pressedKeys).sort((a, b) => a - b);
    const noteSet = new Set(notes.map(note => note % 12));

    //--- Show the notes that are pressed.
    setChordNotes(notes);

    //---- Show the notes names that are pressed.
    extractChordNotes(notes);

    //--- Check if the pressed notes match any of the base chords.
    //--- This is running against the baseChords object defined above.
    //--- The intervals value will only set if the notes match the chord intervals.

    //--- This processes the chord with notes.
    // for (const [chord, chordNotes] of Object.entries(chordsWithNotes)) {   
    //   if (chordNotes.every(note => noteSet.has(getMidiNoteName(note)))) {     
    //     setChordName(chord);   
    //   }
    // }

    //--- This processes the chords with intervals.
    for (const [chord, intervals] of Object.entries(baseChords)) {
      
      if (intervals.every(interval => noteSet.has(interval))) {        
        setChordIntervals(intervals);
        setChordName(chord);
      } 
    }
  }

  //--- Extract the note names from the note set.
  function extractChordNotes(noteSet) {
    //--- Show the note names that are pressed.
    let result = "";
    noteSet.forEach(key => {
      result += getMidiNoteName(key) + " ";
    });
    setNoteNames(result);
  }

  //--- Get the note name from the MIDI note number.
  function getMidiNoteName(note) {
    const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const name = noteNames[note % 12];
    return `${name}`;
  }

  function getMidiOcatveName(note) {
    const octave = Math.floor(note / 12) - 1;
    return `${octave}`;
  }

  //--- Get the MIDI message name from the command number.
  function getMidiMessageName(message) {
    const messageNames = {
      128: "Note Off",
      137: "Pad Off",
      144: "Note On",
      153: "Pad Hit",
      176: "Control Change",
      192: "Program Change",
      217: "Pad Full",
      224: "Pitch Bend"

    };
    return messageNames[message] || "Unknown Message";

  }

  return (
    <>

      <Container>
        <Row>
          <Col>
            <Card>
              <Card.Header>Chord Detector</Card.Header>
              <Card.Body bg="Secondary" >
                <InputGroup className="mb-3">
                  <InputGroup.Text className="w-50" id="basic-addon1">Chord name: </InputGroup.Text>
                  <Form.Control value={chordName} onChange={setChordName} readOnly />
                </InputGroup>

                <InputGroup className="mb-3">
                  <InputGroup.Text className="w-50" id="basic-addon1">Note names: </InputGroup.Text>
                  <Form.Control value={noteNames} onChange={setNoteNames} readOnly />
                </InputGroup>

                <InputGroup className="mb-3">
                  <InputGroup.Text className="w-50" id="basic-addon1">Notes in chord: </InputGroup.Text>
                  <Form.Control value={chordNotes} onChange={setChordNotes} readOnly />
                </InputGroup>

                <InputGroup className="mb-3">
                  <InputGroup.Text className="w-50" id="basic-addon1">Chord intervals: </InputGroup.Text>
                  <Form.Control value={chordIntervals} onChange={setChordIntervals} readOnly />
                </InputGroup>

                <InputGroup className="mb-3">
                  <InputGroup.Text className="w-50" id="basic-addon1">Last note pressed: </InputGroup.Text>
                  <Form.Control value={noteName} onChange={setNoteName} readOnly />
                </InputGroup>

                <InputGroup className="mb-3">
                  <InputGroup.Text className="w-50" id="basic-addon1">Number of notes: </InputGroup.Text>
                  <Form.Control value={noteCount} onChange={setNoteCount} readOnly />
                </InputGroup>
              </Card.Body>
            </Card>
          </Col>

          <Col>
            <Card>
              <Card.Header>MIDI Messages</Card.Header>
              <Card.Body>
                <InputGroup className="mb-3">
                  <InputGroup.Text className="w-50" id="basic-addon1">Last note number: </InputGroup.Text>
                  <Form.Control value={noteNumber} onChange={setNoteNumber} readOnly />
                </InputGroup>

                <InputGroup className="mb-3">
                  <InputGroup.Text className="w-50" id="basic-addon1">Last note octave: </InputGroup.Text>
                  <Form.Control value={octaveName} onChange={setOctaveName} readOnly />
                </InputGroup>

                <InputGroup className="mb-3">
                  <InputGroup.Text className="w-50" id="basic-addon1">Last Velocity: </InputGroup.Text>
                  <Form.Control value={velocity} onChange={setVelocity} readOnly />
                </InputGroup>

                <InputGroup className="mb-3">
                  <InputGroup.Text className="w-50" id="basic-addon1">Last Message: </InputGroup.Text>
                  <Form.Control value={message} onChange={setMessage} readOnly />
                </InputGroup>

                <InputGroup className="mb-3">
                  <InputGroup.Text className="w-50" id="basic-addon1">Last message name: </InputGroup.Text>
                  <Form.Control value={messageName} onChange={setMessageName} readOnly />
                </InputGroup>

                <InputGroup className="mb-3">
                  <InputGroup.Text className="w-50" id="basic-addon1">Device: </InputGroup.Text>
                  <Form.Control value={deviceName} onChange={setDeviceName} readOnly />
                </InputGroup>

              </Card.Body>
            </Card >
          </Col>
        </Row>
        <Row>
          <Col>
            {/*<div className="card">

         <div className="piano-container">
            <ul className="piano-keys-list">
                <li className="piano-keys white-key" data-key="01"></li>
                <li className="piano-keys black-key" data-key="02"></li>
                <li className="piano-keys white-key" data-key="03"></li>
                <li className="piano-keys black-key" data-key="04"></li>
                <li className="piano-keys white-key" data-key="05"></li>

                <li className="piano-keys white-key" data-key="06"></li>
                <li className="piano-keys black-key" data-key="07"></li>
                <li className="piano-keys white-key" data-key="08"></li>
                <li className="piano-keys black-key" data-key="09"></li>
                <li className="piano-keys white-key" data-key="10"></li>
                <li className="piano-keys black-key" data-key="11"></li>
                <li className="piano-keys white-key" data-key="12"></li>

                <li className="piano-keys white-key" data-key="13"></li>
                <li className="piano-keys black-key" data-key="14"></li>
                <li className="piano-keys white-key" data-key="15"></li>
                <li className="piano-keys black-key" data-key="16"></li>
                <li className="piano-keys white-key" data-key="17"></li>
                <li className="piano-keys white-key" data-key="18"></li>
                <li className="piano-keys black-key" data-key="19"></li>
                <li className="piano-keys white-key" data-key="20"></li>
                <li className="piano-keys black-key" data-key="21"></li>
                <li className="piano-keys white-key" data-key="22"></li>
                <li className="piano-keys black-key" data-key="23"></li>
                <li className="piano-keys white-key" data-key="24"></li>
            </ul>
        </div>

</div> */}
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default App