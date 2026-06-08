/**
 * site-data 工具
 *
 * 用途：解决 Vercel 部署后 localStorage/IndexedDB 数据丢失的问题
 *
 * 流程：
 *   本地编辑（数据存 localStorage/IndexedDB）
 *     → Admin 面板点击「导出数据」下载 site-data.json
 *     → 将 site-data.json 放入 public/ 目录
 *     → 提交 Git + 推送 → Vercel 自动部署
 *     → 线上应用启动时自动加载 /site-data.json 还原数据
 */

import { saveImages, saveProjectMedia, loadImages, loadProjectMedia } from './imageStore';

const SITE_DATA_URL = '/site-data.json';

/**
 * 从 public/ 目录加载 site-data.json
 * 仅在非本地开发环境时使用（生产环境 / Vercel 部署）
 */
export async function loadSiteData() {
  try {
    const res = await fetch(SITE_DATA_URL, { cache: 'no-cache' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * 将 site-data 写入 localStorage 和 IndexedDB
 * 已有数据不会被覆盖（以用户本地数据优先）
 */
export async function seedFromSiteData(data) {
  if (!data) return;

  // 1. 恢复自定义节点列表
  if (data.customNodes) {
    const existing = localStorage.getItem('customNodes');
    if (!existing) {
      localStorage.setItem('customNodes', JSON.stringify(data.customNodes));
    }
  }

  // 2. 恢复节点元数据 (node_fp1, node_d1, ...)
  if (data.nodeData) {
    for (const [key, value] of Object.entries(data.nodeData)) {
      const existing = localStorage.getItem(`node_${key}`);
      if (!existing) {
        localStorage.setItem(`node_${key}`, JSON.stringify(value));
      }
    }
  }

  // 3. 恢复节点图片到 IndexedDB
  if (data.nodeImages) {
    for (const [key, images] of Object.entries(data.nodeImages)) {
      try {
        const existing = await loadImages(key).catch(() => []);
        if (!existing || existing.length === 0) {
          await saveImages(key, images);
        }
      } catch (_) { /* 静默失败 */ }
    }
  }

  // 4. 恢复项目元数据
  if (data.projectData) {
    for (const [key, value] of Object.entries(data.projectData)) {
      const existing = localStorage.getItem(`project_${key}`);
      if (!existing) {
        localStorage.setItem(`project_${key}`, JSON.stringify(value));
      }
    }
  }

  // 5. 恢复项目媒体到 IndexedDB
  if (data.projectMedia) {
    for (const [key, media] of Object.entries(data.projectMedia)) {
      try {
        const existing = await loadProjectMedia(Number(key)).catch(() => []);
        if (!existing || existing.length === 0) {
          await saveProjectMedia(Number(key), media);
        }
      } catch (_) { /* 静默失败 */ }
    }
  }
}

/**
 * 收集所有本地数据（localStorage + IndexedDB），返回 site-data JSON 对象
 * 供 Admin 面板导出使用
 */
export async function collectAllData() {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    customNodes: null,
    nodeData: {},
    nodeImages: {},
    projectData: {},
    projectMedia: {},
  };

  // 1. 收集 customNodes
  const customNodesRaw = localStorage.getItem('customNodes');
  if (customNodesRaw) {
    try {
      data.customNodes = JSON.parse(customNodesRaw);
    } catch (_) { /* ignore */ }
  }

  // 2. 收集所有 node_* 数据
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('node_')) {
      const nodeId = key.replace('node_', '');
      try {
        const value = JSON.parse(localStorage.getItem(key));
        if (value) {
          data.nodeData[nodeId] = value;
        }
      } catch (_) { /* ignore */ }
    }
  }

  // 3. 收集节点图片 (IndexedDB)
  const allNodeIds = new Set([
    ...Object.keys(data.nodeData),
    ...(data.customNodes
      ? Object.values(data.customNodes).flat().map(n => n.uniqueId || n.id)
      : [])
  ]);

  for (const nodeId of allNodeIds) {
    try {
      const images = await loadImages(nodeId);
      if (images && images.length > 0) {
        data.nodeImages[nodeId] = images;
      }
    } catch (_) { /* ignore */ }
  }

  // 4. 收集项目数据
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('project_')) {
      const projectId = key.replace('project_', '');
      try {
        const value = JSON.parse(localStorage.getItem(key));
        if (value) {
          data.projectData[projectId] = value;
        }
      } catch (_) { /* ignore */ }
    }
  }

  // 5. 收集项目媒体 (IndexedDB)
  const allProjectIds = [...new Set([...Object.keys(data.projectData), '1', '2'])];

  for (const projectId of allProjectIds) {
    try {
      const media = await loadProjectMedia(Number(projectId));
      if (media && media.length > 0) {
        data.projectMedia[projectId] = media;
      }
    } catch (_) { /* ignore */ }
  }

  return data;
}

/**
 * 触发浏览器下载 JSON 文件
 */
export function downloadJSON(data, filename = 'site-data.json') {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 计算 site-data 的大致大小
 */
export function getDataSize(data) {
  const jsonStr = JSON.stringify(data);
  const bytes = new Blob([jsonStr]).size;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
