// Counter-Strike 2 First-Person Controller & Weapon Animation Engine
// Smooth movement, recoil patterns, inspect animations ('F'), hitscan raycasting, scope zoom, particles

import * as THREE from 'three';
import { WeaponType, SkinItem, KillfeedEvent } from '../types/cs2';
import { WeaponMeshFactory } from './WeaponMeshFactory';
import { soundEngine } from '../audio/SoundEngine';
import { BotManager } from './BotManager';
import { ParticleSystem } from './ParticleSystem';

export class FPSController {
  public camera: THREE.PerspectiveCamera;
  public domElement: HTMLElement;
  public isLocked: boolean = false;

  // Player position & physics
  public position: THREE.Vector3 = new THREE.Vector3(0, 1.8, 25);
  private velocity: THREE.Vector3 = new THREE.Vector3();
  private pitch: number = 0;
  private yaw: number = 0;
  private isGrounded: boolean = true;
  private isCrouching: boolean = false;

  // Controls input
  private keys: Record<string, boolean> = {};

  // Current Weapon & Viewmodel
  public currentWeaponType: WeaponType = 'ak47';
  public currentSkin: SkinItem | undefined;
  public viewmodelGroup: THREE.Group;
  public handsGroup: THREE.Group | null = null;
  public currentWeaponMesh: THREE.Group | null = null;

  // Animation States
  public isInspecting: boolean = false;
  private inspectTime: number = 0;
  public isReloading: boolean = false;
  private reloadTime: number = 0;
  public isScoped: boolean = false;
  public scopeLevel: number = 0; // 0 = none, 1 = 2.5x, 2 = 6x

  // Recoil & Sway
  private recoilPitch: number = 0;
  private recoilYaw: number = 0;
  private walkBobTime: number = 0;

  // External Systems
  private botManager: BotManager | null = null;
  private mapColliders: THREE.Box3[] = [];
  private particleSystem: ParticleSystem | null = null;

  // Callbacks
  public onShoot?: (ammoLeft: number) => void;
  public onKill?: (event: KillfeedEvent) => void;
  public onHit?: (isHeadshot: boolean, damage: number) => void;
  public onToggleBuyMenu?: () => void;
  public onToggleScoreboard?: (show: boolean) => void;

  // Ammo tracking
  public ammo: Record<WeaponType, { current: number; max: number; reserve: number }> = {
    'ak47': { current: 30, max: 30, reserve: 90 },
    'deagle': { current: 7, max: 7, reserve: 35 },
    'awp': { current: 5, max: 5, reserve: 30 },
    'm4a4': { current: 30, max: 30, reserve: 90 },
    'm4a1s': { current: 20, max: 20, reserve: 80 },
    'glock': { current: 20, max: 20, reserve: 120 },
    'usp': { current: 12, max: 12, reserve: 24 },
    'knife-karambit': { current: 1, max: 1, reserve: 0 },
    'knife-butterfly': { current: 1, max: 1, reserve: 0 },
    'knife-bayonet': { current: 1, max: 1, reserve: 0 },
    'knife-flip': { current: 1, max: 1, reserve: 0 },
    'p250': { current: 13, max: 13, reserve: 26 },
    'dual-berettas': { current: 30, max: 30, reserve: 120 },
    'tec9': { current: 18, max: 18, reserve: 90 },
    'nova': { current: 8, max: 8, reserve: 32 },
    'xm1014': { current: 7, max: 7, reserve: 32 },
    'mp5sd': { current: 30, max: 30, reserve: 120 },
    'p90': { current: 50, max: 50, reserve: 100 },
    'mac10': { current: 30, max: 30, reserve: 100 },
    'mp9': { current: 30, max: 30, reserve: 120 },
    'galil': { current: 35, max: 35, reserve: 90 },
    'famas': { current: 25, max: 25, reserve: 90 },
    'ssg08': { current: 10, max: 10, reserve: 90 },
    'sg553': { current: 30, max: 30, reserve: 90 },
    'aug': { current: 30, max: 30, reserve: 90 },
    'flashbang': { current: 2, max: 2, reserve: 0 },
    'smokegrenade': { current: 1, max: 1, reserve: 0 },
    'hegrenade': { current: 1, max: 1, reserve: 0 },
    'molotov': { current: 1, max: 1, reserve: 0 },
    'decoy': { current: 1, max: 1, reserve: 0 },
    'armor': { current: 0, max: 0, reserve: 0 },
    'helmet': { current: 0, max: 0, reserve: 0 },
    'zeus': { current: 1, max: 1, reserve: 0 },
    'defuser': { current: 0, max: 0, reserve: 0 }
  };

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    this.camera = camera;
    this.domElement = domElement;

