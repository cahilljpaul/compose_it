import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import io from 'socket.io-client';
import MusicScore from './MusicScore';
import './Session.css';

const Session = () => {
  const [socket, setSocket] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [music, setMusic] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userSetup, setUserSetup] = useState({ username: '', role: 'musician' });
  const [showUserSetup, setShowUserSetup] = useState(false);
  const navigate = useNavigate();
  const { sessionId } = useParams();

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

  // Fetch session data
  useEffect(() => {
    const fetchSession = async () => {
      try {
        console.log('Fetching session:', sessionId);
        const response = await fetch(`/api/sessions/${sessionId}`);
        
        if (!response.ok) {
          throw new Error(`Session not found (${response.status})`);
        }
        
        const sessionData = await response.json();
        console.log('Session data fetched:', sessionData);
        
        // Check if user needs to set up their details
        if (!sessionData.username || !sessionData.role) {
          setShowUserSetup(true);
        }
        
        setSession(sessionData);
      } catch (error) {
        console.error('Error fetching session:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchSession();
    }
  }, [sessionId]);

  useEffect(() => {
    if (!session) return;

    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join-session', {
        sessionId: session.id,
        username: session.username || 'Anonymous',
        role: session.role || 'musician'
      });
    });

    newSocket.on('session-joined', ({ session: updatedSession, participant }) => {
      setParticipants(updatedSession.participants);
      if (updatedSession.conductor) {
        setParticipants(prev => [...prev, updatedSession.conductor]);
      }
    });

    newSocket.on('participant-joined', (participant) => {
      setParticipants(prev => [...prev, participant]);
    });

    newSocket.on('participant-left', (participantId) => {
      setParticipants(prev => prev.filter(p => p.id !== participantId));
    });

    newSocket.on('instrument-selected', ({ participant, instrument }) => {
      setParticipants(prev => 
        prev.map(p => p.id === participant.id ? { ...p, instrument } : p)
      );
    });

    newSocket.on('music-generated', ({ instrument, music }) => {
      console.log('Music generated received:', { instrument, music });
      setMusic(music);
    });

    newSocket.on('tempo-updated', ({ tempo }) => {
      // Update session tempo
    });

    newSocket.on('conductor-left', () => {
      // Handle conductor leaving
    });

    return () => {
      newSocket.close();
    };
  }, [session]);

  const selectInstrument = (instrument) => {
    setSelectedInstrument(instrument);
    socket.emit('select-instrument', {
      sessionId: session.id,
      instrument
    });
  };

  const updateTempo = (tempo) => {
    socket.emit('update-tempo', {
      sessionId: session.id,
      tempo
    });
  };

  const leaveSession = () => {
    if (socket) {
      socket.disconnect();
    }
    navigate('/');
  };

  const handleUserSetup = () => {
    if (!userSetup.username.trim()) {
      alert('Please enter a username');
      return;
    }
    
    const updatedSession = {
      ...session,
      username: userSetup.username,
      role: userSetup.role
    };
    
    setSession(updatedSession);
    setShowUserSetup(false);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading session...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading">
        <p>Error: {error}</p>
        <button className="btn" onClick={() => navigate('/')}>
          Go Back Home
        </button>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="loading">
        <p>Session not found</p>
        <button className="btn" onClick={() => navigate('/')}>
          Go Back Home
        </button>
      </div>
    );
  }

  if (showUserSetup) {
    return (
      <div className="session">
        <div className="header">
          <h1>Join Session</h1>
        </div>
        <div className="container">
          <div className="card">
            <h2>Set Up Your Profile</h2>
            <p>Please enter your details to join the session</p>
            
            <div className="form-group">
              <label>Your Name</label>
              <input
                type="text"
                className="input"
                placeholder="Enter your name"
                value={userSetup.username}
                onChange={(e) => setUserSetup(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label>Role</label>
              <select 
                className="select" 
                value={userSetup.role} 
                onChange={(e) => setUserSetup(prev => ({ ...prev, role: e.target.value }))}
              >
                <option value="musician">Musician</option>
                <option value="conductor">Conductor</option>
              </select>
            </div>

            <button className="btn" onClick={handleUserSetup}>
              Join Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="session">
      <div className="header">
        <h1>Session: {session.id.slice(0, 8)}</h1>
        <button className="btn btn-secondary" onClick={leaveSession}>
          Leave Session
        </button>
      </div>

      <div className="container">
        {/* Session Info */}
        <div className="session-info">
          <h2>Session Information</h2>
          <p><strong>Key:</strong> {session.key}</p>
          <p><strong>Bars:</strong> {session.numBars}</p>
          <p><strong>Tempo:</strong> {session.tempo} BPM</p>
          <p><strong>Your Role:</strong> {session.role || 'musician'}</p>
        </div>

        {/* Conductor Controls */}
        {session.role === 'conductor' && (
          <div className="conductor-controls">
            <h3>Conductor Controls</h3>
            <div className="control-group">
              <label>Tempo (BPM):</label>
              <input
                type="number"
                min="60"
                max="200"
                value={session.tempo}
                onChange={(e) => updateTempo(parseInt(e.target.value))}
                className="input"
              />
            </div>
          </div>
        )}

        {/* Instrument Selection */}
        {!selectedInstrument && session.role === 'musician' && (
          <div className="card">
            <h2>Select Your Instrument</h2>
            <div className="instruments-grid">
              {instruments.map((instrument) => (
                <button
                  key={instrument.name}
                  className="instrument-btn"
                  onClick={() => selectInstrument(instrument)}
                >
                  <h3>{instrument.name}</h3>
                  <p>{instrument.clef} clef</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Music Score */}
        {selectedInstrument && music && (
          <div className="card">
            <h2>Your Music Score - {selectedInstrument.name}</h2>
            <MusicScore 
              music={music} 
              instrument={selectedInstrument}
              musicKey={session.key}
              tempo={session.tempo}
            />
          </div>
        )}

        {/* Participants */}
        <div className="card">
          <h2>Participants ({participants.length})</h2>
          <div className="participants-list">
            {participants.map((participant) => (
              <div 
                key={participant.id} 
                className={`participant-card ${participant.role === 'conductor' ? 'conductor' : ''}`}
              >
                <div className="participant-name">{participant.username}</div>
                <div className="participant-role">{participant.role}</div>
                {participant.instrument && (
                  <div className="participant-instrument">
                    {participant.instrument.name}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Session; 