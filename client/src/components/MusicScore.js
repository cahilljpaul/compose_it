import React, { useEffect, useRef } from 'react';
import { Factory } from 'vexflow';
import './MusicScore.css';

const MusicScore = ({ music, instrument, musicKey, tempo }) => {
  const scoreRef = useRef(null);

  useEffect(() => {
    if (!music || !scoreRef.current) return;

    // Defensive: clear previous content
    scoreRef.current.innerHTML = '';

    // Defensive: log the ref
    console.log('scoreRef.current:', scoreRef.current);

    try {
      // Explicitly set renderer type to SVG (backend: 'svg' for VexFlow 4.x+)
      const factory = new Factory({
        renderer: { element: scoreRef.current, width: 1000, height: 220, backend: 'svg' }
      });

      const score = factory.EasyScore();

      // Split notes into measures of 4 beats (for 4/4 time)
      const measures = [];
      let currentMeasure = [];
      let currentBeats = 0;
      music.forEach(note => {
        currentMeasure.push(note);
        currentBeats += note.duration;
        if (currentBeats >= 4) {
          measures.push(currentMeasure);
          currentMeasure = [];
          currentBeats = 0;
        }
      });
      if (currentMeasure.length > 0) {
        measures.push(currentMeasure);
      }

      const notesString = measures
        .map(measureNotes =>
          measureNotes.map(note => {
            const noteName = note.note;
            const octave = note.octave;
            const duration = note.duration;
            let durationStr = 'q';
            if (duration === 0.25) durationStr = '16';
            else if (duration === 0.5) durationStr = '8';
            else if (duration === 1) durationStr = 'q';
            else if (duration === 2) durationStr = 'h';
            else if (duration === 4) durationStr = 'w';
            return `${noteName}${octave}/${durationStr}`;
          }).join(', ')
        )
        .join(' | ');

      const voice = score.voice(score.notes(notesString));
      const stave = factory.Stave({
        voices: [voice]
      });
      stave.addClef(instrument.clef === 'bass' ? 'bass' : 'treble');
      stave.addTimeSignature('4/4');
      factory.draw();
    } catch (error) {
      console.error('Error rendering music score:', error);
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
  }, [music, instrument, musicKey, tempo]);

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
          <span>Key: {musicKey}</span>
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