    // Viewmodel container attached to camera
    this.viewmodelGroup = new THREE.Group();
    this.camera.add(this.viewmodelGroup);

    this.setupEventListeners();
    this.equipWeapon('ak47');
  }

  public setBotManager(bm: BotManager) {
    this.botManager = bm;
  }

  public setMapColliders(colliders: THREE.Box3[]) {
    this.mapColliders = colliders;
  }

  public setParticleSystem(ps: ParticleSystem) {
    this.particleSystem = ps;
  }

  private setupEventListeners() {
    this.domElement.addEventListener('click', () => {
      if (!this.isLocked) {
        this.domElement.requestPointerLock();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.isLocked = document.pointerLockElement === this.domElement;
    });

    document.addEventListener('mousemove', (e) => {
      if (!this.isLocked) return;

      const sensitivity = 0.0022;
      this.yaw -= e.movementX * sensitivity;
      this.pitch -= e.movementY * sensitivity;
      this.pitch = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, this.pitch));
    });

    document.addEventListener('mousedown', (e) => {
      if (!this.isLocked) return;

      if (e.button === 0) {
        this.fireWeapon();
      } else if (e.button === 2) {
        this.secondaryAction();
      }
    });

    document.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      if (e.code === 'KeyF' && !this.isReloading) {
        this.triggerInspect();
      }

      if (e.code === 'KeyR' && !this.isReloading) {
        this.reloadWeapon();
      }

      if (e.code === 'Digit1') this.equipWeapon('ak47');
      if (e.code === 'Digit2') this.equipWeapon('deagle');
      if (e.code === 'Digit3') this.equipWeapon('knife-karambit');
      if (e.code === 'Digit4') this.equipWeapon('hegrenade');

      if (e.code === 'KeyB') {
        if (this.onToggleBuyMenu) this.onToggleBuyMenu();
      }

      if (e.code === 'Tab') {
        e.preventDefault();
        if (this.onToggleScoreboard) this.onToggleScoreboard(true);
      }
    });

    document.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;

      if (e.code === 'Tab') {
        if (this.onToggleScoreboard) this.onToggleScoreboard(false);
      }
    });
  }

  public equipWeapon(type: WeaponType, skin?: SkinItem) {
    this.currentWeaponType = type;
    this.currentSkin = skin;
    this.isInspecting = false;
    this.isReloading = false;
    this.isScoped = false;
    this.scopeLevel = 0;
    this.camera.fov = 75;
    this.camera.updateProjectionMatrix();

    while (this.viewmodelGroup.children.length > 0) {
      this.viewmodelGroup.remove(this.viewmodelGroup.children[0]);
    }

    this.handsGroup = WeaponMeshFactory.createHands();
    this.viewmodelGroup.add(this.handsGroup);

    if (type === 'ak47') {
      this.currentWeaponMesh = WeaponMeshFactory.createAK47(skin);
      this.currentWeaponMesh.position.set(0.24, -0.22, -0.42);
    } else if (type === 'deagle') {
      this.currentWeaponMesh = WeaponMeshFactory.createDeagle(skin);
      this.currentWeaponMesh.position.set(0.2, -0.18, -0.36);
    } else if (type === 'awp') {
      this.currentWeaponMesh = WeaponMeshFactory.createAWP(skin);
      this.currentWeaponMesh.position.set(0.22, -0.2, -0.48);
    } else if (type === 'knife-karambit') {
      this.currentWeaponMesh = WeaponMeshFactory.createKarambit(skin);
      this.currentWeaponMesh.position.set(0.18, -0.16, -0.32);
      soundEngine.playKnifeDraw();
    } else {
      this.currentWeaponMesh = WeaponMeshFactory.createAK47(skin);
      this.currentWeaponMesh.position.set(0.24, -0.22, -0.42);
    }

    if (this.currentWeaponMesh) {
      this.viewmodelGroup.add(this.currentWeaponMesh);
    }
  }

  public triggerInspect() {
    this.isInspecting = true;
    this.inspectTime = 0;
    if (this.currentWeaponType.startsWith('knife')) {
      soundEngine.playKnifeSlash();
    }
  }

  public reloadWeapon() {
    const ammoData = this.ammo[this.currentWeaponType];
    if (!ammoData || ammoData.current >= ammoData.max || ammoData.reserve <= 0) return;

    this.isReloading = true;
    this.isInspecting = false;
    this.reloadTime = 0;
    soundEngine.playReload();

    setTimeout(() => {
      const needed = ammoData.max - ammoData.current;
      const amount = Math.min(needed, ammoData.reserve);
      ammoData.current += amount;
      ammoData.reserve -= amount;
      this.isReloading = false;
      if (this.onShoot) this.onShoot(ammoData.current);
    }, 1800);
  }

  public fireWeapon() {
    if (this.isReloading) return;

    const ammoData = this.ammo[this.currentWeaponType];
    if (ammoData && ammoData.current <= 0) {
      soundEngine.playBuyError();
      this.reloadWeapon();
      return;
    }

    if (ammoData && !this.currentWeaponType.startsWith('knife')) {
      ammoData.current--;
      if (this.onShoot) this.onShoot(ammoData.current);
    }

    if (this.currentWeaponType === 'ak47') {
      soundEngine.playAK47();
      this.recoilPitch += 0.05;
      this.recoilYaw += (Math.random() - 0.5) * 0.02;
    } else if (this.currentWeaponType === 'deagle') {
      soundEngine.playDeagle();
      this.recoilPitch += 0.08;
    } else if (this.currentWeaponType === 'awp') {
      soundEngine.playAWP();
      this.recoilPitch += 0.12;
      if (this.isScoped) {
        this.isScoped = false;
        this.scopeLevel = 0;
        this.camera.fov = 75;
        this.camera.updateProjectionMatrix();
      }
    } else if (this.currentWeaponType.startsWith('knife')) {
      soundEngine.playKnifeSlash();
    }

    this.isInspecting = false;

    if (this.currentWeaponMesh) {
      this.currentWeaponMesh.position.z += 0.04;
      this.currentWeaponMesh.rotation.x -= 0.12;
      this.triggerMuzzleFlash();
    }

    // Spawn brass shell casing
    if (this.particleSystem && !this.currentWeaponType.startsWith('knife')) {
      const rightDir = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
      this.particleSystem.spawnBrassCasing(this.position, rightDir);
    }

    this.performHitscan();
  }

  private secondaryAction() {
    if (this.currentWeaponType === 'awp') {
      this.scopeLevel = (this.scopeLevel + 1) % 3;
      if (this.scopeLevel === 1) {
        this.isScoped = true;
        this.camera.fov = 30;
        this.viewmodelGroup.visible = false;
      } else if (this.scopeLevel === 2) {
        this.isScoped = true;
        this.camera.fov = 12;
        this.viewmodelGroup.visible = false;
      } else {
        this.isScoped = false;
        this.camera.fov = 75;
        this.viewmodelGroup.visible = true;
      }
      this.camera.updateProjectionMatrix();
      soundEngine.playClick();
    } else if (this.currentWeaponType.startsWith('knife')) {
      soundEngine.playKnifeSlash();
      this.performHitscan(true);
    }
  }

  private triggerMuzzleFlash() {
    if (!this.currentWeaponMesh) return;
    const flash = new THREE.PointLight(0xffcc44, 5, 8);
    flash.position.set(0.24, -0.2, -0.9);
    this.viewmodelGroup.add(flash);
    setTimeout(() => {
      this.viewmodelGroup.remove(flash);
    }, 45);
  }

  private performHitscan(isStab: boolean = false) {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);

    if (this.botManager) {
      let closestHit: { botId: string; distance: number; isHeadshot: boolean; point: THREE.Vector3 } | null = null;

      this.botManager.bots.forEach(bot => {
        if (!bot.isAlive) return;
        const mesh = this.botManager!.botMeshes.get(bot.id);
        if (!mesh) return;

        const intersects = raycaster.intersectObject(mesh, true);
        if (intersects.length > 0) {
          const hit = intersects[0];
          const isHeadshot = hit.point.y >= 1.55;

          if (!closestHit || hit.distance < closestHit.distance) {
            closestHit = { botId: bot.id, distance: hit.distance, isHeadshot, point: hit.point };
          }
        }
      });

      if (closestHit) {
        const damage = (closestHit as { isHeadshot: boolean }).isHeadshot ? 140 : (isStab ? 65 : 34);
        if ((closestHit as { isHeadshot: boolean }).isHeadshot) {
          soundEngine.playHeadshotDink();
        } else {
          soundEngine.playHitmarker();
        }

        // Blood particles
        if (this.particleSystem) {
          this.particleSystem.spawnBloodSplatter((closestHit as { point: THREE.Vector3 }).point);
        }

        if (this.onHit) this.onHit((closestHit as { isHeadshot: boolean }).isHeadshot, damage);

        const result = this.botManager.damageBot((closestHit as { botId: string }).botId, damage, (closestHit as { isHeadshot: boolean }).isHeadshot);
        if (result && result.isDead) {
          if (this.onKill) {
            this.onKill({
              id: `kill_${Date.now()}`,
              killer: 'JediMindTricks',
              killerTeam: 'CT',
              victim: result.bot.name,
              victimTeam: result.bot.team,
              weapon: this.currentWeaponType,
              weaponName: this.currentWeaponType.toUpperCase(),
              isHeadshot: (closestHit as { isHeadshot: boolean }).isHeadshot,
              isWallbang: false,
              isNoScope: !this.isScoped && this.currentWeaponType === 'awp',
              isThroughSmoke: false,
              timestamp: Date.now()
            });
          }
        }
        return;
      }
    }

    // If no bot hit, hit wall / ground and spawn sparks
    if (this.particleSystem) {
      const hitPoint = this.position.clone().add(raycaster.ray.direction.clone().multiplyScalar(20));
      this.particleSystem.spawnImpactSparks(hitPoint, new THREE.Vector3(0, 1, 0));
    }
  }

  public update(delta: number) {
    if (!this.isLocked) return;

    this.recoilPitch = THREE.MathUtils.lerp(this.recoilPitch, 0, delta * 12);
    this.recoilYaw = THREE.MathUtils.lerp(this.recoilYaw, 0, delta * 12);

    this.camera.rotation.set(0, 0, 0);
    this.camera.rotation.y = this.yaw + this.recoilYaw;
    this.camera.rotation.x = this.pitch + this.recoilPitch;

    const moveSpeed = (this.keys['ShiftLeft'] ? 3.0 : (this.isCrouching ? 2.2 : 6.0));
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);

    const moveDir = new THREE.Vector3();
    if (this.keys['KeyW']) moveDir.add(forward);
    if (this.keys['KeyS']) moveDir.sub(forward);
    if (this.keys['KeyD']) moveDir.add(right);
    if (this.keys['KeyA']) moveDir.sub(right);

    if (moveDir.lengthSq() > 0) {
      moveDir.normalize();
      this.position.addScaledVector(moveDir, moveSpeed * delta);
      this.walkBobTime += delta * (this.keys['ShiftLeft'] ? 6 : 11);
    }

    this.isCrouching = !!this.keys['ControlLeft'];
    const targetY = (this.isCrouching ? 1.2 : 1.8) + (this.position.z < -18 ? 1.2 : 0);
    this.position.y = THREE.MathUtils.lerp(this.position.y, targetY, delta * 10);

    this.position.x = Math.max(-13, Math.min(13, this.position.x));
    this.position.z = Math.max(-38, Math.min(35, this.position.z));

    this.camera.position.copy(this.position);

    if (this.currentWeaponMesh) {
      this.currentWeaponMesh.position.z = THREE.MathUtils.lerp(this.currentWeaponMesh.position.z, -0.42, delta * 15);
      this.currentWeaponMesh.rotation.x = THREE.MathUtils.lerp(this.currentWeaponMesh.rotation.x, 0, delta * 15);

      const bobX = Math.cos(this.walkBobTime) * 0.008;
      const bobY = Math.sin(this.walkBobTime * 2) * 0.008;

      if (this.isInspecting) {
        this.inspectTime += delta * 2.2;
        const inspectRotY = Math.sin(this.inspectTime) * 0.75;
        const inspectRotZ = Math.cos(this.inspectTime * 0.8) * 0.35;
        this.currentWeaponMesh.rotation.y = inspectRotY;
        this.currentWeaponMesh.rotation.z = inspectRotZ;

        if (this.inspectTime > Math.PI * 2) {
          this.isInspecting = false;
        }
      } else {
        this.currentWeaponMesh.rotation.y = THREE.MathUtils.lerp(this.currentWeaponMesh.rotation.y, 0, delta * 10);
        this.currentWeaponMesh.rotation.z = THREE.MathUtils.lerp(this.currentWeaponMesh.rotation.z, 0, delta * 10);
      }

      this.viewmodelGroup.position.set(bobX, bobY, 0);
    }
  }
}
