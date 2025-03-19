import { useState, useEffect } from 'react'
import Form from 'react-bootstrap/Form';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'

function App() {

  const [midiAccess, setMidiAccess] = useState(null);
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    navigator.requestMIDIAccess()
      .then((access) => {
        setMidiAccess(access);
        for (let input of access.inputs.values()) {
          input.onmidimessage = handleMIDIMessage;
        }
      })
      .catch((err) => console.error("MIDI Access Error:", err));
  }, []);

  function handleMIDIMessage(event) {
    const [status, note, velocity] = event.data;
    const type = status === 144 ? "Note On" : status === 128 ? "Note Off" : "Other";
    const newMessage = { type, note, velocity };
    setMessages((prev) => [newMessage, ...prev.slice(0, 9)]);
  }

  return (
    <>
  
      <h1>MIDI-APP</h1>
      <div className="card">
      
      {midiAccess ? (
        <p className="mb-4">MIDI Connected! Listening for messages...</p>
      ) : (
        <p className="mb-4">Waiting for MIDI access...</p>
      )}
      <ul className="border border-gray-600 p-2 rounded">
        {messages.map((msg, index) => (
          <li key={index} className="py-1">
            <strong>{msg.type}</strong> - Note: {msg.note} | Velocity: {msg.velocity}
          </li>
        ))}
      </ul>
    </div>
        
      
      
    </>
  )
}

export default App
