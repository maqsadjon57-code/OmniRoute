// Procedural PBR Texture Generator for CS2 Dust II & Weapon Skins
// Generates realistic Mediterranean architectural textures, military props, graffiti, and skins (NO Minecraft blocks)

import * as THREE from 'three';

export class TextureGenerator {
  private static cache: Map<string, THREE.CanvasTexture> = new Map();

  // 1. Warm Moroccan Stucco Plaster Wall
  public static createStuccoWall(): THREE.CanvasTexture {
    const key = 'stucco_wall';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Base warm ochre sand color
    ctx.fillStyle = '#e5d1b5';
    ctx.fillRect(0, 0, 1024, 1024);

    // Fine plaster grain noise
    const imgData = ctx.getImageData(0, 0, 1024, 1024);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 32;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise * 0.9));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 0.7));
    }
    ctx.putImageData(imgData, 0, 0);

    // Weathered water streaks and plaster cracks
    ctx.strokeStyle = 'rgba(165, 140, 115, 0.25)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 15; i++) {
      ctx.beginPath();
      let x = Math.random() * 1024;
      let y = Math.random() * 800;
      ctx.moveTo(x, y);
      for (let j = 0; j < 6; j++) {
        x += (Math.random() - 0.5) * 40;
        y += Math.random() * 50;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Dirt gradient at bottom
    const grad = ctx.createLinearGradient(0, 800, 0, 1024);
    grad.addColorStop(0, 'rgba(140, 120, 95, 0)');
    grad.addColorStop(1, 'rgba(140, 120, 95, 0.45)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 800, 1024, 224);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set(key, texture);
    return texture;
  }

  // 2. Mediterranean Sandstone Paver Sidewalk / Road
  public static createStonePavement(): THREE.CanvasTexture {
    const key = 'stone_pavement';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#bfae96';
    ctx.fillRect(0, 0, 1024, 1024);

    // Stone paver tiles
    const tileSize = 64;
    ctx.strokeStyle = '#8c7e6c';
    ctx.lineWidth = 3;

    for (let y = 0; y < 1024; y += tileSize) {
      const offsetX = (y / tileSize) % 2 === 0 ? 0 : tileSize / 2;
      for (let x = -offsetX; x < 1024; x += tileSize) {
        // Tile variance
        const lum = Math.floor((Math.random() - 0.5) * 20);
        ctx.fillStyle = `rgb(${190 + lum}, ${175 + lum}, ${150 + lum})`;
        ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
        ctx.strokeRect(x, y, tileSize, tileSize);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    this.cache.set(key, texture);
    return texture;
  }

  // 3. Wooden Shipping Crate with Stencil 14 / RT (Screenshot 14, 15)
  public static createMilitaryCrate(stencil: '14' | 'RT' | 'A'): THREE.CanvasTexture {
    const key = `crate_${stencil}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Wood base
    ctx.fillStyle = '#c5a059';
    ctx.fillRect(0, 0, 512, 512);

    // Wood planks
    const plankH = 512 / 8;
    for (let i = 0; i < 8; i++) {
      const y = i * plankH;
      ctx.fillStyle = i % 2 === 0 ? '#b8944d' : '#caa762';
      ctx.fillRect(0, y, 512, plankH);
      ctx.strokeStyle = '#6e5628';
      ctx.lineWidth = 3;
      ctx.strokeRect(0, y, 512, plankH);

      // Wood grain lines
      ctx.strokeStyle = 'rgba(100, 75, 30, 0.15)';
      ctx.lineWidth = 1;
      for (let g = 0; g < 6; g++) {
        ctx.beginPath();
        ctx.moveTo(0, y + Math.random() * plankH);
        ctx.bezierCurveTo(150, y + Math.random() * plankH, 350, y + Math.random() * plankH, 512, y + Math.random() * plankH);
        ctx.stroke();
      }
    }

    // Outer metal frame border
    ctx.fillStyle = '#5c646b';
    const border = 32;
    ctx.fillRect(0, 0, 512, border);
    ctx.fillRect(0, 512 - border, 512, border);
    ctx.fillRect(0, 0, border, 512);
    ctx.fillRect(512 - border, 0, border, 512);

    // Diagonal brace
    ctx.lineWidth = 36;
    ctx.strokeStyle = '#525a61';
    ctx.beginPath();
    ctx.moveTo(border, border);
    ctx.lineTo(512 - border, 512 - border);
    ctx.stroke();

    // Rivets on metal frame
    ctx.fillStyle = '#2d3339';
    const rivets = [16, 128, 256, 384, 496];
    rivets.forEach(p => {
      ctx.beginPath(); ctx.arc(p, 16, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(p, 496, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(16, p, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(496, p, 5, 0, Math.PI * 2); ctx.fill();
    });

    // Stencil Text
    ctx.save();
    ctx.font = 'bold 110px "Impact", "Arial Black", sans-serif';
    ctx.fillStyle = 'rgba(25, 25, 25, 0.85)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(stencil, 256, 256);
    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set(key, texture);
    return texture;
  }

  // 4. Blue Corrugated Steel Shipping Dumpster (Screenshot 14)
  public static createDumpsterTexture(): THREE.CanvasTexture {
    const key = 'dumpster_metal';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Blue paint
    ctx.fillStyle = '#3a6288';
    ctx.fillRect(0, 0, 512, 512);

    // Vertical corrugated ridges
    const ribW = 32;
    for (let x = 0; x < 512; x += ribW) {
      const grad = ctx.createLinearGradient(x, 0, x + ribW, 0);
      grad.addColorStop(0, '#2b4d6e');
      grad.addColorStop(0.3, '#4d7ea9');
      grad.addColorStop(0.7, '#5c92c2');
      grad.addColorStop(1, '#254360');
      ctx.fillStyle = grad;
      ctx.fillRect(x + 2, 0, ribW - 4, 512);
    }

    // Industrial stencil "14"
    ctx.font = 'bold 48px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText('CS2-14', 40, 60);

    // Weathering rust stains
    ctx.fillStyle = 'rgba(120, 60, 20, 0.4)';
    ctx.fillRect(0, 480, 512, 32);

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set(key, texture);
    return texture;
  }

  // 5. Bombsite A Graffiti on Stucco (Screenshot 10, 15)
  public static createBombsiteASpray(): THREE.CanvasTexture {
    const key = 'site_a_spray';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Transparent background
    ctx.clearRect(0, 0, 512, 512);

    // Red spray circle
    ctx.strokeStyle = '#d62828';
    ctx.lineWidth = 28;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(256, 256, 180, 0.2, Math.PI * 2 - 0.3);
    ctx.stroke();

    // Red spray 'A' letter
    ctx.fillStyle = '#d62828';
    ctx.font = 'bold 260px "Impact", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('A', 256, 270);

    // Spray splatters
    for (let i = 0; i < 40; i++) {
      const rad = Math.random() * 230;
      const ang = Math.random() * Math.PI * 2;
      ctx.fillStyle = 'rgba(214, 40, 40, 0.6)';
      ctx.beginPath();
      ctx.arc(256 + Math.cos(ang) * rad, 256 + Math.sin(ang) * rad, Math.random() * 6, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set(key, texture);
    return texture;
  }

  // 6. Iconic Dust 2 "Goose" Graffiti (Screenshot 15)
  public static createGooseGraffiti(): THREE.CanvasTexture {
    const key = 'goose_graffiti';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, 512, 512);

    // Speech bubble with Arabic "إوز" (Goose)
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 8;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(160, 160, 90, 60, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Arabic text "إوز"
    ctx.fillStyle = '#111111';
    ctx.font = 'bold 54px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('إوز', 160, 160);

    // Goose body
    ctx.fillStyle = '#dedede';
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 10;
    ctx.beginPath();
    // Body oval
    ctx.ellipse(280, 360, 100, 60, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Long black neck
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(220, 350);
    ctx.quadraticCurveTo(200, 260, 220, 200);
    ctx.lineTo(245, 205);
    ctx.quadraticCurveTo(230, 260, 250, 340);
    ctx.closePath();
    ctx.fill();

    // Goose head
    ctx.beginPath();
    ctx.arc(220, 200, 26, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = '#e67e22';
    ctx.beginPath();
    ctx.moveTo(200, 205);
    ctx.lineTo(165, 215);
    ctx.lineTo(198, 225);
    ctx.closePath();
    ctx.fill();

    // Eye
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(215, 195, 5, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set(key, texture);
    return texture;
  }

  // 7. Desert Eagle | Kumicho Dragon Skin Texture (Screenshot 4)
  public static createKumichoDragonTexture(): THREE.CanvasTexture {
    const key = 'skin_kumicho_dragon';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Matte dark gunmetal slide base
    ctx.fillStyle = '#1c1e22';
    ctx.fillRect(0, 0, 1024, 512);

    // Fine brushed steel texture
    for (let x = 0; x < 1024; x += 2) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)';
      ctx.fillRect(x, 0, 2, 512);
    }

    // Laser-etched silver dragon art across slide
    ctx.strokeStyle = '#e0e4eb';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 4;

    // Dragon head and snaking coils
    ctx.beginPath();
    ctx.moveTo(120, 160);
    // Dragon jaws and fangs
    ctx.lineTo(220, 140);
    ctx.lineTo(190, 180);
    ctx.lineTo(280, 150);
    ctx.lineTo(340, 190);
    ctx.stroke();

    // Dragon body waves
    for (let i = 0; i < 4; i++) {
      const cx = 350 + i * 140;
      ctx.beginPath();
      ctx.arc(cx, 160 + (i % 2 === 0 ? 30 : -30), 50, 0, Math.PI * 2);
      ctx.stroke();
      // Scales pattern
      for (let s = 0; s < 5; s++) {
        ctx.beginPath();
        ctx.arc(cx - 20 + s * 10, 160, 12, 0, Math.PI);
        ctx.stroke();
      }
    }

    // Purple Grip Medallion (Right bottom section)
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#5c1d68';
    ctx.fillRect(720, 240, 260, 250);

    // Silver coiled dragon on purple grip
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(850, 360, 70, 0, Math.PI * 1.7);
    ctx.stroke();

    ctx.font = 'bold 32px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('龍', 850, 370); // Chinese/Japanese Dragon Kanji

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set(key, texture);
    return texture;
  }

  // 8. AK-47 | The Empress Skin Texture (Screenshot 16)
  public static createTheEmpressTexture(): THREE.CanvasTexture {
    const key = 'skin_the_empress';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Royal deep midnight blue base
    ctx.fillStyle = '#08192b';
    ctx.fillRect(0, 0, 1024, 512);

    // Radiant Golden Tarot Sunbursts
    const centerX = 512;
    const centerY = 256;
    ctx.strokeStyle = '#e5b338';
    ctx.lineWidth = 3;
    for (let a = 0; a < Math.PI * 2; a += 0.15) {
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.cos(a) * 220, centerY + Math.sin(a) * 220);
      ctx.stroke();
    }

    // Empress Golden Profile / Crown
    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.arc(centerX, centerY - 20, 60, 0, Math.PI * 2);
    ctx.fill();

    // Red ruby tarot frame
    ctx.strokeStyle = '#c0292b';
    ctx.lineWidth = 12;
    ctx.strokeRect(340, 80, 344, 350);

    // Celestial stars & checkerboard grip
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 40; i++) {
      const sx = Math.random() * 1024;
      const sy = Math.random() * 512;
      ctx.fillRect(sx, sy, 3, 3);
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set(key, texture);
    return texture;
  }

  // 9. Karambit Ruby Blade Texture (Screenshot 8, 10)
  public static createKarambitRubyTexture(): THREE.CanvasTexture {
    const key = 'skin_karambit_ruby';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Radiant ruby crystalline gradient
    const grad = ctx.createRadialGradient(256, 256, 40, 256, 256, 256);
    grad.addColorStop(0, '#ff2e63');
    grad.addColorStop(0.4, '#d80032');
    grad.addColorStop(0.8, '#800020');
    grad.addColorStop(1, '#3a000d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Crystalline gemstone facets
    ctx.strokeStyle = 'rgba(255, 180, 200, 0.5)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * 512, Math.random() * 512);
      ctx.lineTo(Math.random() * 512, Math.random() * 512);
      ctx.lineTo(Math.random() * 512, Math.random() * 512);
      ctx.closePath();
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set(key, texture);
    return texture;
  }
}
