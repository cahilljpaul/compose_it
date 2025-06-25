import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Session from './components/Session';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={<Home />} 
          />
          <Route 
            path="/session/:sessionId" 
            element={<Session />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 