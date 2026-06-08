import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BootScreen() {
  const [progress, setProgress] = useState(0);
  const [showText, setShowText] = useState(false);
  const [currentLine, setCurrentLine] = useState(0);

  const bootLines = [
    '> Initializing SHENZEVEN OS...',
    '> Loading kernel modules...',
    '> Mounting file systems...',
    '> Starting network services...',
    '> Authenticating user...',
    '> Loading personal profile...',
    '> System ready.'
  ];

  useEffect(() => {
    setTimeout(() => setShowText(true), 200);
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 27);

    const lineInterval = setInterval(() => {
      setCurrentLine((prev) => {
        if (prev >= bootLines.length - 1) {
          clearInterval(lineInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 400);

    return () => {
      clearInterval(interval);
      clearInterval(lineInterval);
    };
  }, []);

  const progressBlocks = Math.floor(progress / 4);
  const emptyBlocks = 25 - progressBlocks;

  return (
    <div className="min-h-screen bg-[#050508] flex items-center justify-center font-mono">
      {/* 固定大小的终端窗口 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-[600px] h-[450px]"
      >
        <div 
          className="w-full h-full bg-[#0d0d12] rounded-lg border border-[#00d4ff]/30 overflow-hidden"
          style={{
            boxShadow: '0 0 30px rgba(0, 212, 255, 0.2), inset 0 0 60px rgba(0, 212, 255, 0.05)'
          }}
        >
          {/* 终端标题栏 */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#0a0a10] border-b border-[#00d4ff]/20">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]" 
                style={{ boxShadow: '0 0 8px rgba(255, 95, 86, 0.5)' }} />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"
                style={{ boxShadow: '0 0 8px rgba(255, 189, 46, 0.5)' }} />
              <div className="w-3 h-3 rounded-full bg-[#27c93f]"
                style={{ boxShadow: '0 0 8px rgba(39, 201, 63, 0.5)' }} />
            </div>
            
            <div className="text-xs text-[#00d4ff]/70 tracking-wider">
              SHENZEVEN@portfolio ~ 
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00d4ff]" 
                style={{ boxShadow: '0 0 6px rgba(0, 212, 255, 0.8)' }} />
            </div>
          </div>

          {/* 终端内容 - 固定大小，不滚动 */}
          <div className="p-6 h-[calc(100%-70px)] flex flex-col">
            <AnimatePresence>
              {showText && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1"
                >
                  {/* 用户名 */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-4xl font-bold text-[#00d4ff] tracking-widest mb-6"
                    style={{ textShadow: '0 0 20px rgba(0, 212, 255, 0.5)' }}
                  >
                    SHENZEVEN
                  </motion.div>

                  {/* 启动日志 - 固定高度，超出隐藏 */}
                  <div className="space-y-1.5 h-[180px] overflow-hidden">
                    {bootLines.slice(0, currentLine + 1).map((line, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`text-sm ${
                          line.includes('ready') 
                            ? 'text-[#27c93f]' 
                            : line.includes('Initializing')
                            ? 'text-[#00d4ff]'
                            : 'text-[#6b7280]'
                        }`}
                      >
                        {line}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 进度条区域 - 固定在底部 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-auto pt-4"
            >
              <div className="flex justify-between text-xs text-[#00d4ff]/70 mb-2">
                <span>{'>'} PROGRESS</span>
                <span className="text-[#00d4ff]">{progress}%</span>
              </div>
              
              {/* 像素进度条 */}
              <div className="flex gap-0.5 h-3">
                {Array.from({ length: progressBlocks }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex-1 bg-[#00d4ff]"
                    style={{ boxShadow: '0 0 6px rgba(0, 212, 255, 0.8)' }}
                  />
                ))}
                {Array.from({ length: emptyBlocks }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="flex-1 bg-[#1a1a2e]"
                  />
                ))}
              </div>
            </motion.div>
          </div>

          <div className="h-1 bg-gradient-to-r from-transparent via-[#00d4ff]/50 to-transparent" />
        </div>
      </motion.div>
    </div>
  );
}
