import { useEffect, useRef } from "react";

const HeroBackground = () => {
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  useEffect(() => {
    const loadVanta = async () => {
      if (!window.VANTA || !window.VANTA.CLOUDS) return;

      vantaEffect.current = window.VANTA.CLOUDS({
        el: vantaRef.current,
        THREE: window.THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        backgroundColor: 0xeef8fc,
        skyColor: 0x89c8e2,
        cloudColor: 0xadc1de,
        cloudShadowColor: 0x1e3a5f,
        sunColor: 0xff6b4a,
        sunGlareColor: 0xf4b942,
        sunPosition: {x: 3, y: 3, z: 1},
        speed: 1.2
      });
    };

    // Slight delay to ensure scripts are fully loaded globally
    setTimeout(loadVanta, 100);

    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={vantaRef}
      className="fixed inset-0 w-full h-full -z-50 pointer-events-none"
    />
  );
};

export default HeroBackground;
