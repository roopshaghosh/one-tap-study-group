// FILE PATH: frontend/src/components/StudyRoom.tsx
// ============================================================================
// STUDY ROOM COMPONENT
// ============================================================================
// This component manages the active study session.
// It handles a live chat, dynamic participant updates, a countdown timer, 
// and interactions with the browser's Fullscreen API for a distraction-free mode.

import { useState, useEffect, useRef } from 'react';
import { User, Flare, ChatMessage } from '../types';
import { io, Socket } from 'socket.io-client';
import { Maximize2, Minimize2, Send, LogOut, Clock, Users } from 'lucide-react';

interface StudyRoomProps {
  user: User;
  flare: Flare;
  onLeaveRoom: () => void;
}

export default function StudyRoom({ user, flare, onLeaveRoom }: StudyRoomProps) {
  // --------- STATE VARIABLES ---------
  const [socket, setSocket] = useState<Socket | null>(null);
  
  // We keep the flare data in state so we can update it if someone new joins
  const [currentFlare, setCurrentFlare] = useState<Flare>(flare);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(flare.timeLimit * 60); // Convert minutes to seconds
  
  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Ref to automatically scroll the chat to the bottom when a new message arrives
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Ref for the main container to request fullscreen
  const containerRef = useRef<HTMLDivElement>(null);
  // -----------------------------------

  useEffect(() => {
    // Scroll to the bottom of the chat smoothly
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Socket Connection & Real-Time Events
  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    // Tell the server we are joining this specific room identifier
    newSocket.emit('join_room', flare.id);

    // Listen for incoming chat messages in this room
    newSocket.on('chat_message', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Listen for updates to the room (like someone new joining)
    newSocket.on('flare_updated', (updatedFlare: Flare) => {
      setCurrentFlare(updatedFlare);
    });

    return () => {
      newSocket.disconnect(); // Clean up when leaving!
    };
  }, [flare.id]);

  // Handle Countdown Timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    // Run this function every 1000 milliseconds (1 second)
    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    // Cleanup interval so we don't have memory leaks
    return () => clearInterval(timerId);
  }, [timeLeft]);

  // Helper to format remaining seconds into MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Handle Chat Submit
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !socket) return;

    // Construct the message
    const newMessage = {
      flareId: currentFlare.id,
      senderId: user.id,
      senderName: user.name,
      avatar: user.avatar,
      message: inputValue.trim(),
    };

    // Send to backend!
    socket.emit('chat_message', newMessage);
    
    // Clear the input box
    setInputValue('');
  };

  // Toggle FullScreen API
  // This interacts directly with the browser's native capabilities
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div ref={containerRef} className="h-screen bg-black flex flex-col pt-4 px-4 sm:px-6">
      
      {/* 1. ROOM HEADER */}
      <header className="flex justify-between items-center py-4 mb-4 border-b border-zinc-800 shrink-0">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="text-primary">●</span> Room: {currentFlare.subjects.join(', ')}
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Host: {currentFlare.userName}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg font-mono text-xl text-primary font-bold shadow-[0_0_10px_rgba(255,0,51,0.2)]">
            <Clock size={16} className="inline mr-2 -mt-1" />
            {formatTime(timeLeft)}
          </div>
          
          <button 
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
          
          <button 
            onClick={onLeaveRoom}
            className="bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white px-4 py-2 font-semibold rounded-lg flex items-center gap-2 transition-colors"
          >
            Leave <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* 2. MAIN LAYOUT (PARTICIPANTS & CHAT) */}
      <div className="flex-1 min-h-0 flex gap-6 pb-6">
        
        {/* LEFT COLUMN: Participants Panel */}
        <div className="w-1/4 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
            <Users size={16} /> Participants ({currentFlare.participants.length})
          </h2>
          
          <div className="overflow-y-auto pr-2 space-y-2 flex-1">
            {currentFlare.participants.map((p, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-black border border-zinc-800 rounded-lg">
                <img src={p.avatar} alt="Avatar" className="w-10 h-10 rounded-full bg-zinc-800" />
                <div className="flex-1 overflow-hidden">
                  <div className="font-medium truncate text-white text-sm">{p.name}</div>
                  {p.id === currentFlare.userId && (
                    <div className="text-[10px] text-primary uppercase font-bold mt-0.5">Host</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Real-time Chat Panel */}
        <div className="flex-1 bg-zinc-900/30 border border-zinc-800 rounded-xl flex flex-col overflow-hidden relative">
          
          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-500 italic">
                No messages yet. Say hello!
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMe = msg.senderId === user.id;
                
                return (
                  <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-3 max-w-[75%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      <img src={msg.avatar} className="w-8 h-8 rounded-full shadow-sm mt-1" />
                      <div className={isMe ? 'items-end' : 'items-start'}>
                        <div className="text-xs text-zinc-500 mb-1 mx-1 text-left">
                          {isMe ? 'You' : msg.senderName}
                        </div>
                        <div className={`px-4 py-2.5 rounded-2xl ${
                          isMe 
                            ? 'bg-primary text-white rounded-tr-none' 
                            : 'bg-zinc-800 text-zinc-200 rounded-tl-none'
                        }`}>
                          {msg.message}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            {/* Invisible div to help us scroll to the bottom */}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Field */}
          <div className="p-4 bg-zinc-900 border-t border-zinc-800">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-black border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 text-white"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="bg-primary hover:bg-red-600 disabled:opacity-50 disabled:hover:bg-primary text-white p-3 rounded-xl transition-colors flex items-center justify-center shrink-0"
              >
                <Send size={20} />
              </button>
            </form>
          </div>
          
        </div>
      </div>
    </div>
  );
}
