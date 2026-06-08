import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MousePointer2, Hand, Plus, X, Calendar, MapPin, Tag, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import NeuralTree from '../components/NeuralTree';
import NodePopup from '../components/NodePopup';
import { footprintNodes, danceNodes, lifeNodes, categoryColors } from '../data/nodes';
import { useAdmin } from '../context/AdminContext';

export default function AnotherMe() {
  const { isAdmin } = useAdmin();
  const [hoveredNode, setHoveredNode] = useState(null);
  const [pinnedNode, setPinnedNode] = useState(null);
  const [customNodes, setCustomNodes] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [treeVersion, setTreeVersion] = useState(0);
  const [newNode, setNewNode] = useState({
    category: 'footprint',
    name: '',
    time: '',
    location: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem('customNodes');
    if (saved) {
      setCustomNodes(JSON.parse(saved));
    }
  }, []);

  const handleSaveNodes = (updatedNodes) => {
    setCustomNodes(updatedNodes);
    localStorage.setItem('customNodes', JSON.stringify(updatedNodes));
  };

  const handleNodeHover = (node) => {
    if (!pinnedNode) {
      setHoveredNode(node);
    }
  };

  const handleNodeClick = (node) => {
    setPinnedNode(node);
    setHoveredNode(null);
  };

  const handleClosePopup = () => {
    setPinnedNode(null);
    setHoveredNode(null);
  };

  const handleNodeSave = () => {
    setTreeVersion(v => v + 1);
  };

  const handleAddNode = () => {
    if (!newNode.name || !newNode.time) return;

    const nodeWithId = {
      ...newNode,
      uniqueId: `${newNode.category}-${Date.now()}`,
      id: `${newNode.category}-${Date.now()}`
    };

    const currentNodes = customNodes || {
      footprint: [...footprintNodes],
      dance: [...danceNodes],
      life: [...lifeNodes]
    };

    currentNodes[newNode.category] = [...currentNodes[newNode.category], nodeWithId];
    handleSaveNodes(currentNodes);
    
    setNewNode({ category: 'footprint', name: '', time: '', location: '' });
    setShowAddForm(false);
  };

  const handleDeleteNode = (nodeToDelete) => {
    const currentNodes = customNodes || {
      footprint: [...footprintNodes],
      dance: [...danceNodes],
      life: [...lifeNodes]
    };

    const category = nodeToDelete.category;
    // 用 _dataId（原始数据 id）或 uniqueId 匹配，而非 tree 生成的 id
    const matchId = nodeToDelete._dataId || nodeToDelete.uniqueId || nodeToDelete.id;

    currentNodes[category] = currentNodes[category].filter(n =>
      n.uniqueId !== matchId && n.id !== matchId
    );

    handleSaveNodes(currentNodes);
    handleClosePopup();
  };

  const displayedNode = pinnedNode || hoveredNode;
  const currentNodes = customNodes || {
    footprint: footprintNodes,
    dance: danceNodes,
    life: lifeNodes
  };

  return (
    <div className="min-h-screen bg-cyber-black pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-orbitron text-4xl font-bold mb-4 text-cyber-blue">
            另一个我
          </h1>
          <p className="text-cyber-gray font-noto">探索我的足迹、舞蹈与生活</p>
        </motion.div>

        <motion.div
          className="flex flex-wrap gap-6 mb-6 justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyber-blue" style={{ boxShadow: '0 0 10px #00d4ff' }} />
            <span className="text-cyber-gray font-jetbrains text-sm">足迹</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyber-red" style={{ boxShadow: '0 0 10px #ff0040' }} />
            <span className="text-cyber-gray font-jetbrains text-sm">舞蹈</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyber-purple" style={{ boxShadow: '0 0 10px #8b5cf6' }} />
            <span className="text-cyber-gray font-jetbrains text-sm">生活</span>
          </div>
          <div className="h-4 w-[1px] bg-cyber-border mx-2" />
          <div className="flex items-center gap-2 text-cyber-gray/70">
            <MousePointer2 size={14} />
            <span className="font-jetbrains text-xs">悬停预览</span>
          </div>
          <div className="flex items-center gap-2 text-cyber-gray/70">
            <Hand size={14} />
            <span className="font-jetbrains text-xs">点击固定</span>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1 text-cyber-blue font-jetbrains text-xs hover:text-cyber-white transition-colors border border-cyber-blue/30 px-3 py-1 rounded-lg hover:bg-cyber-blue/10"
            >
              <Plus size={14} />
              添加节点
            </button>
          )}
        </motion.div>

        <div className="relative h-[calc(100vh-280px)] flex gap-4 items-start">
          <div className="flex-1 h-full">
            <NeuralTree
              onNodeHover={handleNodeHover}
              onNodeClick={handleNodeClick}
              selectedNode={displayedNode}
              isPinned={!!pinnedNode}
              nodes={customNodes}
              onNodesChange={handleSaveNodes}
              treeVersion={treeVersion}
            />
          </div>

          <div className="w-96 flex-shrink-0">
            <AnimatePresence mode="wait">
              {displayedNode ? (
                <NodePopup
                  key="node-popup"
                  node={displayedNode}
                  onClose={handleClosePopup}
                  onDelete={() => handleDeleteNode(displayedNode)}
                  onSave={handleNodeSave}
                />
              ) : (showAddForm && isAdmin) ? (
                <motion.div
                  key="add-form"
                  className="w-full"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.4 }}
                >
                  <div
                    className="bg-cyber-dark/95 backdrop-blur-xl rounded-xl p-6 shadow-xl"
                    style={{ border: `1px solid ${categoryColors[newNode.category]}` }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: categoryColors[newNode.category], boxShadow: `0 0 10px ${categoryColors[newNode.category]}` }}
                        />
                        <h3 className="font-orbitron text-lg font-semibold text-cyber-white">
                          添加新节点
                        </h3>
                      </div>
                      <button
                        onClick={() => setShowAddForm(false)}
                        className="p-2 rounded-lg text-cyber-gray hover:bg-red-500/20 hover:text-red-500 transition-all"
                        title="关闭"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* 分类 */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-cyber-gray font-jetbrains flex items-center gap-2">
                          <Tag size={14} />
                          分类
                        </span>
                        <select
                          value={newNode.category}
                          onChange={(e) => setNewNode(prev => ({ ...prev, category: e.target.value }))}
                          className="bg-cyber-black border border-cyber-border rounded-lg px-3 py-1.5 text-cyber-white font-jetbrains text-sm focus:outline-none focus:border-cyber-blue w-32"
                        >
                          <option value="footprint">足迹</option>
                          <option value="dance">舞蹈</option>
                          <option value="life">生活</option>
                        </select>
                      </div>

                      {/* 名称 */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-cyber-gray font-jetbrains">名称</span>
                        <input
                          type="text"
                          value={newNode.name}
                          onChange={(e) => setNewNode(prev => ({ ...prev, name: e.target.value }))}
                          className="bg-cyber-black border border-cyber-border rounded-lg px-3 py-1.5 text-cyber-white font-jetbrains text-sm focus:outline-none focus:border-cyber-blue w-40"
                          placeholder="节点名称"
                        />
                      </div>

                      {/* 时间 */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-cyber-gray font-jetbrains flex items-center gap-2">
                          <Calendar size={14} />
                          时间
                        </span>
                        <input
                          type="text"
                          value={newNode.time}
                          onChange={(e) => setNewNode(prev => ({ ...prev, time: e.target.value }))}
                          className="bg-cyber-black border border-cyber-border rounded-lg px-3 py-1.5 text-cyber-white font-jetbrains text-sm focus:outline-none focus:border-cyber-blue w-32"
                          placeholder="YYYY.MM"
                        />
                      </div>

                      {/* 地点 */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-cyber-gray font-jetbrains flex items-center gap-2">
                          <MapPin size={14} />
                          地点
                        </span>
                        <input
                          type="text"
                          value={newNode.location}
                          onChange={(e) => setNewNode(prev => ({ ...prev, location: e.target.value }))}
                          className="bg-cyber-black border border-cyber-border rounded-lg px-3 py-1.5 text-cyber-white font-jetbrains text-sm focus:outline-none focus:border-cyber-blue w-40"
                          placeholder="可选"
                        />
                      </div>

                      {/* 按钮 */}
                      <div className="border-t border-cyber-border pt-4">
                        <div className="flex gap-3">
                          <button
                            onClick={handleAddNode}
                            className="flex-1 flex items-center justify-center gap-2 bg-cyber-blue text-cyber-black font-noto text-sm font-medium py-2 rounded-lg transition-all hover:opacity-90"
                          >
                            <Plus size={16} />
                            添加
                          </button>
                          <button
                            onClick={() => setShowAddForm(false)}
                            className="flex-1 border border-cyber-border text-cyber-gray font-noto text-sm py-2 rounded-lg transition-all hover:border-cyber-blue hover:text-cyber-blue"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
