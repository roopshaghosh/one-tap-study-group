// FILE PATH: frontend/src/types.ts
// ============================================================================
// TYPESCRIPT DEFINITIONS
// ============================================================================
// TypeScript helps us catch errors by strictly defining what data should look like.
// Here, we define the "shapes" of our User, Flare, and ChatMessage objects.

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  location: string;
}

export interface Participant {
  id: string;
  name: string;
  avatar: string;
}

export interface Flare {
  id: string;
  userId: string;
  userName: string;
  avatar: string;
  subjects: string[];
  timeLimit: number;
  distance: number;
  createdAt: number;
  participants: Participant[];
}

export interface ChatMessage {
  id?: string;
  flareId: string;
  senderId: string;
  senderName: string;
  avatar: string;
  message: string;
  timestamp?: string;
}
