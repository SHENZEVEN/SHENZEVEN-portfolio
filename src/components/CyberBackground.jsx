export default function CyberBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* 第一层：网格背景 */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 212, 255, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          opacity: 0.5
        }}
      />
      
      {/* 第二层：PCB 电路走线 */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.12 }} xmlns="http://www.w3.org/2000/svg">
        {/* 左上角 — L 形走线 */}
        <path d="M40,120 L40,40 L180,40" stroke="#00d4ff" strokeWidth="1.5" fill="none" />
        <circle cx="40" cy="120" r="3" fill="#00d4ff" />
        <circle cx="180" cy="40" r="3" fill="#00d4ff" />
        <circle cx="40" cy="40" r="2" fill="none" stroke="#00d4ff" strokeWidth="0.8" />

        {/* 左上角 — 分支走线 */}
        <path d="M40,70 L100,70 L100,150 L160,150" stroke="#00d4ff" strokeWidth="1" fill="none" strokeDasharray="6,3" />
        <circle cx="40" cy="70" r="2" fill="#00d4ff" />
        <circle cx="160" cy="150" r="2.5" fill="#00d4ff" />

        {/* 右上角 — 阶梯走线 */}
        <path d="M100% Mcalc(100% - 60),40 Lcalc(100% - 60),140 Lcalc(100% - 180),140 Lcalc(100% - 180),80" stroke="#8b5cf6" strokeWidth="1.5" fill="none" transform="translate(-40, 0)" />
        <circle cx="calc(100% - 220)" cy="40" r="3" fill="#8b5cf6" transform="translate(-40, 0)" />
        <circle cx="calc(100% - 220)" cy="80" r="2.5" fill="#8b5cf6" transform="translate(-40, 0)" />

        {/* 简化：右上角阶梯走线 */}
        <path d="M90,40 L90,140 L210,140 L210,80" stroke="#8b5cf6" strokeWidth="1.5" fill="none" opacity="0.7" />
        <circle cx="90" cy="40" r="3" fill="#8b5cf6" />
        <circle cx="210" cy="80" r="3" fill="#8b5cf6" />
        <circle cx="90" cy="140" r="2" fill="none" stroke="#8b5cf6" strokeWidth="0.8" />
        <circle cx="210" cy="140" r="2" fill="none" stroke="#8b5cf6" strokeWidth="0.8" />

        {/* 右下角 — 长走线 */}
        <path d="M70,300 L250,300 L250,200 L320,200" stroke="#ff0040" strokeWidth="1" fill="none" opacity="0.6" />
        <circle cx="70" cy="300" r="3" fill="#ff0040" />
        <circle cx="320" cy="200" r="2.5" fill="#ff0040" />
        <circle cx="250" cy="300" r="2" fill="none" stroke="#ff0040" strokeWidth="0.8" />

        {/* 左下角 — 分支电路 */}
        <path d="M60,280 L140,280 L140,220" stroke="#00d4ff" strokeWidth="1.2" fill="none" opacity="0.5" />
        <path d="M140,280 L140,350 L200,350" stroke="#00d4ff" strokeWidth="0.8" fill="none" strokeDasharray="8,4" opacity="0.5" />
        <circle cx="60" cy="280" r="3" fill="#00d4ff" />
        <circle cx="140" cy="220" r="2" fill="#00d4ff" />
        <circle cx="200" cy="350" r="2.5" fill="#00d4ff" />
        <circle cx="140" cy="280" r="2" fill="none" stroke="#00d4ff" strokeWidth="0.8" />

        {/* 中部 — 数据总线（平行线） */}
        <g opacity="0.4">
          <line x1="200" y1="160" x2="350" y2="160" stroke="#00d4ff" strokeWidth="0.8" />
          <line x1="200" y1="168" x2="350" y2="168" stroke="#00d4ff" strokeWidth="0.8" />
          <line x1="200" y1="176" x2="350" y2="176" stroke="#00d4ff" strokeWidth="0.8" />
          <circle cx="200" cy="160" r="1.5" fill="#00d4ff" />
          <circle cx="200" cy="168" r="1.5" fill="#00d4ff" />
          <circle cx="200" cy="176" r="1.5" fill="#00d4ff" />
          <circle cx="350" cy="160" r="1.5" fill="#00d4ff" />
          <circle cx="350" cy="168" r="1.5" fill="#00d4ff" />
          <circle cx="350" cy="176" r="1.5" fill="#00d4ff" />
        </g>

        {/* 顶部 — IC 芯片引脚 */}
        <g opacity="0.35">
          <rect x="280" y="50" width="40" height="24" rx="2" fill="none" stroke="#00d4ff" strokeWidth="1" />
          {[0,8,16,24,32].map((dx, i) => (
            <line key={`top-${i}`} x1={284 + dx} y1={50} x2={284 + dx} y2={42} stroke="#00d4ff" strokeWidth="0.7" />
          ))}
          {[0,8,16,24,32].map((dx, i) => (
            <line key={`bot-${i}`} x1={284 + dx} y1={74} x2={284 + dx} y2={82} stroke="#00d4ff" strokeWidth="0.7" />
          ))}
        </g>
      </svg>

      {/* 第三层：光晕效果 */}
      <div className="absolute inset-0">
        <div 
          className="absolute w-[400px] h-[400px] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(0, 212, 255, 0.25) 0%, transparent 70%)',
            top: '10%',
            left: '25%'
          }}
        />
        <div 
          className="absolute w-[300px] h-[300px] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, transparent 70%)',
            top: '45%',
            right: '15%'
          }}
        />
        <div 
          className="absolute w-[200px] h-[200px] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(255, 0, 64, 0.2) 0%, transparent 70%)',
            bottom: '15%',
            left: '45%'
          }}
        />
      </div>
      
      {/* 第四层：噪点纹理 */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`,
          opacity: 0.8
        }}
      />
    </div>
  );
}