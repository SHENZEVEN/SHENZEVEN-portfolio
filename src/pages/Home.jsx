import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Code2, MousePointer2, Download } from 'lucide-react';
import CyberPortrait from '../components/CyberPortrait';
import ProjectCard from '../components/ProjectCard';
import { projects } from '../data/projects';

export default function Home({ onNavigate }) {
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [isGlitching, setIsGlitching] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentProjectIndex((prev) => (prev + 1) % projects.length);
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 300);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const currentProject = projects[currentProjectIndex];

  const skills = ['React', 'Node.js', 'TypeScript', 'Python', 'AI应用开发'];

  return (
    <div className="min-h-screen bg-cyber-black pt-16">
      <div className="flex flex-col lg:flex-row items-center justify-center min-h-[calc(100vh-4rem)] p-4 lg:p-8">
        <div className="lg:w-1/3 flex flex-col items-center justify-center mb-8 lg:mb-0">
          <motion.div
            className="mb-4 flex items-center gap-2 text-cyber-blue/70 font-jetbrains text-xs"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <MousePointer2 size={14} className="animate-pulse" />
            <span>鼠标悬停探索更多</span>
            <motion.div
              className="w-16 h-[1px] bg-cyber-blue/50"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
            />
          </motion.div>
          <motion.div
            className={`relative aspect-[3/4] max-w-[320px] w-full rounded-xl border-2 border-cyber-blue/30 shadow-cyber hover:shadow-cyber-hover transition-shadow duration-500 ${isGlitching ? 'animate-glitch' : ''}`}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <CyberPortrait
              imageUrl="/photo.jpg"
              className="w-full h-full rounded-xl"
              glitching={isGlitching}
            />
          </motion.div>
        </div>

        <div className="lg:w-1/2 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 
              className="font-orbitron text-3xl sm:text-4xl font-bold mb-3 text-cyber-blue"
              style={{ textShadow: '0 0 10px rgba(0, 212, 255, 0.8), 0 0 20px rgba(0, 212, 255, 0.5), 0 0 40px rgba(0, 212, 255, 0.3)' }}
            >
              盛桢琪
            </h1>

            <p className="text-cyber-gray font-noto text-base mb-4">
              211高校 · 计算机科学 · 大二
            </p>

            <motion.div
              className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-cyber-dark rounded-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-blue opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-blue"></span>
              </span>
              <span className="text-cyber-blue font-jetbrains text-sm">正在寻找第一份实习</span>
            </motion.div>

            <div className="flex flex-wrap gap-2 mb-6">
              {skills.map((skill, index) => (
                <motion.span
                  key={skill}
                  className="px-3 py-1.5 bg-cyber-dark border border-cyber-blue/30 rounded-full text-cyber-blue font-jetbrains text-xs cursor-pointer transition-all duration-200 hover:bg-cyber-blue/10 hover:translate-y-[-2px]"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  {skill}
                </motion.span>
              ))}
            </div>

            <motion.div 
              className="mb-6 bg-cyber-dark border border-cyber-border rounded-lg overflow-hidden relative cursor-pointer max-w-[630px]"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              whileHover={{ borderColor: '#00d4ff' }}
              transition={{ duration: 0.3 }}
            >
              {isHovered && (
                <>
                  <motion.div
                    className="absolute left-0 right-0 h-[2px] bg-cyber-blue z-10"
                    initial={{ top: '-100%' }}
                    animate={{ top: '100%' }}
                    transition={{ duration: 1, ease: 'linear' }}
                    style={{ boxShadow: '0 0 10px #00d4ff, 0 0 20px #00d4ff' }}
                  />
                  <motion.div
                    className="absolute inset-0 pointer-events-none border-2 border-cyber-blue rounded-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ boxShadow: '0 0 15px rgba(0, 212, 255, 0.3), inset 0 0 15px rgba(0, 212, 255, 0.1)' }}
                  />
                </>
              )}
              
              <div className="flex items-center justify-between px-4 py-2 bg-cyber-black/50 border-b border-cyber-border">
                <div className="flex items-center gap-2">
                  <span className="text-cyber-blue font-jetbrains text-xs">&lt;/&gt;</span>
                  <span className="text-cyber-gray font-jetbrains text-xs">projects.json</span>
                </div>
                <span className="text-cyber-gray/50 font-jetbrains text-xs">// {currentProjectIndex + 1}/{projects.length}</span>
              </div>
              
              <div className={`p-4 ${isGlitching ? 'animate-glitch-card' : ''}`}>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {currentProject.heroTags?.map((tag) => (
                    <span key={tag} className="text-cyber-blue font-jetbrains text-xs">
                      &lt;{tag}&gt;
                    </span>
                  ))}
                </div>
                
                <h3 className="font-orbitron text-base font-semibold text-cyber-white mb-1">{currentProject.name}</h3>
                {isGlitching && (
                  <h3 className="font-orbitron text-base font-semibold text-cyber-blue/50 -mt-1 mb-1" style={{ transform: 'translateX(4px)' }}>
                    {currentProject.name}
                  </h3>
                )}
                
                <p className="text-cyber-gray/70 font-jetbrains text-xs mb-3">{currentProject.description}</p>
                
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {currentProject.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 bg-cyber-black border border-cyber-border/50 rounded text-cyber-blue font-jetbrains text-[10px]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <motion.div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => onNavigate(`/project/${currentProject.id}`)}
                  whileHover={{ scale: 1.01 }}
                >
                  <span className="text-cyber-blue font-jetbrains text-xs">查看详情</span>
                  <ArrowRight className="text-cyber-blue" size={12} />
                </motion.div>
              </div>
              
              <div className="flex items-center justify-between px-4 py-2 border-t border-cyber-border">
                <div className="flex gap-2">
                  {projects.map((_, index) => (
                    <button
                      key={index}
                      className={`w-6 h-6 rounded text-xs font-jetbrains transition-all duration-300 ${
                        index === currentProjectIndex
                          ? 'bg-cyber-blue text-cyber-black'
                          : 'bg-cyber-black border border-cyber-border text-cyber-gray hover:border-cyber-blue hover:text-cyber-blue'
                      }`}
                      onClick={() => {
                        setCurrentProjectIndex(index);
                        setIsGlitching(true);
                        setTimeout(() => setIsGlitching(false), 300);
                      }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </button>
                  ))}
                </div>
                <motion.button
                  className="flex items-center gap-1 text-cyber-blue font-jetbrains text-xs"
                  onClick={() => onNavigate('/projects')}
                  whileHover={{ x: 4 }}
                >
                  view all
                  <ArrowRight size={12} />
                </motion.button>
              </div>
              
              <div className="px-4 py-2 bg-cyber-black/30 border-t border-cyber-border/50">
                <div className="flex items-center gap-2 font-jetbrains text-xs">
                  <span className="text-cyber-blue">~</span>
                  <span className="text-cyber-gray">$ cd</span>
                  <span className="text-cyber-blue">/another-me</span>
                  <span className="text-cyber-gray">#</span>
                  <span className="text-purple-400">explore more</span>
                </div>
              </div>
            </motion.div>

            <div className="flex gap-3">
              <motion.button
                className="flex items-center justify-center gap-2 bg-cyber-blue text-cyber-black font-noto text-xs font-medium px-5 py-2.5 rounded-lg transition-all hover:opacity-90"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('/projects')}
              >
                查看全部项目
                <ArrowRight size={14} />
              </motion.button>
              
              <motion.button
                className="flex items-center justify-center gap-2 border border-cyber-blue text-cyber-blue font-noto text-xs px-5 py-2.5 rounded-lg transition-all hover:bg-cyber-blue hover:text-cyber-black"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.open('https://github.com/SHENZEVEN', '_blank')}
              >
                <Code2 size={14} />
                GitHub
              </motion.button>

              <motion.a
                href="/resume.pdf"
                download
                className="flex items-center justify-center gap-2 border border-white/30 text-cyber-white font-noto text-xs px-5 py-2.5 rounded-lg transition-all duration-300 hover:border-white/60 hover:bg-white/5"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download size={14} />
                下载简历
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
