const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Store active sessions
const sessions = new Map();

// Music generation utilities
const keys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'];
const instruments = [
  { name: 'Piano', clef: 'treble', range: { min: 60, max: 84 } },
  { name: 'Violin', clef: 'treble', range: { min: 55, max: 84 } },
  { name: 'Cello', clef: 'bass', range: { min: 36, max: 72 } },
  { name: 'Flute', clef: 'treble', range: { min: 60, max: 84 } },
  { name: 'Clarinet', clef: 'treble', range: { min: 55, max: 79 } },
  { name: 'Trumpet', clef: 'treble', range: { min: 55, max: 79 } },
  { name: 'Trombone', clef: 'bass', range: { min: 40, max: 72 } },
  { name: 'Drums', clef: 'percussion', range: { min: 35, max: 81 } }
];

// Generate random notes for an instrument
function generateNotes(instrument, key, numBars, tempo) {
  // Always generate 8 quarter notes of C4 for preview
  return Array.from({ length: numBars * 4 }, (_, i) => ({
    note: 'C',
    octave: 4,
    duration: 1,
    startBeat: i
  }));
}

// Create a new session
app.post('/api/sessions', (req, res) => {
  const { key, numBars, tempo } = req.body;
  const sessionId = uuidv4();
  
  const session = {
    id: sessionId,
    key: key || 'C',
    numBars: numBars || 4,
    tempo: tempo || 120,
    participants: [],
    conductor: null,
    createdAt: new Date()
  };
  
  sessions.set(sessionId, session);
  res.json({ sessionId, session });
});

// Get session info
app.get('/api/sessions/:sessionId', (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  res.json(session);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join session
  socket.on('join-session', ({ sessionId, username, role }) => {
    const session = sessions.get(sessionId);
    if (!session) {
      socket.emit('error', { message: 'Session not found' });
      return;
    }
    
    socket.join(sessionId);
    
    const participant = {
      id: socket.id,
      username,
      role: role || 'musician',
      instrument: null
    };
    
    if (role === 'conductor') {
      session.conductor = participant;
    } else {
      session.participants.push(participant);
    }
    
    socket.emit('session-joined', { session, participant });
    socket.to(sessionId).emit('participant-joined', participant);
  });
  
  // Select instrument
  socket.on('select-instrument', ({ sessionId, instrument }) => {
    console.log('Select instrument called:', { sessionId, instrument });
    const session = sessions.get(sessionId);
    if (!session) {
      console.log('Session not found:', sessionId);
      return;
    }
    
    const participant = session.participants.find(p => p.id === socket.id) || session.conductor;
    if (participant) {
      participant.instrument = instrument;
      
      // Generate music for this instrument
      console.log('Generating music for:', instrument.name, 'in key:', session.key);
      const music = generateNotes(instrument, session.key, session.numBars, session.tempo);
      console.log('Generated music:', music);
      participant.music = music;
      
      socket.emit('music-generated', { instrument, music });
      socket.to(sessionId).emit('instrument-selected', { participant, instrument });
    } else {
      console.log('Participant not found for socket:', socket.id);
    }
  });
  
  // Conductor controls
  socket.on('update-tempo', ({ sessionId, tempo }) => {
    const session = sessions.get(sessionId);
    if (!session) return;
    
    session.tempo = tempo;
    io.to(sessionId).emit('tempo-updated', { tempo });
  });
  
  socket.on('update-key', ({ sessionId, key }) => {
    const session = sessions.get(sessionId);
    if (!session) return;
    
    session.key = key;
    // Regenerate music for all participants
    session.participants.forEach(participant => {
      if (participant.instrument) {
        participant.music = generateNotes(participant.instrument, key, session.numBars, session.tempo);
      }
    });
    
    io.to(sessionId).emit('key-updated', { key, participants: session.participants });
  });
  
  // Disconnect handling
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove from all sessions
    sessions.forEach((session, sessionId) => {
      const participantIndex = session.participants.findIndex(p => p.id === socket.id);
      if (participantIndex !== -1) {
        session.participants.splice(participantIndex, 1);
        io.to(sessionId).emit('participant-left', socket.id);
      }
      
      if (session.conductor && session.conductor.id === socket.id) {
        session.conductor = null;
        io.to(sessionId).emit('conductor-left');
      }
    });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 