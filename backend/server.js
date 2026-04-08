// FILE PATH: backend/server.js
// ============================================================================
// ONE-TAP STUDY GROUP - BACKEND SERVER
// ============================================================================
// Welcome! This is the main backend file for our application. 
// It is written in Node.js, and uses two very important libraries:
// 1. Express: A framework that makes it easy to handle web requests.
// 2. Socket.io: A library that allows "real-time" communication. Unlike standard 
//    web requests where the browser has to ask the server for updates, Socket.io 
//    keeps a connection open so the server can push updates instantly to everyone!

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// --- 1. SETUP THE SERVER ---
// We initialize our Express app.
const app = express();

// Enable CORS (Cross-Origin Resource Sharing). 
// Since our React frontend runs on a different port (like 5173) than this server (port 3001),
// browsers will block communication for security reasons unless we enable CORS.
app.use(cors());

// Express normally handles data, but to use Socket.io, we need to attach it to a standard 
// Node HTTP server. So we wrap our Express app inside an HTTP server.
const server = http.createServer(app);

// Initialize Socket.io and attach it to the HTTP server. 
// We configure it to allow connections from any origin (so our frontend can reach it).
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

// --- 2. IN-MEMORY DATABASE ---
// Since we are not using a real database (like MongoDB or PostgreSQL) for this project,
// we will store our data in simple JavaScript variables. 
// Note: In real life, if the server restarts, this data is lost!
let activeFlares = [];   // Stores study flares created by users
const activeUsers = {};  // Maps a socket.id to user data to track who is connected

// --- 3. HELPER FUNCTIONS ---
// This function generates a fake ID for a new flare.
const generateId = () => Math.random().toString(36).substring(2, 9);

