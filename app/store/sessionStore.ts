'use client';

import { nanoid } from 'nanoid';
import { create } from 'zustand';
import { Element } from '../types';

export interface User {
  id: string;
  name: string;
  color: string;
  cursorPosition?: { x: number; y: number };
}

interface SessionStore {
  sessionId: string | null;
  isHost: boolean;
  users: User[];
  currentUser: User | null;
  isConnected: boolean;
  
  createSession: () => string;
  joinSession: (sessionId: string, userName: string) => void;
  leaveSession: () => void;
  setCurrentUser: (user: User) => void;
  addUser: (user: User) => void;
  removeUser: (userId: string) => void;
  updateUserCursor: (userId: string, position: { x: number; y: number }) => void;
  
  syncElements: (elements: Element[]) => void;
  onElementsChange?: (elements: Element[]) => void;
}

const userColors = [
  '#7c3aed', '#e03131', '#2f9e44', '#1971c2', 
  '#f08c00', '#9c36b5', '#0c8599', '#d6336c'
];

const getRandomColor = () => userColors[Math.floor(Math.random() * userColors.length)];

const generateSessionId = () => nanoid(8).toUpperCase();

export const useSessionStore = create<SessionStore>((set, get) => ({
  sessionId: null,
  isHost: false,
  users: [],
  currentUser: null,
  isConnected: false,

  createSession: () => {
    const sessionId = generateSessionId();
    const user: User = {
      id: nanoid(6),
      name: 'Host',
      color: getRandomColor(),
    };
    
    set({
      sessionId,
      isHost: true,
      currentUser: user,
      users: [user],
      isConnected: true,
    });
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('omni-session', JSON.stringify({ sessionId, user }));
    }
    
    return sessionId;
  },

  joinSession: (sessionId, userName) => {
    const user: User = {
      id: nanoid(6),
      name: userName || 'Guest',
      color: getRandomColor(),
    };
    
    set({
      sessionId,
      isHost: false,
      currentUser: user,
      users: [user],
      isConnected: true,
    });
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('omni-session', JSON.stringify({ sessionId, user }));
    }
  },

  leaveSession: () => {
    set({
      sessionId: null,
      isHost: false,
      users: [],
      currentUser: null,
      isConnected: false,
    });
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('omni-session');
    }
  },

  setCurrentUser: (user) => set({ currentUser: user }),

  addUser: (user) => {
    set((state) => ({
      users: [...state.users.filter(u => u.id !== user.id), user],
    }));
  },

  removeUser: (userId) => {
    set((state) => ({
      users: state.users.filter((u) => u.id !== userId),
    }));
  },

  updateUserCursor: (userId, position) => {
    set((state) => ({
      users: state.users.map((u) =>
        u.id === userId ? { ...u, cursorPosition: position } : u
      ),
    }));
  },

  syncElements: (elements) => {
    const { onElementsChange } = get();
    if (onElementsChange) {
      onElementsChange(elements);
    }
  },
}));
