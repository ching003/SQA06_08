import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    VANTA: any;
    THREE: any;
  }
}

export function VantaBackground() {
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<any>(null);

  useEffect(() => {
    // Dynamically load Three.js and Vanta
    const loadScripts = async () => {
      // Load Three.js
      if (!window.THREE) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js';
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      // Load Vanta Clouds
      if (!window.VANTA) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.clouds.min.js';
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      // Initialize Vanta effect
      if (vantaRef.current && !vantaEffect.current) {
        vantaEffect.current = window.VANTA.CLOUDS({
          el: vantaRef.current,
          mouseControls: false,
          touchControls: false,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          skyColor: 0x68b8d7,
          cloudColor: 0xadc1de,
          cloudShadowColor: 0x183550,
          sunColor: 0xff9919,
          sunGlareColor: 0xff6633,
          sunlightColor: 0xff9933,
          speed: 0.3,
        });
      }
    };

    loadScripts();

    // Cleanup
    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
      }
    };
  }, []);

  return (
    <>
      {/* Solid gradient background - top section */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: 'linear-gradient(to bottom, #43c4fa 0%, #49bdeb 35%, #7dc0db 50%, #8ec9e0 65%)'
        }}
      />
      {/* Vanta clouds - bottom section with smooth blend */}
      <div
        ref={vantaRef}
        className="fixed -z-10"
        style={{
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%',
          height: '70vh',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%)'
        }}
      />
    </>
  );
}
