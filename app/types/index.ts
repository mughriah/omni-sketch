import { nanoid } from 'nanoid';

export type Tool = 'select' | 'pen' | 'rectangle' | 'ellipse' | 'line' | 'arrow' | 'text' | 'eraser';

export type Point = {
  x: number;
  y: number;
  pressure?: number;
};

export interface Element {
  id: string;
  type: Tool;
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: Point[];
  strokeColor: string;
  strokeWidth: number;
  fillColor?: string;
  text?: string;
  isSelected?: boolean;
  rotation?: number;
}

export interface CanvasState {
  elements: Element[];
  selectedTool: Tool;
  strokeColor: string;
  strokeWidth: number;
  fillColor: string;
  zoom: number;
  panOffset: Point;
  history: Element[][];
  historyIndex: number;
  isDrawing: boolean;
  currentElement: Element | null;
}

export const createId = () => nanoid(10);

export const defaultElement: Omit<Element, 'id' | 'type' | 'x' | 'y'> = {
  strokeColor: '#1e1e1e',
  strokeWidth: 2,
  fillColor: 'transparent',
};
