'use client';

import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  isExiting?: boolean;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  startExitAnimation: (id: string) => void;
}

let toastId = 0;
const ANIMATION_DURATION = 300;

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  
  addToast: (message, type = 'info', duration = 3000) => {
    const id = `toast-${++toastId}`;
    
    set((state) => ({
      toasts: [...state.toasts, { id, message, type, duration, isExiting: false }],
    }));

    if (duration > 0) {
      setTimeout(() => {
        get().startExitAnimation(id);
      }, duration);
    }
  },

  startExitAnimation: (id) => {
    set((state) => ({
      toasts: state.toasts.map((t) =>
        t.id === id ? { ...t, isExiting: true } : t
      ),
    }));

    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, ANIMATION_DURATION);
  },

  removeToast: (id) => {
    const toast = get().toasts.find((t) => t.id === id);
    if (toast && !toast.isExiting) {
      get().startExitAnimation(id);
    }
  },
}));

export const toast = {
  success: (message: string, duration?: number) => 
    useToastStore.getState().addToast(message, 'success', duration),
  error: (message: string, duration?: number) => 
    useToastStore.getState().addToast(message, 'error', duration),
  warning: (message: string, duration?: number) => 
    useToastStore.getState().addToast(message, 'warning', duration),
  info: (message: string, duration?: number) => 
    useToastStore.getState().addToast(message, 'info', duration),
};
