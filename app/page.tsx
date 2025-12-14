'use client';

import { useEffect } from 'react';
import Canvas from './components/Canvas';
import Controls from './components/Controls';
import ExportPanel from './components/ExportPanel';
import SelectionInfo from './components/SelectionInfo';
import ToastContainer from './components/Toast';
import Toolbar from './components/Toolbar';
import styles from './page.module.css';
import { useCanvasStore } from './store/canvasStore';

export default function Home() {
  const { undo, redo, setSelectedTool, deleteSelectedElements } = useCanvasStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        redo();
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelectedElements();
      }
      if (!e.ctrlKey && !e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'v':
          case '1':
            setSelectedTool('select');
            break;
          case 'p':
          case '2':
            setSelectedTool('pen');
            break;
          case 'l':
          case '3':
            setSelectedTool('line');
            break;
          case 'a':
          case '4':
            setSelectedTool('arrow');
            break;
          case 'r':
          case '5':
            setSelectedTool('rectangle');
            break;
          case 'o':
          case '6':
            setSelectedTool('ellipse');
            break;
          case 'e':
          case '7':
            setSelectedTool('eraser');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, setSelectedTool, deleteSelectedElements]);

  return (
    <div className={styles.container}>
      <Toolbar />
      <ExportPanel />
      <Canvas />
      <Controls />
      <SelectionInfo />
      <ToastContainer />
    </div>
  );
}
