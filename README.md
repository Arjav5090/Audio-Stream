## Audio Streaming Application with Real-Time Audio Manipulation and Visualization

### **Project Description**

This React application allows real-time audio streaming between two users using WebRTC, with additional features such as real-time audio visualization.

The project is divided into two key steps:


- **Audio Streaming**: Real-time audio streaming between two users using WebRTC. Users can select their preferred audio input (microphone) and output devices for the stream.

- **Audio Visualization**: Real-time visualization of the audio stream frequency spectrum. The visualization dynamically updates as the audio plays, giving visual feedback of the sound.

---

### **Technologies Used**
- **React**: Frontend framework.
- **WebRTC**: For peer-to-peer audio streaming.
- **D3.js**: For audio visualization.
- **Chakra UI**: For UI components and styling.
- **Socket.io**: For signaling between peers in WebRTC.

---

### **Features Implemented**
- Real-time audio streaming between two users using WebRTC.
- Selection of audio input and output devices.
- Real-time audio visualization using frequency spectrum.

---

### **Setup Instructions**

To run this project locally, follow the steps below:

#### 1. **Clone the repository**
```bash
git clone https://github.com/your-username/Audio-Stream.git
cd Audio-Stream
```

#### 2. **Setup Signaling Server**
```bash
cd server
node server.js
```
This will start the signaling server on `localhost:8080`.
#### 3. **Run the Application**

The application uses a basic Socket.io signaling server for WebRTC connections. 

- Navigate to the `frontend` directory (or create one), and install dependencies:
  ```bash
  npm install
  npm start
  ```
This will start the app on `http://localhost:3000`.

#### 5. **Test Audio Streaming**
- Open the app in two browser tabs or windows.
- Enter the same room ID in both and click "Join Room" to connect. 
- Audio streaming should begin between the two windows.

#### 7. **View Audio Visualization**
The real-time frequency spectrum visualization will appear as soon as the audio stream is established.

---

### **Challenges Encountered**
- **WebRTC Integration**: Handling peer-to-peer audio connections using WebRTC across different browsers and ensuring smooth streaming.
- **Real-Time Visualization**: Creating efficient and responsive visualizations using D3.js to reflect real-time audio changes.

---
