import getStroke from 'perfect-freehand';
import { Element, Point } from '../types';

export function getSvgPathFromStroke(stroke: number[][]): string {
  if (!stroke.length) return '';

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ['M', ...stroke[0], 'Q']
  );

  d.push('Z');
  return d.join(' ');
}

export function getStrokePath(points: Point[], strokeWidth: number): string {
  const stroke = getStroke(
    points.map((p) => [p.x, p.y, p.pressure ?? 0.5]),
    {
      size: strokeWidth * 2,
      thinning: 0.5,
      smoothing: 0.5,
      streamline: 0.5,
      easing: (t) => t,
      start: {
        taper: 0,
        cap: true,
      },
      end: {
        taper: 0,
        cap: true,
      },
    }
  );

  return getSvgPathFromStroke(stroke);
}

export function screenToCanvas(
  screenX: number,
  screenY: number,
  zoom: number,
  panOffset: Point
): Point {
  return {
    x: (screenX - panOffset.x) / zoom,
    y: (screenY - panOffset.y) / zoom,
  };
}

export function canvasToScreen(
  canvasX: number,
  canvasY: number,
  zoom: number,
  panOffset: Point
): Point {
  return {
    x: canvasX * zoom + panOffset.x,
    y: canvasY * zoom + panOffset.y,
  };
}

export function getElementAtPosition(
  x: number,
  y: number,
  elements: Element[],
  threshold: number = 10
): Element | null {
  for (let i = elements.length - 1; i >= 0; i--) {
    const element = elements[i];
    
    if (element.type === 'pen' && element.points) {
      for (const point of element.points) {
        const distance = Math.sqrt(
          Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2)
        );
        if (distance < threshold) return element;
      }
    } else if (element.type === 'rectangle') {
      const minX = Math.min(element.x, element.x + (element.width || 0));
      const maxX = Math.max(element.x, element.x + (element.width || 0));
      const minY = Math.min(element.y, element.y + (element.height || 0));
      const maxY = Math.max(element.y, element.y + (element.height || 0));
      
      if (x >= minX - threshold && x <= maxX + threshold &&
          y >= minY - threshold && y <= maxY + threshold) {
        return element;
      }
    } else if (element.type === 'ellipse') {
      const cx = element.x + (element.width || 0) / 2;
      const cy = element.y + (element.height || 0) / 2;
      const rx = Math.abs((element.width || 0) / 2) + threshold;
      const ry = Math.abs((element.height || 0) / 2) + threshold;
      
      const normalized = Math.pow((x - cx) / rx, 2) + Math.pow((y - cy) / ry, 2);
      if (normalized <= 1) return element;
    } else if (element.type === 'line' || element.type === 'arrow') {
      const x1 = element.x;
      const y1 = element.y;
      const x2 = element.x + (element.width || 0);
      const y2 = element.y + (element.height || 0);
      
      const distance = distanceToLine(x, y, x1, y1, x2, y2);
      if (distance < threshold) return element;
    }
  }
  
  return null;
}

function distanceToLine(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0) param = dot / lenSq;

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = px - xx;
  const dy = py - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function getElementBounds(element: Element): BoundingBox | null {
  const padding = 8;
  
  if (element.type === 'pen' && element.points && element.points.length > 0) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    for (const point of element.points) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }
    
    return {
      x: minX - padding,
      y: minY - padding,
      width: maxX - minX + padding * 2,
      height: maxY - minY + padding * 2,
    };
  } else if (element.type === 'rectangle') {
    const x = Math.min(element.x, element.x + (element.width || 0));
    const y = Math.min(element.y, element.y + (element.height || 0));
    const width = Math.abs(element.width || 0);
    const height = Math.abs(element.height || 0);
    
    return {
      x: x - padding,
      y: y - padding,
      width: width + padding * 2,
      height: height + padding * 2,
    };
  } else if (element.type === 'ellipse') {
    const cx = element.x + (element.width || 0) / 2;
    const cy = element.y + (element.height || 0) / 2;
    const rx = Math.abs((element.width || 0) / 2);
    const ry = Math.abs((element.height || 0) / 2);
    
    return {
      x: cx - rx - padding,
      y: cy - ry - padding,
      width: rx * 2 + padding * 2,
      height: ry * 2 + padding * 2,
    };
  } else if (element.type === 'line' || element.type === 'arrow') {
    const x1 = element.x;
    const y1 = element.y;
    const x2 = element.x + (element.width || 0);
    const y2 = element.y + (element.height || 0);
    
    return {
      x: Math.min(x1, x2) - padding,
      y: Math.min(y1, y2) - padding,
      width: Math.abs(x2 - x1) + padding * 2,
      height: Math.abs(y2 - y1) + padding * 2,
    };
  }
  
  return null;
}
