import { useState } from 'react';
import { Menu, X, Terminal, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '../context/AdminContext';

export default function Navbar({ currentPage, onNavigate }) {
  const { isAdmin } = useAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [glitching, setGlitching] = useState(false);

  const navItems = [
    { label: '首页', path: '/', cmd: 'cd /home' },
    { label: '项目', path: '/projects', cmd: 'cd /projects' },
    { label: '另一个我', path: '/another-me', cmd: 'cd /another-me' },
    { label: '联系', path: '/contact', cmd: 'cd /contact' },
  ];

  const handleLogoClick = () => {
    setGlitching(true);
    setTimeout(() => setGlitching(false), 200);
    onNavigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (path) => {
    onNavigate(path);
    
    // 如果是"另一个我"页面，滚动到底部
    if (path === '/another-me') {
      // 等待页面动画完成后再滚动（动画约 500ms）
      setTimeout(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth'
        });
      }, 600);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-cyber-black/90 backdrop-blur-cyber border-b border-cyber-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            <button
              onClick={handleLogoClick}
              className="font-jetbrains text-base font-bold tracking-wider cursor-pointer text-cyber-blue text-shadow-blue flex items-center gap-2"
              style={{ textShadow: '0 0 10px rgba(0, 212, 255, 0.8), 0 0 20px rgba(0, 212, 255, 0.5), 0 0 40px rgba(0, 212, 255, 0.3)' }}
            >
              <Terminal size={18} className="text-cyber-blue" />
              SHENZEVEN
              <span className="text-xs font-mono text-green-500"># ONLINE</span>
            </button>

            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`relative font-jetbrains text-sm transition-all duration-200 ${
                    currentPage === item.path
                      ? 'text-cyber-blue'
                      : 'text-cyber-gray hover:text-cyber-white'
                  }`}
                >
                  <span className="text-cyber-purple">$</span>
                  <span className="ml-1">{item.cmd}</span>
                  {currentPage === item.path && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyber-blue"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      exit={{ scaleX: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              ))}
              <div className="w-[1px] h-5 bg-cyber-border" />
              <button
                onClick={() => handleNavClick('/admin')}
                className={`relative font-jetbrains text-sm transition-all duration-200 flex items-center gap-1 ${
                  currentPage === '/admin' ? 'text-cyber-blue' : 'text-cyber-gray/50 hover:text-cyber-blue'
                }`}
                title="管理后台"
              >
                <Shield size={14} className={isAdmin ? 'text-green-500' : ''} />
              </button>
            </div>

            <button
              className="md:hidden text-cyber-blue p-2"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-[100] bg-cyber-black/95 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="h-full flex flex-col items-center justify-center space-y-6">
              <button
                className="absolute top-4 right-4 text-cyber-blue p-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X size={24} />
              </button>
              {navItems.map((item, index) => (
                <motion.button
                  key={item.path}
                  onClick={() => {
                    handleNavClick(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`font-jetbrains text-xl ${
                    currentPage === item.path ? 'text-cyber-blue' : 'text-cyber-white'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <span className="text-cyber-purple">$</span>
                  <span className="ml-2">{item.cmd}</span>
                </motion.button>
              ))}
              <motion.button
                onClick={() => {
                  handleNavClick('/admin');
                  setMobileMenuOpen(false);
                }}
                className={`font-jetbrains text-xl flex items-center gap-2 ${
                  currentPage === '/admin' ? 'text-cyber-blue' : 'text-cyber-gray/60'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navItems.length * 0.1 }}
              >
                <Shield size={18} className={isAdmin ? 'text-green-500' : ''} />
                <span>cd /admin</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
