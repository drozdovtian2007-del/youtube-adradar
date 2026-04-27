import React, { useEffect, useRef } from 'react';

export default function Cursor() {
  const dotRef = useRef(null);
  const glowRef = useRef(null);
  const pos = useRef({ x: -200, y: -200 });
  const smooth = useRef({ x: -200, y: -200 });
  const raf = useRef(null);
  const hovering = useRef(false);
  const clicking = useRef(false);

  useEffect(() => {
    function onMove(e) {
      pos.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      }
      const el = document.elementFromPoint(e.clientX, e.clientY);
      hovering.current = !!(el && (
        el.closest('a, button, [role="button"], input, textarea, select, label') ||
        el.tagName === 'A' || el.tagName === 'BUTTON' || el.tagName === 'INPUT'
      ));
    }
    function onDown() { clicking.current = true; }
    function onUp()   { clicking.current = false; }

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);

    function loop() {
      smooth.current.x += (pos.current.x - smooth.current.x) * 0.13;
      smooth.current.y += (pos.current.y - smooth.current.y) * 0.13;

      if (glowRef.current) {
        const scale = clicking.current ? 0.75 : hovering.current ? 1.5 : 1;
        glowRef.current.style.transform =
          `translate(${smooth.current.x}px, ${smooth.current.y}px) translate(-50%, -50%) scale(${scale})`;
        glowRef.current.style.borderColor = hovering.current
          ? 'rgba(244,114,182,0.9)'
          : 'rgba(167,139,250,0.7)';
        glowRef.current.style.boxShadow = hovering.current
          ? '0 0 12px rgba(244,114,182,0.5), inset 0 0 8px rgba(244,114,182,0.1)'
          : '0 0 8px rgba(167,139,250,0.4), inset 0 0 8px rgba(244,114,182,0.15)';
      }
      raf.current = requestAnimationFrame(loop);
    }
    raf.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <>
      {/* sharp dot — follows instantly */}
      <div ref={dotRef} style={{
        position: 'fixed', top: 0, left: 0,
        width: 7, height: 7,
        borderRadius: '50%',
        background: '#fff',
        boxShadow: '0 0 10px rgba(167,139,250,1), 0 0 20px rgba(244,114,182,0.7)',
        pointerEvents: 'none',
        zIndex: 99999,
        willChange: 'transform',
        transform: 'translate(-200px,-200px) translate(-50%,-50%)',
      }} />
      {/* outer ring — lags behind */}
      <div ref={glowRef} style={{
        position: 'fixed', top: 0, left: 0,
        width: 36, height: 36,
        borderRadius: '50%',
        border: '1.5px solid rgba(167,139,250,0.7)',
        boxShadow: '0 0 8px rgba(167,139,250,0.4), inset 0 0 8px rgba(244,114,182,0.15)',
        pointerEvents: 'none',
        zIndex: 99998,
        willChange: 'transform, opacity',
        transform: 'translate(-200px,-200px) translate(-50%,-50%)',
        transition: 'opacity 0.3s, border-color 0.3s, box-shadow 0.3s',
        background: 'transparent',
      }} />
    </>
  );
}
