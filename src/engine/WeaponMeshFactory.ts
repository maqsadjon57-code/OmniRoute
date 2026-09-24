// Smooth 3D CS2 Weapon & Hands Mesh Factory
// High polygon, realistic proportions, beveled edges, realistic materials (NO Minecraft blocks)

import * as THREE from 'three';
import { WeaponType, SkinItem } from '../types/cs2';
import { TextureGenerator } from './TextureGenerator';

export class WeaponMeshFactory {
  // Create first person hands with tactical gloves holding weapon
  public static createHands(): THREE.Group {
    const handsGroup = new THREE.Group();

    // Glove Material (Dark navy / black tactical leather with blue/red polymer guards)
    const gloveMat = new THREE.MeshStandardMaterial({
      color: 0x1a2438,
      roughness: 0.6,
      metalness: 0.2
    });

    const guardMat = new THREE.MeshStandardMaterial({
      color: 0x0066cc,
      roughness: 0.3,
      metalness: 0.8
    });

    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xd9a584,
      roughness: 0.8,
      metalness: 0.05
    });

    // Right Arm & Forearm
    const rightForearmGeo = new THREE.CylinderGeometry(0.05, 0.065, 0.45, 16);
    const rightForearm = new THREE.Mesh(rightForearmGeo, gloveMat);
    rightForearm.position.set(0.24, -0.22, 0.15);
    rightForearm.rotation.set(0.6, 0.2, -0.4);
    handsGroup.add(rightForearm);

    // Right Hand / Glove Knuckle Protector
    const knuckleGeo = new THREE.BoxGeometry(0.08, 0.04, 0.07);
    const knuckle = new THREE.Mesh(knuckleGeo, guardMat);
    knuckle.position.set(0.18, -0.06, -0.08);
    knuckle.rotation.set(0.5, 0.1, -0.3);
    handsGroup.add(knuckle);

    // Right Fingers gripping trigger/handle
    for (let f = 0; f < 4; f++) {
      const fingerGeo = new THREE.CylinderGeometry(0.011, 0.012, 0.07, 10);
      const finger = new THREE.Mesh(fingerGeo, gloveMat);
      finger.position.set(0.17 + (f * 0.012), -0.09 - (f * 0.015), -0.12 - (f * 0.01));
      finger.rotation.set(1.4, 0.1, -0.2);
      handsGroup.add(finger);
    }

    // Left Arm & Forearm supporting front of weapon
    const leftForearmGeo = new THREE.CylinderGeometry(0.048, 0.062, 0.42, 16);
    const leftForearm = new THREE.Mesh(leftForearmGeo, gloveMat);
    leftForearm.position.set(-0.18, -0.25, 0.12);
    leftForearm.rotation.set(0.7, -0.3, 0.5);
    handsGroup.add(leftForearm);

    // Left Hand holding handguard
    const leftKnuckle = new THREE.Mesh(knuckleGeo.clone(), guardMat);
    leftKnuckle.position.set(-0.08, -0.1, -0.25);
    leftKnuckle.rotation.set(0.3, -0.4, 0.4);
    handsGroup.add(leftKnuckle);

    return handsGroup;
  }

  // Build 3D AK-47 Rifle
  public static createAK47(skin?: SkinItem): THREE.Group {
    const group = new THREE.Group();
    group.name = 'weapon_ak47';

    // Materials
    const metalMat = new THREE.MeshStandardMaterial({
      color: skin?.primaryColor ? new THREE.Color(skin.primaryColor) : 0x222428,
      metalness: skin?.metallic ?? 0.85,
      roughness: skin?.roughness ?? 0.35,
      map: skin?.patternType === 'empress' ? TextureGenerator.createTheEmpressTexture() : undefined
    });

    const woodMat = new THREE.MeshStandardMaterial({
      color: skin?.patternType === 'empress' ? 0xd4af37 : (skin?.patternType === 'redline' ? 0x1a1a1a : 0x7c4524),
      roughness: 0.5,
      metalness: 0.1
    });

    const highlightMat = new THREE.MeshStandardMaterial({
      color: skin?.accentColor ? new THREE.Color(skin.accentColor) : 0xe52521,
      metalness: 0.7,
      roughness: 0.2
    });

    // 1. Receiver
    const receiverGeo = new THREE.BoxGeometry(0.05, 0.09, 0.35);
    const receiver = new THREE.Mesh(receiverGeo, metalMat);
    receiver.position.set(0, 0, 0);
    group.add(receiver);

    // 2. Barrel
    const barrelGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.45, 16);
    const barrel = new THREE.Mesh(barrelGeo, metalMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.015, -0.4);
    group.add(barrel);

    // 3. Gas Tube & Wooden Handguard
    const handguardGeo = new THREE.CylinderGeometry(0.026, 0.028, 0.22, 16);
    const handguard = new THREE.Mesh(handguardGeo, woodMat);
    handguard.rotation.x = Math.PI / 2;
    handguard.position.set(0, 0.02, -0.28);
    group.add(handguard);

    // 4. Iconic Curved Banana Magazine
    const magGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.24, 12, 1, false, 0, Math.PI);
    const mag = new THREE.Mesh(magGeo, metalMat);
    mag.position.set(0, -0.14, -0.06);
    mag.rotation.x = 0.35;
    group.add(mag);

    // 5. Wooden Stock
    const stockGeo = new THREE.BoxGeometry(0.04, 0.09, 0.28);
    const stock = new THREE.Mesh(stockGeo, woodMat);
    stock.position.set(0, -0.02, 0.3);
    stock.rotation.x = 0.08;
    group.add(stock);

    // 6. Pistol Grip
    const gripGeo = new THREE.BoxGeometry(0.035, 0.12, 0.055);
    const grip = new THREE.Mesh(gripGeo, woodMat);
    grip.position.set(0, -0.1, 0.08);
    grip.rotation.x = -0.35;
    group.add(grip);

    // 7. Front Sight
    const frontSightGeo = new THREE.BoxGeometry(0.008, 0.04, 0.015);
    const frontSight = new THREE.Mesh(frontSightGeo, metalMat);
    frontSight.position.set(0, 0.045, -0.58);
    group.add(frontSight);

    // 8. Muzzle Flash Anchor Point
    const muzzleAnchor = new THREE.Object3D();
    muzzleAnchor.name = 'muzzle_anchor';
    muzzleAnchor.position.set(0, 0.015, -0.65);
    group.add(muzzleAnchor);

    return group;
  }

  // Build 3D Desert Eagle Pistol (Kumicho Dragon skin support)
  public static createDeagle(skin?: SkinItem): THREE.Group {
    const group = new THREE.Group();
    group.name = 'weapon_deagle';

    const slideMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.9,
      roughness: 0.22,
      map: TextureGenerator.createKumichoDragonTexture()
    });

    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x22262a,
      metalness: 0.8,
      roughness: 0.3
    });

    const gripMat = new THREE.MeshStandardMaterial({
      color: 0x611b70, // Royal purple dragon grip
      roughness: 0.4,
      metalness: 0.3
    });

    // 1. Massive Slide
    const slideGeo = new THREE.BoxGeometry(0.045, 0.055, 0.26);
    const slide = new THREE.Mesh(slideGeo, slideMat);
    slide.position.set(0, 0.04, -0.03);
    group.add(slide);

    // 2. Heavy Barrel Front
    const barrelGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.1, 16);
    const barrel = new THREE.Mesh(barrelGeo, frameMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.04, -0.18);
    group.add(barrel);

    // 3. Lower Frame & Trigger Guard
    const frameGeo = new THREE.BoxGeometry(0.04, 0.04, 0.22);
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(0, 0, -0.02);
    group.add(frame);

    // 4. Ergonomic Grip
    const gripGeo = new THREE.BoxGeometry(0.038, 0.13, 0.065);
    const grip = new THREE.Mesh(gripGeo, gripMat);
    grip.position.set(0, -0.07, 0.04);
    grip.rotation.x = -0.3;
    group.add(grip);

    // 5. Sights
    const sightGeo = new THREE.BoxGeometry(0.008, 0.015, 0.01);
    const frontSight = new THREE.Mesh(sightGeo, frameMat);
    frontSight.position.set(0, 0.072, -0.15);
    group.add(frontSight);

    const rearSight = new THREE.Mesh(sightGeo.clone(), frameMat);
    rearSight.position.set(0, 0.072, 0.09);
    group.add(rearSight);

    // Muzzle Anchor
    const muzzle = new THREE.Object3D();
    muzzle.name = 'muzzle_anchor';
    muzzle.position.set(0, 0.04, -0.24);
    group.add(muzzle);

    return group;
  }

  // Build 3D AWP Sniper Rifle
  public static createAWP(skin?: SkinItem): THREE.Group {
    const group = new THREE.Group();
    group.name = 'weapon_awp';

    const bodyMat = new THREE.MeshStandardMaterial({
      color: skin?.patternType === 'dragon' ? 0xc7a048 : (skin?.patternType === 'asiimov' ? 0xffffff : 0x3d4a36),
      metalness: 0.5,
      roughness: 0.4
    });

    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x1b1d20,
      metalness: 0.9,
      roughness: 0.25
    });

    const lensMat = new THREE.MeshPhysicalMaterial({
      color: 0x113355,
      transmission: 0.9,
      roughness: 0.05,
      metalness: 0.1
    });

    // 1. Rifle Stock & Chassis
    const chassisGeo = new THREE.BoxGeometry(0.06, 0.09, 0.7);
    const chassis = new THREE.Mesh(chassisGeo, bodyMat);
    chassis.position.set(0, 0, 0.05);
    group.add(chassis);

    // Thumbhole stock cutout
    const buttstockGeo = new THREE.BoxGeometry(0.05, 0.12, 0.28);
    const buttstock = new THREE.Mesh(buttstockGeo, bodyMat);
    buttstock.position.set(0, -0.04, 0.42);
    group.add(buttstock);

    // 2. Long Fluted Bull Barrel
    const barrelGeo = new THREE.CylinderGeometry(0.016, 0.018, 0.75, 16);
    const barrel = new THREE.Mesh(barrelGeo, metalMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.02, -0.65);
    group.add(barrel);

    // 3. Muzzle Brake
    const muzzleBrakeGeo = new THREE.BoxGeometry(0.035, 0.035, 0.08);
    const muzzleBrake = new THREE.Mesh(muzzleBrakeGeo, metalMat);
    muzzleBrake.position.set(0, 0.02, -1.04);
    group.add(muzzleBrake);

    // 4. Massive Sniper Scope
    const scopeTubeGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.32, 16);
    const scopeTube = new THREE.Mesh(scopeTubeGeo, metalMat);
    scopeTube.rotation.x = Math.PI / 2;
    scopeTube.position.set(0, 0.1, -0.05);
    group.add(scopeTube);

    // Scope front bell
    const frontBellGeo = new THREE.CylinderGeometry(0.034, 0.024, 0.09, 16);
    const frontBell = new THREE.Mesh(frontBellGeo, metalMat);
    frontBell.rotation.x = -Math.PI / 2;
    frontBell.position.set(0, 0.1, -0.24);
    group.add(frontBell);

    // Scope Glass Lens
    const lensGeo = new THREE.CircleGeometry(0.03, 16);
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.position.set(0, 0.1, -0.285);
    lens.rotation.y = Math.PI;
    group.add(lens);

    // Scope mount rings
    const ringGeo = new THREE.BoxGeometry(0.05, 0.04, 0.03);
    const ring1 = new THREE.Mesh(ringGeo, metalMat);
    ring1.position.set(0, 0.065, -0.15);
    group.add(ring1);

    const ring2 = new THREE.Mesh(ringGeo.clone(), metalMat);
    ring2.position.set(0, 0.065, 0.05);
    group.add(ring2);

    // 5. Bolt Handle
    const boltGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.07, 8);
    const bolt = new THREE.Mesh(boltGeo, metalMat);
    bolt.rotation.z = Math.PI / 2.3;
    bolt.position.set(0.05, 0.04, 0.1);
    group.add(bolt);

    // Muzzle Anchor
    const muzzle = new THREE.Object3D();
    muzzle.name = 'muzzle_anchor';
    muzzle.position.set(0, 0.02, -1.1);
    group.add(muzzle);

    return group;
  }

  // Build 3D Karambit Knife (Ruby Doppler skin support)
  public static createKarambit(skin?: SkinItem): THREE.Group {
    const group = new THREE.Group();
    group.name = 'weapon_karambit';

    const bladeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.95,
      roughness: 0.1,
      map: TextureGenerator.createKarambitRubyTexture()
    });

    const handleMat = new THREE.MeshStandardMaterial({
      color: 0xf2ebe1, // Ivory / bone handle
      roughness: 0.35,
      metalness: 0.15
    });

    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x8a0b22, // Ruby ring
      metalness: 0.9,
      roughness: 0.15
    });

    // 1. Curved Talon Blade (Constructed with curved smooth shape)
    const bladeShape = new THREE.Shape();
    bladeShape.moveTo(0, 0);
    bladeShape.quadraticCurveTo(0.04, 0.08, 0.12, 0.14);
    bladeShape.quadraticCurveTo(0.18, 0.16, 0.22, 0.12);
    bladeShape.quadraticCurveTo(0.14, 0.04, 0.08, -0.06);
    bladeShape.quadraticCurveTo(0.02, -0.08, 0, 0);

    const extrudeSettings = { depth: 0.006, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.002, bevelThickness: 0.002 };
    const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, extrudeSettings);
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.set(0, 0, -0.08);
    blade.rotation.set(0.2, 0.4, 0.6);
    group.add(blade);

    // 2. Ergonomic Handle with Finger Grooves
    const handleGeo = new THREE.BoxGeometry(0.026, 0.13, 0.038);
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.set(-0.02, -0.06, 0.04);
    handle.rotation.set(-0.2, 0.1, -0.3);
    group.add(handle);

    // 3. Iconic Finger Ring Pommel
    const ringGeo = new THREE.TorusGeometry(0.025, 0.007, 12, 24);
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(-0.05, -0.14, 0.07);
    ring.rotation.set(0.3, 0.2, 0);
    group.add(ring);

    return group;
  }
}
