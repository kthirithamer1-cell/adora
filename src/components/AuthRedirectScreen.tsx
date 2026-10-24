'use client';

import React from 'react';

export default function AuthRedirectScreen() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#07090E',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        color: '#FFFFFF',
        fontFamily: 'Outfit, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow background */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '320px',
          height: '320px',
          background: 'radial-gradient(circle, rgba(0, 229, 255, 0.12) 0%, rgba(7, 9, 14, 0) 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          border: '3px solid rgba(0, 229, 255, 0.2)',
          borderTopColor: '#00E5FF',
          animation: 'mmSpin 0.8s linear infinite',
        }}
      />

      <div style={{ textAlign: 'center', zIndex: 1 }}>
        <h3
          style={{
            fontSize: '1.05rem',
            fontWeight: 800,
            letterSpacing: '-0.01em',
            margin: '0 0 6px 0',
            color: '#FFFFFF',
          }}
        >
          Accès sécurisé MarkMosaiq
        </h3>
        <p
          style={{
            fontSize: '0.85rem',
            color: '#94A3B8',
            margin: 0,
            fontWeight: 500,
          }}
        >
          Vérification de la session et redirection vers la connexion...
        </p>
      </div>

      <style>{`
        @keyframes mmSpin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
