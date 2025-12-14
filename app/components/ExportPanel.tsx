'use client';

import { useEffect, useRef, useState } from 'react';
import { useCanvasStore } from '../store/canvasStore';
import { toast } from '../store/toastStore';
import { getStrokePath } from '../utils/drawing';
import styles from './ExportPanel.module.css';

type ExportFormat = 'png' | 'jpg' | 'jpeg' | 'svg';

export default function ExportPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { elements } = useCanvasStore();

  const closeDropdown = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 150);
  };

  const toggleDropdown = () => {
    if (isOpen) {
      closeDropdown();
    } else {
      setIsOpen(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        if (isOpen && !isClosing) {
          closeDropdown();
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, isClosing]);

  const generateSVGContent = (includeBackground: boolean = true): string => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    elements.forEach(element => {
      if (element.type === 'pen' && element.points) {
        element.points.forEach(point => {
          minX = Math.min(minX, point.x);
          minY = Math.min(minY, point.y);
          maxX = Math.max(maxX, point.x);
          maxY = Math.max(maxY, point.y);
        });
      } else {
        const x1 = element.x;
        const y1 = element.y;
        const x2 = element.x + (element.width || 0);
        const y2 = element.y + (element.height || 0);
        minX = Math.min(minX, x1, x2);
        minY = Math.min(minY, y1, y2);
        maxX = Math.max(maxX, x1, x2);
        maxY = Math.max(maxY, y1, y2);
      }
    });

    const padding = 40;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    if (!isFinite(minX)) {
      minX = 0; minY = 0; maxX = 800; maxY = 600;
    }

    const width = maxX - minX;
    const height = maxY - minY;

    const svgElements = elements.map(element => {
      switch (element.type) {
        case 'pen':
          if (!element.points || element.points.length < 2) return '';
          const path = getStrokePath(element.points, element.strokeWidth);
          return `<path d="${path}" fill="${element.strokeColor}" />`;

        case 'rectangle':
          const rectX = Math.min(element.x, element.x + (element.width || 0));
          const rectY = Math.min(element.y, element.y + (element.height || 0));
          const rectW = Math.abs(element.width || 0);
          const rectH = Math.abs(element.height || 0);
          return `<rect x="${rectX}" y="${rectY}" width="${rectW}" height="${rectH}" fill="${element.fillColor || 'transparent'}" stroke="${element.strokeColor}" stroke-width="${element.strokeWidth}" rx="4" />`;

        case 'ellipse':
          const cx = element.x + (element.width || 0) / 2;
          const cy = element.y + (element.height || 0) / 2;
          const rx = Math.abs((element.width || 0) / 2);
          const ry = Math.abs((element.height || 0) / 2);
          return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${element.fillColor || 'transparent'}" stroke="${element.strokeColor}" stroke-width="${element.strokeWidth}" />`;

        case 'line':
          return `<line x1="${element.x}" y1="${element.y}" x2="${element.x + (element.width || 0)}" y2="${element.y + (element.height || 0)}" stroke="${element.strokeColor}" stroke-width="${element.strokeWidth}" stroke-linecap="round" />`;

        case 'arrow':
          const startX = element.x;
          const startY = element.y;
          const endX = element.x + (element.width || 0);
          const endY = element.y + (element.height || 0);
          const angle = Math.atan2(endY - startY, endX - startX);
          const arrowLength = 15;
          const arrowAngle = Math.PI / 6;
          const arrow1X = endX - arrowLength * Math.cos(angle - arrowAngle);
          const arrow1Y = endY - arrowLength * Math.sin(angle - arrowAngle);
          const arrow2X = endX - arrowLength * Math.cos(angle + arrowAngle);
          const arrow2Y = endY - arrowLength * Math.sin(angle + arrowAngle);
          return `<g>
            <line x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" stroke="${element.strokeColor}" stroke-width="${element.strokeWidth}" stroke-linecap="round" />
            <polyline points="${arrow1X},${arrow1Y} ${endX},${endY} ${arrow2X},${arrow2Y}" stroke="${element.strokeColor}" stroke-width="${element.strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round" />
          </g>`;

        default:
          return '';
      }
    }).join('\n    ');

    const background = includeBackground ? `<rect x="${minX}" y="${minY}" width="${width}" height="${height}" fill="#fafafa" />` : '';

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}" width="${width}" height="${height}">
  ${background}
  ${svgElements}
</svg>`;
  };

  const exportAsSVG = () => {
    const svgContent = generateSVGContent(true);
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    downloadBlob(blob, 'omni-sketch.svg');
  };

  const exportAsImage = async (format: 'png' | 'jpg' | 'jpeg') => {
    setIsExporting(true);
    
    try {
      const svgContent = generateSVGContent(true);
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
      const svgElement = svgDoc.documentElement;
      const width = parseFloat(svgElement.getAttribute('width') || '800');
      const height = parseFloat(svgElement.getAttribute('height') || '600');

      const scale = 2;
      canvas.width = width * scale;
      canvas.height = height * scale;
      ctx.scale(scale, scale);

      const img = new Image();
      const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          if (format === 'jpg' || format === 'jpeg') {
            ctx.fillStyle = '#fafafa';
            ctx.fillRect(0, 0, width, height);
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          URL.revokeObjectURL(url);
          resolve();
        };
        img.onerror = reject;
        img.src = url;
      });

      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
      const quality = format === 'png' ? undefined : 0.95;
      
      canvas.toBlob((blob) => {
        if (blob) {
          downloadBlob(blob, `omni-sketch.${format}`);
        }
        setIsExporting(false);
      }, mimeType, quality);
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    closeDropdown();
  };

  const handleExport = (format: ExportFormat) => {
    if (elements.length === 0) {
      toast.warning('Canvas boş! Önce bir şeyler çizin.');
      return;
    }

    if (format === 'svg') {
      exportAsSVG();
    } else {
      exportAsImage(format);
    }
  };

  return (
    <div className={styles.container} ref={panelRef}>
      <button
        className={styles.trigger}
        onClick={toggleDropdown}
        title="Dışa Aktar"
        disabled={isExporting}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        <span>İndir</span>
      </button>

      {isOpen && (
        <div className={`${styles.dropdown} ${isClosing ? styles.dropdownClosing : ''}`}>
          <div className={styles.header}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Çizimi İndir</span>
          </div>

          <div className={styles.formatList}>
            <button 
              className={styles.formatButton}
              onClick={() => handleExport('png')}
              disabled={isExporting}
            >
              <div className={styles.formatIcon} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                PNG
              </div>
              <div className={styles.formatInfo}>
                <span className={styles.formatName}>PNG</span>
                <span className={styles.formatDesc}>Şeffaf arka plan destekli</span>
              </div>
            </button>

            <button 
              className={styles.formatButton}
              onClick={() => handleExport('jpg')}
              disabled={isExporting}
            >
              <div className={styles.formatIcon} style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                JPG
              </div>
              <div className={styles.formatInfo}>
                <span className={styles.formatName}>JPG</span>
                <span className={styles.formatDesc}>Fotoğraflar için ideal</span>
              </div>
            </button>

            <button 
              className={styles.formatButton}
              onClick={() => handleExport('jpeg')}
              disabled={isExporting}
            >
              <div className={styles.formatIcon} style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                JPEG
              </div>
              <div className={styles.formatInfo}>
                <span className={styles.formatName}>JPEG</span>
                <span className={styles.formatDesc}>Yüksek uyumluluk</span>
              </div>
            </button>

            <button 
              className={styles.formatButton}
              onClick={() => handleExport('svg')}
              disabled={isExporting}
            >
              <div className={styles.formatIcon} style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                SVG
              </div>
              <div className={styles.formatInfo}>
                <span className={styles.formatName}>SVG</span>
                <span className={styles.formatDesc}>Vektörel, ölçeklenebilir</span>
              </div>
            </button>
          </div>

          {isExporting && (
            <div className={styles.exporting}>
              <div className={styles.spinner} />
              <span>Dışa aktarılıyor...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
