// Counter-Strike 2 Bot AI & 3D Character Management
// Phoenix Connexion Terrorists & SAS Counter-Terrorists with Russian names and overhead HUD

import * as THREE from 'three';
import { BotEntity, Team, WeaponType } from '../types/cs2';
import { soundEngine } from '../audio/SoundEngine';

export class BotManager {
  public scene: THREE.Group;
  public bots: BotEntity[] = [];
  public botMeshes: Map<string, THREE.Group> = new Map();
  public overheadLabels: Map<string, THREE.Sprite> = new Map();
  private waypoints: THREE.Vector3[];

  constructor(scene: THREE.Group, waypoints: THREE.Vector3[]) {
    this.scene = scene;
    this.waypoints = waypoints;
    this.initDefaultBots();
  }

  private initDefaultBots() {
    // Exact Russian Bot Names matching Screenshot 12!
    const botConfigs: { name: string; team: Team; weapon: WeaponType; pos: [number, number, number] }[] = [
      { name: 'БОТ Колин', team: 'T', weapon: 'awp', pos: [-6, 1.2, -32] },
      { name: 'БОТ Муха', team: 'T', weapon: 'ak47', pos: [-2, 1.2, -34] },
      { name: 'БОТ Тельсен', team: 'T', weapon: 'ak47', pos: [2, 1.2, -34] },
      { name: 'БОТ Оли', team: 'T', weapon: 'ssg08', pos: [6, 1.2, -32] },
      { name: 'БОТ Семён', team: 'T', weapon: 'deagle', pos: [0, 0, -5] },
      { name: 'БОТ Иван', team: 'CT', weapon: 'm4a4', pos: [-4, 0, 10] },
      { name: 'БОТ Артём', team: 'CT', weapon: 'usp', pos: [4, 0, 15] },
    ];

    botConfigs.forEach((cfg, idx) => {
      const id = `bot_${idx}`;
      const bot: BotEntity = {
        id,
        name: cfg.name,
        team: cfg.team,
        health: 100,
        maxHealth: 100,
        weapon: cfg.weapon,
        position: cfg.pos,
        rotation: Math.PI,
        targetPosition: cfg.pos,
        isAlive: true,
        state: 'patrol',
        lastShotTime: 0,
        patrolWaypointIndex: idx % this.waypoints.length,
        color: cfg.team === 'T' ? '#d4af37' : '#4a90e2'
      };

      this.bots.push(bot);
      const mesh = this.createBot3DMesh(bot);
      mesh.position.set(...bot.position);
      this.scene.add(mesh);
      this.botMeshes.set(id, mesh);

      // Overhead name & health sprite (Screenshot 12)
      const label = this.createOverheadSprite(bot);
      mesh.add(label);
      this.overheadLabels.set(id, label);
    });
  }

  // Create 3D Character Mesh (Phoenix Connexion balaclava or SAS gas mask)
  private createBot3DMesh(bot: BotEntity): THREE.Group {
    const group = new THREE.Group();
    group.name = bot.id;

    const isT = bot.team === 'T';

    // Materials
    const balaclavaMat = new THREE.MeshStandardMaterial({
      color: isT ? 0x2d3a24 : 0x181c22, // Olive balaclava for T, Dark gas mask for CT
      roughness: 0.8
    });

    const shirtMat = new THREE.MeshStandardMaterial({
      color: isT ? 0xd0bfa8 : 0x223344, // Plaid / tan shirt for T, Navy tactical for CT
      roughness: 0.85
    });

    const vestMat = new THREE.MeshStandardMaterial({
      color: 0x8a7b62, // Tan plate carrier vest (Screenshot 1, 12)
      roughness: 0.7,
      metalness: 0.1
    });

    const pantsMat = new THREE.MeshStandardMaterial({
      color: 0x485139, // Olive cargo pants
      roughness: 0.9
    });

    const bootMat = new THREE.MeshStandardMaterial({
      color: 0x221a14,
      roughness: 0.5
    });

    // 1. Head (Balaclava)
    const headGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const head = new THREE.Mesh(headGeo, balaclavaMat);
    head.position.y = 1.65;
    group.add(head);

    // Eye cutout / lenses
    const eyesGeo = new THREE.BoxGeometry(0.16, 0.04, 0.06);
    const eyesMat = new THREE.MeshStandardMaterial({ color: isT ? 0xd9a584 : 0x0088cc, roughness: 0.2, metalness: 0.8 });
    const eyes = new THREE.Mesh(eyesGeo, eyesMat);
    eyes.position.set(0, 1.66, 0.18);
    group.add(eyes);

    // 2. Torso (Tactical Plate Carrier Vest over shirt)
    const torsoGeo = new THREE.BoxGeometry(0.5, 0.65, 0.32);
    const torso = new THREE.Mesh(torsoGeo, vestMat);
    torso.position.y = 1.15;
    group.add(torso);

    // Vest pouches / pouches
    const pouchGeo = new THREE.BoxGeometry(0.12, 0.15, 0.08);
    for (let p = -1; p <= 1; p++) {
      const pouch = new THREE.Mesh(pouchGeo, vestMat);
      pouch.position.set(p * 0.15, 1.05, 0.18);
      group.add(pouch);
    }

    // 3. Legs (Cargo pants)
    const leftLegGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.75, 12);
    const leftLeg = new THREE.Mesh(leftLegGeo, pantsMat);
    leftLeg.position.set(-0.16, 0.45, 0);
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(leftLegGeo.clone(), pantsMat);
    rightLeg.position.set(0.16, 0.45, 0);
    group.add(rightLeg);

