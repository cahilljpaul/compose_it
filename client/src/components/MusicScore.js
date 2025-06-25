import React, { useEffect, useRef } from 'react';
import { Factory } from 'vexflow';
import './MusicScore.css';

const MusicScore = ({ music, instrument, key, tempo }) => {
  const scoreRef = useRef(null);

  useEffect(() => {
    if (!music || !scoreRef.current) return;

    // Clear previous content
    scoreRef.current.innerHTML = '';

    try {
      // Initialize VexFlow
      const factory = new Factory({
        renderer: { elementId: scoreRef.current, width: 800, height: 200 }
      });

      const score = factory.EasyScore();
      const system = factory.System();

      // Create the score - convert our music data to VexFlow format
      const notes = music.map(note => {
        const noteName = note.note;
        const octave = note.octave;
        const duration = note.duration;
        
        // Convert duration to VexFlow notation
        let durationStr = 'q'; // quarter note by default
        if (duration === 0.25) durationStr = '16';
        else if (duration === 0.5) durationStr = '8';
        else if (duration === 1) durationStr = 'q';
        else if (duration === 2) durationStr = 'h';
        else if (duration === 4) durationStr = 'w';

        return `${noteName}${octave}/${durationStr}`;
      }).join(', ');

      console.log('VexFlow notes string:', notes);

      // Add the notes to the system
      system
        .addStave({
          voices: [
            score.voice(score.notes(notes))
          ]
        })
        .addClef(instrument.clef === 'bass' ? 'bass' : 'treble')
        .addTimeSignature('4/4');

      // Render the score
      factory.draw();
    } catch (error) {
      console.error('Error rendering music score:', error);
      // Fallback: show the notes as text
      scoreRef.current.innerHTML = `
        <div style="padding: 20px; text-align: center;">
          <h4>Music Score (Text Format)</h4>
          <div style="font-family: monospace; text-align: left; max-width: 600px; margin: 0 auto;">
            ${music.map((note, index) => 
              `${index + 1}. ${note.note}${note.octave} (${note.duration}s) - Beat ${note.startBeat}`
            ).join('<br>')}
          </div>
        </div>
      `;
    }

  }, [music, instrument, key, tempo]);

  if (!music) {
    return (
      <div className="music-score-container">
        <p>No music generated yet. Please select an instrument.</p>
      </div>
    );
  }

  return (
    <div className="music-score-container">
      <div className="score-info">
        <h3>{instrument.name} Score</h3>
        <div className="score-details">
          <span>Key: {key}</span>
          <span>Tempo: {tempo} BPM</span>
          <span>Clef: {instrument.clef}</span>
        </div>
      </div>
      
      <div className="score-display">
        <div ref={scoreRef} className="vexflow-score"></div>
      </div>
      
      <div className="music-notes">
        <h4>Generated Notes:</h4>
        <div className="notes-list">
          {music.map((note, index) => (
            <div key={index} className="note-item">
              <span className="note-name">{note.note}{note.octave}</span>
              <span className="note-duration">{note.duration}s</span>
              <span className="note-beat">Beat {note.startBeat}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MusicScore; 