// FILE PATH: frontend/src/components/Dashboard.tsx
// ============================================================================
// DASHBOARD COMPONENT
// ============================================================================
// This is the core page of our app! It connects to our Socket.io backend,
// listens for nearby active flares, and allows the user to send their own flare.
// It is heavily interactive and state-driven.

import { useState, useEffect } from 'react';
import { User, Flare } from '../types';
import { LogOut, Flame, MapPin, Clock, Users, Check } from 'lucide-react';
// We import socket.io-client to talk to our backend!
import { io, Socket } from 'socket.io-client';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onJoinRoom: (flare: Flare) => void;
}

// These are the predefined options the user can select from
const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Programming', 'Biology', 'History', 'Literature', 'Economics'];
const TIME_LIMITS = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '60 min', value: 60 },
  { label: '2 hours', value: 120 }
];

export default function Dashboard({ user, onLogout, onJoinRoom }: DashboardProps) {
  // --------- STATE VARIABLES ---------
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeFlares, setActiveFlares] = useState<Flare[]>([]); // Data from the server
  
  // What the user is currently selecting for their new flare
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<number>(30);
  
  // UI states for when the user clicks 'SEND FLARE'
  const [isSending, setIsSending] = useState(false);
  const [joinedUsers, setJoinedUsers] = useState<any[]>([]);
  // const [myFlareId, setMyFlareId] = useState<string | null>(null);
  // -----------------------------------

  // useEffect block to handle the Socket.io connection.
  useEffect(() => {
    // 1. Connect to the backend server
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    // 2. Identify ourselves to the server
    newSocket.emit('register_user', user);

    // 3. Listen for the server continuously sending updated flare lists
    newSocket.on('flares_updated', (flares: Flare[]) => {
      // Sort them so the newest flares are at the top
      setActiveFlares(flares.sort((a, b) => b.createdAt - a.createdAt));
    });

    // 4. Listen for notifications that someone joined OUR newly created flare
    newSocket.on('participant_joined', (data) => {
      if (data.participant.id !== user.id) {
        // Add them to the screen so we can see who joined!
        setJoinedUsers(prev => [...prev, data.participant]);
      }
    });

    // When the component is removed/closed, we disconnect to save resources
    return () => {
      newSocket.disconnect();
    };
  }, [user]); // Only run this effect again if the `user` object completely changes

  // Function to handle clicking on a subject chip (multiselect logic)
  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject) // Remove if already selected
        : [...prev, subject]              // Add if not selected
    );
  };

  // Function to handle clicking the big red "SEND FLARE" button
  const handleSendFlare = () => {
    if (selectedSubjects.length === 0 || !socket) return;
    
    setIsSending(true); // Triggers the visual "searching" UI
    
    // Tell the server we want to create a flare
    socket.emit('send_flare', {
      subjects: selectedSubjects,
      timeLimit: selectedTime
    }, (response: any) => {
      // The server confirmed it! Save our flare's generated ID.
      //setMyFlareId(response.flareId);
      
      // We will automatically transition to the Study Room after 8 seconds
      // to give time for fake/simulated users to "join" our flare.
      setTimeout(() => {
        // Find our fully constructed flare in the active list
        const myFullFlare = activeFlares.find(f => f.id === response.flareId);
        // If we can't find it yet, we just create a dummy exact copy to pass to the next page
        const roomData = myFullFlare || {
          id: response.flareId,
          userId: user.id,
          userName: user.name,
          avatar: user.avatar,
          subjects: selectedSubjects,
          timeLimit: selectedTime,
          distance: 0,
          createdAt: Date.now(),
          participants: [user, ...joinedUsers]
        };
        // Tell the parent component (App.tsx) to switch to the Study Room!
        onJoinRoom(roomData);
      }, 8000); 
    });
  };

  // Function to join SOMEONE ELSE'S flare from the nearby list
  const handleJoinNearby = (flare: Flare) => {
    if (socket) {
      socket.emit('join_room', flare.id); // Tell server we are joining
      onJoinRoom(flare);                  // Move to Study Room screen
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 pt-4 px-4 sm:px-6">
      
      {/* 1. HEADER */}
      <header className="flex justify-between items-center py-4 mb-8 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Flame className="text-primary" size={28} />
          <span className="text-xl font-bold tracking-tight">Digital Flare</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold">{user.name}</div>
              <div className="text-xs text-zinc-500 font-mono">{user.location}</div>
            </div>
            <img src={user.avatar} alt="avatar" className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700" />
          </div>
          <button 
            onClick={onLogout}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* 2. SENDING FLARE OVERLAY (Shows after you click Send Flare) */}
      {isSending ? (
        <div className="bg-zinc-900 border border-primary/30 rounded-2xl p-8 md:p-12 text-center animate-in fade-in duration-500">
          <div className="relative w-32 h-32 mx-auto mb-8">
            {/* Pulsing animation background */}
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
            <div className="absolute inset-2 bg-primary/40 rounded-full animate-pulse"></div>
            <div className="absolute inset-4 bg-primary text-white flex items-center justify-center rounded-full z-10 shadow-[0_0_30px_rgba(255,0,51,0.8)]">
              <Flame size={48} />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Flare Broadcasted!</h2>
          <p className="text-zinc-400 mb-8">Notifying students near {user.location}...</p>
          
          <div className="max-w-md mx-auto bg-black rounded-xl p-6 border border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4 text-left">Joining Now</h3>
            
            <div className="space-y-3 min-h-[150px]">
              {joinedUsers.length === 0 ? (
                <div className="flex items-center justify-center h-full text-zinc-500 italic text-sm py-8">
                  Waiting for partners...
                </div>
              ) : (
                joinedUsers.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 bg-zinc-900 p-3 rounded-lg animate-in slide-in-from-right duration-500">
                    <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full" />
                    <span className="font-medium flex-1 text-left">{p.name}</span>
                    <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded">Joined</span>
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-6 text-sm text-zinc-500 flex items-center justify-center gap-2">
              <Clock size={14} className="animate-pulse text-primary" />
              Starting study room in a few seconds...
            </div>
          </div>
        </div>
      ) : (
        /* 3. MAIN DASHBOARD CONTENT (When not sending a flare) */
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* LEFT COLUMN: Launch Form */}
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Flame className="text-primary" /> Launch Your Flare
              </h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-zinc-400 mb-3 uppercase tracking-wider">What are you studying?</label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map(subject => {
                    const isSelected = selectedSubjects.includes(subject);
                    return (
                      <button
                        key={subject}
                        onClick={() => toggleSubject(subject)}
                        className={`text-sm px-4 py-2 rounded-full border transition-all duration-200 flex items-center gap-1
                          ${isSelected 
                            ? 'bg-primary/10 border-primary text-white shadow-[0_0_10px_rgba(255,0,51,0.2)]' 
                            : 'bg-black border-zinc-800 text-zinc-400 hover:border-zinc-600'
                          }
                        `}
                      >
                        {isSelected && <Check size={14} />}
                        {subject}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium text-zinc-400 mb-3 uppercase tracking-wider">Time Limit</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TIME_LIMITS.map(time => (
                    <button
                      key={time.value}
                      onClick={() => setSelectedTime(time.value)}
                      className={`text-sm py-2 rounded-lg border transition-all duration-200
                        ${selectedTime === time.value 
                          ? 'bg-zinc-800 border-zinc-600 text-white' 
                          : 'bg-black border-zinc-800 text-zinc-500 hover:border-zinc-700'
                        }
                      `}
                    >
                      {time.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* The big glowing button */}
              <button
                onClick={handleSendFlare}
                disabled={selectedSubjects.length === 0}
                className={`w-full py-5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300
                  ${selectedSubjects.length === 0 
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                    : 'bg-primary text-white glow-effect hover:bg-red-600'
                  }
                `}
              >
                <Flame size={24} />
                SEND FLARE
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Nearby Live Flares */}
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MapPin className="text-primary" /> Nearby Flares
              <span className="flex h-2 w-2 relative ml-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            </h2>
            
            <div className="space-y-4">
              {activeFlares.filter(f => f.userId !== user.id).length === 0 ? (
                <div className="bg-zinc-900/50 border border-zinc-800 border-dashed rounded-xl p-8 text-center text-zinc-500">
                  No active flares nearby. Be the first to start one!
                </div>
              ) : (
                // Filter out flares created by ourselves so we don't join our own flare!
                activeFlares.filter(f => f.userId !== user.id).map(flare => (
                  <div key={flare.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors group">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <img src={flare.avatar} alt="avatar" className="w-10 h-10 rounded-full" />
                        <div>
                          <div className="font-semibold text-white">{flare.userName}</div>
                          <div className="text-xs text-primary flex items-center gap-1">
                            <MapPin size={10} /> {flare.distance}m away
                          </div>
                        </div>
                      </div>
                      <div className="text-xs font-mono bg-black px-2 py-1 rounded text-zinc-400 border border-zinc-800 flex items-center gap-1">
                        <Clock size={12} /> {flare.timeLimit}m left
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {flare.subjects.map(s => (
                        <span key={s} className="text-[10px] uppercase font-bold tracking-wider bg-zinc-800 text-zinc-300 px-2 py-1 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex -space-x-2">
                        {flare.participants.map((p, i) => (
                           <img key={i} src={p.avatar} title={p.name} className="w-6 h-6 rounded-full border-2 border-zinc-900 relative z-10" />
                        ))}
                      </div>
                      
                      <button 
                        onClick={() => handleJoinNearby(flare)}
                        className="text-xs font-bold bg-white text-black px-4 py-2 flex items-center gap-1 rounded hover:bg-zinc-200 transition-colors"
                      >
                        JOIN IN <Users size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
