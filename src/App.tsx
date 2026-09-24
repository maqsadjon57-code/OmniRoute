// Counter-Strike 2 - Live Source 2 Game Application
// Recreates all design elements from user screenshots:
// - Buy Menu (Screenshot 1)
// - Main Menu Play & Practice (Screenshot 2)
// - Realistic Dust II 3D Environment (Screenshot 3, 10, 13, 14, 15)
// - 3D Weapon Inspect Screen (Screenshot 4)
// - Bot Match with Russian Bot Names (Screenshot 12)
// - End-of-Match 7-0 VICTORY Accolades (Screenshot 9)
// - Loadout & Skins (Screenshot 6, 7, 8, 16, 17, 18)
// - In-Game CS2 HUD & Radar (Screenshot 10, 16)
// - Scoreboard (Screenshot 11)
// - VRS Pro Tournaments & Majors (Screenshot 11)

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CS2MainMenu } from './components/CS2MainMenu';
import { CS2BuyMenu } from './components/CS2BuyMenu';
import { CS2InspectModal } from './components/CS2InspectModal';
import { CS2Loadout } from './components/CS2Loadout';
import { CS2HUD } from './components/CS2HUD';
import { CS2Scoreboard } from './components/CS2Scoreboard';
import { CS2VictoryScreen } from './components/CS2VictoryScreen';
import { CS2Settings } from './components/CS2Settings';
import { CS2TournamentsModal } from './components/CS2TournamentsModal';
import { MapDust2 } from './engine/MapDust2';
import { BotManager } from './engine/BotManager';
import { FPSController } from './engine/FPSController';
import { ParticleSystem } from './engine/ParticleSystem';
import { soundEngine } from './audio/SoundEngine';
import { SKINS_DATABASE } from './data/skinsDatabase';
import { PlayerStats, KillfeedEvent, SkinItem, BuyMenuItem, PracticeSettings } from './types/cs2';

