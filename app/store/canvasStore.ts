'use client';

import { create } from 'zustand';
import { Element, Point, Tool, createId } from '../types';

export type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | null;

interface SelectionBox {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface CanvasStore {
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
  isDragging: boolean;
  isResizing: boolean;
  isMarqueeSelecting: boolean;
  marqueeBox: SelectionBox | null;
  resizeHandle: ResizeHandle;
  dragStartPoint: Point | null;
  initialElementsState: Element[] | null;
  currentElement: Element | null;
  selectedElementIds: string[];

  setSelectedTool: (tool: Tool) => void;
  setStrokeColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  setFillColor: (color: string) => void;
  setZoom: (zoom: number) => void;
  setPanOffset: (offset: Point) => void;
  
  startDrawing: (point: Point) => void;
  continueDrawing: (point: Point) => void;
  finishDrawing: () => void;
  
  startDragging: (point: Point) => void;
  continueDragging: (point: Point) => void;
  finishDragging: () => void;
  
  startResizing: (point: Point, handle: ResizeHandle) => void;
  continueResizing: (point: Point) => void;
  finishResizing: () => void;
  
  startMarqueeSelection: (point: Point) => void;
  continueMarqueeSelection: (point: Point) => void;
  finishMarqueeSelection: () => void;
  
  addElement: (element: Element) => void;
  updateElement: (id: string, updates: Partial<Element>) => void;
  updateSelectedElementsColor: (strokeColor?: string, fillColor?: string) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string | null, addToSelection?: boolean) => void;
  selectElementsInBox: (box: SelectionBox) => void;
  clearSelection: () => void;
  deleteSelectedElements: () => void;
  
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
  
  clearCanvas: () => void;
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  elements: [],
  selectedTool: 'pen',
  strokeColor: '#1e1e1e',
  strokeWidth: 2,
  fillColor: 'transparent',
  zoom: 1,
  panOffset: { x: 0, y: 0 },
  history: [[]],
  historyIndex: 0,
  isDrawing: false,
  isDragging: false,
  isResizing: false,
  isMarqueeSelecting: false,
  marqueeBox: null,
  resizeHandle: null,
  dragStartPoint: null,
  initialElementsState: null,
  currentElement: null,
  selectedElementIds: [],

  setSelectedTool: (tool) => set({ selectedTool: tool, selectedElementIds: [] }),
  setStrokeColor: (color) => set({ strokeColor: color }),
  setStrokeWidth: (width) => set({ strokeWidth: width }),
  setFillColor: (color) => set({ fillColor: color }),
  setZoom: (zoom) => set({ zoom: Math.min(Math.max(0.1, zoom), 5) }),
  setPanOffset: (offset) => set({ panOffset: offset }),

  startDrawing: (point) => {
    const { selectedTool, strokeColor, strokeWidth, fillColor } = get();
    
    if (selectedTool === 'select') return;
    
    const newElement: Element = {
      id: createId(),
      type: selectedTool,
      x: point.x,
      y: point.y,
      strokeColor,
      strokeWidth,
      fillColor,
      points: selectedTool === 'pen' ? [point] : undefined,
      width: 0,
      height: 0,
    };
    
    set({ isDrawing: true, currentElement: newElement });
  },

  continueDrawing: (point) => {
    const { isDrawing, currentElement, selectedTool } = get();
    
    if (!isDrawing || !currentElement) return;
    
    if (selectedTool === 'pen' && currentElement.points) {
      set({
        currentElement: {
          ...currentElement,
          points: [...currentElement.points, point],
        },
      });
    } else if (['rectangle', 'ellipse', 'line', 'arrow'].includes(selectedTool)) {
      set({
        currentElement: {
          ...currentElement,
          width: point.x - currentElement.x,
          height: point.y - currentElement.y,
        },
      });
    }
  },

  finishDrawing: () => {
    const { currentElement, elements } = get();
    
    if (currentElement) {
      const newElements = [...elements, currentElement];
      set({
        elements: newElements,
        isDrawing: false,
        currentElement: null,
      });
      get().saveToHistory();
    } else {
      set({ isDrawing: false });
    }
  },

  addElement: (element) => {
    set((state) => ({ elements: [...state.elements, element] }));
    get().saveToHistory();
  },

