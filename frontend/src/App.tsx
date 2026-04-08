// FILE PATH: frontend/src/App.tsx
// ============================================================================
// MAIN APP COMPONENT & ROUTER
// ============================================================================
// This component reads authentication data (our fake JWT) from localStorage.
// Depending on where the user is in the "flow", it shows different components:
// 1. If not logged in -> Show Login
// 2. If logged in but not in a room -> Show Dashboard
// 3. If in a room -> Show StudyRoom

import { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import StudyRoom from './components/StudyRoom';
import { User, Flare } from './types';

function App() {
  // State variables in React trigger the UI to refresh when their values change.
  const [user, setUser] = useState<User | null>(null);
  
  // If the user has joined a specific flare, we store it here.
  const [activeFlare, setActiveFlare] = useState<Flare | null>(null);

  // useEffect runs once when the app starts. It checks if there is a saved 
  // user in the browser's localStorage. This mimics how a JWT works.
  useEffect(() => {
    const savedToken = localStorage.getItem('jwt_token');
    if (savedToken) {
      try {
        // We stored the user data simply as a JSON string inside the "token". 
        // We parse it back into a JavaScript object.
        const parsedUser = JSON.parse(savedToken);
        setUser(parsedUser);
      } catch (e) {
        console.error("Failed to parse token");
      }
    }
  }, []); // The empty array [] means this effect runs ONLY once on startup.

  // This function is passed to the Login component. 
  // When the user logs in, we save their info in state and in localStorage.
  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('jwt_token', JSON.stringify(loggedInUser));
  };

  // This function is passed to the Dashboard and StudyRoom to let the user log out.
  const handleLogout = () => {
    setUser(null);
    setActiveFlare(null);
    localStorage.removeItem('jwt_token');
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30">
      {/* 
        This is conditional rendering! 
        - If 'user' is null, show <Login />
        - If 'user' exists but 'activeFlare' is null, show <Dashboard />
        - If both exist, show <StudyRoom />
      */}
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : !activeFlare ? (
        <Dashboard 
          user={user} 
          onLogout={handleLogout} 
          onJoinRoom={(flare: Flare) => setActiveFlare(flare)} 
        />
      ) : (
        <StudyRoom 
          user={user} 
          flare={activeFlare} 
          onLeaveRoom={() => setActiveFlare(null)} 
        />
      )}
    </div>
  );
}

export default App;
