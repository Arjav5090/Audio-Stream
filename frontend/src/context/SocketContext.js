import React, { createContext, useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import Peer from "simple-peer";

const SocketContext = createContext();

const socket = io("http://localhost:8080");

const ContextProvider = ({ children }) => {
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState(null);
  const [name, setName] = useState("");
  const [call, setCall] = useState({});
  const [me, setMe] = useState("");
  const [roomID, setRoomID] = useState(""); 
  const [audioDevices, setAudioDevices] = useState([]); 
  const [selectedDevice, setSelectedDevice] = useState(null); 
  const [isFilterOn, setIsFilterOn] = useState(false); // State for toggling filter on/off

  const myAudio = useRef();
  const userAudio = useRef();
  const connectionRef = useRef();
  const analyserRef = useRef(null); // Audio analyser node
  const audioDataRef = useRef(null); // Stores audio data for visualization
  const animationRef = useRef(null); // For animation loop

  const audioContextRef = useRef(null); 
  const gainNodeRef = useRef(null);
  const filterNodeRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices()
      .then((devices) => {
        const audioInputDevices = devices.filter(device => device.kind === 'audioinput');
        setAudioDevices(audioInputDevices);
      })
      .catch((error) => console.log("Error fetching audio devices: ", error));

    socket.on("me", (id) => {
      setMe(id);
    });

    socket.on("callUser", ({ from, name: callerName, signal }) => {
      setCall({ isReceivingCall: true, from, name: callerName, signal });
    });

    socket.on("userJoined", (id) => {
      console.log(`User joined: ${id}`);
    });
  }, []);

    // UseEffect Example: Ensure analyserRef is ready before using it
    useEffect(() => {
      const animateAudio = () => {
        if (analyserRef.current && audioDataRef.current) {
          analyserRef.current.getByteTimeDomainData(audioDataRef.current);
          animationRef.current = requestAnimationFrame(animateAudio);
        }
      };
    
      if (analyserRef.current && audioContextRef.current) {
        animationRef.current = requestAnimationFrame(animateAudio);
      }
    }, [analyserRef, audioContextRef]);  // No need to include animateAudio in the dependency array
    
    

    const getUserAudio = () => {
      navigator.mediaDevices
        .getUserMedia({
          audio: {
            deviceId: selectedDevice ? { exact: selectedDevice } : undefined
          }
        })
        .then((currentStream) => {
          setStream(currentStream);
          if (myAudio.current) {
            myAudio.current.srcObject = currentStream;
          }
    
          // Initialize audio context if not done already
          if (!audioContextRef.current) {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const gainNode = audioContext.createGain();
            const filterNode = audioContext.createBiquadFilter();
            const analyserNode = audioContext.createAnalyser();
    
            // Set default filter properties
            gainNode.gain.value = 1;
            filterNode.type = 'lowpass';
            filterNode.frequency.setValueAtTime(200, audioContext.currentTime);
    
            // Connect the local stream to the analyser (for visualization)
            const source = audioContext.createMediaStreamSource(currentStream);
            source.connect(gainNode).connect(filterNode).connect(analyserNode).connect(audioContext.destination);
    
            // Set up analyser node
            analyserNode.fftSize = 2048;
            analyserNode.minDecibels = -90;
            analyserNode.maxDecibels = -10;
            analyserNode.smoothingTimeConstant = 0.85;
    
            analyserRef.current = analyserNode;  // Ensure analyserRef is set
            audioDataRef.current = new Uint8Array(analyserNode.frequencyBinCount);  // Allocate memory for audio data
            audioContextRef.current = audioContext;
            gainNodeRef.current = gainNode;
            filterNodeRef.current = filterNode;
    
            // Only proceed to visualize if everything is ready
            if (analyserRef.current && audioContext) {
              animationRef.current = requestAnimationFrame(animateAudio);  // Start the animation
            }
          }
        })
        .catch((error) => console.log("Error accessing media devices: ", error));
    };
    

  
    const animateAudio = () => {
      if (analyserRef.current && audioDataRef.current) {
        analyserRef.current.getByteTimeDomainData(audioDataRef.current);
        console.log("Audio Data:", audioDataRef.current);  // Log to check if the data is being populated
        requestAnimationFrame(animateAudio);
      }
    };
    
  

  // Function to toggle gain and frequency filter on/off
  const toggleFilter = () => {
    setIsFilterOn(!isFilterOn);
    if (filterNodeRef.current && gainNodeRef.current) {
      if (isFilterOn) {
        // Turn off the filter (restore full gain and remove frequency restriction)
        filterNodeRef.current.frequency.setValueAtTime(0, audioContextRef.current.currentTime);
        gainNodeRef.current.gain.value = 1;
        console.log("Filter removed");
      } else {
        // Apply the filter (lowpass with 200 Hz cutoff, reduce gain to 0.75)
        filterNodeRef.current.frequency.setValueAtTime(200, audioContextRef.current.currentTime);
        gainNodeRef.current.gain.value = 0.75;
        console.log("Filter applied");
      }
    }
  };

  const joinRoom = (room) => {
    setRoomID(room);
    socket.emit("joinRoom", room);
    getUserAudio();  // Fetch user audio when they join the room
  };
  

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on("signal", (data) => {
      socket.emit("answerCall", { roomID, signal: data });
    });

    peer.on("stream", (currentStream) => {
      if (userAudio.current) {
        userAudio.current.srcObject = currentStream;

        // Create an audio context for the remote stream and connect it to the analyser node
        const audioContext = audioContextRef.current || new (window.AudioContext || window.webkitAudioContext)();
        const remoteSource = audioContext.createMediaStreamSource(currentStream);
        remoteSource.connect(analyserRef.current); // Connect remote stream to the same analyser

        console.log("Remote stream connected to AnalyserNode");
      }

      console.log("Receiving remote stream");
    });

    peer.signal(call.signal);
    connectionRef.current = peer;
  };

  const callUser = () => {
    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on("signal", (data) => {
      socket.emit("callUser", {
        roomID,
        signalData: data,
        from: me,
        name
      });
    });

    peer.on("stream", (currentStream) => {
      if (userAudio.current) {
        userAudio.current.srcObject = currentStream;

        // Create an audio context for the remote stream and connect it to the analyser node
        const audioContext = audioContextRef.current || new (window.AudioContext || window.webkitAudioContext)();
        const remoteSource = audioContext.createMediaStreamSource(currentStream);
        remoteSource.connect(analyserRef.current); // Connect remote stream to the same analyser

        console.log("Remote stream connected to AnalyserNode");
      }

      console.log("Receiving remote stream");
    });

    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
    window.location.reload();
  };

  return (
    <SocketContext.Provider
      value={{
        call,
        callAccepted,
        myAudio,
        userAudio,
        stream,
        name,
        setName,
        callEnded,
        me,
        callUser,
        leaveCall,
        answerCall,
        roomID,
        setRoomID,
        joinRoom,
        audioDevices,
        selectedDevice,
        setSelectedDevice,
        toggleFilter, // Expose toggle function for filter control
        isFilterOn,   // State to track if filter is applied
        audioDataRef, // Pass the audio data for visualization
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export { ContextProvider, SocketContext };
