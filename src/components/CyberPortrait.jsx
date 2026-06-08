import { useEffect, useLayoutEffect, useRef, useState } from 'react';

export default function CyberPortrait({ imageUrl, className = '', glitching: externalGlitching }) {
  const containerRef = useRef(null);
  const maskCanvasRef = useRef(null);
  const trailCanvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [internalGlitching, setInternalGlitching] = useState(false);

  const stateRef = useRef({
    mouse: { x: -1000, y: -1000, active: false },
    mouseHistory: [],
    animationId: null,
  });

  const glitching = externalGlitching !== undefined ? externalGlitching : internalGlitching;

  useEffect(() => {
    const img = new Image();
    img.onload = () => setLoading(false);
    img.onerror = () => setLoading(false);
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    if (externalGlitching !== undefined) return;
    
    const triggerGlitch = () => {
      setInternalGlitching(true);
      setTimeout(() => setInternalGlitching(false), 300);
      const nextDelay = 5000 + Math.random() * 3000;
      setTimeout(triggerGlitch, nextDelay);
    };
    const initialDelay = 3000 + Math.random() * 5000;
    const timer = setTimeout(triggerGlitch, initialDelay);
    return () => clearTimeout(timer);
  }, [externalGlitching]);

  useLayoutEffect(() => {
    const maskCanvas = maskCanvasRef.current;
    const trailCanvas = trailCanvasRef.current;
    const container = containerRef.current;
    
    console.log('[CyberPortrait] useLayoutEffect start');
    console.log('[CyberPortrait] maskCanvas:', maskCanvas);
    console.log('[CyberPortrait] trailCanvas:', trailCanvas);
    console.log('[CyberPortrait] container:', container);
    
    if (!maskCanvas || !trailCanvas || !container) {
      console.log('[CyberPortrait] Missing canvas or container!');
      return;
    }

    const maskCtx = maskCanvas.getContext('2d');
    const trailCtx = trailCanvas.getContext('2d');
    const state = stateRef.current;

    function resize() {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio, 2);

      console.log('[CyberPortrait] resize - rect:', rect);
      console.log('[CyberPortrait] resize - dpr:', dpr);

      // 如果容器还没有尺寸，不执行 resize
      if (rect.width === 0 || rect.height === 0) {
        console.log('[CyberPortrait] resize - container has no size!');
        return;
      }

      [maskCanvas, trailCanvas].forEach(c => {
        c.width = rect.width * dpr;
        c.height = rect.height * dpr;
        c.style.width = rect.width + 'px';
        c.style.height = rect.height + 'px';
      });

      maskCtx.scale(dpr, dpr);
      trailCtx.scale(dpr, dpr);

      // 初始化光罩：绘制蓝紫渐变
      drawOverlay(rect.width, rect.height);
    }

    function drawOverlay(w, h) {
      console.log('[CyberPortrait] drawOverlay - w:', w, 'h:', h);
      
      // 绘制蓝紫渐变光罩
      const gradient = maskCtx.createLinearGradient(0, 0, 0, h);
      gradient.addColorStop(0, 'rgba(0, 212, 255, 0.4)');
      gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.25)');
      gradient.addColorStop(1, 'rgba(0, 212, 255, 0.3)');
      
      maskCtx.globalCompositeOperation = 'source-over';
      maskCtx.fillStyle = gradient;
      maskCtx.fillRect(0, 0, w, h);
      
      console.log('[CyberPortrait] drawOverlay - completed');
    }

    resize();
    console.log('[CyberPortrait] resize called initially');
    window.addEventListener('resize', resize);

    function onMouseMove(e) {
      const rect = container.getBoundingClientRect();
      state.mouse.x = e.clientX - rect.left;
      state.mouse.y = e.clientY - rect.top;
      state.mouse.active = true;

      state.mouseHistory.push({
        x: state.mouse.x,
        y: state.mouse.y,
        time: Date.now()
      });

      const cutoff = Date.now() - 500;
      state.mouseHistory = state.mouseHistory.filter(p => p.time > cutoff);
    }

    function onMouseLeave() {
      state.mouse.active = false;
      state.mouse.x = -1000;
      state.mouse.y = -1000;
      state.mouseHistory = [];
    }

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseleave', onMouseLeave);

    function animate() {
      const rect = container.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      console.log('[CyberPortrait] animate - w:', w, 'h:', h);

      // 光罩恢复：每帧轻微恢复
      maskCtx.globalCompositeOperation = 'source-over';
      maskCtx.globalAlpha = 0.008;
      drawOverlay(w, h);
      maskCtx.globalAlpha = 1;

      // 清除彗星尾 canvas
      trailCtx.globalCompositeOperation = 'source-over';
      trailCtx.clearRect(0, 0, w, h);

      // 彗星尾擦除光罩
      if (state.mouseHistory.length > 0) {
        maskCtx.globalCompositeOperation = 'destination-out';

        state.mouseHistory.forEach((point) => {
          const age = Date.now() - point.time;
          const maxAge = 500;
          const progress = 1 - (age / maxAge);

          if (progress > 0) {
            const headRadius = 15 * progress;
            const tailRadius = 45 * progress;

            // 彗星尾形状擦除（更尖锐）
            const gradient = maskCtx.createRadialGradient(
              point.x, point.y, 0,
              point.x, point.y, tailRadius
            );
            gradient.addColorStop(0, `rgba(255, 255, 255, ${progress * 0.95})`);
            gradient.addColorStop(0.15, `rgba(255, 255, 255, ${progress * 0.7})`);
            gradient.addColorStop(0.4, `rgba(255, 255, 255, ${progress * 0.3})`);
            gradient.addColorStop(0.7, `rgba(255, 255, 255, ${progress * 0.1})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            maskCtx.fillStyle = gradient;
            maskCtx.beginPath();
            maskCtx.arc(point.x, point.y, tailRadius, 0, Math.PI * 2);
            maskCtx.fill();

            // 核心完全擦除
            maskCtx.fillStyle = `rgba(255, 255, 255, ${progress})`;
            maskCtx.beginPath();
            maskCtx.arc(point.x, point.y, headRadius * 0.3, 0, Math.PI * 2);
            maskCtx.fill();
          }
        });

        // 彗星尾发光效果
        trailCtx.globalCompositeOperation = 'source-over';

        state.mouseHistory.forEach((point) => {
          const age = Date.now() - point.time;
          const maxAge = 500;
          const progress = 1 - (age / maxAge);

          if (progress > 0) {
            const headRadius = 15 * progress;
            const tailRadius = 45 * progress;

            // 蓝紫色彗星尾发光（更尖锐）
            const gradient = trailCtx.createRadialGradient(
              point.x, point.y, 0,
              point.x, point.y, tailRadius
            );
            gradient.addColorStop(0, `rgba(0, 212, 255, ${progress * 0.9})`);
            gradient.addColorStop(0.15, `rgba(139, 92, 246, ${progress * 0.6})`);
            gradient.addColorStop(0.4, `rgba(168, 85, 247, ${progress * 0.25})`);
            gradient.addColorStop(0.7, `rgba(168, 85, 247, ${progress * 0.08})`);
            gradient.addColorStop(1, 'rgba(168, 85, 247, 0)');

            trailCtx.fillStyle = gradient;
            trailCtx.beginPath();
            trailCtx.arc(point.x, point.y, tailRadius, 0, Math.PI * 2);
            trailCtx.fill();

            // 彗星头核心发光
            trailCtx.fillStyle = `rgba(0, 212, 255, ${progress})`;
            trailCtx.beginPath();
            trailCtx.arc(point.x, point.y, headRadius * 0.25, 0, Math.PI * 2);
            trailCtx.fill();
          }
        });
      }

      state.animationId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);
      if (state.animationId) cancelAnimationFrame(state.animationId);
    };
  }, [loading]);

  if (loading) {
    return (
      <div className={`relative overflow-hidden bg-cyber-black flex items-center justify-center ${className}`}>
        <div className="text-cyber-blue animate-pulse text-sm">加载中...</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden cursor-pointer ${className} ${glitching ? 'animate-glitch' : ''}`}
    >
      {/* Layer 1: 真实照片 */}
      <img
        src={imageUrl}
        alt="portrait"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Layer 2: 光罩 Canvas（蓝紫渐变 + 擦除） */}
      <canvas
        ref={maskCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Layer 3: 彗星尾发光 Canvas */}
      <canvas
        ref={trailCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* Layer 4: 扫描线 + Glitch */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute left-0 right-0 h-[2px] animate-scan"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, #00d4ff 20%, #00d4ff 80%, transparent 100%)',
            boxShadow: '0 0 8px #00d4ff, 0 0 16px #00d4ff, 0 0 32px rgba(0,212,255,0.5)',
          }}
        />

        <div
          className="absolute left-0 right-0 h-[60px] animate-scan opacity-30"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(0,212,255,0.3) 50%, transparent 100%)',
            filter: 'blur(8px)',
            marginTop: '-30px',
          }}
        />

        {glitching && (
          <>
            <div
              className="absolute left-[5%] w-[40%] h-[2px] top-[8%]"
              style={{
                background: 'linear-gradient(90deg, #00d4ff 0%, #8b5cf6 100%)',
                boxShadow: '0 0 8px #00d4ff',
                transform: 'translateX(10px) skewX(-12deg)',
                mixBlendMode: 'screen',
              }}
            />
            <div
              className="absolute right-[8%] w-[35%] h-[3px] top-[18%]"
              style={{
                background: 'linear-gradient(90deg, #8b5cf6 0%, #a855f7 50%, #00d4ff 100%)',
                boxShadow: '0 0 10px #8b5cf6',
                transform: 'translateX(-6px) skewX(10deg)',
                mixBlendMode: 'screen',
              }}
            />
            <div
              className="absolute left-[15%] w-[50%] h-[1px] top-[28%]"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, #00d4ff 30%, #8b5cf6 70%, transparent 100%)',
                boxShadow: '0 0 5px #00d4ff',
                transform: 'translateX(4px)',
                mixBlendMode: 'screen',
              }}
            />
            <div
              className="absolute right-[20%] w-[25%] h-[4px] top-[38%]"
              style={{
                background: 'linear-gradient(90deg, #00d4ff 0%, #8b5cf6 50%, #a855f7 100%)',
                boxShadow: '0 0 12px #8b5cf6, 0 0 20px #00d4ff',
                transform: 'translateX(-12px) skewX(-6deg)',
                mixBlendMode: 'screen',
              }}
            />
            <div
              className="absolute left-[25%] w-[60%] h-[2px] top-[48%]"
              style={{
                background: 'linear-gradient(90deg, #8b5cf6 0%, #00d4ff 40%, #a855f7 80%, #00d4ff 100%)',
                boxShadow: '0 0 8px #8b5cf6',
                transform: 'translateX(2px) scaleX(1.1)',
                mixBlendMode: 'screen',
              }}
            />
            <div
              className="absolute left-[8%] w-[30%] h-[3px] top-[58%]"
              style={{
                background: 'linear-gradient(90deg, #00d4ff 0%, #8b5cf6 100%)',
                boxShadow: '0 0 6px #00d4ff',
                transform: 'translateX(-8px) skewX(15deg)',
                mixBlendMode: 'screen',
              }}
            />
            <div
              className="absolute right-[5%] w-[45%] h-[4px] top-[68%]"
              style={{
                background: 'linear-gradient(90deg, #8b5cf6 0%, #00d4ff 30%, #a855f7 60%, #00d4ff 100%)',
                boxShadow: '0 0 10px #8b5cf6, 0 0 18px #00d4ff',
                transform: 'translateX(5px) skewX(-8deg)',
                mixBlendMode: 'screen',
              }}
            />
            <div
              className="absolute left-[40%] w-[20%] h-[2px] top-[78%]"
              style={{
                background: 'linear-gradient(90deg, #a855f7 0%, #8b5cf6 100%)',
                boxShadow: '0 0 6px #a855f7',
                transform: 'translateX(-4px)',
                mixBlendMode: 'screen',
              }}
            />
            <div
              className="absolute left-[10%] right-[15%] h-[1px] top-[88%]"
              style={{
                background: 'linear-gradient(90deg, #00d4ff 0%, #8b5cf6 25%, #a855f7 50%, #8b5cf6 75%, #00d4ff 100%)',
                boxShadow: '0 0 10px #00d4ff',
                transform: 'translateX(5px)',
                mixBlendMode: 'screen',
              }}
            />
            
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, rgba(139,92,246,0.15) 0%, transparent 25%, transparent 75%, rgba(0,212,255,0.15) 100%)',
                transform: 'translateX(3px)',
                mixBlendMode: 'screen',
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(0,212,255,0.1) 20%, transparent 40%, rgba(139,92,246,0.1) 60%, transparent 80%, rgba(168,85,247,0.1) 100%)',
                transform: 'translateX(-2px)',
                mixBlendMode: 'screen',
              }}
            />
            
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`,
                mixBlendMode: 'overlay',
              }}
            />
          </>
        )}

        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,212,255,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,212,255,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>
    </div>
  );
}