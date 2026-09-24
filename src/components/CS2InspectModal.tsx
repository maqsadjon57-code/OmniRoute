// Counter-Strike 2 Weapon 3D Inspect Screen (Точная копия Скриншота 4)
// Rotating 3D Viewport, Lore description, Rarity colored line, Pattern seed, Float value, Close button

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SkinItem } from '../types/cs2';
import { WeaponMeshFactory } from '../engine/WeaponMeshFactory';
import { soundEngine } from '../audio/SoundEngine';

interface CS2InspectModalProps {
  skin: SkinItem;
  onClose: () => void;
  onEquip?: (skin: SkinItem) => void;
}

export const CS2InspectModal: React.FC<CS2InspectModalProps> = ({ skin, onClose, onEquip }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'weapon' | 'agent' | 'info'>('weapon');
  const [isDragging, setIsDragging] = useState(false);
  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(0);

  useEffect(() => {
    if (!mountRef.current) return;

    // Setup Three.js Scene for Inspect Viewport
    const width = mountRef.current.clientWidth || 800;
    const height = mountRef.current.clientHeight || 500;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 1.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Studio Lighting for Skin Specularity
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(2, 3, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x90b0e0, 1.5);
    fillLight.position.set(-3, -1, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffddaa, 2.0);
    rimLight.position.set(0, 3, -3);
    scene.add(rimLight);

    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);

    // Build 3D Weapon Mesh
    let weaponMesh: THREE.Group;
    if (skin.weaponType === 'deagle') {
      weaponMesh = WeaponMeshFactory.createDeagle(skin);
      weaponMesh.scale.set(2.4, 2.4, 2.4);
    } else if (skin.weaponType === 'ak47') {
      weaponMesh = WeaponMeshFactory.createAK47(skin);
      weaponMesh.scale.set(1.4, 1.4, 1.4);
    } else if (skin.weaponType === 'awp') {
      weaponMesh = WeaponMeshFactory.createAWP(skin);
      weaponMesh.scale.set(1.1, 1.1, 1.1);
    } else if (skin.weaponType.startsWith('knife')) {
      weaponMesh = WeaponMeshFactory.createKarambit(skin);
      weaponMesh.scale.set(2.5, 2.5, 2.5);
    } else {
      weaponMesh = WeaponMeshFactory.createDeagle(skin);
      weaponMesh.scale.set(2.2, 2.2, 2.2);
    }

    scene.add(weaponMesh);

    // Mouse Drag Rotation
    let prevMouseX = 0;
    let prevMouseY = 0;
    let dragging = false;
    let autoRotate = true;

    const onMouseDown = (e: MouseEvent) => {
      dragging = true;
      autoRotate = false;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      weaponMesh.rotation.y += deltaX * 0.01;
      weaponMesh.rotation.x += deltaY * 0.01;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      dragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (autoRotate) {
        weaponMesh.rotation.y += 0.006;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [skin]);

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col justify-between text-white select-none backdrop-blur-xl"
      style={{
        background: 'radial-gradient(circle at 50% 45%, rgba(35, 42, 54, 0.9) 0%, rgba(12, 16, 22, 0.97) 100%)',
        fontFamily: '"Montserrat", "Chakra Petch", sans-serif'
      }}
    >
      {/* Top Header: Weapon & Skin Name with Rarity Bar (Screenshot 4) */}
      <div className="pt-12 text-center">
        <h2 className="text-3xl font-bold tracking-wider text-gray-100">
          {skin.weaponName} <span className="text-gray-400">|</span> {skin.name}
        </h2>
        {/* Rarity Colored Line (Pink/Purple for Classified, Red for Covert, Gold for Knife) */}
        <div 
          className="h-1 w-72 mx-auto mt-2 rounded shadow-lg"
          style={{ backgroundColor: skin.rarityColor }}
        ></div>
        <div className="text-xs uppercase font-bold tracking-widest mt-1 text-gray-400">
          {skin.rarity} {skin.weaponType.startsWith('knife') ? '★ Special Item' : 'Weapon'}
        </div>
      </div>

      {/* Center 3D Viewport */}
      <div ref={mountRef} className="flex-1 w-full flex items-center justify-center cursor-grab active:cursor-grabbing relative">
        {/* Subtle radial glow under weapon */}
        <div 
          className="absolute w-96 h-96 rounded-full pointer-events-none opacity-20 blur-3xl"
          style={{ backgroundColor: skin.rarityColor }}
        ></div>
      </div>

      {/* Bottom Description & Flavor Text (Screenshot 4) */}
      <div className="max-w-2xl mx-auto text-center px-6 pb-4">
        <p className="text-xs leading-relaxed text-gray-300">
          {skin.description}
        </p>
        {skin.flavorText && (
          <p className="text-xs italic text-gray-400 mt-2 font-serif">
            {skin.flavorText}
          </p>
        )}

        {/* Float Value & Seed preview */}
        <div className="flex justify-center items-center space-x-6 mt-4 text-[11px] font-mono text-gray-400 bg-black/40 py-1.5 px-4 rounded border border-gray-800">
          <span>Exterior: <strong className="text-gray-200">{skin.wearCategory}</strong></span>
          <span>Float: <strong className="text-cyan-400">{skin.floatValue.toFixed(8)}</strong></span>
          <span>Pattern Template: <strong className="text-yellow-400">{skin.patternSeed}</strong></span>
        </div>
      </div>

      {/* Bottom Action Bar: Pistol Icon, Agent Icon, Info Icon, Close Button */}
      <div className="flex items-center justify-between px-12 py-5 bg-black/60 border-t border-gray-800/60">
        {/* Left Toggle Buttons */}
        <div className="flex items-center space-x-4 text-gray-400">
          <button 
            onClick={() => { soundEngine.playClick(); setActiveTab('weapon'); }}
            className={`p-2 rounded hover:text-white transition ${activeTab === 'weapon' ? 'bg-gray-700 text-white' : ''}`}
            title="Inspect Weapon"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </button>

          <button 
            onClick={() => { soundEngine.playClick(); setActiveTab('agent'); }}
            className={`p-2 rounded hover:text-white transition ${activeTab === 'agent' ? 'bg-gray-700 text-white' : ''}`}
            title="View on Agent"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          </button>

          <button 
            onClick={() => { soundEngine.playClick(); setActiveTab('info'); }}
            className={`p-2 rounded hover:text-white transition ${activeTab === 'info' ? 'bg-gray-700 text-white' : ''}`}
            title="Details"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </button>

          {onEquip && (
            <button
              onClick={() => {
                soundEngine.playBuySuccess();
                onEquip(skin);
              }}
              className="px-4 py-1.5 rounded bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs uppercase tracking-wider transition"
            >
              EQUIP
            </button>
          )}
        </div>

        {/* Right Close Button */}
        <button
          onClick={() => { soundEngine.playClick(); onClose(); }}
          className="px-8 py-2 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs uppercase tracking-wider border border-gray-700 transition"
        >
          CLOSE
        </button>
      </div>
    </div>
  );
};