// Simulated list of random user profiles. We use these to automatically generate 
// "Nearby Flares" and simulate people joining your study session!
const simulatedUsers = [
  { id: 'sim_1', name: 'Alex Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
  { id: 'sim_2', name: 'Maria Garcia', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria' },
  { id: 'sim_3', name: 'David Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David' },
  { id: 'sim_4', name: 'Sarah Lee', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
  { id: 'sim_5', name: 'James Wilson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James' }
];

const subjectsList = ['Mathematics', 'Physics', 'Programming', 'Biology', 'Literature'];

// Function to generate a random nearby flare to make the app feel alive.
const generateRandomFlare = () => {
  const randomUser = simulatedUsers[Math.floor(Math.random() * simulatedUsers.length)];
  const randomSubject = subjectsList[Math.floor(Math.random() * subjectsList.length)];
  
  return {
    id: generateId(),
    userId: randomUser.id,
    userName: randomUser.name,
    avatar: randomUser.avatar,
    subjects: [randomSubject],
    timeLimit: 30, // 30 minutes
    distance: Math.floor(Math.random() * 500) + 50, // Random distance in meters
    createdAt: Date.now(),
    participants: [{ 
      id: randomUser.id, 
      name: randomUser.name, 
      avatar: randomUser.avatar 
    }]
  };
};

// Start simulating random flares appearing every 15 seconds.
setInterval(() => {
  // Add a new random flare
  const newFlare = generateRandomFlare();
  activeFlares.push(newFlare);
  
  // Keep the list to a maximum of 6 flares so it doesn't get too bloated
  if (activeFlares.length > 6) {
    activeFlares.shift(); // Remove the oldest flare
  }

  // Broadcast to EVERY connected user that the active flares list has updated
  io.emit('flares_updated', activeFlares);
}, 15000); // 15000 ms = 15 seconds


// --- 4. REAL-TIME SOCKET LISTENER ---
// io.on('connection') triggers every time a completely new user opens the website 
// and connects via Socket.io. The 'socket' object represents that one specific user's connection.
io.on('connection', (socket) => {
  console.log(`🔌 New user connected: ${socket.id}`);

  // When a user connects, immediately send them the current list of active flares.
  socket.emit('flares_updated', activeFlares);

  // 4a. USER IDENTIFICATION
  // The frontend sends user details when they log in. We save those details.
  socket.on('register_user', (userData) => {
    activeUsers[socket.id] = userData;
    console.log(`👤 User registered: ${userData.name}`);
  });

  // 4b. SEND (CREATE) A FLARE
  // Triggered when a user clicks the giant "SEND FLARE" button.
  socket.on('send_flare', (flareData, callback) => {
    const user = activeUsers[socket.id];
    if (!user) return; // If we don't know who this is, ignore.

    console.log(`🚀 Flare sent by ${user.name}`);

    // Construct the flare object. We include the user themselves as the first participant.
    const newFlare = {
      id: generateId(),
      userId: user.id,
      userName: user.name,
      avatar: user.avatar,
      subjects: flareData.subjects,
      timeLimit: flareData.timeLimit,
      distance: 0, // It's their own flare, distance is 0
      createdAt: Date.now(),
      participants: [{
        id: user.id,
        name: user.name,
        avatar: user.avatar
      }]
    };

    activeFlares.push(newFlare);
    
    // Notify all other users about the new flare.
    io.emit('flares_updated', activeFlares);
    
    // A callback lets the frontend know the server successfully processed the request.
    if (typeof callback === "function") {
      callback({ success: true, flareId: newFlare.id });
    }

    // --- SIMULATE OTHERS JOINING ---
    // Here is the magic: Since this is a demo, we want to pretend the app is very busy.
    // 4 to 8 seconds after the user creates a flare, "fake" users will start joining it.
    setTimeout(() => {
      // Find the flare in our array
      const flareToUpdate = activeFlares.find(f => f.id === newFlare.id);
      if (flareToUpdate) {
        // Pick a random simulated user to join
        const randomJoinee = simulatedUsers[Math.floor(Math.random() * simulatedUsers.length)];
        
        // Ensure they aren't already in the list
        if (!flareToUpdate.participants.some(p => p.id === randomJoinee.id)) {
          flareToUpdate.participants.push(randomJoinee);
          
          console.log(`🤝 Simulated user ${randomJoinee.name} joined flare ${flareToUpdate.id}`);
          
          // Emit the updated flare to EVERYONE, and specifically to anyone in the 'room' for this flare
          io.emit('flares_updated', activeFlares);
          io.to(flareToUpdate.id).emit('flare_updated', flareToUpdate);
          
          // Specifically notify the owner that someone joined!
          io.to(socket.id).emit('participant_joined', {
            flareId: flareToUpdate.id,
            participant: randomJoinee
          });
        }
      }
    }, Math.floor(Math.random() * 4000) + 4000); // Wait between 4000ms (4s) and 8000ms (8s)
  });

  // 4c. JOINING A STUDY ROOM
  // Triggered when a user clicks to join an existing flare.
  socket.on('join_room', (flareId) => {
    // Socket.io has a concept of "Rooms". A socket can join a room to only receive
    // messages broadcasted to that specific room. Perfect for a private study group!
    socket.join(flareId);
    console.log(`👥 Socket ${socket.id} joined room ${flareId}`);

    // If the flare exists, add the user to its participants list.
    const flare = activeFlares.find(f => f.id === flareId);
    const user = activeUsers[socket.id];
    
    if (flare && user) {
      if (!flare.participants.some(p => p.id === user.id)) {
        flare.participants.push({
          id: user.id,
          name: user.name,
          avatar: user.avatar
        });
        
        // Notify everyone globally, and notify everyone specifically in this room.
        io.emit('flares_updated', activeFlares);
        io.to(flareId).emit('flare_updated', flare);
      }
    }
  });

  // 4d. REAL-TIME CHAT IN ROOM
  socket.on('chat_message', (data) => {
    // We expect data to have { flareId, message, senderId, senderName, avatar }
    console.log(`💬 Chat in room ${data.flareId}: ${data.message}`);
    
    // Broadcast this message ONLY to users who have joined this specific flareId room!
    // We construct the final message object including a timestamp.
    io.to(data.flareId).emit('chat_message', {
      id: generateId(),
      ...data, // Spreads out the properties we received
      timestamp: new Date().toISOString()
    });

    // --- SIMULATE OTHERS REPLYING ---
    // If a user types something, we make a simulated user reply a few seconds later!
    const flare = activeFlares.find(f => f.id === data.flareId);
    if (flare) {
      // Find a participant who is NOT the person who just sent the message
      const otherParticipant = flare.participants.find(p => p.id !== data.senderId);
      if (otherParticipant) {
        // Wait between 1.5 and 3.5 seconds before replying
        setTimeout(() => {
          const replies = [
            `I totally agree, ${data.senderName}.`,
            "Should we start reviewing from chapter 1?",
            "That makes a lot of sense!",
            "I'm ready when you all are 😊",
            "Can someone explain the main topic again?"
          ];
          const randomReply = replies[Math.floor(Math.random() * replies.length)];
          
          // Emit a brand new chat message from the simulated user
          io.to(data.flareId).emit('chat_message', {
            id: generateId(),
            flareId: data.flareId,
            senderId: otherParticipant.id,
            senderName: otherParticipant.name,
            avatar: otherParticipant.avatar,
            message: randomReply,
            timestamp: new Date().toISOString()
          });
        }, Math.floor(Math.random() * 2000) + 1500);
      }
    }
  });

  // 4e. DISCONNECT
  // Triggered if the user closes the browser or loses internet connection
  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
    // Clean up memory to prevent leaks!
    delete activeUsers[socket.id];
  });
});

// --- 5. START SERVER ---
// We tell the Node.js server to start listening for traffic on port 3001.
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`✨ Backend server is running on http://localhost:${PORT}`);
});
