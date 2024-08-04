'use client'
import React, { useState, useEffect } from 'react';

const CursorFollower = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX - 20, y: e.clientY - 20 });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '2px solid #888888',
        backgroundColor: 'transparent',
        pointerEvents: 'none',
        transition: 'all 0.15s ease-out',
        zIndex: 9999,
        boxShadow: 'none',
      }}
    />
  );
};

export default CursorFollower;