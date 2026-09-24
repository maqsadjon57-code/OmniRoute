// Counter-Strike 2 Source 2 Particle System
// Bullet impact sparks, stone dust, blood decals, casing ejection, muzzle flame

import * as THREE from 'three';

export interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: THREE.Color;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  gravity: number;
  type: 'spark' | 'smoke' | 'blood' | 'casing';
  rotation?: number;
  rotSpeed?: number;
}

export class ParticleSystem {
  public particles: Particle[] = [];
  public group: THREE.Group;
  private sparkGeo: THREE.BufferGeometry;
  private sparkMat: THREE.PointsMaterial;
  private sparkPoints: THREE.Points;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'particle_system';

    // Particle Points Buffer
    const maxParticles = 1000;
    this.sparkGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(maxParticles * 3);
    const colors = new Float32Array(maxParticles * 3);

    this.sparkGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.sparkGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.sparkMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.sparkPoints = new THREE.Points(this.sparkGeo, this.sparkMat);
    this.group.add(this.sparkPoints);
  }

  // Bullet impact on stone / wall
  public spawnImpactSparks(point: THREE.Vector3, normal: THREE.Vector3) {
    for (let i = 0; i < 15; i++) {
      const spread = new THREE.Vector3(
        normal.x + (Math.random() - 0.5) * 1.5,
        normal.y + Math.random() * 1.5,
        normal.z + (Math.random() - 0.5) * 1.5
      ).normalize();

      this.particles.push({
        position: point.clone(),
        velocity: spread.multiplyScalar(4 + Math.random() * 5),
        color: new THREE.Color(1.0, 0.7, 0.2), // Bright orange/yellow spark
        size: 0.06 + Math.random() * 0.06,
        alpha: 1.0,
        life: 0,
        maxLife: 0.25 + Math.random() * 0.2,
        gravity: 12,
        type: 'spark'
      });
    }

    // Concrete dust puff
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        position: point.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2)),
        velocity: new THREE.Vector3((Math.random() - 0.5) * 1.5, Math.random() * 1.8, (Math.random() - 0.5) * 1.5),
        color: new THREE.Color(0.85, 0.78, 0.68), // Sandstone dust
        size: 0.25 + Math.random() * 0.3,
        alpha: 0.6,
        life: 0,
        maxLife: 0.6 + Math.random() * 0.4,
        gravity: -0.5,
        type: 'smoke'
      });
    }
  }

  // Blood splatter on bot hit
  public spawnBloodSplatter(point: THREE.Vector3) {
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        position: point.clone(),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.2) * 4,
          (Math.random() - 0.5) * 4
        ),
        color: new THREE.Color(0.65, 0.02, 0.02), // Dark crimson blood
        size: 0.09,
        alpha: 0.95,
        life: 0,
        maxLife: 0.4 + Math.random() * 0.3,
        gravity: 14,
        type: 'blood'
      });
    }
  }

  // Shell Casing Ejection
  public spawnBrassCasing(origin: THREE.Vector3, dir: THREE.Vector3) {
    this.particles.push({
      position: origin.clone(),
      velocity: dir.clone().multiplyScalar(3.5).add(new THREE.Vector3(0, 2.5, 0)),
      color: new THREE.Color(0.9, 0.75, 0.2), // Polished brass
      size: 0.04,
      alpha: 1.0,
      life: 0,
      maxLife: 1.2,
      gravity: 15,
      type: 'casing',
      rotation: 0,
      rotSpeed: 25
    });
  }

  public update(delta: number) {
    const posAttr = this.sparkGeo.getAttribute('position') as THREE.BufferAttribute;
    const colAttr = this.sparkGeo.getAttribute('color') as THREE.BufferAttribute;

    const posArray = posAttr.array as Float32Array;
    const colArray = colAttr.array as Float32Array;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += delta;

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }

      // Physics
      p.velocity.y -= p.gravity * delta;
      p.position.addScaledVector(p.velocity, delta);

      // Floor bounce for casings
      if (p.type === 'casing' && p.position.y < 0.02) {
        p.position.y = 0.02;
        p.velocity.y *= -0.4;
        p.velocity.x *= 0.6;
        p.velocity.z *= 0.6;
      }

      // Fade out
      const progress = p.life / p.maxLife;
      p.alpha = 1 - progress;
    }

    // Write particles into GPU Buffer
    const count = Math.min(this.particles.length, posArray.length / 3);
    for (let i = 0; i < count; i++) {
      const p = this.particles[i];
      posArray[i * 3] = p.position.x;
      posArray[i * 3 + 1] = p.position.y;
      posArray[i * 3 + 2] = p.position.z;

      colArray[i * 3] = p.color.r * p.alpha;
      colArray[i * 3 + 1] = p.color.g * p.alpha;
      colArray[i * 3 + 2] = p.color.b * p.alpha;
    }

    // Zero out unused slots
    for (let i = count; i < posArray.length / 3; i++) {
      posArray[i * 3] = 0;
      posArray[i * 3 + 1] = -9999;
      posArray[i * 3 + 2] = 0;
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  }
}
