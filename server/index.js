const app = require("express")();
const server = require("http").createServer(app);
const cors = require("cors");
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
const PORT = process.env.PORT || 8080;
app.get('/', (req, res) => {
  res.send('Audio streaming server is running');
});

io.on("connection", (socket) => {
  console.log(`New client connected with ID: ${socket.id}`);

  socket.on("joinRoom", (roomID) => {
    console.log(`User ${socket.id} joined room ${roomID}`);
    socket.join(roomID);

    // Notify other users in the room
    socket.to(roomID).emit("userJoined", socket.id);
  });

  // Signaling for WebRTC
  socket.on("callUser", ({ roomID, signalData, from, name }) => {
    console.log(`Calling user in room: ${roomID}`);
    socket.to(roomID).emit("callUser", { signal: signalData, from, name });
  });

  socket.on("answerCall", ({ roomID, signal }) => {
    console.log(`Answering call in room: ${roomID}`);
    socket.to(roomID).emit("callAccepted", signal);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
    socket.broadcast.emit("callEnded");
  });
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
