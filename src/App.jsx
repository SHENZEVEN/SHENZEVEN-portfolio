import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import BootScreen from './components/BootScreen';
import Home from './pages/Home';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import AnotherMe from './pages/AnotherMe';
import Contact from './pages/Contact';
import CustomCursor from './components/CustomCursor';
import DataStream from './components/DataStream';
import CyberBackground from './components/CyberBackground';
import { AdminProvider } from './context/AdminContext';
import Admin from './pages/Admin';

function App() {
  const [currentPage, setCurrentPage] = useState('/');
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleNavigate = (path) => {
    if (path === currentPage) return;
    setCurrentPage(path);
    window.history.pushState({}, '', path);
  };

  const formatTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  if (isLoading) {
    return <BootScreen />;
  }

  const renderPage = () => {
    if (currentPage === '/') return <Home onNavigate={handleNavigate} />;
    if (currentPage === '/projects') return <Projects onNavigate={handleNavigate} />;
    if (currentPage.startsWith('/project/')) {
      const projectId = currentPage.split('/')[2];
      return <ProjectDetail projectId={projectId} onNavigate={handleNavigate} />;
    }
    if (currentPage === '/another-me') return <AnotherMe />;
    if (currentPage === '/contact') return <Contact />;
    if (currentPage === '/admin') return <Admin onNavigate={handleNavigate} />;
    return <Home onNavigate={handleNavigate} />;
  };

  return (
    <AdminProvider>
      <div className="min-h-screen bg-cyber-black relative overflow-hidden">
        <CyberBackground />
      <DataStream />
      <CustomCursor />
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />
      
      <AnimatePresence mode="wait">
        <motion.main
          key={currentPage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
        >
          {renderPage()}
        </motion.main>
      </AnimatePresence>
      
      {/* 底部实时时间 */}
      <motion.footer
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 font-jetbrains text-xs text-cyber-gray/60"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <span className="text-cyber-purple">TIME:</span>
        <span className="ml-2">{formatTime(currentTime)} UTC+8</span>
      </motion.footer>
      </div>
    </AdminProvider>
  );
}

export default App;