    // Boots
    const bootGeo = new THREE.BoxGeometry(0.13, 0.15, 0.22);
    const leftBoot = new THREE.Mesh(bootGeo, bootMat);
    leftBoot.position.set(-0.16, 0.08, 0.04);
    group.add(leftBoot);

    const rightBoot = new THREE.Mesh(bootGeo.clone(), bootMat);
    rightBoot.position.set(0.16, 0.08, 0.04);
    group.add(rightBoot);

    // 4. Arms & Weapon held in hands
    const armGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.55, 12);
    const leftArm = new THREE.Mesh(armGeo, shirtMat);
    leftArm.position.set(-0.32, 1.25, 0.15);
    leftArm.rotation.set(0.8, 0.3, -0.4);
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo.clone(), shirtMat);
    rightArm.position.set(0.32, 1.25, 0.15);
    rightArm.rotation.set(0.8, -0.3, 0.4);
    group.add(rightArm);

    // Held Gun
    const gunGeo = new THREE.BoxGeometry(0.06, 0.1, 0.65);
    const gunMat = new THREE.MeshStandardMaterial({ color: 0x1f2124, metalness: 0.8, roughness: 0.3 });
    const gun = new THREE.Mesh(gunGeo, gunMat);
    gun.position.set(0, 1.2, 0.45);
    group.add(gun);

    return group;
  }

  // Create overhead CS2 Bot Health & Weapon sprite (Screenshot 12)
  private createOverheadSprite(bot: BotEntity): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    this.updateSpriteCanvas(canvas, bot);

    const texture = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(1.4, 0.7, 1);
    sprite.position.set(0, 2.2, 0);
    return sprite;
  }

  private updateSpriteCanvas(canvas: HTMLCanvasElement, bot: BotEntity) {
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, 256, 128);

    if (!bot.isAlive) return;

    // Weapon icon silhouette text
    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('🔫', 128, 35);

    // Russian Bot Name: 'БОТ Колин' (Yellow/Gold for T, Blue for CT)
    ctx.font = 'bold 26px "Arial Black", "Montserrat", sans-serif';
    ctx.fillStyle = bot.team === 'T' ? '#ffcc00' : '#4dabf7';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillText(bot.name, 128, 70);

    // Health Percentage: '100% ▼'
    ctx.font = 'bold 22px sans-serif';
    ctx.fillStyle = bot.health > 50 ? '#ffcc00' : '#ff4444';
    ctx.fillText(`${Math.max(0, Math.round(bot.health))}% ▼`, 128, 100);
  }

  // Update Bot AI Behavior each frame
  public update(delta: number, playerPos: THREE.Vector3, onBotShoot?: (bot: BotEntity) => void) {
    const now = performance.now();

    this.bots.forEach(bot => {
      if (!bot.isAlive) return;

      const mesh = this.botMeshes.get(bot.id);
      if (!mesh) return;

      // Distance to player
      const botPos = new THREE.Vector3(...bot.position);
      const distToPlayer = botPos.distanceTo(playerPos);

      // Bot Behavior States
      if (distToPlayer < 24) {
        // Alert / Combat: Turn towards player
        const angleToPlayer = Math.atan2(playerPos.x - botPos.x, playerPos.z - botPos.z);
        mesh.rotation.y = angleToPlayer;
        bot.rotation = angleToPlayer;

        // Shoot at player every ~1.5 - 2.5 seconds
        if (now - bot.lastShotTime > 1800 + Math.random() * 800) {
          bot.lastShotTime = now;
          this.triggerBotMuzzleFlash(mesh);
          soundEngine.playAK47();
          if (onBotShoot) onBotShoot(bot);
        }
      } else {
        // Patrol Waypoints
        if (this.waypoints.length > 0) {
          const targetWp = this.waypoints[bot.patrolWaypointIndex];
          const dir = new THREE.Vector3().subVectors(targetWp, botPos);
          dir.y = 0;

          if (dir.length() < 1.0) {
            bot.patrolWaypointIndex = (bot.patrolWaypointIndex + 1) % this.waypoints.length;
          } else {
            dir.normalize();
            bot.position[0] += dir.x * 1.8 * delta;
            bot.position[2] += dir.z * 1.8 * delta;
            mesh.position.set(...bot.position);
            mesh.rotation.y = Math.atan2(dir.x, dir.z);
          }
        }
      }
    });
  }

  private triggerBotMuzzleFlash(botMesh: THREE.Group) {
    const flash = new THREE.PointLight(0xffaa22, 4, 6);
    flash.position.set(0, 1.2, 0.8);
    botMesh.add(flash);
    setTimeout(() => {
      botMesh.remove(flash);
    }, 60);
  }

  // Player hits bot
  public damageBot(botId: string, damage: number, isHeadshot: boolean): { isDead: boolean; bot: BotEntity } | null {
    const bot = this.bots.find(b => b.id === botId);
    if (!bot || !bot.isAlive) return null;

    bot.health -= damage;
    const mesh = this.botMeshes.get(botId);

    // Update overhead label
    const sprite = this.overheadLabels.get(botId);
    if (sprite) {
      const tex = sprite.material.map as THREE.CanvasTexture;
      if (tex && tex.image) {
        this.updateSpriteCanvas(tex.image, bot);
        tex.needsUpdate = true;
      }
    }

    if (bot.health <= 0) {
      bot.health = 0;
      bot.isAlive = false;
      bot.state = 'dead';

      // Fall / ragdoll death animation
      if (mesh) {
        mesh.rotation.x = Math.PI / 2;
        mesh.position.y = 0.2;
        if (sprite) mesh.remove(sprite);
      }

      return { isDead: true, bot };
    }

    return { isDead: false, bot };
  }
}
