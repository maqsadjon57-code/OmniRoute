// Counter-Strike 2 Main Menu (Точная копия Скриншота 2)
// Play, Practice, 10 Map Cards Grid, Practice Toggles, Green GO Button, Friends List

import React, { useState } from 'react';
import { MAPS_DATABASE } from '../data/skinsDatabase';
import { soundEngine } from '../audio/SoundEngine';
import { GameMode, PracticeSettings } from '../types/cs2';

interface CS2MainMenuProps {
  onStartMatch: (mapId: string, settings: PracticeSettings) => void;
  onOpenInventory: () => void;
  onOpenLoadout: () => void;
}

export const CS2MainMenu: React.FC<CS2MainMenuProps> = ({
  onStartMatch,
  onOpenInventory,
  onOpenLoadout
}) => {
  const [activeTab, setActiveTab] = useState<'play' | 'inventory' | 'loadout' | 'store' | 'news'>('play');
  const [playSubtab, setPlaySubtab] = useState<'matchmaking' | 'practice'>('practice');
  const [selectedMode, setSelectedMode] = useState<string>('competitive');
  const [selectedMapId, setSelectedMapId] = useState<string>('dust2');

  const [settings, setSettings] = useState<PracticeSettings>({
    openParty: true,
    grenadeCamera: false,
    infiniteAmmo: false,
    infiniteWarmup: true,
    botDifficulty: 'expert',
    botCount: 8,
    enableRadar: true
  });

  const modes = [
    { id: 'premier', label: 'PREMIER' },
    { id: 'competitive', label: 'COMPETITIVE' },
    { id: 'wingman', label: 'WINGMAN' },
    { id: 'casual', label: 'CASUAL' },
    { id: 'deathmatch', label: 'DEATHMATCH' },
    { id: 'private', label: 'PRIVATE MATCHMAKING' }
  ];

  const friends = [
    { name: 's1mple_fan', rank: 'Global Elite', status: 'In Game (Dust II)', avatar: '🐺', online: true },
    { name: 'm0NESY_clutch', rank: 'Supreme', status: 'Main Menu', avatar: '⚡', online: true },
    { name: 'b1t_headshot', rank: 'LEM', status: 'In Game (Mirage)', avatar: '🎯', online: true },
    { name: 'donk_rush', rank: 'Global Elite', status: 'Looking to Play', avatar: '🔥', online: true },
    { name: 'zywOo_king', rank: 'Global Elite', status: 'Away', avatar: '👑', online: false },
    { name: 'device_awp', rank: 'Supreme', status: 'Offline', avatar: '🦅', online: false },
  ];

  const handleLaunch = () => {
    soundEngine.playClick();
    soundEngine.playRadioLetsRoll();
    onStartMatch(selectedMapId, settings);
  };

  return (
    <div 
      className="fixed inset-0 z-40 flex flex-col justify-between text-white select-none overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #10151c 0%, #161e29 50%, #0e131a 100%)',
        fontFamily: '"Montserrat", "Chakra Petch", sans-serif'
      }}
    >
      {/* Top Navigation Bar (Screenshot 2) */}
      <div className="flex items-center justify-between px-8 py-3 bg-black/40 border-b border-gray-800/60 backdrop-blur-md">
        {/* Left Icons: Home, TV, Settings, Power */}
        <div className="flex items-center space-x-5 text-gray-400">
          <button className="hover:text-white transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          </button>
          <button className="hover:text-white transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          </button>
          <button className="hover:text-white transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </button>
          <button className="hover:text-red-400 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          </button>
        </div>

        {/* Center Main Tabs: INVENTORY | LOADOUT | PLAY | STORE | NEWS */}
        <div className="flex items-center space-x-8 text-sm font-bold tracking-wider">
          <button 
            onClick={() => { soundEngine.playClick(); onOpenInventory(); }}
            className="text-gray-400 hover:text-white transition"
          >
            INVENTORY
          </button>
          <button 
            onClick={() => { soundEngine.playClick(); onOpenLoadout(); }}
            className="text-gray-400 hover:text-white transition"
          >
            LOADOUT
          </button>
          <button 
            className="relative px-3 py-1 text-cyan-400 font-extrabold border-b-2 border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.5)]"
          >
            PLAY
          </button>
          <button className="text-gray-400 hover:text-white transition">
            STORE
          </button>
          <button className="text-gray-400 hover:text-white transition">
            NEWS
          </button>
        </div>

        {/* Right User Steam Profile / Badge */}
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-xs font-bold text-gray-200">JediMindTricks</div>
            <div className="text-[10px] text-green-400 font-semibold">Online • CS2 Prime</div>
          </div>
          <div className="relative w-8 h-8 rounded bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center font-bold text-sm shadow">
            ⚔️
            <span className="absolute -bottom-1 -right-1 text-[9px] font-extrabold bg-blue-700 px-1 rounded-full border border-blue-400">
              37
            </span>
          </div>
        </div>
      </div>

      {/* Mode Sub-Navigation (MATCHMAKING | PRACTICE) */}
      <div className="flex items-center justify-center space-x-4 py-2 border-b border-gray-800/40 bg-black/20">
        <button 
          onClick={() => { soundEngine.playClick(); setPlaySubtab('matchmaking'); }}
          className={`px-4 py-1 text-xs font-bold rounded transition ${
            playSubtab === 'matchmaking' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          MATCHMAKING
        </button>
        <button 
          onClick={() => { soundEngine.playClick(); setPlaySubtab('practice'); }}
          className={`flex items-center space-x-1.5 px-4 py-1 text-xs font-bold rounded transition ${
            playSubtab === 'practice' ? 'bg-[#3b82f6] text-white shadow-md' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <span>PRACTICE</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </button>
      </div>

      {/* Game Mode Bar: PREMIER | COMPETITIVE | WINGMAN | CASUAL | DEATHMATCH */}
      <div className="flex items-center justify-center space-x-6 py-2 text-xs font-semibold text-gray-400 border-b border-gray-800/30">
        {modes.map(m => (
          <button
            key={m.id}
            onClick={() => { soundEngine.playClick(); setSelectedMode(m.id); }}
            className={`transition pb-1 ${
              selectedMode === m.id 
                ? 'text-cyan-400 font-bold border-b-2 border-cyan-400' 
                : 'hover:text-gray-200'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Main Content: Left Options Toggles + Center Map Cards + Right Friends List */}
      <div className="flex-1 flex px-8 py-4 space-x-6 overflow-hidden">
        {/* Left Options (Screenshot 2) */}
        <div className="w-56 flex flex-col space-y-4 text-xs font-medium text-gray-300">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Options
          </div>

          {/* Open Party */}
          <div className="flex items-center justify-between">
            <span>Open Party</span>
            <button 
              onClick={() => setSettings(s => ({ ...s, openParty: !s.openParty }))}
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition ${settings.openParty ? 'bg-[#48bb78]' : 'bg-gray-700'}`}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow transform transition ${settings.openParty ? 'translate-x-4' : 'translate-x-0'}`}></div>
            </button>
          </div>

          {/* Grenade Camera */}
          <div className="flex items-center justify-between">
            <span>Grenade Camera</span>
            <button 
              onClick={() => setSettings(s => ({ ...s, grenadeCamera: !s.grenadeCamera }))}
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition ${settings.grenadeCamera ? 'bg-[#48bb78]' : 'bg-gray-700'}`}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow transform transition ${settings.grenadeCamera ? 'translate-x-4' : 'translate-x-0'}`}></div>
            </button>
          </div>

          {/* Infinite Ammo */}
          <div className="flex items-center justify-between">
            <span>Infinite Ammo</span>
            <button 
              onClick={() => setSettings(s => ({ ...s, infiniteAmmo: !s.infiniteAmmo }))}
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition ${settings.infiniteAmmo ? 'bg-[#48bb78]' : 'bg-gray-700'}`}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow transform transition ${settings.infiniteAmmo ? 'translate-x-4' : 'translate-x-0'}`}></div>
            </button>
          </div>

          {/* Infinite Warmup */}
          <div className="relative group flex items-center justify-between">
            <span>Infinite Warmup</span>
            <button 
              onClick={() => setSettings(s => ({ ...s, infiniteWarmup: !s.infiniteWarmup }))}
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition ${settings.infiniteWarmup ? 'bg-[#48bb78]' : 'bg-gray-700'}`}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow transform transition ${settings.infiniteWarmup ? 'translate-x-4' : 'translate-x-0'}`}></div>
            </button>

            {/* Tooltip (Screenshot 2) */}
            <div className="absolute left-0 bottom-7 hidden group-hover:block z-30 w-52 p-2 bg-black/90 border border-gray-700 rounded text-[11px] text-gray-200 shadow-xl pointer-events-none">
              When enabled the match will remain in permanent warmup and no bots will join.
            </div>
          </div>

          {/* Replay Training Day */}
          <div className="pt-2 text-gray-400 hover:text-gray-200 cursor-pointer text-xs">
            Replay Training Day
          </div>
        </div>

        {/* Center: 10 Maps Grid (2 Rows x 5 Columns - Screenshot 2) */}
        <div className="flex-1 grid grid-cols-5 gap-3 max-w-5xl">
          {MAPS_DATABASE.map(map => {
            const isSelected = selectedMapId === map.id;
            return (
              <button
                key={map.id}
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedMapId(map.id);
                }}
                className={`relative flex flex-col justify-between p-2 rounded overflow-hidden transition-all duration-200 text-left border ${
                  isSelected 
                    ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.4)] scale-102 bg-gray-800' 
                    : 'border-gray-800 hover:border-gray-500 bg-[#161a22]'
                }`}
                style={{
                  height: '190px',
                  backgroundImage: `radial-gradient(circle at center, rgba(30,40,55,0.7) 0%, rgba(10,14,20,0.95) 100%)`
                }}
              >
                {/* Top Corner Map Badge */}
                <div className="flex justify-between items-start">
                  <span className="text-lg">{map.badge}</span>
                  <span className="text-[10px] font-mono text-gray-500 uppercase">{map.location}</span>
                </div>

                {/* Center Map Crest Graphic */}
                <div className="flex flex-col items-center justify-center my-auto">
                  <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center font-bold text-sm ${
                    isSelected ? 'border-yellow-400 text-yellow-300' : 'border-gray-600 text-gray-400'
                  }`}>
                    {map.badge}
                  </div>
                </div>

                {/* Bottom Map Name */}
                <div className="text-center font-bold text-sm tracking-wide text-gray-200">
                  {map.name}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Sidebar: Steam Friends List */}
        <div className="w-56 flex flex-col space-y-3 bg-black/30 p-3 rounded-lg border border-gray-800/40">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-800 pb-1.5 flex justify-between">
            <span>Friends</span>
            <span className="text-green-400 font-mono">4/6</span>
          </div>

          <div className="flex-1 flex flex-col space-y-2 overflow-y-auto">
            {friends.map((f, i) => (
              <div key={i} className="flex items-center space-x-2 p-1.5 rounded hover:bg-gray-800/50 cursor-pointer transition">
                <div className="relative text-lg">
                  {f.avatar}
                  <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-black ${f.online ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate text-gray-200">{f.name}</div>
                  <div className="text-[10px] text-gray-500 truncate">{f.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar: Launch Button [ GO ] (Screenshot 2) */}
      <div className="flex items-center justify-end px-10 py-4 bg-black/60 border-t border-gray-800/60">
        <button
          onClick={handleLaunch}
          className="relative group px-16 py-3.5 rounded bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] text-white font-black tracking-widest text-lg uppercase shadow-[0_0_25px_rgba(34,197,94,0.4)] transition-all duration-200 active:scale-95"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)'
          }}
        >
          GO
        </button>
      </div>
    </div>
  );
};
