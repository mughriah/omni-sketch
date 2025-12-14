'use client';

import Link from 'next/link';
import { FaGithub } from 'react-icons/fa';
import { useCanvasStore } from '../store/canvasStore';
import styles from './Controls.module.css';

export default function Controls() {
  const { 
    zoom, 
    setZoom, 
    undo, 
    redo, 
    history, 
    historyIndex,
    clearCanvas 
  } = useCanvasStore();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleZoomIn = () => setZoom(zoom + 0.1);
  const handleZoomOut = () => setZoom(zoom - 0.1);
  const handleResetZoom = () => setZoom(1);

  return (
    <>
      <div className={styles.zoomControls}>
        <button 
          className={styles.controlButton} 
          onClick={handleZoomOut}
          title="Uzaklaştır"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <button 
          className={styles.zoomValue} 
          onClick={handleResetZoom}
          title="Sıfırla"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button 
          className={styles.controlButton} 
          onClick={handleZoomIn}
          title="Yakınlaştır"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      <div className={styles.historyControls}>
        <button 
          className={`${styles.controlButton} ${!canUndo ? styles.disabled : ''}`}
          onClick={undo}
          disabled={!canUndo}
          title="Geri Al (Ctrl+Z)"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 10h13a5 5 0 0 1 0 10H12" />
            <polyline points="7 6 3 10 7 14" />
          </svg>
        </button>
        <button 
          className={`${styles.controlButton} ${!canRedo ? styles.disabled : ''}`}
          onClick={redo}
          disabled={!canRedo}
          title="İleri Al (Ctrl+Y)"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10H8a5 5 0 0 0 0 10h5" />
            <polyline points="17 6 21 10 17 14" />
          </svg>
        </button>
      </div>

      <div className={styles.clearControl}>
        <button 
          className={styles.clearButton}
          onClick={clearCanvas}
          title="Tümünü Temizle"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          <span>Temizle</span>
        </button>
      </div>

      <Link href={"https://github.com/firatmio"} target='_blank'>
      <div className={styles.branding}>
        <FaGithub className={styles.brandIcon} />
                  <span>Created by firatmio</span>
              </div>
      </Link>
    </>
  );
}
