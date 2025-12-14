'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './ColorPicker.module.css';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

const presetColors = [
  '#1e1e1e', '#374151', '#6b7280', '#9ca3af',
  '#e03131', '#f03e3e', '#ff6b6b', '#ffa8a8',
  '#2f9e44', '#40c057', '#69db7c', '#b2f2bb',
  '#1971c2', '#228be6', '#4dabf7', '#a5d8ff',
  '#f08c00', '#fab005', '#ffd43b', '#ffec99',
  '#9c36b5', '#ae3ec9', '#da77f2', '#eebefa',
  '#0c8599', '#15aabf', '#66d9e8', '#c5f6fa',
  '#d6336c', '#f06595', '#faa2c1', '#ffdeeb',
];

export default function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(color);
  const pickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setCustomColor(color);
  }, [color]);

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    onChange(newColor);
  };

  return (
    <div className={styles.container} ref={pickerRef}>
      <button
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        title="Özel Renk Seç"
      >
        <div className={styles.colorPreview} style={{ backgroundColor: color }} />
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      
      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <span>Renk Seç</span>
          </div>
          
          <div className={styles.presetGrid}>
            {presetColors.map((presetColor) => (
              <button
                key={presetColor}
                className={`${styles.presetColor} ${color === presetColor ? styles.selected : ''}`}
                style={{ backgroundColor: presetColor }}
                onClick={() => {
                  onChange(presetColor);
                  setCustomColor(presetColor);
                }}
              />
            ))}
          </div>
          
          <div className={styles.customSection}>
            <label className={styles.customLabel}>Özel Renk</label>
            <div className={styles.customInput}>
              <input
                ref={inputRef}
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                className={styles.nativeColorInput}
              />
              <input
                type="text"
                value={customColor}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                    setCustomColor(val);
                    if (val.length === 7) {
                      onChange(val);
                    }
                  }
                }}
                className={styles.hexInput}
                placeholder="#000000"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
