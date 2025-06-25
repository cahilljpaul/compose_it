import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [username, setUsername] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [role, setRole] = useState('musician');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();

  const keys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'];
  const [selectedKey, setSelectedKey] = useState('C');
  const [numBars, setNumBars] = useState(4);
  const [tempo, setTempo] = useState(120);

  const createSession = async () => {
    if (!username.trim()) {
      alert('Please enter a username');
      return;
    }

    setIsCreating(true);
    try {
      console.log('Creating session with:', { key: selectedKey, numBars, tempo });
      
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: selectedKey,
          numBars,
          tempo
        }),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Session created:', data);
      console.log('Session ID:', data.sessionId);
      console.log('Session object:', data.session);
      
      // Navigate to the session - the Session component will fetch the data
      navigate(`/session/${data.sessionId}`);
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Failed to create session: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const joinSession = async () => {
    if (!username.trim() || !sessionId.trim()) {
      alert('Please enter both username and session ID');
      return;
    }

    setIsJoining(true);
    try {
      console.log('Joining session:', sessionId);
      
      const response = await fetch(`/api/sessions/${sessionId}`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Session not found (${response.status})`);
      }

      const sessionData = await response.json();
      console.log('Session data:', sessionData);
      
      // Navigate to the session - the Session component will fetch the data
      navigate(`/session/${sessionId}`);
    } catch (error) {
      console.error('Error joining session:', error);
      alert('Failed to join session: ' + error.message);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="home">
      <div className="header">
        <h1>Compose It</h1>
        <p className="subtitle">Collaborative Music Composition</p>
      </div>

      <div className="main-content">
        <div className="container">
          <div className="grid grid-2">
            {/* Create Session */}
            <div className="card">
              <h2>Create New Session</h2>
              <p className="mb-20">Start a new collaborative music session as the conductor</p>
              
              <div className="form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Enter your name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Key</label>
                <select 
                  className="select" 
                  value={selectedKey} 
                  onChange={(e) => setSelectedKey(e.target.value)}
                >
                  {keys.map(key => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Number of Bars</label>
                <input
                  type="number"
                  className="input"
                  min="1"
                  max="16"
                  value={numBars}
                  onChange={(e) => setNumBars(parseInt(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label>Tempo (BPM)</label>
                <input
                  type="number"
                  className="input"
                  min="60"
                  max="200"
                  value={tempo}
                  onChange={(e) => setTempo(parseInt(e.target.value))}
                />
              </div>

              <button 
                className="btn" 
                onClick={createSession}
                disabled={isCreating}
              >
                {isCreating ? 'Creating...' : 'Create Session'}
              </button>
            </div>

            {/* Join Session */}
            <div className="card">
              <h2>Join Session</h2>
              <p className="mb-20">Join an existing session as a musician or conductor</p>
              
              <div className="form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Enter your name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Session ID</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Enter session ID"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select 
                  className="select" 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="musician">Musician</option>
                  <option value="conductor">Conductor</option>
                </select>
              </div>

              <button 
                className="btn" 
                onClick={joinSession}
                disabled={isJoining}
              >
                {isJoining ? 'Joining...' : 'Join Session'}
              </button>
            </div>
          </div>

          <div className="features">
            <h3>Features</h3>
            <div className="grid grid-3">
              <div className="feature">
                <h4>Auto-Generated Music</h4>
                <p>Generate random sheet music for multiple instruments</p>
              </div>
              <div className="feature">
                <h4>Real-time Collaboration</h4>
                <p>Multiple musicians can join and play together</p>
              </div>
              <div className="feature">
                <h4>Conductor Controls</h4>
                <p>Adjust tempo and key in real-time</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 