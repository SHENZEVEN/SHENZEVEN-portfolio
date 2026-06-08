import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Save, Upload, X, Trash2, Plus, MapPin, Calendar, Tag } from 'lucide-react';
import { categoryColors } from '../data/nodes';
import { saveImages, loadImages, deleteImages } from '../utils/imageStore';
import { compressImage } from '../utils/compressImage';
import { useAdmin } from '../context/AdminContext';

export default function NodePopup({ node, onClose, onDelete, onSave }) {
  const { isAdmin } = useAdmin();
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [savedData, setSavedData] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [editedTime, setEditedTime] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imageError, setImageError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [lastSavedImages, setLastSavedImages] = useState([]);

  useEffect(() => {
    if (node) {
      const nodeKey = node._dataId || node.uniqueId || node.id;
      const raw = localStorage.getItem(`node_${nodeKey}`);
      const parsed = raw ? JSON.parse(raw) : null;

      // 分离元数据和旧格式图片
      const legacyImages = parsed?.images;
      const meta = parsed ? {
        description: parsed.description,
        name: parsed.name,
        time: parsed.time,
        location: parsed.location,
        tags: parsed.tags,
      } : null;

      const rawDesc = meta?.description || '';
      setDescription(rawDesc === '点击添加描述...' ? '' : rawDesc);
      setEditedName(meta?.name || node.name);
      setEditedTime(meta?.time || node.time);
      setLocation(meta?.location || '');
      setTags(meta?.tags || []);
      setSavedData(meta);

      // 图片加载 + 自动迁移
      loadImages(nodeKey).then(async (storedImages) => {
        let imgs = storedImages || [];

        // 如果 IndexedDB 为空但 localStorage 有旧图片 → 自动迁移
        if (imgs.length === 0 && legacyImages && legacyImages.length > 0) {
          imgs = legacyImages;
          try {
            await saveImages(nodeKey, legacyImages);
            // 迁移成功，从 localStorage 中剥离 images，仅保留元数据
            if (meta) {
              localStorage.setItem(`node_${nodeKey}`, JSON.stringify(meta));
            }
          } catch (_) { /* 迁移失败用原数据兜底 */ }
        }

        setImages(imgs);
        setLastSavedImages(imgs);
      }).catch(() => {
        // IndexedDB 失败，用旧 localStorage 图片兜底
        setImages(legacyImages || []);
        setLastSavedImages(legacyImages || []);
      });
    }
  }, [node]);

  // 处理单个图片文件（供点击上传和拖拽上传共用）
  const processImageFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setImageError('请选择图片文件');
      setTimeout(() => setImageError(''), 3000);
      return;
    }

    // 放宽到 20MB 原图，压缩后会大幅缩小
    if (file.size > 20 * 1024 * 1024) {
      setImageError('图片过大（超过20MB）');
      setTimeout(() => setImageError(''), 3000);
      return;
    }

    try {
      setImageError('');
      const compressed = await compressImage(file);
      setImages(prev => [...prev, compressed]);
    } catch (err) {
      setImageError('图片处理失败，请重试');
      setTimeout(() => setImageError(''), 3000);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) processImageFile(file);
  };

  // 拖拽上传
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // 只在真正离开区域时才取消高亮
    if (e.currentTarget === e.target || !e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      Array.from(files).forEach(file => processImageFile(file));
    }
  };

  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (index) => {
    setTags(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const nodeKey = node._dataId || node.uniqueId || node.id;
    const meta = {
      description: description || '',
      name: editedName || node?.name,
      time: editedTime || node?.time,
      location,
      tags,
    };

    try {
      // 元数据存 localStorage（纯文本，极小）
      localStorage.setItem(`node_${nodeKey}`, JSON.stringify(meta));
      // 图片存 IndexedDB（容量按 GB 算）
      await saveImages(nodeKey, images);

      setSavedData(meta);
      setLastSavedImages(images);
      setIsEditing(false);
      setImageError('');
      onSave?.();
    } catch (err) {
      setImageError('保存失败，请重试');
      setTimeout(() => setImageError(''), 3000);
    }
  };

  const handleClose = () => {
    setIsEditing(false);
    if (savedData) {
      setDescription(savedData.description || '');
      setImages(lastSavedImages);
      setEditedName(savedData.name || node?.name);
      setEditedTime(savedData.time || node?.time);
      setLocation(savedData.location || '');
      setTags(savedData.tags || []);
    } else {
      setDescription('');
      setImages([]);
      setEditedName(node?.name);
      setEditedTime(node?.time);
      setLocation('');
      setTags([]);
    }
    onClose?.();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
      e.preventDefault();
      if (e.target.id === 'new-tag') {
        handleAddTag();
      }
    }
  };

  const handleDelete = async () => {
    const nodeKey = node._dataId || node.uniqueId || node.id;
    localStorage.removeItem(`node_${nodeKey}`);
    await deleteImages(nodeKey).catch(() => {});
    onDelete?.();
  };

  if (!node) return null;

  const color = categoryColors[node.category] || '#00d4ff';

  return (
    <AnimatePresence>
      <motion.div
        className="w-full max-h-[calc(100vh-200px)] overflow-y-auto"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        transition={{ duration: 0.4 }}
      >
        <div
          className="bg-cyber-dark/95 backdrop-blur-xl rounded-xl p-6 shadow-xl relative overflow-hidden"
          style={{ border: `1px solid ${isDragging ? '#00d4ff' : color}`, boxShadow: isDragging ? `0 0 20px rgba(0,212,255,0.3), inset 0 0 20px rgba(0,212,255,0.05)` : undefined }}
          onDragEnter={isEditing ? handleDragEnter : undefined}
          onDragOver={isEditing ? handleDragOver : undefined}
          onDragLeave={isEditing ? handleDragLeave : undefined}
          onDrop={isEditing ? handleDrop : undefined}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
              />
              {isEditing ? (
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="font-orbitron text-lg font-semibold text-cyber-white bg-transparent border-b border-cyber-blue/40 focus:border-cyber-blue outline-none py-0.5 transition-colors placeholder:text-cyber-gray/50"
                  placeholder="节点名称"
                />
              ) : (
                <h3 className="font-orbitron text-lg font-semibold text-cyber-white truncate">
                  {editedName}
                </h3>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isEditing && onDelete && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-all"
                  title="删除节点"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-cyber-gray hover:bg-red-500/20 hover:text-red-500 transition-all"
                title="关闭"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showDeleteConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
              >
                <p className="text-red-400 font-jetbrains text-sm mb-3">确定要删除这个节点吗？此操作无法撤销。</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    className="flex-1 bg-red-500 text-white font-noto text-sm py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    确认删除
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 border border-cyber-border text-cyber-gray font-noto text-sm py-2 rounded-lg hover:border-cyber-blue hover:text-cyber-blue transition-colors"
                  >
                    取消
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-cyber-gray font-jetbrains flex items-center gap-2">
                <Calendar size={14} />
                时间
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={editedTime}
                  onChange={(e) => setEditedTime(e.target.value)}
                  className="bg-transparent border-b border-cyber-blue/40 text-cyber-white font-jetbrains text-sm focus:outline-none focus:border-cyber-blue w-32 text-right py-0.5 transition-colors placeholder:text-cyber-gray/50"
                  placeholder="YYYY.MM"
                />
              ) : (
                <span className="text-cyber-white font-jetbrains text-sm">{editedTime}</span>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-cyber-gray font-jetbrains flex items-center gap-2">
                <MapPin size={14} />
                地点
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-transparent border-b border-cyber-blue/40 text-cyber-white font-jetbrains text-sm focus:outline-none focus:border-cyber-blue w-40 text-right py-0.5 transition-colors placeholder:text-cyber-gray/50"
                  placeholder="添加地点"
                />
              ) : (
                <span className="text-cyber-white font-jetbrains text-sm">{location || '-'}</span>
              )}
            </div>

            {(images.length > 0 || isEditing) && (
              <div className="border-t border-cyber-border pt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-cyber-gray font-jetbrains text-sm">相册</span>
                  {isEditing && (
                    <label className="flex items-center gap-1 text-cyber-blue font-jetbrains text-xs cursor-pointer hover:text-cyber-white transition-colors">
                      <Plus size={14} />
                      添加照片
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>

                {imageError && (
                  <div className="mb-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 font-jetbrains text-xs">{imageError}</p>
                  </div>
                )}

                {images.length > 0 ? (
                  <div className={`grid gap-2 mb-3 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {images.map((img, index) => (
                      <div key={index} className="relative aspect-[4/3] rounded-lg overflow-hidden group">
                        <img src={img} alt={`${editedName} - ${index + 1}`} className="w-full h-full object-cover" />
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="aspect-[4/3] rounded-lg flex flex-col items-center justify-center mb-3 bg-cyber-black/60 border border-dashed border-cyber-blue/30 hover:border-cyber-blue/60 transition-colors">
                    <Upload size={24} className="text-cyber-blue/60 mb-2" />
                    <span className="text-cyber-blue/60 font-jetbrains text-xs">拖拽或点击上传</span>
                  </div>
                )}
              </div>
            )}

            {(tags.length > 0 || isEditing) && (
              <div className="flex flex-wrap gap-2 items-center">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 bg-cyber-dark border border-cyber-blue/30 rounded-full text-cyber-blue font-jetbrains text-xs ${
                      isEditing ? 'flex items-center gap-1' : ''
                    }`}
                  >
                    {tag}
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveTag(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </span>
                ))}
                {isEditing && (
                  <>
                    <input
                      id="new-tag"
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-28 bg-transparent border-b border-cyber-blue/40 text-cyber-white font-jetbrains text-xs focus:outline-none focus:border-cyber-blue py-0.5 transition-colors placeholder:text-cyber-gray/50"
                      placeholder="新标签"
                    />
                    <button
                      onClick={handleAddTag}
                      className="flex-shrink-0 p-1 bg-cyber-blue/20 text-cyber-blue rounded hover:bg-cyber-blue/40 transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </>
                )}
              </div>
            )}

            {(isEditing || description) && (
              <div className="border-t border-cyber-border pt-4">
                {isEditing ? (
                  <textarea
                    className="w-full min-h-[60px] bg-transparent border-b border-cyber-blue/40 text-cyber-white font-noto text-sm resize-y focus:outline-none focus:border-cyber-blue py-1 transition-colors leading-relaxed placeholder:text-cyber-gray/50"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="输入描述..."
                  />
                ) : (
                  <p className="text-cyber-gray font-noto text-sm leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="flex-1 flex items-center justify-center gap-2 bg-cyber-blue text-cyber-black font-noto text-sm font-medium py-2 rounded-lg transition-all hover:opacity-90"
                  >
                    <Save size={16} />
                    保存
                  </button>
                  <button
                    onClick={handleClose}
                    className="flex-1 border border-cyber-border text-cyber-gray font-noto text-sm py-2 rounded-lg transition-all hover:border-cyber-blue hover:text-cyber-blue"
                  >
                    取消
                  </button>
                </>
              ) : isAdmin ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 flex items-center justify-center gap-2 border border-cyber-border text-cyber-blue font-noto text-sm py-2 rounded-lg transition-all hover:bg-cyber-blue hover:text-cyber-black"
                >
                  <Edit3 size={16} />
                  编辑
                </button>
              ) : null}
            </div>
          </div>

          {/* 拖拽上传覆盖层 */}
          {isDragging && (
            <div className="absolute inset-0 bg-cyber-blue/10 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center z-10 pointer-events-none">
              <Upload size={40} className="text-cyber-blue mb-3 animate-bounce" />
              <p className="text-cyber-blue font-orbitron text-sm">释放以上传图片</p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}