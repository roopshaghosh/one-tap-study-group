# One-Tap Study Group

Welcome to our Digital Flare application! We have built a full-stack, real-time application using React, Express, and Socket.io. 

This guide will explain exactly how to start this application, how the folders are organized, and how the entire workflow functions.

---

##  Step 1: Setup and Run Instructions

 You will need two terminal windows open: one for the backend (server) and one for the frontend (website).

### A. Starting the Backend Server

1. Open your terminal or command prompt.
2. Navigate into the backend folder:
   ```bash
   cd c:\Users\shamp\OneDrive\Desktop\study-group\backend
   ```
3. Install the dependencies. This downloads Express and Socket.io from the internet:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```
   *You should see a message saying: `✨ Backend server is running on http://localhost:3001`.*

### B. Starting the Frontend Website

1. Open a **second** terminal window.
2. Navigate into the frontend folder:
   ```bash
   cd c:\Users\shamp\OneDrive\Desktop\study-group\frontend
   ```
3. Install the needed packages (React, Tailwind CSS, Lucide Icons, Socket.io):
   ```bash
   npm install
   ```
4. Start the development website:
   ```bash
   npm run dev
   ```
   *You will see a link, usually `http://localhost:5173`. Hold CTRL (or CMD) and click that link to open the app in your browser!*

---

##  Step 2: Project Folder Structure Explained

```text
study-group/
│
├── backend/                  <-- THE SERVER (Brain)
│   ├── node_modules/         (Auto-generated: Where downloaded packages live)
│   ├── package.json          (List of tools the backend needs, like socket.io)
│   └── server.js             (The main brain: Handles user connections and real-time chat)
│
└── frontend/                 <-- THE WEBSITE (Face)
    ├── node_modules/         (Auto-generated: UI packages)
    ├── package.json          (List of tools the website needs, like React)
    ├── tailwind.config.js    (Tells Tailwind CSS what colors to use)
    ├── vite.config.ts        (The tool that builds our website lightning fast)
    ├── index.html            (The very first file the browser loads)
    │
    └── src/                  <-- ALL OUR REACT CODE LIVES HERE
        ├── main.tsx          (Injects React into our index.html)
        ├── App.tsx           (The Router - Decides which page to show)
        ├── index.css         (Global styles & our custom glowing button effect)
        ├── types.ts          (TypeScript rules defining what a 'User' or 'Flare' looks like)
        │
        └── components/       <-- THE VISUAL BLOCKS
            ├── Login.tsx       (The beautiful dark login screen)
            ├── Dashboard.tsx   (Where you launch big red flares and see nearby matches)
            └── StudyRoom.tsx   (The actual private group, holding the chat and timer)
```

---

##  Step 3: Complete User Workflow Explanation

Here is exactly what happens step-by-step when you use the website:

### 1. Opening the Website
When you navigate to `http://localhost:5173`, the browser downloads the React app. `App.tsx` sees you don't have a saved "JWT Token" in your `localStorage`, so it shows you the **Login Page**.

### 2. Logging In
You type in the demo credentials (`roopsha@example.com` and `123456`) and click **Get Started**. The `Login.tsx` component checks these details. If correct, it creates a demo User object, hands it to `App.tsx`, and saves it to your browser. You are instantly visually transitioned to the **Dashboard**.

### 3. Arriving at the Dashboard
When `Dashboard.tsx` loads, it immediately connects to the backend (`server.js`) using `Socket.io`. 
* **Nearby Flares:** In the background, `server.js` randomly creates simulated users and broadcasts them every 15 seconds. Your React app receives this data instantly without you reloading the page, updating the "Nearby Flares" list!

### 4. Sending a Flare
You pick your subjects (e.g., *Programming*), pick a time (e.g., *30 min*), and hit the giant glowing **SEND FLARE** button. 
* React tells `server.js`: *"Hey, I'm starting a flare!"*
* The server saves your flare and tells *everyone else connected* that a new group has formed.
* Your screen changes to a pulsing "Flare Broadcasted" view. We've programmed `server.js` to wait randomly between 4 and 8 seconds, and then "fake users" start magically joining your flare so the UI feels incredibly alive!

### 5. Entering the Study Room
After 8 seconds of seeing fake users join, the Dashboard automatically shifts you to the **Study Room**. 
Here, `StudyRoom.tsx` asks the server to place you in a private "Socket.io Room". 
* **Chatting:** When you type "Hello there!" and press send, `StudyRoom.tsx` sends the message to the server. The server instantly bounces that message back ONLY to people who have joined your specific Room. 
* **Focusing:** You click the fullscreen button in the top right. React triggers the browser's native `requestFullscreen` API to hide your tabs and focus entirely on studying!
* **Leaving:** When time is up, you click the "Leave" button. You tell the server you are out, and React drops you safely back to the Dashboard.

---
