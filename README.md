# 🎵 Compose It - Collaborative Music Composition App

A real-time collaborative music composition application that auto-generates sheet music for multiple instruments. Musicians can join sessions, select instruments, and receive randomly generated music scores while conductors can control tempo and key changes in real-time.

## ✨ Features

- **Auto-Generated Music**: Creates random sheet music (x1 to x2 bars) based on selected key and instrument
- **Multi-Instrument Support**: Piano, Violin, Cello, Flute, Clarinet, Trumpet, Trombone, Drums
- **Real-time Collaboration**: Multiple musicians can join the same session
- **Conductor Controls**: Real-time tempo adjustment and session management
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Sheet Music Rendering**: Visual music notation using VexFlow

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd compose_it
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Start the development servers**
   ```bash
   npm run dev
   ```

This will start both the backend server (port 3001) and frontend client (port 3000).

### Manual Setup

If you prefer to install dependencies separately:

**Backend:**
```bash
cd server
npm install
npm run dev
```

**Frontend:**
```bash
cd client
npm install
npm start
```

## 🎼 How to Use

### Creating a Session

1. Open the app in your browser (http://localhost:3000)
2. Enter your name
3. Select a key (C, G, D, A, E, B, F#, C#, F, Bb, Eb, Ab, Db, Gb, Cb)
4. Choose the number of bars (1-16)
5. Set the tempo (60-200 BPM)
6. Click "Create Session" to become the conductor

### Joining a Session

1. Enter your name
2. Enter the session ID (provided by the conductor)
3. Choose your role (Musician or Conductor)
4. Click "Join Session"

### As a Musician

1. Select your instrument from the available options
2. View your auto-generated sheet music
3. See other participants in the session
4. Follow the conductor's tempo changes

### As a Conductor

1. Control the session tempo in real-time
2. Monitor all participants
3. Manage the session settings

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Socket.IO** - Real-time communication
- **VexFlow** - Music notation rendering
- **Tone.js** - Audio synthesis

### Frontend
- **React** - UI framework
- **Socket.IO Client** - Real-time communication
- **VexFlow** - Music notation rendering
- **Styled Components** - CSS-in-JS styling
- **Framer Motion** - Animations

## 📁 Project Structure

```
compose_it/
├── server/                 # Backend server
│   ├── index.js           # Main server file
│   └── package.json       # Server dependencies
├── client/                # Frontend React app
│   ├── public/            # Static files
│   ├── src/               # React source code
│   │   ├── components/    # React components
│   │   │   ├── Home.js    # Home page component
│   │   │   ├── Session.js # Session management
│   │   │   └── MusicScore.js # Sheet music rendering
│   │   ├── App.js         # Main app component
│   │   └── index.js       # React entry point
│   └── package.json       # Client dependencies
├── package.json           # Root package.json
└── README.md             # This file
```

## 🎵 Music Generation

The app generates music using the following algorithm:

1. **Note Selection**: Random notes within the instrument's range
2. **Duration Variety**: Mix of 16th, 8th, quarter, half, and whole notes
3. **Rhythm Patterns**: 4/4 time signature with proper beat distribution
4. **Key Compatibility**: Notes are generated to work with the selected key

### Supported Instruments

| Instrument | Clef | Range | Description |
|------------|------|-------|-------------|
| Piano | Treble | C4-C6 | Full keyboard range |
| Violin | Treble | G3-C6 | Standard violin range |
| Cello | Bass | C2-C5 | Standard cello range |
| Flute | Treble | C4-C6 | Standard flute range |
| Clarinet | Treble | E3-G5 | Bb clarinet range |
| Trumpet | Treble | E3-G5 | Bb trumpet range |
| Trombone | Bass | E2-C5 | Tenor trombone range |
| Drums | Percussion | Various | Drum kit notation |

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the server directory:

```env
PORT=3001
NODE_ENV=development
```

### Customization

You can customize the music generation by modifying:

- **Keys**: Edit the `keys` array in `server/index.js`
- **Instruments**: Modify the `instruments` array in `server/index.js`
- **Note Generation**: Update the `generateNotes` function in `server/index.js`

## 🚀 Deployment

### Production Build

1. **Build the client**
   ```bash
   cd client
   npm run build
   ```

2. **Start the production server**
   ```bash
   cd server
   npm start
   ```

### Docker Deployment

```dockerfile
# Dockerfile example
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

- [ ] Audio playback of generated music
- [ ] More complex music generation algorithms
- [ ] Support for different time signatures
- [ ] Music export functionality (PDF, MIDI)
- [ ] Recording and playback of sessions
- [ ] Advanced conductor controls (dynamics, articulation)
- [ ] Mobile app version

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   - Change the port in `server/index.js` or kill the process using the port

2. **Socket.IO connection errors**
   - Ensure both server and client are running
   - Check for firewall/network issues

3. **VexFlow rendering issues**
   - Clear browser cache
   - Check browser console for errors

### Getting Help

If you encounter any issues:

1. Check the browser console for errors
2. Verify all dependencies are installed
3. Ensure both server and client are running
4. Check the network tab for API errors

## 🙏 Acknowledgments

- [VexFlow](https://vexflow.com/) for music notation rendering
- [Socket.IO](https://socket.io/) for real-time communication
- [React](https://reactjs.org/) for the UI framework
- [Tone.js](https://tonejs.github.io/) for audio synthesis 