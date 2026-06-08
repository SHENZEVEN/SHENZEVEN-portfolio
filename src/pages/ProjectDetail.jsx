import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Code2, ExternalLink, Edit3, Save, X, Upload, Trash2, Play, Image as ImageIcon, Video } from 'lucide-react';
import { projects } from '../data/projects';
import { compressImage } from '../utils/compressImage';
import { loadProjectMedia, saveProjectMedia } from '../utils/imageStore';
import { useAdmin } from '../context/AdminContext';

export default function ProjectDetail({ projectId, onNavigate }) {
  const { isAdmin } = useAdmin();
  const project = projects.find(p => p.id === parseInt(projectId));
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState(null);
  const [savedData, setSavedData] = useState(null);
  const [mediaError, setMediaError] = useState('');

  useEffect(() => {
    if (project) {
      const saved = localStorage.getItem(`project_${project.id}`);
      const localData = saved ? JSON.parse(saved) : null;

      // 从 IndexedDB 加载媒体
      loadProjectMedia(project.id).then(async (storedMedia) => {
        let media = storedMedia || [];

        // 迁移：IndexedDB 为空但 localStorage 有旧媒体数据
        const legacyMedia = localData?.media;
        if (media.length === 0 && legacyMedia && legacyMedia.length > 0) {
          media = legacyMedia;
          await saveProjectMedia(project.id, legacyMedia).catch(() => {});
        }

        const merged = { ...(localData || project), media };
        setEditedProject(merged);
        setSavedData({ ...merged });

        // 清理 localStorage 中的 media，只保留元数据
        if (localData?.media) {
          const { media: _, ...meta } = localData;
          localStorage.setItem(`project_${project.id}`, JSON.stringify(meta));
        }
      }).catch(() => {
        // IndexedDB 失败，用 localStorage 兜底
        setEditedProject({ ...project, media: localData?.media || [] });
      });
    }
  }, [project]);

  const handleFieldChange = (field, value) => {
    if (!editedProject) return;
    setEditedProject(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTagChange = (index, value) => {
    if (!editedProject) return;
    const newTags = [...editedProject.tags];
    newTags[index] = value;
    setEditedProject(prev => ({
      ...prev,
      tags: newTags
    }));
  };

  const handleAddTag = () => {
    if (!editedProject) return;
    setEditedProject(prev => ({
      ...prev,
      tags: [...prev.tags, '']
    }));
  };

  const handleRemoveTag = (index) => {
    if (!editedProject) return;
    const newTags = editedProject.tags.filter((_, i) => i !== index);
    setEditedProject(prev => ({
      ...prev,
      tags: newTags
    }));
  };

  const handleArrayFieldChange = (field, index, value) => {
    if (!editedProject) return;
    const newArray = [...editedProject[field]];
    newArray[index] = value;
    setEditedProject(prev => ({
      ...prev,
      [field]: newArray
    }));
  };

  const handleAddArrayItem = (field) => {
    if (!editedProject) return;
    setEditedProject(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const handleRemoveArrayItem = (field, index) => {
    if (!editedProject) return;
    const newArray = editedProject[field].filter((_, i) => i !== index);
    setEditedProject(prev => ({
      ...prev,
      [field]: newArray
    }));
  };

  const handleMediaUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of files) {
      const isVideo = file.type.startsWith('video/');

      if (isVideo) {
        // 视频限制 50MB
        if (file.size > 50 * 1024 * 1024) {
          setMediaError('视频过大（超过50MB），请压缩后重试');
          setTimeout(() => setMediaError(''), 4000);
          continue;
        }
        setMediaError('');
        const reader = new FileReader();
        const data = await new Promise((resolve, reject) => {
          reader.onload = (ev) => resolve(ev.target.result);
          reader.onerror = () => reject(new Error('读取失败'));
          reader.readAsDataURL(file);
        });
        setEditedProject(prev => ({
          ...prev,
          media: [...(prev.media || []), { id: Date.now() + Math.random(), type: 'video', data, name: file.name }]
        }));
      } else {
        try {
          const compressed = await compressImage(file);
          setMediaError('');
          setEditedProject(prev => ({
            ...prev,
            media: [...(prev.media || []), { id: Date.now() + Math.random(), type: 'image', data: compressed, name: file.name }]
          }));
        } catch (_) {
          setMediaError('图片处理失败');
          setTimeout(() => setMediaError(''), 3000);
        }
      }
    }
  };

  const handleRemoveMedia = (index) => {
    if (!editedProject) return;
    const newMedia = (editedProject.media || []).filter((_, i) => i !== index);
    setEditedProject(prev => ({
      ...prev,
      media: newMedia
    }));
  };

  const handleSave = async () => {
    if (!editedProject) return;
    // 媒体存 IndexedDB，元数据存 localStorage
    const { media, ...meta } = editedProject;
    localStorage.setItem(`project_${project.id}`, JSON.stringify(meta));
    await saveProjectMedia(project.id, media || []).catch(() => {});
    setSavedData(editedProject);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (savedData) {
      setEditedProject(savedData);
    } else {
      setEditedProject({ ...project, media: [] });
    }
    setIsEditing(false);
  };

  if (!project || !editedProject) {
    return (
      <div className="min-h-screen bg-cyber-black pt-16 flex items-center justify-center">
        <p className="text-cyber-gray font-noto">项目不存在</p>
      </div>
    );
  }

  const media = editedProject.media || [];

  return (
    <div className="min-h-screen bg-cyber-black pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between mb-8"
        >
          <button
            onClick={() => onNavigate('/projects')}
            className="flex items-center gap-2 text-cyber-blue font-noto text-sm hover:text-cyber-white transition-colors"
          >
            <ArrowLeft size={20} />
            返回项目列表
          </button>
          
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="editing"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex gap-2"
              >
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-cyber-blue text-cyber-black font-noto text-sm font-medium px-4 py-2 rounded-lg transition-all hover:opacity-90"
                >
                  <Save size={16} />
                  保存
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 border border-cyber-border text-cyber-gray font-noto text-sm px-4 py-2 rounded-lg transition-all hover:border-cyber-blue hover:text-cyber-blue"
                >
                  <X size={16} />
                  取消
                </button>
              </motion.div>
            ) : isAdmin ? (
              <motion.button
                key="edit"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 border border-cyber-border text-cyber-blue font-noto text-sm px-4 py-2 rounded-lg transition-all hover:bg-cyber-blue hover:text-cyber-black"
              >
                <Edit3 size={16} />
                编辑项目
              </motion.button>
            ) : null}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <span className="font-jetbrains text-cyber-blue/60 text-sm">项目编号</span>
            {isEditing ? (
              <input
                type="text"
                value={editedProject.number}
                onChange={(e) => handleFieldChange('number', e.target.value)}
                className="font-orbitron text-cyber-blue text-2xl font-bold bg-transparent border-b border-cyber-blue/30 focus:outline-none focus:border-cyber-blue"
              />
            ) : (
              <span className="font-orbitron text-cyber-blue text-2xl font-bold">{editedProject.number}</span>
            )}
          </div>
          
          {isEditing ? (
            <input
              type="text"
              value={editedProject.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className="font-orbitron text-3xl font-bold text-cyber-white mb-4 bg-transparent border-b border-cyber-blue/30 focus:outline-none focus:border-cyber-blue w-full"
            />
          ) : (
            <h1 className="font-orbitron text-3xl font-bold text-cyber-white mb-4">
              {editedProject.name}
            </h1>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-cyber-dark border border-cyber-border rounded-xl p-6 mb-8"
        >
          <h2 className="font-orbitron text-lg font-semibold text-cyber-blue mb-4">项目概述</h2>
          {isEditing ? (
            <textarea
              value={editedProject.overview}
              onChange={(e) => handleFieldChange('overview', e.target.value)}
              className="w-full h-24 bg-cyber-black border border-cyber-border rounded-lg p-3 text-cyber-white font-noto leading-relaxed resize-none focus:outline-none focus:border-cyber-blue"
            />
          ) : (
            <p className="text-cyber-white font-noto leading-relaxed">
              {editedProject.overview}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-orbitron text-lg font-semibold text-cyber-blue">技术栈</h2>
            {isEditing && (
              <button
                onClick={handleAddTag}
                className="text-cyber-blue font-jetbrains text-sm hover:text-cyber-white transition-colors"
              >
                + 添加
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {editedProject.tags.map((tag, index) => (
              <div key={index} className="relative">
                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => handleTagChange(index, e.target.value)}
                      className="px-4 py-2 bg-cyber-dark border border-cyber-blue/30 rounded-full text-cyber-blue font-jetbrains text-sm focus:outline-none focus:border-cyber-blue"
                    />
                    <button
                      onClick={() => handleRemoveTag(index)}
                      className="ml-1 text-red-400 hover:text-red-300"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <span
                    className="px-4 py-2 bg-cyber-dark border border-cyber-blue/30 rounded-full text-cyber-blue font-jetbrains text-sm"
                  >
                    {tag}
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-cyber-dark border border-cyber-border rounded-xl p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-orbitron text-lg font-semibold text-cyber-blue">核心功能模块</h2>
            {isEditing && (
              <button
                onClick={() => handleAddArrayItem('features')}
                className="text-cyber-blue font-jetbrains text-sm hover:text-cyber-white transition-colors"
              >
                + 添加
              </button>
            )}
          </div>
          <ul className="space-y-2">
            {editedProject.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-cyber-blue flex-shrink-0" />
                {isEditing ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleArrayFieldChange('features', index, e.target.value)}
                      className="flex-1 bg-cyber-black border border-cyber-border rounded-lg px-3 py-1.5 text-cyber-white font-noto text-sm focus:outline-none focus:border-cyber-blue"
                    />
                    <button
                      onClick={() => handleRemoveArrayItem('features', index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <span className="text-cyber-white font-noto">{feature}</span>
                )}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-cyber-dark border border-cyber-border rounded-xl p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-orbitron text-lg font-semibold text-cyber-blue">技术亮点</h2>
            {isEditing && (
              <button
                onClick={() => handleAddArrayItem('techHighlights')}
                className="text-cyber-blue font-jetbrains text-sm hover:text-cyber-white transition-colors"
              >
                + 添加
              </button>
            )}
          </div>
          <ul className="space-y-3">
            {editedProject.techHighlights.map((highlight, index) => (
              <li key={index} className="flex gap-3">
                <span className="text-cyber-purple flex-shrink-0">•</span>
                {isEditing ? (
                  <div className="flex-1 flex items-start gap-2">
                    <textarea
                      value={highlight}
                      onChange={(e) => handleArrayFieldChange('techHighlights', index, e.target.value)}
                      className="flex-1 bg-cyber-black border border-cyber-border rounded-lg px-3 py-1.5 text-cyber-gray font-noto text-sm leading-relaxed resize-none focus:outline-none focus:border-cyber-blue"
                      rows={2}
                    />
                    <button
                      onClick={() => handleRemoveArrayItem('techHighlights', index)}
                      className="text-red-400 hover:text-red-300 mt-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <span className="text-cyber-gray font-noto leading-relaxed">{highlight}</span>
                )}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-cyber-dark border border-cyber-border rounded-xl p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-orbitron text-lg font-semibold text-cyber-blue">成果</h2>
            {isEditing && (
              <button
                onClick={() => handleAddArrayItem('achievements')}
                className="text-cyber-blue font-jetbrains text-sm hover:text-cyber-white transition-colors"
              >
                + 添加
              </button>
            )}
          </div>
          <ul className="space-y-2">
            {editedProject.achievements.map((achievement, index) => (
              <li key={index} className="flex items-center gap-3">
                <span className="text-cyber-purple flex-shrink-0">✓</span>
                {isEditing ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={achievement}
                      onChange={(e) => handleArrayFieldChange('achievements', index, e.target.value)}
                      className="flex-1 bg-cyber-black border border-cyber-border rounded-lg px-3 py-1.5 text-cyber-white font-noto text-sm focus:outline-none focus:border-cyber-blue"
                    />
                    <button
                      onClick={() => handleRemoveArrayItem('achievements', index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <span className="text-cyber-white font-noto">{achievement}</span>
                )}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-cyber-dark border border-cyber-border rounded-xl p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-orbitron text-lg font-semibold text-cyber-blue">演示素材</h2>
            {mediaError && (
              <div className="mb-3 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 font-jetbrains text-xs">{mediaError}</p>
              </div>
            )}
            {isEditing && (
              <label className="flex items-center gap-1 text-cyber-blue font-jetbrains text-sm cursor-pointer hover:text-cyber-white transition-colors">
                <Upload size={16} />
                上传图片/视频
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={handleMediaUpload}
                />
              </label>
            )}
          </div>

          {media.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {media.map((item, index) => (
                <div key={index} className="relative aspect-video bg-cyber-black rounded-lg overflow-hidden group">
                  {item.type === 'video' ? (
                    <video
                      src={item.data}
                      controls
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <img
                      src={item.data}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 px-2 py-1 rounded">
                    {item.type === 'video' ? (
                      <Video size={14} className="text-cyber-blue" />
                    ) : (
                      <ImageIcon size={14} className="text-cyber-blue" />
                    )}
                    <span className="text-cyber-white font-jetbrains text-xs">
                      {item.name}
                    </span>
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => handleRemoveMedia(index)}
                      className="absolute top-2 right-2 p-2 rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  {!isEditing && item.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                      <Play size={48} className="text-cyber-blue" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="aspect-video bg-cyber-black rounded-lg flex flex-col items-center justify-center">
              <Upload size={32} className="text-cyber-gray mb-3" />
              <span className="text-cyber-gray font-jetbrains text-sm">
                {isEditing ? '点击上方按钮上传图片或视频' : '暂无演示素材'}
              </span>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <a
            href={editedProject.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-cyber-blue text-cyber-black font-noto text-sm font-medium px-6 py-3 rounded-lg transition-all hover:opacity-90"
          >
            <Code2 size={16} />
            查看源码
            <ExternalLink size={14} />
          </a>
        </motion.div>
      </div>
    </div>
  );
}