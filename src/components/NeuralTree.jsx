import { useEffect, useRef, useMemo, useState } from 'react';
import * as d3 from 'd3';
import { footprintNodes, danceNodes, lifeNodes, categoryColors } from '../data/nodes';

export default function NeuralTree({ onNodeHover, onNodeClick, selectedNode, isPinned, nodes: externalNodes, onNodesChange, treeVersion }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const gRef = useRef(null);
  const nodeRef = useRef(null);
  const labelsRef = useRef(null);
  const centerLabelRef = useRef(null);
  const treeDataRef = useRef(null);
  const zoomRef = useRef(null);
  const isPinnedRef = useRef(isPinned);
  const onNodeHoverRef = useRef(onNodeHover);
  const onNodeClickRef = useRef(onNodeClick);
  const [scale, setScale] = useState(1);

  // 保持所有回调 ref 同步，避免 D3 事件处理器闭包过期
  useEffect(() => {
    isPinnedRef.current = isPinned;
    onNodeHoverRef.current = onNodeHover;
    onNodeClickRef.current = onNodeClick;
  }, [isPinned, onNodeHover, onNodeClick]);

  const treeData = useMemo(() => {
    const categoryData = [
      { nodes: externalNodes?.footprint || footprintNodes, category: 'footprint', baseAngle: -Math.PI / 2 },
      { nodes: externalNodes?.dance || danceNodes, category: 'dance', baseAngle: Math.PI / 6 },
      { nodes: externalNodes?.life || lifeNodes, category: 'life', baseAngle: Math.PI * 5 / 6 },
    ];

    const allNodes = [];
    const allLinks = [];
    let nodeIdCounter = 0;

    const buildBinaryTree = (nodes, parentId, startAngle, angleSpread, level, maxLevel, baseRadius, category) => {
      if (nodes.length === 0 || level > maxLevel) return;

      const node = nodes[0];
      const nodeId = node.uniqueId || `${category}-${nodeIdCounter++}`;

      // 读取 localStorage 中用户编辑过的名称覆盖
      const dataId = node.id;
      let displayName = node.name;
      try {
        const saved = localStorage.getItem(`node_${dataId || node.uniqueId || nodeId}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.name && parsed.name !== node.name) {
            displayName = parsed.name;
          }
        }
      } catch (_) { /* ignore */ }

      const radius = level === 1 ? baseRadius + 28 : baseRadius + level * 50;
      const x = Math.cos(startAngle) * radius;
      const y = Math.sin(startAngle) * radius;

      const newNode = {
        ...node,
        id: nodeId,
        _dataId: node.id,
        name: displayName,
        category,
        x,
        y,
        level,
        parentId
      };
      allNodes.push(newNode);
      allLinks.push({ source: parentId, target: nodeId, category });

      if (nodes.length > 1) {
        const halfSpread = angleSpread / 2;
        buildBinaryTree(nodes.slice(1, Math.ceil(nodes.length / 2) + 1), nodeId, startAngle - halfSpread, halfSpread, level + 1, maxLevel, baseRadius, category);
        buildBinaryTree(nodes.slice(Math.ceil(nodes.length / 2) + 1), nodeId, startAngle + halfSpread, halfSpread, level + 1, maxLevel, baseRadius, category);
      }
    };

    allNodes.push({ id: 'center', name: '我', category: 'center', x: 0, y: 0, level: 0 });

    // 动态计算 maxLevel，确保所有节点都能显示
    const maxNodesInCategory = Math.max(...categoryData.map(c => c.nodes.length));
    const maxLevel = Math.max(4, Math.ceil(Math.log2(maxNodesInCategory + 1)));

    categoryData.forEach(cat => {
      buildBinaryTree(cat.nodes, 'center', cat.baseAngle, Math.PI / 4, 1, maxLevel, 60, cat.category);
    });

    return { nodes: allNodes, links: allLinks };
  }, [externalNodes, treeVersion]);

  const handleZoomIn = () => {
    if (!svgRef.current || !gRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(zoomRef.current.scaleBy, 1.3);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !gRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(zoomRef.current.scaleBy, 0.7);
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !gRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(zoomRef.current.transform, d3.zoomIdentity);
  };

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    const container = containerRef.current;
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    const centerX = width / 2;
    const centerY = height / 2;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // 保存当前缩放状态，节点数据变化后恢复
    const savedTransform = d3.zoomTransform(svgRef.current);

    svg.selectAll('*').remove();

    const g = svg.append('g').attr('class', 'tree-container');
    gRef.current = g;

    const positionedNodes = treeData.nodes.map(n => ({
      ...n,
      x: n.x + centerX,
      y: n.y + centerY
    }));

    // === 赛博轨道环 ===
    const ringGroup = g.append('g').attr('class', 'orbital-rings');
    const maxRenderedLevel = Math.max(...treeData.nodes.map(n => n.level).filter(l => l > 0), 1);
    for (let lv = 1; lv <= maxRenderedLevel; lv++) {
      const ringR = lv === 1 ? 60 + 28 : 60 + lv * 50;
      ringGroup.append('circle')
        .attr('cx', centerX).attr('cy', centerY).attr('r', ringR)
        .attr('fill', 'none')
        .attr('stroke', '#00d4ff')
        .attr('stroke-width', 0.5)
        .attr('stroke-dasharray', '2,6')
        .attr('opacity', 0.25);
    }

    // 外圈装饰虚线框
    svg.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(0, 212, 255, 0.3)')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5');

    const linkGroup = g.append('g').attr('class', 'links').attr('opacity', 1);
    const nodeGroup = g.append('g').attr('class', 'nodes');
    const labelGroup = g.append('g').attr('class', 'labels');

    const links = linkGroup.selectAll('line')
      .data(treeData.links)
      .join('line')
      .attr('stroke', d => categoryColors[d.category] || '#00d4ff')
      .attr('stroke-width', d => d.category === 'center' ? 1 : 2)
      .attr('stroke-opacity', 0.8)
      .attr('x1', d => {
        const sourceNode = positionedNodes.find(n => n.id === d.source);
        return sourceNode ? sourceNode.x : centerX;
      })
      .attr('y1', d => {
        const sourceNode = positionedNodes.find(n => n.id === d.source);
        return sourceNode ? sourceNode.y : centerY;
      })
      .attr('x2', d => {
        const targetNode = positionedNodes.find(n => n.id === d.target);
        return targetNode ? targetNode.x : centerX;
      })
      .attr('y2', d => {
        const targetNode = positionedNodes.find(n => n.id === d.target);
        return targetNode ? targetNode.y : centerY;
      });

    const node = nodeGroup.selectAll('circle')
      .data(positionedNodes)
      .join('circle')
      .attr('class', d => d.id !== 'center' ? 'interactive-node' : 'center-node')
      .attr('r', d => d.id === 'center' ? 10 : 5)
      .attr('fill', d => categoryColors[d.category])
      .attr('opacity', 0)
      .style('cursor', d => d.id !== 'center' ? 'pointer' : 'default')
      .style('filter', d => d.id === 'center'
        ? 'drop-shadow(0 0 8px #ffffff)'
        : 'none');

    // 中心节点外层脉冲环
    nodeGroup.append('circle')
      .attr('cx', centerX).attr('cy', centerY)
      .attr('r', 18)
      .attr('fill', 'none')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.4)
      .attr('class', 'center-pulse-ring')
      .attr('opacity', 0);

    nodeGroup.select('.center-pulse-ring')
      .transition().duration(800).attr('opacity', 1);

    // 中心脉冲环 — 用 D3 interval 代替 CSS animation（避免持续 layout 消耗）
    const pulseRing = nodeGroup.select('.center-pulse-ring');
    let pulsePhase = 0;
    const pulseInterval = setInterval(() => {
      if (!pulseRing.node()) { clearInterval(pulseInterval); return; }
      pulsePhase += 0.05;
      const r = 18 + Math.sin(pulsePhase) * 3;
      const opacity = 0.2 + Math.sin(pulsePhase) * 0.15;
      pulseRing.attr('r', r).attr('stroke-opacity', opacity);
    }, 50);

    const labels = labelGroup.selectAll('text')
      .data(positionedNodes.filter(n => n.id !== 'center'))
      .join('text')
      .attr('class', 'node-label')
      .attr('data-id', d => d.id)
      .attr('font-size', '11px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('fill', d => categoryColors[d.category])
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .attr('opacity', 0)
      .style('pointer-events', 'none')
      .text(d => d.name);

    // 移除中心标签
    // const centerLabel = labelGroup.append('text')
    //   .attr('x', centerX)
    //   .attr('y', centerY)
    //   .attr('font-size', '14px')
    //   .attr('font-family', 'Orbitron, sans-serif')
    //   .attr('font-weight', 'bold')
    //   .attr('fill', '#ffffff')
    //   .attr('text-anchor', 'middle')
    //   .attr('alignment-baseline', 'middle')
    //   .attr('opacity', 0)
    //   .style('text-shadow', '0 0 10px #ffffff')
    //   .text('我');

    node.transition()
      .duration(600)
      .delay((d, i) => d.id === 'center' ? 0 : d.level * 100 + 200)
      .attr('opacity', 1);

    labels.transition()
      .duration(400)
      .delay((d, i) => d.level * 100 + 400)
      .attr('opacity', 0.8);

    // centerLabel.transition()
    //   .duration(600)
    //   .attr('opacity', 1);

    node.attr('cx', d => d.x)
        .attr('cy', d => d.y);

    labels.attr('x', d => {
          const angle = Math.atan2(d.y - centerY, d.x - centerX);
          return d.x + Math.cos(angle) * 18;
        })
        .attr('y', d => {
          const angle = Math.atan2(d.y - centerY, d.x - centerX);
          return d.y + Math.sin(angle) * 18;
        });

    nodeRef.current = node;
    labelsRef.current = labels;
    // centerLabelRef.current = centerLabel; // 移除中心标签引用
    treeDataRef.current = { nodes: positionedNodes };

    const zoom = d3.zoom()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setScale(event.transform.k);
      });

    zoomRef.current = zoom;
    svg.call(zoom);

    // 恢复之前的缩放状态
    if (savedTransform && (savedTransform.k !== 1 || savedTransform.x !== 0 || savedTransform.y !== 0)) {
      svg.call(zoom.transform, savedTransform);
    }

    node.on('mouseenter', function(event, d) {
      if (d.id === 'center') return;
      
      d3.select(this)
        .transition()
        .duration(200)
        .attr('r', 9)
        .style('filter', `drop-shadow(0 0 8px ${categoryColors[d.category]})`);

      labelGroup.selectAll(`[data-id="${d.id}"]`)
        .transition()
        .duration(200)
        .attr('opacity', 1);

      if (!isPinnedRef.current) {
        onNodeHoverRef.current?.(d);
      }
    });

    node.on('mouseleave', function(event, d) {
      if (d.id === 'center') return;

      d3.select(this)
        .transition()
        .duration(200)
        .attr('r', 5)
        .style('filter', 'none');

      labelGroup.selectAll(`[data-id="${d.id}"]`)
        .transition()
        .duration(200)
        .attr('opacity', 0.8);

      if (!isPinnedRef.current) {
        onNodeHoverRef.current?.(null);
      }
    });

    node.on('click', function(event, d) {
      if (d.id === 'center') return;
      event.stopPropagation();
      onNodeClickRef.current?.(d);
    });

    // 点击空白区域关闭卡片
    svg.on('click', function(event) {
      if (event.target === this && isPinnedRef.current) {
        onNodeClickRef.current?.(null);
      }
    });

    const handleResize = () => {
      const newWidth = container.offsetWidth;
      const newHeight = container.offsetHeight;
      const newCenterX = newWidth / 2;
      const newCenterY = newHeight / 2;
      const scaleX = newWidth / width;
      const scaleY = newHeight / height;
      const scale = Math.min(scaleX, scaleY);

      svg.attr('width', newWidth).attr('height', newHeight);
      
      // 更新范围框大小
      svg.selectAll('rect')
        .attr('width', newWidth)
        .attr('height', newHeight);

      const newNodes = treeData.nodes.map(n => ({
        ...n,
        x: n.x * scale + newCenterX,
        y: n.y * scale + newCenterY
      }));

      if (nodeRef.current) {
        nodeRef.current.attr('cx', d => newNodes.find(n => n.id === d.id)?.x)
                      .attr('cy', d => newNodes.find(n => n.id === d.id)?.y);
      }

      if (labelsRef.current) {
        labelsRef.current.attr('x', d => {
              const nn = newNodes.find(n => n.id === d.id);
              if (!nn) return 0;
              const angle = Math.atan2(nn.y - newCenterY, nn.x - newCenterX);
              return nn.x + Math.cos(angle) * 18;
            })
            .attr('y', d => {
              const nn = newNodes.find(n => n.id === d.id);
              if (!nn) return 0;
              const angle = Math.atan2(nn.y - newCenterY, nn.x - newCenterX);
              return nn.y + Math.sin(angle) * 18;
            });
      }

      if (centerLabelRef.current) {
        centerLabelRef.current.attr('x', newCenterX).attr('y', newCenterY);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(pulseInterval);
    };
  }, [treeData]);

  useEffect(() => {
    if (!nodeRef.current || !labelsRef.current) return;

    nodeRef.current.attr('stroke', d => selectedNode?.id === d.id ? '#ffffff' : 'none')
                  .attr('stroke-width', d => selectedNode?.id === d.id ? 2 : 0)
                  .style('filter', d => {
                    if (d.id === 'center') return 'drop-shadow(0 0 8px #ffffff)';
                    return selectedNode?.id === d.id
                      ? `drop-shadow(0 0 8px ${categoryColors[d.category]})`
                      : 'none';
                  });

    labelsRef.current.attr('font-weight', d => selectedNode?.id === d.id ? 'bold' : 'normal')
                    .attr('opacity', d => selectedNode?.id === d.id ? 1 : 0.8);
  }, [selectedNode]);

  return (
    <div ref={containerRef} className="w-full h-full cursor-move relative overflow-hidden">
      <svg ref={svgRef} className="w-full h-full" />
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 bg-black/50 border border-cyber-blue text-cyber-blue rounded-lg flex items-center justify-center hover:bg-cyber-blue/20 transition-all font-bold text-lg"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 bg-black/50 border border-cyber-blue text-cyber-blue rounded-lg flex items-center justify-center hover:bg-cyber-blue/20 transition-all font-bold text-lg"
        >
          -
        </button>
        <button
          onClick={handleResetZoom}
          className="w-10 h-10 bg-black/50 border border-cyber-blue text-cyber-blue rounded-lg flex items-center justify-center hover:bg-cyber-blue/20 transition-all font-bold text-xs"
        >
          重置
        </button>
        <div className="text-center text-cyber-blue text-xs mt-1">
          {Math.round(scale * 100)}%
        </div>
      </div>
    </div>
  );
}
