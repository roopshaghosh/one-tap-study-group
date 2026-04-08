// FILE PATH: frontend/src/components/Login.tsx
// ============================================================================
// LOGIN COMPONENT
// ============================================================================
// This is the first page the user sees. It provides a stunning dark UI 
// with glowing effects. We use a mock authentication system where only
// specific test credentials work.

import { useState } from 'react';
import { User } from '../types';
import { Flame, ArrowRight } from 'lucide-react'; // Using Lucide for beautiful SVG icons

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  // We use state to track everything the user types into the input fields.
  const [email, setEmail] = useState('roopsha@example.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  // This function runs when the user clicks the "Get Started" button.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevents the browser from reloading the page
    
    // Fake Authentication Logic: In a real app, this would make an API call to the backend.
    if (email === 'roopsha@example.com' && password === '123456') {
      const demoUser: User = {
        id: 'u_roopsha123',
        name: 'Roopsha',
        email: 'roopsha@example.com',
        // Using an API to get a fast user avatar
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Roopsha',
        location: 'Indore, Madhya Pradesh'
      };
      
      // Call the function passed from App.tsx to log the user in!
      onLogin(demoUser);
    } else {
      setError('Invalid credentials. Use roopsha@example.com / 123456');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 relative overflow-hidden">
      
      {/* Decorative background glow circles for that premium aesthetic */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />

      <div className="max-w-md w-full bg-zinc-950 border border-zinc-900 rounded-2xl p-8 shadow-2xl relative z-10 transition-transform duration-500 hover:scale-[1.01]">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
            <Flame size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Digital Flare</h1>
          <p className="text-zinc-500 mt-2">Find your study group instantly</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">Password</label>
              <span className="text-xs text-primary cursor-pointer hover:underline">Forgot?</span>
            </div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="w-full mt-6 bg-primary hover:bg-red-600 text-white font-semibold py-3.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_0_15px_rgba(255,0,51,0.3)] hover:shadow-[0_0_25px_rgba(255,0,51,0.5)]"
          >
            <span>Get Started</span>
            <ArrowRight 
              size={18} 
              className={`transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`}
            />
          </button>
          
          <div className="text-center mt-6">
            <p className="text-zinc-500 text-sm">
              Don't have an account? <span className="text-white hover:text-primary cursor-pointer transition-colors">Sign up</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
