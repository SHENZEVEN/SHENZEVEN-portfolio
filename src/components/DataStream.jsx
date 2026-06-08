import { useEffect, useRef } from 'react';

export default function DataStream() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*(){}[]|;:,.<>?/~`';
    const fontSize = 14;
    const columns = 15;
    const drops = [];

    const resizeCanvas = () => {
      canvas.width = fontSize * columns;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }

    let animationId;
    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00d4ff';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        const gradient = ctx.createLinearGradient(x, y - 100 * fontSize, x, y);
        gradient.addColorStop(0, 'rgba(0, 212, 255, 0)');
        gradient.addColorStop(0.5, 'rgba(0, 212, 255, 0.3)');
        gradient.addColorStop(1, '#00d4ff');
        ctx.fillStyle = gradient;

        ctx.fillText(char, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed right-0 top-0 pointer-events-none z-0 opacity-40"
    />
  );
}
