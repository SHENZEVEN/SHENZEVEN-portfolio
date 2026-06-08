import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, LogOut, ArrowRight, Eye, EyeOff, Download } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { collectAllData, downloadJSON, getDataSize } from '../utils/siteData';

export default function Admin({ onNavigate }) {
  const { isAdmin, login, logout } = useAdmin();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState('');

  const handleExport = async () => {
    setExporting(true);
    setExportMsg('');
    try {
      const data = await collectAllData();
      const size = getDataSize(data);
      downloadJSON(data, 'site-data.json');
      setExportMsg(`导出成功！文件大小: ${size}`);
      setTimeout(() => setExportMsg(''), 5000);
    } catch (err) {
      setExportMsg('导出失败，请重试');
      setTimeout(() => setExportMsg(''), 3000);
    }
    setExporting(false);
  };

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
          {/* 数据导出 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-cyber-dark border border-yellow-500/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-orbitron text-lg font-semibold text-yellow-400 mb-1">
                  数据导出
                </h3>
                <p className="text-cyber-gray font-jetbrains text-xs">
                  导出所有编辑数据（节点、项目、图片）为 JSON 文件。将文件放入 public/ 目录后提交推送，Vercel 部署即可同步数据。
                </p>
              </div>
            </div>
            {exportMsg && (
              <p className={`font-jetbrains text-xs mb-3 ${exportMsg.startsWith('导出成功') ? 'text-green-400' : 'text-red-400'}`}>
                {exportMsg}
              </p>
            )}
            <div className="flex items-center gap-4">
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center gap-2 bg-yellow-500/80 text-cyber-black font-orbitron text-sm font-bold px-5 py-2.5 rounded-lg transition-all hover:bg-yellow-500 disabled:opacity-50"
              >
                <Download size={16} />
                {exporting ? '导出中...' : '导出 site-data.json'}
              </button>
              <span className="text-cyber-gray/60 font-jetbrains text-xs">
                导出的文件会自动下载到本地
              </span>
            </div>
          </motion.div>

          {/* 部署提示 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-cyber-dark border border-cyber-blue/20 rounded-xl p-5"
          >
            <h4 className="font-orbitron text-sm font-semibold text-cyber-blue mb-2">部署步骤</h4>
            <ol className="text-cyber-gray font-jetbrains text-xs space-y-1.5">
              <li>1. 点击上方按钮导出 <code className="text-cyber-blue bg-cyber-black px-1.5 py-0.5 rounded">site-data.json</code></li>
              <li>2. 将下载的文件放入项目 <code className="text-cyber-blue bg-cyber-black px-1.5 py-0.5 rounded">public/</code> 目录（覆盖已有文件）</li>
              <li>3. 如有视频，将视频文件放入 <code className="text-cyber-blue bg-cyber-black px-1.5 py-0.5 rounded">public/media/</code> 目录</li>
              <li>4. <code className="text-cyber-green bg-cyber-black px-1.5 py-0.5 rounded">git add public/site-data.json public/media/</code> → commit → push</li>
              <li>5. Vercel 自动部署，数据同步上线 🎉</li>
            </ol>
          </motion.div>

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
