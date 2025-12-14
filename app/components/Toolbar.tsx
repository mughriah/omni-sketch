'use client';

import { useCanvasStore } from '../store/canvasStore';
import { Tool } from '../types';
import ColorPicker from './ColorPicker';
import styles from './Toolbar.module.css';

const tools: { id: Tool; label: string }[] = [
  { id: 'select', label: 'Seç (V)' },
  { id: 'pen', label: 'Kalem (P)' },
  { id: 'line', label: 'Çizgi (L)' },
  { id: 'arrow', label: 'Ok (A)' },
  { id: 'rectangle', label: 'Dikdörtgen (R)' },
  { id: 'ellipse', label: 'Elips (O)' },
  { id: 'eraser', label: 'Silgi (E)' },
];

const colors = [
  '#1e1e1e',
  '#e03131',
  '#2f9e44',
  '#1971c2',
  '#f08c00',
  '#9c36b5',
  '#0c8599',
  '#868e96',
];

const strokeWidths = [2, 4, 6, 8];

const ToolIcon = ({ tool }: { tool: Tool }) => {
  switch (tool) {
    case 'select':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
          <path d="M13 13l6 6" />
        </svg>
      );
    case 'pen':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19l7-7 3 3-7 7-3-3z" />
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
          <path d="M2 2l7.586 7.586" />
          <circle cx="11" cy="11" r="2" />
        </svg>
      );
    case 'line':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="5" y1="19" x2="19" y2="5" />
        </svg>
      );
    case 'arrow':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="19" x2="19" y2="5" />
          <polyline points="10 5 19 5 19 14" />
        </svg>
      );
    case 'rectangle':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
        </svg>
      );
    case 'ellipse':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <ellipse cx="12" cy="12" rx="9" ry="7" />
        </svg>
      );
    case 'eraser':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 20H7L3 16c-.8-.8-.8-2 0-2.8l10-10c.8-.8 2-.8 2.8 0l6 6c.8.8.8 2 0 2.8L13 21" />
          <path d="M6.5 13.5L14.5 5.5" />
        </svg>
      );
    default:
      return null;
  }
};

export default function Toolbar() {
  const { 
    selectedTool, 
    setSelectedTool, 
    strokeColor, 
    setStrokeColor,
    strokeWidth,
    setStrokeWidth,
  } = useCanvasStore();

  return (
    <div className={styles.toolbarContainer}>
      <div className={styles.toolbar}>
        <div className={styles.toolGroup}>
          {tools.map((tool) => (
            <button
              key={tool.id}
              className={`${styles.toolButton} ${selectedTool === tool.id ? styles.active : ''}`}
              onClick={() => setSelectedTool(tool.id)}
              title={tool.label}
            >
              <ToolIcon tool={tool.id} />
            </button>
          ))}
        </div>

        <div className={styles.divider} />

        <div className={styles.toolGroup}>
          {colors.map((color) => (
            <button
              key={color}
              className={`${styles.colorButton} ${strokeColor === color ? styles.activeColor : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => setStrokeColor(color)}
              title={color}
            />
          ))}
          <ColorPicker color={strokeColor} onChange={setStrokeColor} />
        </div>

        <div className={styles.divider} />

        <div className={styles.toolGroup}>
          {strokeWidths.map((width) => (
            <button
              key={width}
              className={`${styles.strokeButton} ${strokeWidth === width ? styles.active : ''}`}
              onClick={() => setStrokeWidth(width)}
              title={`${width}px`}
            >
              <div 
                className={styles.strokePreview} 
                style={{ 
                  height: `${width}px`,
                  backgroundColor: strokeColor 
                }} 
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
