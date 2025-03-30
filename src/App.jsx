import { useState, useEffect } from 'react'

//--- Bootstrap imports.
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import * as Tone from 'tone';

//--- CSS imports.
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'

function App() {

  //--- Device values.
  const [deviceName, setDeviceName] = useState([]);
  const [deviceManufacturer, setDeviceManufacturer] = useState([]);
  const [midiAccess, setMidiAccess] = useState(null);
  const [displayKeys, setDisplayKeys] = useState(new Set());

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
  const [chordNotes, setChordNotes] = useState([]);
  const [chordName, setChordName] = useState([]);
  const [chordIntervals, setChordIntervals] = useState([]);

  


  //--- Create a Set to hold the pressed notes.
  let pressedKeys = new Set();

  //--- Define the base chords and their intervals.
  const baseChords = {

    //--- C and its variations.
    'C5': [0, 7],
    'C': [0, 4, 7],
    'Cadd9': [0, 4, 7, 11],
    'Cm': [0, 3, 7],

    //--- D and its variations.
    'D5': [2, 9],
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

  const NOTES = [
    "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"
  ];

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

  //--- Use this to generate a list of keys.
  const generateKeys = () => {
    let keys = [];
    for (let octave = 0; octave < 2; octave++) {
      for (let note of NOTES) {
        keys.push(`${note}${octave}`);
      }
    }
    return keys;
  };

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
    setDisplayKeys((prev) => new Set(prev).add(note)); // Show the pressed key.
    setNoteName(getMidiNoteName(note)); // Show the note name.
    pressedKeys.add(note); // Add to the pressedKeys set.
    processChord(); // And finally process the chord built so far.
    sythesizeNote(note)
  }
 
  //--- Handle the note OFF event. Remove the note to the set and detect the chord.
  function noteOff(note) {

    //endSythesizeNote(note)

    // Clear the pressed key.
    setDisplayKeys((prev) => {
      const newKeys = new Set(prev);
      newKeys.delete(note);
      return newKeys;
    });

    setNoteName(""); // Clear the note name.
    pressedKeys.delete(note); // Take the key out of the set.
    processChord(); // And finally process the chord built so far.
  }

  function sythesizeNote(note) {

    let theNote = midiNoteToKey(note)
    //console.log(theNote)

    const synth = new Tone.PolySynth({
      volume: -8
    }
      
    ).toDestination();
    const now = Tone.now()
    synth.triggerAttackRelease(theNote, "8n")

    // const synth = new Tone.PolySynth(Tone.MonoSynth, {
    //   volume: -8,
    //   oscillator: {
    //     type: "square8",
    //   },
    //   envelope: {
    //     attack: 0.05,
    //     decay: 0.3,
    //     sustain: 0.4,
    //     release: 0.8,
    //   },
    //   filterEnvelope: {
    //     attack: 0.001,
    //     decay: 0.7,
    //     sustain: 0.1,
    //     release: 0.8,
    //     baseFrequency: 300,
    //     octaves: 4,
    //   },
    // }).toDestination();

  }

  function endSythesizeNote(note) {

    let theNote = midiNoteToKey(note)
    //console.log(theNote)

    const synth = new Tone.Synth().toDestination();
    const now = Tone.now()
    synth.triggerRelease(theNote, now)

    // const synth = new Tone.PolySynth(Tone.MonoSynth, {
    //   volume: -8,
    //   oscillator: {
    //     type: "square8",
    //   },
    //   envelope: {
    //     attack: 0.05,
    //     decay: 0.3,
    //     sustain: 0.4,
    //     release: 0.8,
    //   },
    //   filterEnvelope: {
    //     attack: 0.001,
    //     decay: 0.7,
    //     sustain: 0.1,
    //     release: 0.8,
    //     baseFrequency: 300,
    //     octaves: 4,
    //   },
    // }).toDestination();

  }


  function processChord() {

    //--- Show how many keys were pressed.
    setNoteCount(pressedKeys.size);

    //--- If less than 2 keys are pressed, clear the chord data and return.
    if (pressedKeys.size < 2) {
      setChordNotes("");
      setChordIntervals("");
      setChordName("");
      setNoteNames("");
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
    //--- This is running against the baseChords object defined above.
    //--- The intervals value will only set if the notes match the chord intervals.
    for (const [chord, intervals] of Object.entries(baseChords)) {
      if (intervals.every(interval => noteSet.has(interval))) {
        setChordIntervals(intervals);
        setChordName(chord);
      }
    }
  }

  //--- This helps us map a known note to a key on the keyboard.
  const midiNoteToKey = (midiNote) => {
    const note = NOTES[midiNote % 12];
    const octave = Math.floor(midiNote / 12) - 1;
    return `${note}${octave}`;
    
  };

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
            <div className="card">
              <div className="piano">
                {generateKeys().map((key) => {
                  const isPressed = [...displayKeys].map(midiNoteToKey).includes(key);
                  return (
                    <div
                      key={key}
                      className={`key ${key.includes("#") ? "black" : "white"} ${isPressed ? "active" : ""}`}
                    >
                      {key}
                    </div>
                  );
                })}
              </div>
            </div>
          </Col>
        </Row>

      </Container>
    </>
  )
}

export default App