export default function App() {
  const [screen, setScreen] = useState<'main-menu' | 'game' | 'loadout' | 'victory'>('main-menu');
  const [showBuyMenu, setShowBuyMenu] = useState(false);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTournaments, setShowTournaments] = useState(false);
  const [inspectSkin, setInspectSkin] = useState<SkinItem | null>(null);

  // Player Stats & Game State
  const [stats, setStats] = useState<PlayerStats>({
    health: 100,
    maxHealth: 100,
    armor: 100,
    hasHelmet: true,
    money: 16000,
    kills: 7,
    deaths: 0,
    assists: 1,
    score: 16,
    mvps: 3,
    ping: 18,
    hasDefuseKit: true,
    hasBomb: false,
    currentWeapon: 'ak47',
    equippedWeapons: {
      primary: 'ak47',
      secondary: 'deagle',
      knife: 'knife-karambit',
      grenades: ['hegrenade', 'flashbang', 'smokegrenade']
    },
    weaponAmmo: {
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
    }
  });

  const [roundTime, setRoundTime] = useState(115);
  const [scoreCT, setScoreCT] = useState(7);
  const [scoreT, setScoreT] = useState(0);
  const [currentCallout, setCurrentCallout] = useState('Site A');
  const [killfeed, setKillfeed] = useState<KillfeedEvent[]>([
    {
      id: 'k1',
      killer: 'JediMindTricks',
      killerTeam: 'CT',
      victim: 'БОТ Семён',
      victimTeam: 'T',
      weapon: 'ak47',
      weaponName: 'AK-47',
      isHeadshot: true,
      isWallbang: false,
      isNoScope: false,
      isThroughSmoke: false,
      timestamp: Date.now() - 15000
    }
  ]);

  const [isScoped, setIsScoped] = useState(false);
  const [scopeLevel, setScopeLevel] = useState(0);
  const [hitmarker, setHitmarker] = useState(false);
  const [lastDamage, setLastDamage] = useState<number | null>(null);

  // 3D Canvas Mount Ref
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const fpsControllerRef = useRef<FPSController | null>(null);
  const botManagerRef = useRef<BotManager | null>(null);
  const particleSystemRef = useRef<ParticleSystem | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Round Timer Countdown
  useEffect(() => {
    if (screen !== 'game') return;
    const timer = setInterval(() => {
      setRoundTime(t => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [screen]);

  // Initialize Three.js Game Engine
  useEffect(() => {
    if (!canvasContainerRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xdfcbaf, 0.008);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    cameraRef.current = camera;
    scene.add(camera);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    canvasContainerRef.current.appendChild(renderer.domElement);

    // 3. Build Dust II Map
    const mapDust2 = new MapDust2();
    scene.add(mapDust2.scene);

    // 4. Build Particle System
    const particleSystem = new ParticleSystem();
    scene.add(particleSystem.group);
    particleSystemRef.current = particleSystem;

    // 5. Build Bot Manager (Russian bots)
    const botManager = new BotManager(scene, mapDust2.botWaypoints);
    botManagerRef.current = botManager;

    // 6. Build FPS Controller
    const controller = new FPSController(camera, renderer.domElement);
    controller.setBotManager(botManager);
    controller.setMapColliders(mapDust2.colliders);
    controller.setParticleSystem(particleSystem);
    fpsControllerRef.current = controller;

    // Equip default skin (AK-47 The Empress)
    const empressSkin = SKINS_DATABASE.find(s => s.id === 'ak47-the-empress');
    controller.equipWeapon('ak47', empressSkin);

    // Controller Callbacks
    controller.onShoot = (ammoLeft) => {
      setStats(prev => ({
        ...prev,
        weaponAmmo: {
          ...prev.weaponAmmo,
          [controller.currentWeaponType]: {
            ...prev.weaponAmmo[controller.currentWeaponType],
            current: ammoLeft
          }
        }
      }));
    };

    controller.onHit = (isHeadshot, dmg) => {
      setHitmarker(true);
      setLastDamage(dmg);
      setTimeout(() => setHitmarker(false), 120);
      setTimeout(() => setLastDamage(null), 800);
    };

    controller.onKill = (event) => {
      setKillfeed(prev => [...prev, event]);
      setStats(prev => ({
        ...prev,
        kills: prev.kills + 1,
        score: prev.score + 2,
        money: Math.min(16000, prev.money + 300)
      }));

      // Check if all T bots are eliminated
      const aliveTBots = botManager.bots.filter(b => b.team === 'T' && b.isAlive);
      if (aliveTBots.length <= 1) {
        setTimeout(() => {
          setScoreCT(c => c + 1);
          setScreen('victory');
        }, 1200);
      }
    };

    controller.onToggleBuyMenu = () => {
      setShowBuyMenu(prev => {
        const next = !prev;
        if (next) {
          document.exitPointerLock();
        } else {
          renderer.domElement.requestPointerLock();
        }
        return next;
      });
    };

    controller.onToggleScoreboard = (show) => {
      setShowScoreboard(show);
    };

    // 7. Animation Loop
    let animId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      animId = requestAnimationFrame(animate);
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Update Player Controller
      controller.update(delta);

      // Update Particle System
      particleSystem.update(delta);

      // Update Scoped state
      setIsScoped(controller.isScoped);
      setScopeLevel(controller.scopeLevel);

      // Update Dynamic Callout based on position
      const pos = controller.position;
      if (pos.z < -26) {
        if (pos.x < -2) setCurrentCallout('Goose');
        else setCurrentCallout('Bombsite A');
      } else if (pos.z < -14) {
        setCurrentCallout('A Ramp');
      } else if (pos.z > 20) {
        setCurrentCallout('Long Doors');
      } else if (pos.x > 8) {
        setCurrentCallout('Car / Dumpster');
      } else {
        setCurrentCallout('Long A');
      }

      // Update Bots AI
      botManager.update(delta, controller.position, (shootingBot) => {
        setStats(prev => {
          const newHp = Math.max(0, prev.health - 12);
          if (newHp === 0) {
            soundEngine.playRadioTWin();
          }
          return { ...prev, health: newHp };
        });
      });

      // Render Scene
      renderer.render(scene, camera);
    };

    animate(performance.now());

    // Window Resize Handler
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (canvasContainerRef.current && renderer.domElement) {
        canvasContainerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const handleBuyWeapon = (item: BuyMenuItem) => {
    setStats(prev => ({
      ...prev,
      money: prev.money - item.price,
      currentWeapon: item.weaponType
    }));

    if (fpsControllerRef.current) {
      const skin = SKINS_DATABASE.find(s => s.weaponType === item.weaponType);
      fpsControllerRef.current.equipWeapon(item.weaponType, skin);
    }
  };

  const handleStartMatch = (mapId: string, settings: PracticeSettings) => {
    setScreen('game');
    setShowBuyMenu(false);
    if (rendererRef.current) {
      rendererRef.current.domElement.requestPointerLock();
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#0a0d14] font-['Montserrat',sans-serif]">
      {/* 1. 3D WebGL Canvas Layer (Dust II Map & Viewmodel) */}
      <div 
        ref={canvasContainerRef} 
        className="absolute inset-0 w-full h-full cursor-crosshair"
      />

      {/* 2. CS2 MAIN MENU OVERLAY (Screenshot 2) */}
      {screen === 'main-menu' && (
        <CS2MainMenu
          onStartMatch={handleStartMatch}
          onOpenInventory={() => {
            const deagleSkin = SKINS_DATABASE.find(s => s.id === 'deagle-kumicho-dragon') || SKINS_DATABASE[0];
            setInspectSkin(deagleSkin);
          }}
          onOpenLoadout={() => setScreen('loadout')}
        />
      )}

      {/* 3. IN-GAME HUD LAYER (Screenshot 10, 16) */}
      {screen === 'game' && (
        <CS2HUD
          stats={stats}
          bots={botManagerRef.current ? botManagerRef.current.bots : []}
          killfeed={killfeed}
          roundTime={roundTime}
          scoreCT={scoreCT}
          scoreT={scoreT}
          currentCallout={currentCallout}
          isScoped={isScoped}
          scopeLevel={scopeLevel}
          hitmarker={hitmarker}
          lastDamage={lastDamage}
        />
      )}

      {/* 4. CS2 BUY MENU (Screenshot 1) */}
      {showBuyMenu && screen === 'game' && (
        <CS2BuyMenu
          money={stats.money}
          onBuyWeapon={handleBuyWeapon}
          onClose={() => {
            setShowBuyMenu(false);
            if (rendererRef.current) {
              rendererRef.current.domElement.requestPointerLock();
            }
          }}
        />
      )}

      {/* 5. CS2 SCOREBOARD OVERLAY (Screenshot 11) */}
      {showScoreboard && screen === 'game' && (
        <CS2Scoreboard
          stats={stats}
          bots={botManagerRef.current ? botManagerRef.current.bots : []}
          scoreCT={scoreCT}
          scoreT={scoreT}
        />
      )}

      {/* 6. CS2 WEAPON 3D INSPECT MODAL (Screenshot 4) */}
      {inspectSkin && (
        <CS2InspectModal
          skin={inspectSkin}
          onClose={() => setInspectSkin(null)}
          onEquip={(skin) => {
            if (fpsControllerRef.current) {
              fpsControllerRef.current.equipWeapon(skin.weaponType, skin);
            }
            setStats(prev => ({ ...prev, currentWeapon: skin.weaponType }));
            setInspectSkin(null);
          }}
        />
      )}

      {/* 7. CS2 LOADOUT SCREEN (Screenshot 6) */}
      {screen === 'loadout' && (
        <CS2Loadout
          onBack={() => setScreen('main-menu')}
          onInspectSkin={(skin) => setInspectSkin(skin)}
          onEquipSkin={(skin) => {
            if (fpsControllerRef.current) {
              fpsControllerRef.current.equipWeapon(skin.weaponType, skin);
            }
            setStats(prev => ({ ...prev, currentWeapon: skin.weaponType }));
          }}
        />
      )}

      {/* 8. CS2 END-OF-MATCH VICTORY SCREEN (Screenshot 9) */}
      {screen === 'victory' && (
        <CS2VictoryScreen
          scoreCT={scoreCT}
          scoreT={scoreT}
          onContinue={() => {
            setRoundTime(115);
            setStats(prev => ({ ...prev, health: 100, armor: 100 }));
            if (botManagerRef.current) {
              botManagerRef.current.bots.forEach(b => {
                b.health = 100;
                b.isAlive = true;
                const mesh = botManagerRef.current!.botMeshes.get(b.id);
                if (mesh) {
                  mesh.rotation.x = 0;
                  mesh.position.set(...b.position);
                }
              });
            }
            setScreen('game');
            if (rendererRef.current) {
              rendererRef.current.domElement.requestPointerLock();
            }
          }}
        />
      )}

      {/* 9. SETTINGS MODAL */}
      {showSettings && (
        <CS2Settings
          onClose={() => setShowSettings(false)}
          volume={0.8}
          onVolumeChange={(vol) => soundEngine.setVolume(vol)}
        />
      )}

      {/* 10. MAJOR TOURNAMENTS MODAL (Screenshot 11) */}
      {showTournaments && (
        <CS2TournamentsModal onClose={() => setShowTournaments(false)} />
      )}

      {/* In-Game Top Control Buttons */}
      {screen === 'game' && (
        <div className="absolute top-4 left-44 z-30 flex items-center space-x-2">
          <button
            onClick={() => {
              document.exitPointerLock();
              setScreen('main-menu');
            }}
            className="px-3 py-1 bg-black/60 hover:bg-black/90 rounded border border-gray-700/80 text-[11px] font-bold text-gray-300 hover:text-white transition backdrop-blur-sm"
          >
            [ESC] Menu
          </button>

          <button
            onClick={() => {
              document.exitPointerLock();
              setShowBuyMenu(true);
            }}
            className="px-3 py-1 bg-[#d4a337]/20 hover:bg-[#d4a337]/40 rounded border border-[#d4a337]/60 text-[11px] font-bold text-[#d4a337] transition backdrop-blur-sm"
          >
            [B] Buy Menu
          </button>

          <button
            onClick={() => {
              document.exitPointerLock();
              setShowTournaments(true);
            }}
            className="px-3 py-1 bg-cyan-900/40 hover:bg-cyan-800/60 rounded border border-cyan-500/60 text-[11px] font-bold text-cyan-300 transition backdrop-blur-sm"
          >
            🏆 Major Invites
          </button>

          <button
            onClick={() => {
              document.exitPointerLock();
              setShowSettings(true);
            }}
            className="px-2 py-1 bg-black/60 hover:bg-black/90 rounded border border-gray-700/80 text-gray-300 hover:text-white transition backdrop-blur-sm"
          >
            ⚙️
          </button>
        </div>
      )}
    </div>
  );
}
