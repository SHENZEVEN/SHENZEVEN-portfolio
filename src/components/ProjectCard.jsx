import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Upload, Image as ImageIcon } from 'lucide-react';
import { compressImage } from '../utils/compressImage';
import { loadProjectMedia, saveProjectMedia } from '../utils/imageStore';
import { useAdmin } from '../context/AdminContext';

export default function ProjectCard({ project, onClick, compact = false }) {
  const { isAdmin } = useAdmin();
  const [isHovered, setIsHovered] = useState(false);
  const [media, setMedia] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadProjectMedia(project.id).then(stored => {
      setMedia(stored || []);
    }).catch(() => setMedia([]));
  }, [project.id]);

  const firstImage = media.find(m => m.type === 'image');

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const newItem = {
        id: Date.now() + Math.random(),
        type: 'image',
        data: compressed,
        name: file.name,
      };

      // 读取现有媒体，合并新图片后存入 IndexedDB
      const existing = await loadProjectMedia(project.id).catch(() => []);
      const merged = [...(existing || []), newItem];
      await saveProjectMedia(project.id, merged);
      setMedia(merged);
    } catch (_) {}
    setUploading(false);
  };

  const placeholderArea = (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      {firstImage ? (
        <img src={firstImage.data} alt={project.name} className="w-full h-full object-cover" />
      ) : (
        <>
          <ImageIcon size={compact ? 24 : 32} className="text-cyber-gray/60 mb-2" />
          <span className="text-cyber-gray/60 font-jetbrains text-xs">项目截图</span>
        </>
      )}
    </div>
  );

  if (compact) {
    return (
      <motion.div
        className="relative bg-cyber-dark border border-cyber-border rounded-lg overflow-hidden cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-4">
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {project.heroTags?.map((tag) => (
              <span key={tag} className="text-cyber-blue font-jetbrains text-xs">
                &lt;{tag}&gt;
              </span>
            ))}
          </div>
          <h3 className="font-orbitron text-base font-semibold text-cyber-white mb-1.5">{project.name}</h3>
          <p className="text-cyber-gray text-xs font-noto mb-2 line-clamp-1">{project.description}</p>

          <div className="flex flex-wrap gap-1 mb-2">
            {project.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-cyber-black border border-cyber-border rounded-full text-cyber-blue font-jetbrains text-[10px]">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-cyber-blue font-jetbrains text-[10px]">查看详情</span>
            <ArrowRight className="text-cyber-blue" size={12} />
          </div>
        </div>
        {isHovered && (
          <>
            <motion.div
              className="absolute left-0 right-0 h-[2px] bg-cyber-blue"
              initial={{ top: '-100%' }}
              animate={{ top: '100%' }}
              transition={{ duration: 1, ease: 'linear' }}
              style={{ boxShadow: '0 0 10px #00d4ff, 0 0 20px #00d4ff' }}
            />
            <motion.div
              className="absolute inset-0 pointer-events-none border-2 border-cyber-blue"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ boxShadow: '0 0 15px rgba(0, 212, 255, 0.3), inset 0 0 15px rgba(0, 212, 255, 0.1)' }}
            />
          </>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="relative bg-cyber-dark border border-cyber-border/50 rounded-xl overflow-hidden cursor-pointer card-glow card-glow-hover transition-all duration-500"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-6 flex flex-col lg:flex-row gap-6">
        {/* 截图区域 */}
        <div className="relative lg:w-1/2 aspect-video bg-cyber-black rounded-lg overflow-hidden flex-shrink-0 group">
          {placeholderArea}

          {/* 上传按钮 — 仅管理员 hover 时显示 */}
          {isAdmin && (
            <div
              className={`absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            >
              <label className="flex items-center gap-2 text-cyber-blue font-jetbrains text-xs cursor-pointer hover:text-cyber-white transition-colors">
                <Upload size={16} className={uploading ? 'animate-spin' : ''} />
                {uploading ? '上传中...' : firstImage ? '更换截图' : '上传截图'}
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
              />
            </div>
          )}

          {isHovered && (
            <motion.div
              className="absolute left-0 right-0 h-[2px] bg-cyber-blue z-10"
              initial={{ top: '-100%' }}
              animate={{ top: '100%' }}
              transition={{ duration: 1, ease: 'linear' }}
              style={{ boxShadow: '0 0 10px #00d4ff, 0 0 20px #00d4ff' }}
            />
          )}
        </div>

        <div className="lg:w-1/2 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-3">
            <span className="font-jetbrains text-cyber-blue/60 text-sm">项目编号</span>
            <span className="font-orbitron text-cyber-blue text-lg font-bold">{project.number}</span>
          </div>

          <h3 className="font-orbitron text-xl font-semibold text-cyber-white mb-2">{project.name}</h3>
          <p className="text-cyber-gray text-sm font-noto mb-4">{project.description}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-cyber-black border border-cyber-border rounded-full text-cyber-blue font-jetbrains text-xs">
                {tag}
              </span>
            ))}
          </div>

          <div className="text-cyber-gray font-jetbrains text-xs mb-2">{project.completedAt}</div>
          <p className="text-cyber-white/80 text-sm font-noto mb-4">{project.highlights}</p>

          <div className="flex items-center gap-2 text-cyber-blue cursor-pointer group">
            <span className="font-noto text-sm">查看详情</span>
            <ArrowRight className="transition-transform group-hover:translate-x-1" size={16} />
          </div>
        </div>
      </div>

      {isHovered && (
        <motion.div
          className="absolute inset-0 pointer-events-none border-2 border-cyber-blue"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ boxShadow: '0 0 20px rgba(0, 212, 255, 0.4), inset 0 0 20px rgba(0, 212, 255, 0.2)' }}
        />
      )}
    </motion.div>
  );
}
