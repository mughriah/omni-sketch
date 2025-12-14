'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { ResizeHandle, useCanvasStore } from '../store/canvasStore';
import { Element, Point } from '../types';
import { BoundingBox, getElementAtPosition, getElementBounds, getStrokePath, screenToCanvas } from '../utils/drawing';
import styles from './Canvas.module.css';

export default function Canvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  const {
    elements,
    selectedTool,
    zoom,
    panOffset,
    isDrawing,
    isDragging,
    isResizing,
    isMarqueeSelecting,
    marqueeBox,
    currentElement,
    selectedElementIds,
    startDrawing,
    continueDrawing,
    finishDrawing,
    startDragging,
    continueDragging,
    finishDragging,
    startResizing,
    continueResizing,
    finishResizing,
    startMarqueeSelection,
    continueMarqueeSelection,
    finishMarqueeSelection,
    selectElement,
    deleteElement,
    setPanOffset,
  } = useCanvasStore();

  const isPanning = useRef(false);
  const lastPanPoint = useRef<Point>({ x: 0, y: 0 });

  const getPointerPosition = useCallback(
    (e: React.PointerEvent | PointerEvent): Point => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      
      return screenToCanvas(screenX, screenY, zoom, panOffset);
    },
    [zoom, panOffset]
  );

  const getResizeHandleAtPosition = useCallback(
    (point: Point, bounds: BoundingBox): ResizeHandle => {
      const handleSize = 12 / zoom;
      const { x, y, width, height } = bounds;

      if (Math.abs(point.x - x) < handleSize && Math.abs(point.y - y) < handleSize) return 'nw';
      if (Math.abs(point.x - (x + width)) < handleSize && Math.abs(point.y - y) < handleSize) return 'ne';
      if (Math.abs(point.x - x) < handleSize && Math.abs(point.y - (y + height)) < handleSize) return 'sw';
      if (Math.abs(point.x - (x + width)) < handleSize && Math.abs(point.y - (y + height)) < handleSize) return 'se';

      if (Math.abs(point.x - (x + width / 2)) < handleSize && Math.abs(point.y - y) < handleSize) return 'n';
      if (Math.abs(point.x - (x + width / 2)) < handleSize && Math.abs(point.y - (y + height)) < handleSize) return 's';
      if (Math.abs(point.x - x) < handleSize && Math.abs(point.y - (y + height / 2)) < handleSize) return 'w';
      if (Math.abs(point.x - (x + width)) < handleSize && Math.abs(point.y - (y + height / 2)) < handleSize) return 'e';

      return null;
    },
    [zoom]
  );

  const getMultiSelectionBoundsFromElements = useCallback((elementsArr: Element[], selectedIds: string[]): BoundingBox | null => {
    if (selectedIds.length === 0) return null;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    for (const id of selectedIds) {
      const element = elementsArr.find((el) => el.id === id);
      if (!element) continue;

      const bounds = getElementBounds(element);
      if (!bounds) continue;

      minX = Math.min(minX, bounds.x);
      minY = Math.min(minY, bounds.y);
      maxX = Math.max(maxX, bounds.x + bounds.width);
      maxY = Math.max(maxY, bounds.y + bounds.height);
    }

    if (minX === Infinity) return null;

    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button === 1 || (e.button === 0 && e.altKey)) {
        isPanning.current = true;
        lastPanPoint.current = { x: e.clientX, y: e.clientY };
        return;
      }

      const point = getPointerPosition(e);
      point.pressure = e.pressure;

      if (selectedTool === 'select') {
        if (selectedElementIds.length > 0) {
          const bounds = getMultiSelectionBoundsFromElements(elements, selectedElementIds);
          if (bounds) {
            const handle = getResizeHandleAtPosition(point, bounds);
            if (handle) {
              startResizing(point, handle);
              return;
            }
          }
        }

        const element = getElementAtPosition(point.x, point.y, elements);
        if (element) {
          const isShiftPressed = e.shiftKey;
          if (isShiftPressed) {
            selectElement(element.id, true);
          } else if (!selectedElementIds.includes(element.id)) {
            selectElement(element.id, false);
          }
          startDragging(point);
        } else {
          startMarqueeSelection(point);
        }
      } else if (selectedTool === 'eraser') {
        const element = getElementAtPosition(point.x, point.y, elements);
        if (element) {
          deleteElement(element.id);
        }
      } else {
        startDrawing(point);
      }
    },
    [selectedTool, elements, selectedElementIds, getPointerPosition, getResizeHandleAtPosition, getMultiSelectionBoundsFromElements, startDrawing, selectElement, deleteElement, startDragging, startResizing, startMarqueeSelection]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (isPanning.current) {
        const dx = e.clientX - lastPanPoint.current.x;
        const dy = e.clientY - lastPanPoint.current.y;
        setPanOffset({
          x: panOffset.x + dx,
          y: panOffset.y + dy,
        });
        lastPanPoint.current = { x: e.clientX, y: e.clientY };
        return;
      }

      if (isMarqueeSelecting && selectedTool === 'select') {
        const point = getPointerPosition(e);
        continueMarqueeSelection(point);
        return;
      }

      if (isResizing && selectedTool === 'select') {
        const point = getPointerPosition(e);
        continueResizing(point);
        return;
      }

      if (isDragging && selectedTool === 'select') {
        const point = getPointerPosition(e);
        continueDragging(point);
        return;
      }

      if (!isDrawing) return;

      const point = getPointerPosition(e);
      point.pressure = e.pressure;
      continueDrawing(point);
    },
    [isDrawing, isDragging, isResizing, isMarqueeSelecting, selectedTool, getPointerPosition, continueDrawing, continueDragging, continueResizing, continueMarqueeSelection, panOffset, setPanOffset]
  );

  const handlePointerUp = useCallback(() => {
    if (isPanning.current) {
      isPanning.current = false;
      return;
    }
    if (isMarqueeSelecting) {
      finishMarqueeSelection();
      return;
    }
    if (isResizing) {
      finishResizing();
      return;
    }
    if (isDragging) {
      finishDragging();
      return;
    }
    finishDrawing();
  }, [finishDrawing, finishDragging, finishResizing, finishMarqueeSelection, isDragging, isResizing, isMarqueeSelecting]);

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const canvasX = (mouseX - panOffset.x) / zoom;
        const canvasY = (mouseY - panOffset.y) / zoom;
        
        const delta = -e.deltaY * 0.001;
        const newZoom = Math.min(Math.max(0.1, zoom + delta), 5);
        
        const newPanOffsetX = mouseX - canvasX * newZoom;
        const newPanOffsetY = mouseY - canvasY * newZoom;
        
        useCanvasStore.getState().setZoom(newZoom);
        setPanOffset({ x: newPanOffsetX, y: newPanOffsetY });
      } else {
        setPanOffset({
          x: panOffset.x - e.deltaX,
          y: panOffset.y - e.deltaY,
        });
      }
    },
    [zoom, panOffset, setPanOffset]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  const renderElement = (element: Element, isPreview: boolean = false) => {
    const isSelected = selectedElementIds.includes(element.id) && !isPreview;
    const opacity = isPreview ? 0.7 : 1;

    switch (element.type) {
      case 'pen':
        if (!element.points || element.points.length < 2) return null;
        const path = getStrokePath(element.points, element.strokeWidth);
        return (
          <g key={element.id}>
            <path
              d={path}
              fill={element.strokeColor}
              opacity={opacity}
              className={isSelected ? styles.selected : ''}
            />
          </g>
        );

      case 'rectangle':
        const rectX = Math.min(element.x, element.x + (element.width || 0));
        const rectY = Math.min(element.y, element.y + (element.height || 0));
        const rectW = Math.abs(element.width || 0);
        const rectH = Math.abs(element.height || 0);
        return (
          <rect
            key={element.id}
            x={rectX}
            y={rectY}
            width={rectW}
            height={rectH}
            fill={element.fillColor || 'transparent'}
            stroke={element.strokeColor}
            strokeWidth={element.strokeWidth}
            rx={4}
            opacity={opacity}
            className={isSelected ? styles.selected : ''}
          />
        );

      case 'ellipse':
        const cx = element.x + (element.width || 0) / 2;
        const cy = element.y + (element.height || 0) / 2;
        const rx = Math.abs((element.width || 0) / 2);
        const ry = Math.abs((element.height || 0) / 2);
        return (
          <ellipse
            key={element.id}
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            fill={element.fillColor || 'transparent'}
            stroke={element.strokeColor}
            strokeWidth={element.strokeWidth}
            opacity={opacity}
            className={isSelected ? styles.selected : ''}
          />
        );

      case 'line':
        return (
          <line
            key={element.id}
            x1={element.x}
            y1={element.y}
            x2={element.x + (element.width || 0)}
            y2={element.y + (element.height || 0)}
            stroke={element.strokeColor}
            strokeWidth={element.strokeWidth}
            strokeLinecap="round"
            opacity={opacity}
            className={isSelected ? styles.selected : ''}
          />
        );

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
        
        return (
          <g key={element.id} opacity={opacity} className={isSelected ? styles.selected : ''}>
            <line
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke={element.strokeColor}
              strokeWidth={element.strokeWidth}
              strokeLinecap="round"
            />
            <polyline
              points={`${arrow1X},${arrow1Y} ${endX},${endY} ${arrow2X},${arrow2Y}`}
              stroke={element.strokeColor}
              strokeWidth={element.strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        );

      default:
        return null;
    }
  };

  const getMultiSelectionBounds = (): BoundingBox | null => {
    if (selectedElementIds.length === 0) return null;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    for (const id of selectedElementIds) {
      const element = elements.find((el) => el.id === id);
      if (!element) continue;

      const bounds = getElementBounds(element);
      if (!bounds) continue;

      minX = Math.min(minX, bounds.x);
      minY = Math.min(minY, bounds.y);
      maxX = Math.max(maxX, bounds.x + bounds.width);
      maxY = Math.max(maxY, bounds.y + bounds.height);
    }

    if (minX === Infinity) return null;

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  };

  const renderSelectionBox = () => {
    if (selectedElementIds.length === 0) return null;
    
    const bounds = getMultiSelectionBounds();
    if (!bounds) return null;
    
    const handleSize = 8;
    
    const cornerHandles = [
      { x: bounds.x, y: bounds.y, cursor: 'nw-resize', handle: 'nw' as ResizeHandle },
      { x: bounds.x + bounds.width, y: bounds.y, cursor: 'ne-resize', handle: 'ne' as ResizeHandle },
      { x: bounds.x, y: bounds.y + bounds.height, cursor: 'sw-resize', handle: 'sw' as ResizeHandle },
      { x: bounds.x + bounds.width, y: bounds.y + bounds.height, cursor: 'se-resize', handle: 'se' as ResizeHandle },
    ];

    const edgeHandles = [
      { x: bounds.x + bounds.width / 2, y: bounds.y, cursor: 'n-resize', handle: 'n' as ResizeHandle },
      { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height, cursor: 's-resize', handle: 's' as ResizeHandle },
      { x: bounds.x, y: bounds.y + bounds.height / 2, cursor: 'w-resize', handle: 'w' as ResizeHandle },
      { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2, cursor: 'e-resize', handle: 'e' as ResizeHandle },
    ];
    
    return (
      <g>
        <rect
          x={bounds.x}
          y={bounds.y}
          width={bounds.width}
          height={bounds.height}
          className={styles.selectionBorder}
          rx={4}
        />
        {cornerHandles.map((handle, index) => (
          <rect
            key={`corner-${index}`}
            x={handle.x - handleSize / 2}
            y={handle.y - handleSize / 2}
            width={handleSize}
            height={handleSize}
            className={styles.selectionHandles}
            rx={2}
            style={{ cursor: handle.cursor }}
          />
        ))}
        {edgeHandles.map((handle, index) => (
          <rect
            key={`edge-${index}`}
            x={handle.x - handleSize / 2}
            y={handle.y - handleSize / 2}
            width={handleSize}
            height={handleSize}
            className={styles.selectionHandles}
            rx={2}
            style={{ cursor: handle.cursor }}
          />
        ))}
      </g>
    );
  };

  const renderMarqueeBox = () => {
    if (!isMarqueeSelecting || !marqueeBox) return null;

    const x = Math.min(marqueeBox.startX, marqueeBox.endX);
    const y = Math.min(marqueeBox.startY, marqueeBox.endY);
    const width = Math.abs(marqueeBox.endX - marqueeBox.startX);
    const height = Math.abs(marqueeBox.endY - marqueeBox.startY);

    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        className={styles.marqueeBox}
      />
    );
  };

  const gridSize = 40;
  const gridOffsetX = ((panOffset.x % (gridSize * zoom)) + gridSize * zoom) % (gridSize * zoom);
  const gridOffsetY = ((panOffset.y % (gridSize * zoom)) + gridSize * zoom) % (gridSize * zoom);

  return (
    <div
      ref={canvasRef}
      className={styles.canvas}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{ touchAction: 'none' }}
    >
      <svg className={styles.gridBackground}>
        <defs>
          <pattern 
            id="infiniteGrid" 
            width={gridSize * zoom} 
            height={gridSize * zoom} 
            patternUnits="userSpaceOnUse"
            x={gridOffsetX}
            y={gridOffsetY}
          >
            <circle cx={zoom} cy={zoom} r={zoom} fill="#e0e0e0" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#infiniteGrid)" />
      </svg>

      <svg
        ref={svgRef}
        className={styles.svg}
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {elements.map((element) => renderElement(element))}
        
        {currentElement && renderElement(currentElement, true)}
        
        {renderSelectionBox()}
        
        {renderMarqueeBox()}
      </svg>
    </div>
  );
}
