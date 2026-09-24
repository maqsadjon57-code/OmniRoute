// Realistic 3D Map Reconstruction: Dust II (Morocco)
// Smooth architecture, PBR-like materials, props, graffiti, palm trees, no voxel/minecraft blocks

import * as THREE from 'three';
import { TextureGenerator } from './TextureGenerator';

export class MapDust2 {
  public scene: THREE.Group;
  public colliders: THREE.Box3[] = [];
  public spawnPointsCT: THREE.Vector3[] = [];
  public spawnPointsT: THREE.Vector3[] = [];
  public botWaypoints: THREE.Vector3[] = [];

  constructor() {
    this.scene = new THREE.Group();
    this.scene.name = 'map_dust2';
    this.buildMap();
  }

  private buildMap() {
    // 1. Textures & Materials
    const stuccoTex = TextureGenerator.createStuccoWall();
    const stoneTex = TextureGenerator.createStonePavement();
    const crate14Tex = TextureGenerator.createMilitaryCrate('14');
    const crateRTTex = TextureGenerator.createMilitaryCrate('RT');
    const dumpsterTex = TextureGenerator.createDumpsterTexture();
    const siteASprayTex = TextureGenerator.createBombsiteASpray();
    const gooseTex = TextureGenerator.createGooseGraffiti();

    const wallMat = new THREE.MeshStandardMaterial({
      map: stuccoTex,
      roughness: 0.85,
      metalness: 0.05
    });

    const groundMat = new THREE.MeshStandardMaterial({
      map: stoneTex,
      roughness: 0.9,
      metalness: 0.1
    });

    const crate14Mat = new THREE.MeshStandardMaterial({
      map: crate14Tex,
      roughness: 0.65,
      metalness: 0.2
    });

    const crateRTMat = new THREE.MeshStandardMaterial({
      map: crateRTTex,
      roughness: 0.65,
      metalness: 0.2
    });

    const dumpsterMat = new THREE.MeshStandardMaterial({
      map: dumpsterTex,
      roughness: 0.45,
      metalness: 0.6
    });

    const trimMat = new THREE.MeshStandardMaterial({
      color: 0x8a765e,
      roughness: 0.7
    });

    // 2. Ground Terrain (Long A street, A Platform, Pit, Catwalk)
    // Main Long A Road
    const roadGeo = new THREE.PlaneGeometry(30, 80);
    const road = new THREE.Mesh(roadGeo, groundMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0, 0);
    road.receiveShadow = true;
    this.scene.add(road);

    // Elevated Bombsite A Platform (y = 1.2m)
    const siteAPlatGeo = new THREE.BoxGeometry(22, 1.2, 24);
    const siteAPlat = new THREE.Mesh(siteAPlatGeo, groundMat);
    siteAPlat.position.set(0, 0.6, -30);
    siteAPlat.receiveShadow = true;
    this.scene.add(siteAPlat);
    this.colliders.push(new THREE.Box3().setFromObject(siteAPlat));

    // Ramp connecting Long A to Site A
    const rampGeo = new THREE.BoxGeometry(10, 1.2, 12);
    const ramp = new THREE.Mesh(rampGeo, groundMat);
    ramp.position.set(0, 0.4, -18);
    ramp.rotation.x = 0.1;
    this.scene.add(ramp);

    // Bombsite A Red Spray Decal on Platform
    const decalGeo = new THREE.PlaneGeometry(8, 8);
    const decalMat = new THREE.MeshBasicMaterial({
      map: siteASprayTex,
      transparent: true,
      opacity: 0.9,
      depthWrite: false
    });
    const siteADecal = new THREE.Mesh(decalGeo, decalMat);
    siteADecal.rotation.x = -Math.PI / 2;
    siteADecal.position.set(-2, 1.21, -30);
    this.scene.add(siteADecal);

    // 3. Buildings & Walls (Smooth Mediterranean Architecture)
    // Goose Wall (Back of Site A - Screenshot 15)
    this.addBuildingWall(0, 4, -42, 22, 8, 2, wallMat);

    // Goose Decal on Goose Wall
    const gooseDecalGeo = new THREE.PlaneGeometry(3.5, 3.5);
    const gooseDecalMat = new THREE.MeshBasicMaterial({
      map: gooseTex,
      transparent: true,
      opacity: 0.95
    });
    const gooseMesh = new THREE.Mesh(gooseDecalGeo, gooseDecalMat);
    gooseMesh.position.set(-3.5, 3.2, -40.9);
    this.scene.add(gooseMesh);

    // Left Long Wall (Street wall with arches)
    this.addBuildingWall(-15, 5, 0, 2, 10, 80, wallMat);

    // Right Long Wall & Hotel Aurore building (Screenshot 13)
    this.addBuildingWall(15, 6, 5, 2, 12, 70, wallMat);

    // Hotel Aurore Arabic Sign on Right Wall
    this.addWallSign(13.9, 3.8, 8, 'فندق أورور Motel Aurore ⬅ A');

    // Catwalk / Short Wall (Left of Site A)
    this.addBuildingWall(-11, 4, -30, 2, 8, 24, wallMat);

    // Long Doors entrance archway at the back (z = +38)
    this.addArchway(0, 0, 38, wallMat);

    // 4. Props & Cover (Crates, Barrels, Dumpsters - Screenshot 14, 15)
    // A Site Default Plant Crates
    this.addCrateCluster(1, 1.2, -32, crate14Mat, crateRTMat);

    // Triple Crates near Catwalk
    this.addCrate(-7, 1.2, -28, 2.2, 2.2, 2.2, crate14Mat);
    this.addCrate(-7, 3.4, -28, 2.0, 2.0, 2.0, crateRTMat);

    // Blue Shipping Dumpster at CT Cross (Screenshot 14)
    const dumpster = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.4, 7.5), dumpsterMat);
    dumpster.position.set(7, 1.7, -12);
    dumpster.rotation.y = -0.15;
    dumpster.castShadow = true;
    this.scene.add(dumpster);
    this.colliders.push(new THREE.Box3().setFromObject(dumpster));

    // Barrels (Blue & Rusty)
    this.addBarrel(8.5, 0, 15, 0x224466);
    this.addBarrel(9.8, 0, 14.5, 0x884422);
    this.addBarrel(9.2, 1.6, 14.8, 0x224466);

    // 5. Environmental Details (Palm Trees, Satellite Dishes, Cables)
    this.addPalmTree(-14, 0, -20);
    this.addPalmTree(14, 0, -10);
    this.addSatelliteDish(-14, 9, -25);
    this.addSatelliteDish(14, 11, 5);

    // Hanging Overhead Cables
    this.addOverheadCable(new THREE.Vector3(-14, 8, 10), new THREE.Vector3(14, 8, 15));
    this.addOverheadCable(new THREE.Vector3(-14, 7.5, -15), new THREE.Vector3(14, 8.5, -10));

    // 6. Lighting & Skybox
    this.setupLighting();

    // 7. Define Spawn Points & Bot Patrol Waypoints
    this.spawnPointsT.push(new THREE.Vector3(0, 1.6, 32));
    this.spawnPointsT.push(new THREE.Vector3(-4, 1.6, 30));
    this.spawnPointsT.push(new THREE.Vector3(4, 1.6, 30));

    this.spawnPointsCT.push(new THREE.Vector3(0, 2.8, -35));
    this.spawnPointsCT.push(new THREE.Vector3(-6, 2.8, -32));
    this.spawnPointsCT.push(new THREE.Vector3(6, 2.8, -32));

    this.botWaypoints.push(new THREE.Vector3(0, 2.8, -32)); // Site A
    this.botWaypoints.push(new THREE.Vector3(-4, 2.8, -36)); // Goose
    this.botWaypoints.push(new THREE.Vector3(6, 1.6, -15)); // Dumpster
    this.botWaypoints.push(new THREE.Vector3(0, 1.6, 0)); // Long Street
    this.botWaypoints.push(new THREE.Vector3(-8, 1.6, 12)); // Pit corner
  }

  private addBuildingWall(x: number, y: number, z: number, w: number, h: number, d: number, mat: THREE.Material) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    this.colliders.push(new THREE.Box3().setFromObject(mesh));

    // Roof cornice trim
    const trimGeo = new THREE.BoxGeometry(w * 1.05, 0.4, d * 1.02);
    const trim = new THREE.Mesh(trimGeo, new THREE.MeshStandardMaterial({ color: 0x9e8870 }));
    trim.position.set(x, y + h / 2 + 0.2, z);
    this.scene.add(trim);
  }

  private addArchway(x: number, y: number, z: number, mat: THREE.Material) {
    const archGroup = new THREE.Group();
    const pillarGeo = new THREE.BoxGeometry(2.5, 7, 2.5);
    const leftPillar = new THREE.Mesh(pillarGeo, mat);
    leftPillar.position.set(x - 5, y + 3.5, z);
    archGroup.add(leftPillar);
    this.colliders.push(new THREE.Box3().setFromObject(leftPillar));

    const rightPillar = new THREE.Mesh(pillarGeo, mat);
    rightPillar.position.set(x + 5, y + 3.5, z);
    archGroup.add(rightPillar);
    this.colliders.push(new THREE.Box3().setFromObject(rightPillar));

    const lintelGeo = new THREE.BoxGeometry(13, 2.5, 2.5);
    const lintel = new THREE.Mesh(lintelGeo, mat);
    lintel.position.set(x, y + 8, z);
    archGroup.add(lintel);

    this.scene.add(archGroup);
  }

  private addCrate(x: number, y: number, z: number, w: number, h: number, d: number, mat: THREE.Material) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const crate = new THREE.Mesh(geo, mat);
    crate.position.set(x, y + h / 2, z);
    crate.castShadow = true;
    crate.receiveShadow = true;
    this.scene.add(crate);
    this.colliders.push(new THREE.Box3().setFromObject(crate));
  }

  private addCrateCluster(x: number, y: number, z: number, mat1: THREE.Material, mat2: THREE.Material) {
    this.addCrate(x, y, z, 2.4, 2.4, 2.4, mat1);
    this.addCrate(x + 2.5, y, z, 2.2, 2.2, 2.2, mat2);
    this.addCrate(x + 0.5, y + 2.4, z, 2.1, 2.1, 2.1, mat2);
  }

  private addBarrel(x: number, y: number, z: number, color: number) {
    const geo = new THREE.CylinderGeometry(0.5, 0.5, 1.6, 16);
    const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.7, roughness: 0.4 });
    const barrel = new THREE.Mesh(geo, mat);
    barrel.position.set(x, y + 0.8, z);
    barrel.castShadow = true;
    this.scene.add(barrel);
    this.colliders.push(new THREE.Box3().setFromObject(barrel));
  }

  private addWallSign(x: number, y: number, z: number, text: string) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#234567';
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, 500, 116);
    ctx.font = 'bold 36px Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 64);

    const tex = new THREE.CanvasTexture(canvas);
    const geo = new THREE.PlaneGeometry(4.5, 1.2);
    const mat = new THREE.MeshBasicMaterial({ map: tex });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.rotation.y = -Math.PI / 2;
    this.scene.add(mesh);
  }

  private addPalmTree(x: number, y: number, z: number) {
    const trunkGeo = new THREE.CylinderGeometry(0.25, 0.4, 10, 10);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6e5138, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(x, y + 5, z);
    trunk.rotation.z = 0.08;
    this.scene.add(trunk);

    // Palm Fronds
    const frondMat = new THREE.MeshStandardMaterial({ color: 0x2e6b30, roughness: 0.6, side: THREE.DoubleSide });
    for (let i = 0; i < 7; i++) {
      const frondGeo = new THREE.PlaneGeometry(1.2, 4.5);
      const frond = new THREE.Mesh(frondGeo, frondMat);
      frond.position.set(x, y + 10, z);
      frond.rotation.y = (i / 7) * Math.PI * 2;
      frond.rotation.x = 0.8;
      this.scene.add(frond);
    }
  }

  private addSatelliteDish(x: number, y: number, z: number) {
    const dishGeo = new THREE.SphereGeometry(0.8, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const dishMat = new THREE.MeshStandardMaterial({ color: 0xdedede, metalness: 0.3, roughness: 0.5, side: THREE.DoubleSide });
    const dish = new THREE.Mesh(dishGeo, dishMat);
    dish.position.set(x, y, z);
    dish.rotation.x = 0.6;
    this.scene.add(dish);
  }

  private addOverheadCable(p1: THREE.Vector3, p2: THREE.Vector3) {
    const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    mid.y -= 1.2; // Sagging cable
    const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
    const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.02, 6, false);
    const cableMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
    const cable = new THREE.Mesh(tubeGeo, cableMat);
    this.scene.add(cable);
  }

  private setupLighting() {
    // Warm Mediterranean Sun
    const sunLight = new THREE.DirectionalLight(0xfffaed, 2.2);
    sunLight.position.set(40, 60, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 120;
    sunLight.shadow.camera.left = -40;
    sunLight.shadow.camera.right = 40;
    sunLight.shadow.camera.top = 40;
    sunLight.shadow.camera.bottom = -40;
    this.scene.add(sunLight);

    // Sky Ambient Light (Warm azure sky / warm bounce)
    const hemiLight = new THREE.HemisphereLight(0x9bd8ff, 0xdfcbaf, 1.1);
    this.scene.add(hemiLight);

    // Sky Dome with Hazy Horizon
    const skyGeo = new THREE.SphereGeometry(150, 32, 16);
    const skyMat = new THREE.MeshBasicMaterial({
      color: 0x87ceeb,
      side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(sky);
  }
}
