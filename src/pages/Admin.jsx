import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, LogOut, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export default function Admin({ onNavigate }) {
  const { isAdmin, login, logout } = useAdmin();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError('');
    const ok = await login(password);
    if (!ok) {
      setError('密码错误');
      setPassword('');
    }
    setLoading(false);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-cyber-black pt-16 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-sm w-full mx-4"
        >
          <div className="bg-cyber-dark/95 backdrop-blur-xl rounded-xl p-8 border border-cyber-border shadow-xl text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyber-blue/10 flex items-center justify-center border border-cyber-blue/30">
              <Shield size={28} className="text-cyber-blue" />
            </div>
            <h1 className="font-orbitron text-xl font-bold text-cyber-white mb-2">
              管理后台
            </h1>
            <p className="text-cyber-gray font-jetbrains text-xs mb-6">
              输入密码以解锁编辑功能
            </p>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-cyber-black border border-cyber-border rounded-lg px-4 py-3 text-cyber-white font-jetbrains text-sm focus:outline-none focus:border-cyber-blue pr-10"
                  placeholder="密码"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-gray hover:text-cyber-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {error && (
                <p className="text-red-400 font-jetbrains text-xs">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyber-blue text-cyber-black font-orbitron text-sm font-bold py-3 rounded-lg transition-all hover:opacity-90 disabled:opacity-50"
              >
                {loading ? '验证中...' : '解锁'}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-black pt-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/30">
            <Shield size={28} className="text-green-500" />
          </div>
          <h1 className="font-orbitron text-3xl font-bold text-cyber-white mb-2">
            管理后台
          </h1>
          <p className="text-cyber-gray font-jetbrains text-sm">编辑模式已激活</p>
        </motion.div>

        <div className="space-y-4">
          <button
            onClick={() => onNavigate('/another-me')}
            className="w-full bg-cyber-dark border border-cyber-border rounded-xl p-6 text-left hover:border-cyber-blue transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-orbitron text-lg font-semibold text-cyber-white mb-1">管理节点</h3>
                <p className="text-cyber-gray font-jetbrains text-xs">编辑"另一个我"页面的所有节点</p>
              </div>
              <ArrowRight size={20} className="text-cyber-blue group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => onNavigate('/projects')}
            className="w-full bg-cyber-dark border border-cyber-border rounded-xl p-6 text-left hover:border-cyber-blue transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-orbitron text-lg font-semibold text-cyber-white mb-1">管理项目</h3>
                <p className="text-cyber-gray font-jetbrains text-xs">编辑项目详情、上传截图和视频</p>
              </div>
              <ArrowRight size={20} className="text-cyber-blue group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          <button
            onClick={logout}
            className="w-full border border-red-500/30 rounded-xl p-5 text-center hover:bg-red-500/10 transition-all group"
          >
            <div className="flex items-center justify-center gap-2 text-red-400">
              <LogOut size={16} />
              <span className="font-orbitron text-sm">锁定编辑模式</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
