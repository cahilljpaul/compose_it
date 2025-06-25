import React, { useEffect, useRef } from 'react';
import { Renderer, Stave, StaveNote, Voice, Formatter } from 'vexflow';
import './MusicScore.css';

// Helper to map numeric durations to VexFlow duration strings
function getVexflowDuration(duration) {
  if (duration === 1) return 'q';      // quarter note
  if (duration === 2) return 'h';      // half note
  if (duration === 0.5) return '8';    // eighth note
  if (duration === 0.25) return '16';  // sixteenth note
  if (duration === 4) return 'w';      // whole note
  return 'q'; // fallback
}

const MusicScore = ({ music, instrument, musicKey, tempo }) => {
  const scoreRef = useRef(null);

  useEffect(() => {
    if (!music || !scoreRef.current) return;

    // Clear previous content
    scoreRef.current.innerHTML = '';
    console.log('scoreRef.current:', scoreRef.current);

    try {
      // Create VexFlow SVG renderer directly
      const renderer = new Renderer(scoreRef.current, Renderer.Backends.SVG);
      renderer.resize(1000, 220);
      const context = renderer.getContext();
      context.setFont('Arial', 10, '').setBackgroundFillStyle('#fff');

      // Create a stave
      const stave = new Stave(10, 40, 900);
      stave.addClef(instrument.clef === 'bass' ? 'bass' : 'treble');
      stave.addTimeSignature('4/4');
      stave.setContext(context).draw();

      // Convert music notes to VexFlow StaveNotes
      const notes = music.map(note => {
        let durationStr = 'q';
        if (note.duration === 0.25) durationStr = '16';
        else if (note.duration === 0.5) durationStr = '8';
        else if (note.duration === 1) durationStr = 'q';
        else if (note.duration === 2) durationStr = 'h';
        else if (note.duration === 4) durationStr = 'w';
        return new StaveNote({
          clef: instrument.clef === 'bass' ? 'bass' : 'treble',
          keys: [`${note.note.toLowerCase()}/${note.octave}`],
          duration: durationStr
        });
      });

      // Group notes into measures of 4 beats (for 4/4 time)
      const measures = [];
      let currentMeasure = [];
      let currentBeats = 0;
      music.forEach(note => {
        currentMeasure.push(note);
        currentBeats += note.duration;
        if (Math.abs(currentBeats - 4) < 0.0001) { // floating point safe
          measures.push(currentMeasure);
          currentMeasure = [];
          currentBeats = 0;
        }
      });
      if (currentMeasure.length > 0) {
        measures.push(currentMeasure);
      }

      // Create voices for each measure and format them
      let x = 10;
      measures.forEach(measureNotes => {
        const voice = new Voice({ num_beats: 4, beat_value: 4 });
        voice.addTickables(measureNotes);
        new Formatter().joinVoices([voice]).format([voice], 900 / measures.length);
        voice.draw(context, stave);
        x += 900 / measures.length;
      });
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