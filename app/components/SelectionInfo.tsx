'use client';

import { useRef, useState } from 'react';
import { useCanvasStore } from '../store/canvasStore';
import { getElementBounds } from '../utils/drawing';
import styles from './SelectionInfo.module.css';

const toolNames: Record<string, string> = {
  pen: 'Kalem',
  rectangle: 'Dikdörtgen',
  ellipse: 'Daire',
  line: 'Çizgi',
  arrow: 'Ok',
  text: 'Metin',
};

export default function SelectionInfo() {
  const { elements, selectedElementIds, deleteSelectedElements, updateSelectedElementsColor } = useCanvasStore();
  const strokeInputRef = useRef<HTMLInputElement>(null);
  const fillInputRef = useRef<HTMLInputElement>(null);
  const [showFillPicker, setShowFillPicker] = useState(false);

  if (selectedElementIds.length === 0) return null;

  const selectedElements = elements.filter((el) => selectedElementIds.includes(el.id));
  
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  for (const element of selectedElements) {
    const bounds = getElementBounds(element);
    if (!bounds) continue;
    minX = Math.min(minX, bounds.x);
    minY = Math.min(minY, bounds.y);
    maxX = Math.max(maxX, bounds.x + bounds.width);
    maxY = Math.max(maxY, bounds.y + bounds.height);
  }

  const totalWidth = Math.round(maxX - minX);
  const totalHeight = Math.round(maxY - minY);

  const isSingleSelection = selectedElements.length === 1;
  const element = isSingleSelection ? selectedElements[0] : null;

  const firstElement = selectedElements[0];
  const commonStrokeColor = selectedElements.every((el) => el.strokeColor === firstElement?.strokeColor)
    ? firstElement?.strokeColor
    : '#1e1e1e';
  const commonFillColor = selectedElements.every((el) => el.fillColor === firstElement?.fillColor)
    ? firstElement?.fillColor
    : 'transparent';

  const handleStrokeColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSelectedElementsColor(e.target.value, undefined);
  };

  const handleFillColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSelectedElementsColor(undefined, e.target.value);
  };

  const handleStrokeSwatchClick = () => {
    strokeInputRef.current?.click();
  };

  const handleFillSwatchClick = () => {
    if (!showFillPicker) {
      setShowFillPicker(true);
    }
    fillInputRef.current?.click();
  };

  const handleRemoveFill = () => {
    updateSelectedElementsColor(undefined, 'transparent');
    setShowFillPicker(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.infoBox}>
        <div className={styles.typeBadge}>
          {isSingleSelection && element ? (
            <>
              <span className={styles.typeIcon}>
                {element.type === 'pen' && '✏️'}
                {element.type === 'rectangle' && '⬜'}
                {element.type === 'ellipse' && '⭕'}
                {element.type === 'line' && '📏'}
                {element.type === 'arrow' && '➡️'}
              </span>
              <span>{toolNames[element.type] || element.type}</span>
            </>
          ) : (
            <>
              <span className={styles.typeIcon}>📦</span>
              <span>{selectedElements.length} nesne seçili</span>
            </>
          )}
        </div>

        <div className={styles.divider} />

        <div className={styles.sizeInfo}>
          <div className={styles.sizeItem}>
            <span className={styles.label}>G:</span>
            <span className={styles.value}>{totalWidth}px</span>
          </div>
          <div className={styles.sizeItem}>
            <span className={styles.label}>Y:</span>
            <span className={styles.value}>{totalHeight}px</span>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.colorInfo}>
          <div className={styles.colorGroup}>
            <span className={styles.colorLabel}>Çizgi</span>
            <div 
              className={styles.colorSwatch}
              style={{ backgroundColor: commonStrokeColor }}
              onClick={handleStrokeSwatchClick}
              title="Çizgi rengi"
            />
            <input
              ref={strokeInputRef}
              type="color"
              value={commonStrokeColor}
              onChange={handleStrokeColorChange}
              className={styles.hiddenColorInput}
            />
          </div>
          <div className={styles.colorGroup}>
            <span className={styles.colorLabel}>Dolgu</span>
            {commonFillColor && commonFillColor !== 'transparent' ? (
              <div className={styles.fillSwatchGroup}>
                <div 
                  className={styles.colorSwatch}
                  style={{ backgroundColor: commonFillColor }}
                  onClick={handleFillSwatchClick}
                  title="Dolgu rengi"
                />
                <button 
                  className={styles.removeFillButton}
                  onClick={handleRemoveFill}
                  title="Dolguyu kaldır"
                >
                  ×
                </button>
              </div>
            ) : (
              <div 
                className={`${styles.colorSwatch} ${styles.noFill}`}
                onClick={handleFillSwatchClick}
                title="Dolgu ekle"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
            )}
            <input
              ref={fillInputRef}
              type="color"
              value={commonFillColor === 'transparent' ? '#ffffff' : commonFillColor}
              onChange={handleFillColorChange}
              className={styles.hiddenColorInput}
            />
          </div>
        </div>

        <div className={styles.divider} />

        <button 
          className={styles.deleteButton}
          onClick={deleteSelectedElements}
          title="Seçilenleri sil"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </button>
      </div>
    </div>
  );
}
