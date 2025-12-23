import { useEffect, useRef } from 'react';
import './TargetCursor.css';

export default function TargetCursor({ hideDefaultCursor = true }) {
  const cursorRef = useRef(null);
  const dotRef = useRef(null);
  const cornersRef = useRef([]);
  const mousePos = useRef({ x: 0, y: 0 });
  const rafId = useRef(null);

  useEffect(() => {
    if (hideDefaultCursor) {
      document.body.style.cursor = 'none';
    }

    const cursor = cursorRef.current;
    const dot = dotRef.current;
    const corners = cornersRef.current;

    // Instant cursor follow
    const updateCursor = () => {
      cursor.style.left = mousePos.current.x + 'px';
      cursor.style.top = mousePos.current.y + 'px';
      rafId.current = requestAnimationFrame(updateCursor);
    };

    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    // Hover effects
    const handleMouseOver = (e) => {
      const target = e.target.closest('.cursor-target, button, a');
      if (target) {
        cursor.classList.add('hovering');
        const rect = target.getBoundingClientRect();
        const size = 16;
        
        corners[0].style.cssText = `left: ${rect.left - size}px; top: ${rect.top - size}px; opacity: 1`;
        corners[1].style.cssText = `left: ${rect.right}px; top: ${rect.top - size}px; opacity: 1`;
        corners[2].style.cssText = `left: ${rect.right}px; top: ${rect.bottom}px; opacity: 1`;
        corners[3].style.cssText = `left: ${rect.left - size}px; top: ${rect.bottom}px; opacity: 1`;
      }
    };

    const handleMouseOut = (e) => {
      if (!e.relatedTarget || !e.relatedTarget.closest('.cursor-target, button, a')) {
        cursor.classList.remove('hovering');
        corners.forEach(corner => corner.style.opacity = '0');
      }
    };

    const handleMouseDown = () => {
      cursor.classList.add('clicking');
    };

    const handleMouseUp = () => {
      cursor.classList.remove('clicking');
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    updateCursor();

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [hideDefaultCursor]);

  return (
    <>
      <div ref={cursorRef} className="target-cursor-wrapper">
        <div ref={dotRef} className="target-cursor-dot" />
      </div>
      <div ref={el => cornersRef.current[0] = el} className="target-cursor-corner corner-tl" />
      <div ref={el => cornersRef.current[1] = el} className="target-cursor-corner corner-tr" />
      <div ref={el => cornersRef.current[2] = el} className="target-cursor-corner corner-br" />
      <div ref={el => cornersRef.current[3] = el} className="target-cursor-corner corner-bl" />
    </>
  );
}

