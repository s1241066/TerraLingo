import * as THREE from 'three';

// 🛣️ 黑色底中間一條白色虛線的極簡馬路貼圖
export function createRoadTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // 1. 純黑底瀝青路面
  ctx.fillStyle = '#121316';
  ctx.fillRect(0, 0, 1024, 1024);

  // 2. 中間一條純白色的虛線
  ctx.fillStyle = '#ffffff';
  const dashWidth = 22;
  const dashLength = 96;
  const gap = 64;
  for (let y = 16; y < 1024; y += dashLength + gap) {
    ctx.fillRect(512 - dashWidth / 2, y, dashWidth, dashLength);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 16;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 📐 編輯模式專用方格虛線框貼圖 (Dashed Square Grid Tile Texture)
export function createDashedGridTexture(strokeColor = '#ffffff', fillColor = 'rgba(16, 185, 129, 0.14)'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 256, 256);

  // Subtle translucent tile fill
  ctx.fillStyle = fillColor;
  ctx.fillRect(6, 6, 244, 244);

  // Crisp dashed outer border
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 7;
  ctx.setLineDash([22, 16]);
  ctx.strokeRect(8, 8, 240, 240);

  // Subtle corner brackets for visual clarity
  ctx.setLineDash([]);
  ctx.lineWidth = 8;
  const len = 26;
  const corners = [
    [6, 6, 1, 1],
    [250, 6, -1, 1],
    [6, 250, 1, -1],
    [250, 250, -1, -1],
  ];
  corners.forEach(([cx, cy, dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(cx + dx * len, cy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx, cy + dy * len);
    ctx.stroke();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createClockFaceTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Dial background (warm parchment white)
  ctx.fillStyle = '#fbfbf2';
  ctx.fillRect(0, 0, 256, 256);

  // Outer golden bronze ring
  ctx.strokeStyle = '#c68a4c';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(128, 128, 116, 0, Math.PI * 2);
  ctx.stroke();

  // Inner ring
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(128, 128, 102, 0, Math.PI * 2);
  ctx.stroke();

  // Hour tick marks
  ctx.strokeStyle = '#1d2a44';
  ctx.lineWidth = 6;
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6;
    const x1 = 128 + Math.cos(angle) * 88;
    const y1 = 128 + Math.sin(angle) * 88;
    const x2 = 128 + Math.cos(angle) * 100;
    const y2 = 128 + Math.sin(angle) * 100;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // Clock hands (showing 12:00 from textbook p.103 "clock hit twelve")
  ctx.strokeStyle = '#0f172a';
  ctx.lineCap = 'round';
  // Hour hand
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(128, 128);
  ctx.lineTo(128, 56);
  ctx.stroke();

  // Minute hand
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(128, 128);
  ctx.lineTo(128, 40);
  ctx.stroke();

  // Center cap
  ctx.fillStyle = '#c68a4c';
  ctx.beginPath();
  ctx.arc(128, 128, 8, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createGrassTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Green meadow base
  ctx.fillStyle = '#4ade80';
  ctx.fillRect(0, 0, 256, 256);

  // Soft clover & grass tufts
  ctx.fillStyle = '#22c55e';
  for (let i = 0; i < 600; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    ctx.fillRect(x, y, 3, 3);
  }

  ctx.fillStyle = '#86efac';
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    ctx.fillRect(x, y, 2, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// ==========================================
// Paving Tile Procedural Textures
// ==========================================

export function createCobblestoneTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Dark stone mortar base
  ctx.fillStyle = '#334155';
  ctx.fillRect(0, 0, 256, 256);

  // Cobblestone rounded stone grid
  const stoneColors = ['#64748b', '#94a3b8', '#475569', '#cbd5e1'];
  const rows = 8;
  const cols = 8;
  const cellW = 256 / cols;
  const cellH = 256 / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const offsetX = (r % 2 === 1) ? cellW / 2 : 0;
      const x = (c * cellW + offsetX) % 256;
      const y = r * cellH;
      const color = stoneColors[(r * 3 + c * 5) % stoneColors.length];

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(x + 2, y + 2, cellW - 4, cellH - 4, 4);
      ctx.fill();

      // Stone highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(x + 4, y + 4, cellW - 8, 3);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createRedBrickTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Light cement mortar
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(0, 0, 256, 256);

  // Red/terracotta brick tones
  const brickColors = ['#b91c1c', '#991b1b', '#c2410c', '#a16207', '#7f1d1d'];
  const brickH = 32;
  const brickW = 64;

  for (let y = 0; y < 256; y += brickH) {
    const isOdd = Math.floor(y / brickH) % 2 === 1;
    const shift = isOdd ? brickW / 2 : 0;
    for (let x = -brickW; x < 256 + brickW; x += brickW) {
      const bx = x + shift;
      const color = brickColors[Math.abs(Math.floor((bx * 7 + y * 13) % brickColors.length))];
      ctx.fillStyle = color;
      ctx.fillRect(bx + 2, y + 2, brickW - 4, brickH - 4);

      // Subtle texture grain
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(bx + 4, y + brickH - 6, brickW - 8, 2);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createStonePlazaTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Elegant light marble / granite slab
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(0, 0, 256, 256);

  // Large slab joints (4x4 large square tiles)
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 3;

  for (let i = 0; i <= 256; i += 64) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 256);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(256, i);
    ctx.stroke();
  }

  // Marble grain specks
  ctx.fillStyle = 'rgba(100, 116, 139, 0.12)';
  for (let i = 0; i < 200; i++) {
    const rx = Math.random() * 256;
    const ry = Math.random() * 256;
    ctx.fillRect(rx, ry, Math.random() * 4 + 1, Math.random() * 4 + 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createTerracottaTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Warm terracotta clay base
  ctx.fillStyle = '#ea580c';
  ctx.fillRect(0, 0, 256, 256);

  // Diamond / Diagonal paver grid
  ctx.strokeStyle = '#c2410c';
  ctx.lineWidth = 4;
  for (let i = -256; i < 512; i += 64) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 256, 256);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(i, 256);
    ctx.lineTo(i + 256, 0);
    ctx.stroke();
  }

  // Golden clay highlights
  ctx.fillStyle = 'rgba(254, 215, 170, 0.18)';
  for (let i = 0; i < 300; i++) {
    const rx = Math.random() * 256;
    const ry = Math.random() * 256;
    ctx.fillRect(rx, ry, 2, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createWoodDeckTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Deep wood base
  ctx.fillStyle = '#451a03';
  ctx.fillRect(0, 0, 256, 256);

  // Horizontal wood planks
  const plankH = 32;
  const woodShades = ['#78350f', '#92400e', '#b45309', '#7c2d12'];

  for (let y = 0; y < 256; y += plankH) {
    ctx.fillStyle = woodShades[Math.floor(y / plankH) % woodShades.length];
    ctx.fillRect(0, y + 2, 256, plankH - 4);

    // Plank nail studs
    ctx.fillStyle = '#292524';
    ctx.fillRect(16, y + plankH / 2 - 2, 4, 4);
    ctx.fillRect(128, y + plankH / 2 - 2, 4, 4);
    ctx.fillRect(240, y + plankH / 2 - 2, 4, 4);

    // Subtle grain lines
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(0, y + 6, 256, 2);
    ctx.fillRect(0, y + 18, 256, 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