  updateElement: (id, updates) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ),
    }));
  },

  updateSelectedElementsColor: (strokeColor, fillColor) => {
    const { selectedElementIds } = get();
    if (selectedElementIds.length === 0) return;

    set((state) => ({
      elements: state.elements.map((el) =>
        selectedElementIds.includes(el.id)
          ? {
              ...el,
              ...(strokeColor !== undefined && { strokeColor }),
              ...(fillColor !== undefined && { fillColor }),
            }
          : el
      ),
    }));
    get().saveToHistory();
  },

  deleteElement: (id) => {
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedElementIds: state.selectedElementIds.filter((eid) => eid !== id),
    }));
    get().saveToHistory();
  },

  selectElement: (id, addToSelection = false) => {
    if (id === null) {
      set({ selectedElementIds: [] });
    } else if (addToSelection) {
      set((state) => {
        if (state.selectedElementIds.includes(id)) {
          return { selectedElementIds: state.selectedElementIds.filter((eid) => eid !== id) };
        }
        return { selectedElementIds: [...state.selectedElementIds, id] };
      });
    } else {
      set({ selectedElementIds: [id] });
    }
  },

  clearSelection: () => {
    set({ selectedElementIds: [] });
  },

  selectElementsInBox: (box) => {
    const { elements } = get();
    const minX = Math.min(box.startX, box.endX);
    const maxX = Math.max(box.startX, box.endX);
    const minY = Math.min(box.startY, box.endY);
    const maxY = Math.max(box.startY, box.endY);

    const selectedIds: string[] = [];

    for (const element of elements) {
      let elementInBox = false;

      if (element.type === 'pen' && element.points) {
        elementInBox = element.points.some(
          (p) => p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY
        );
      } else {
        const elMinX = Math.min(element.x, element.x + (element.width || 0));
        const elMaxX = Math.max(element.x, element.x + (element.width || 0));
        const elMinY = Math.min(element.y, element.y + (element.height || 0));
        const elMaxY = Math.max(element.y, element.y + (element.height || 0));

        elementInBox = !(elMaxX < minX || elMinX > maxX || elMaxY < minY || elMinY > maxY);
      }

      if (elementInBox) {
        selectedIds.push(element.id);
      }
    }

    set({ selectedElementIds: selectedIds });
  },

  deleteSelectedElements: () => {
    const { selectedElementIds } = get();
    if (selectedElementIds.length === 0) return;
    
    set((state) => ({
      elements: state.elements.filter((el) => !selectedElementIds.includes(el.id)),
      selectedElementIds: [],
    }));
    get().saveToHistory();
  },

  startDragging: (point) => {
    set({ isDragging: true, dragStartPoint: point });
  },

  continueDragging: (point) => {
    const { isDragging, dragStartPoint, selectedElementIds, elements } = get();
    
    if (!isDragging || !dragStartPoint || selectedElementIds.length === 0) return;
    
    const dx = point.x - dragStartPoint.x;
    const dy = point.y - dragStartPoint.y;
    
    const updatedElements = elements.map((el) => {
      if (!selectedElementIds.includes(el.id)) return el;
      
      if (el.type === 'pen' && el.points) {
        return {
          ...el,
          x: el.x + dx,
          y: el.y + dy,
          points: el.points.map((p) => ({
            ...p,
            x: p.x + dx,
            y: p.y + dy,
          })),
        };
      }
      
      return {
        ...el,
        x: el.x + dx,
        y: el.y + dy,
      };
    });
    
    set({ elements: updatedElements, dragStartPoint: point });
  },

  finishDragging: () => {
    const { isDragging } = get();
    if (isDragging) {
      set({ isDragging: false, dragStartPoint: null });
      get().saveToHistory();
    }
  },

  startResizing: (point, handle) => {
    const { elements } = get();
    set({ 
      isResizing: true, 
      resizeHandle: handle, 
      dragStartPoint: point,
      initialElementsState: JSON.parse(JSON.stringify(elements))
    });
  },

  continueResizing: (point) => {
    const { isResizing, resizeHandle, dragStartPoint, selectedElementIds, initialElementsState } = get();
    
    if (!isResizing || !resizeHandle || !dragStartPoint || selectedElementIds.length === 0 || !initialElementsState) return;

    const dx = point.x - dragStartPoint.x;
    const dy = point.y - dragStartPoint.y;

    let initMinX = Infinity, initMinY = Infinity, initMaxX = -Infinity, initMaxY = -Infinity;
    
    for (const id of selectedElementIds) {
      const element = initialElementsState.find((el) => el.id === id);
      if (!element) continue;

      if (element.type === 'pen' && element.points) {
        for (const p of element.points) {
          initMinX = Math.min(initMinX, p.x);
          initMinY = Math.min(initMinY, p.y);
          initMaxX = Math.max(initMaxX, p.x);
          initMaxY = Math.max(initMaxY, p.y);
        }
      } else {
        const elMinX = Math.min(element.x, element.x + (element.width || 0));
        const elMaxX = Math.max(element.x, element.x + (element.width || 0));
        const elMinY = Math.min(element.y, element.y + (element.height || 0));
        const elMaxY = Math.max(element.y, element.y + (element.height || 0));
        initMinX = Math.min(initMinX, elMinX);
        initMinY = Math.min(initMinY, elMinY);
        initMaxX = Math.max(initMaxX, elMaxX);
        initMaxY = Math.max(initMaxY, elMaxY);
      }
    }

    const initWidth = initMaxX - initMinX || 1;
    const initHeight = initMaxY - initMinY || 1;

    let scaleX = 1, scaleY = 1;
    let anchorX = initMinX, anchorY = initMinY;

    switch (resizeHandle) {
      case 'se':
        scaleX = (initWidth + dx) / initWidth;
        scaleY = (initHeight + dy) / initHeight;
        break;
      case 'sw':
        scaleX = (initWidth - dx) / initWidth;
        scaleY = (initHeight + dy) / initHeight;
        anchorX = initMaxX;
        break;
      case 'ne':
        scaleX = (initWidth + dx) / initWidth;
        scaleY = (initHeight - dy) / initHeight;
        anchorY = initMaxY;
        break;
      case 'nw':
        scaleX = (initWidth - dx) / initWidth;
        scaleY = (initHeight - dy) / initHeight;
        anchorX = initMaxX;
        anchorY = initMaxY;
        break;
      case 'e':
        scaleX = (initWidth + dx) / initWidth;
        break;
      case 'w':
        scaleX = (initWidth - dx) / initWidth;
        anchorX = initMaxX;
        break;
      case 's':
        scaleY = (initHeight + dy) / initHeight;
        break;
      case 'n':
        scaleY = (initHeight - dy) / initHeight;
        anchorY = initMaxY;
        break;
    }

    if (scaleX <= 0.1) scaleX = 0.1;
    if (scaleY <= 0.1) scaleY = 0.1;

    const updatedElements = initialElementsState.map((element) => {
      if (!selectedElementIds.includes(element.id)) {
        return get().elements.find((el) => el.id === element.id) || element;
      }

      if (element.type === 'pen' && element.points) {
        const newPoints = element.points.map((p) => ({
          ...p,
          x: anchorX + (p.x - anchorX) * scaleX,
          y: anchorY + (p.y - anchorY) * scaleY,
        }));
        return { ...element, points: newPoints };
      }

      const elX = element.x;
      const elY = element.y;
      const elW = element.width || 0;
      const elH = element.height || 0;

      const newX = anchorX + (elX - anchorX) * scaleX;
      const newY = anchorY + (elY - anchorY) * scaleY;
      const newWidth = elW * scaleX;
      const newHeight = elH * scaleY;

      return { ...element, x: newX, y: newY, width: newWidth, height: newHeight };
    });

    set({ elements: updatedElements });
  },

  finishResizing: () => {
    const { isResizing } = get();
    if (isResizing) {
      set({ isResizing: false, resizeHandle: null, dragStartPoint: null, initialElementsState: null });
      get().saveToHistory();
    }
  },

  startMarqueeSelection: (point) => {
    set({
      isMarqueeSelecting: true,
      marqueeBox: { startX: point.x, startY: point.y, endX: point.x, endY: point.y },
      selectedElementIds: [],
    });
  },

  continueMarqueeSelection: (point) => {
    const { isMarqueeSelecting, marqueeBox } = get();
    if (!isMarqueeSelecting || !marqueeBox) return;

    const newBox = { ...marqueeBox, endX: point.x, endY: point.y };
    set({ marqueeBox: newBox });
    get().selectElementsInBox(newBox);
  },

  finishMarqueeSelection: () => {
    set({ isMarqueeSelecting: false, marqueeBox: null });
  },

  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      set({
        historyIndex: newIndex,
        elements: [...history[newIndex]],
      });
    }
  },

  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      set({
        historyIndex: newIndex,
        elements: [...history[newIndex]],
      });
    }
  },

  saveToHistory: () => {
    const { elements, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...elements]);
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  clearCanvas: () => {
    set({ elements: [], selectedElementIds: [] });
    get().saveToHistory();
  },
}));
