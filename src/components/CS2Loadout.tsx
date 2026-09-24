// Counter-Strike 2 Loadout Screen (Точная копия Скриншота 6)
// Equip CT / Equip T, Starting Pistol, Other Pistols, Mid-Tier, Rifles categories, Agent preview

import React, { useState } from 'react';
import { SKINS_DATABASE } from '../data/skinsDatabase';
import { SkinItem, Team } from '../types/cs2';
import { soundEngine } from '../audio/SoundEngine';

interface CS2LoadoutProps {
  onBack: () => void;
  onInspectSkin: (skin: SkinItem) => void;
  onEquipSkin: (skin: SkinItem) => void;
}

export const CS2Loadout: React.FC<CS2LoadoutProps> = ({ onBack, onInspectSkin, onEquipSkin }) => {
  const [team, setTeam] = useState<Team>('CT');

  const categories = [
    {
      title: 'STARTING PISTOL',
      items: SKINS_DATABASE.filter(s => s.weaponType === 'usp' || s.weaponType === 'glock')
    },
    {
      title: 'OTHER PISTOLS',
      items: SKINS_DATABASE.filter(s => s.weaponType === 'deagle' || s.weaponType === 'p250' || s.weaponType === 'dual-berettas')
    },
    {
      title: 'MID-TIER',
      items: SKINS_DATABASE.filter(s => ['nova', 'xm1014', 'mp5sd', 'p90', 'mac10', 'mp9'].includes(s.weaponType))
    },
    {
      title: 'RIFLES',
      items: SKINS_DATABASE.filter(s => ['ak47', 'm4a4', 'm4a1s', 'awp', 'ssg08'].includes(s.weaponType))
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-40 flex flex-col justify-between text-white select-none overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #121c27 0%, #1a2736 50%, #0d141e 100%)',
        fontFamily: '"Montserrat", "Chakra Petch", sans-serif'
      }}
    >
      {/* Top Navbar */}
      <div className="flex items-center justify-between px-8 py-3 bg-black/40 border-b border-gray-800">
        <button 
          onClick={onBack}
          className="flex items-center space-x-2 text-xs font-bold text-gray-400 hover:text-white"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          <span>BACK</span>
        </button>

        <div className="flex items-center space-x-8 text-sm font-bold tracking-wider">
          <span className="text-gray-400">INVENTORY</span>
          <span className="text-cyan-400 font-extrabold border-b-2 border-cyan-400 pb-1">LOADOUT</span>
          <span className="text-gray-400">PLAY</span>
          <span className="text-gray-400">STORE</span>
          <span className="text-gray-400">NEWS</span>
        </div>

        <div className="text-xs font-mono text-gray-400">CS2 LOADOUT MANAGER</div>
      </div>

      {/* Main Loadout View: Agent on Left + Grid on Right (Screenshot 6) */}
      <div className="flex-1 flex px-10 py-6 space-x-8 overflow-hidden">
        {/* Left Side: Equip CT / T Button + Standing 3D SAS Agent */}
        <div className="w-80 flex flex-col justify-between items-center">
          <button 
            onClick={() => {
              soundEngine.playClick();
              setTeam(t => t === 'CT' ? 'T' : 'CT');
            }}
            className={`w-full py-2.5 rounded font-black text-sm uppercase tracking-widest transition shadow-lg ${
              team === 'CT' ? 'bg-[#0ea5e9] hover:bg-[#0284c7] text-white' : 'bg-[#eab308] hover:bg-[#ca8a04] text-black'
            }`}
          >
            EQUIP {team}
          </button>

          {/* SAS Agent Render (Gas Mask & Tactical Gear - Screenshot 5 & 6) */}
          <div className="flex-1 w-full flex items-center justify-center relative">
            <svg viewBox="0 0 300 500" className="w-full h-full drop-shadow-2xl">
              {/* SAS Gas Mask Head */}
              <circle cx="150" cy="85" r="42" fill="#1b2028" />
              {/* Blue Circular Reflective Lenses */}
              <circle cx="132" cy="78" r="16" fill="#0077cc" stroke="#003366" strokeWidth="4" />
              <circle cx="168" cy="78" r="16" fill="#0077cc" stroke="#003366" strokeWidth="4" />
              <circle cx="135" cy="75" r="4" fill="#ffffff" opacity="0.6" />
              <circle cx="171" cy="75" r="4" fill="#ffffff" opacity="0.6" />
              {/* Gas Mask Filter Canister on Side */}
              <rect x="180" y="85" width="22" height="32" rx="6" fill="#2d3748" stroke="#0088cc" strokeWidth="2" />
              {/* Navy Blue Tactical Vest */}
              <rect x="105" y="145" width="90" height="130" rx="12" fill="#202c3d" stroke="#16202c" strokeWidth="4" />
              {/* British Union Jack patch */}
              <rect x="80" y="170" width="24" height="16" rx="2" fill="#1e3a8a" stroke="#ffffff" strokeWidth="1" />
              {/* Mag Pouches */}
              <rect x="120" y="200" width="25" height="45" rx="4" fill="#36455b" />
              <rect x="155" y="200" width="25" height="45" rx="4" fill="#36455b" />
              {/* Combat Pants & Kneepads */}
              <path d="M 112 285 L 145 285 L 140 460 L 108 460 Z" fill="#283547" />
              <path d="M 155 285 L 188 285 L 192 460 L 160 460 Z" fill="#283547" />
              {/* Kneepads */}
              <circle cx="125" cy="370" r="14" fill="#151b24" />
              <circle cx="175" cy="370" r="14" fill="#151b24" />
              {/* Combat Boots */}
              <rect x="104" y="460" width="38" height="24" rx="5" fill="#11151c" />
              <rect x="160" y="460" width="38" height="24" rx="5" fill="#11151c" />
              {/* Weapon Held (Rifle) */}
              <rect x="30" y="190" width="240" height="24" rx="4" fill="#4d533a" stroke="#2b2d22" strokeWidth="3" transform="rotate(-15 150 200)" />
            </svg>
          </div>
        </div>

        {/* Right Side: Columns Grid (Starting Pistol, Other Pistols, Mid-Tier, Rifles) */}
        <div className="flex-1 grid grid-cols-4 gap-4 overflow-y-auto">
          {categories.map((cat, idx) => (
            <div key={idx} className="flex flex-col space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 border-b border-gray-700/60 pb-1 flex items-center space-x-1.5">
                <span>▼</span>
                <span>{cat.title}</span>
              </div>

              <div className="flex flex-col space-y-2.5">
                {cat.items.map(skin => (
                  <div
                    key={skin.id}
                    onClick={() => {
                      soundEngine.playClick();
                      onInspectSkin(skin);
                    }}
                    className="relative flex flex-col justify-between p-3 h-28 rounded bg-[#131b24]/90 border border-gray-800 hover:border-cyan-400 hover:bg-[#1c2735] cursor-pointer transition group"
                  >
                    {/* Top Row: Weapon & Skin Name */}
                    <div className="flex items-start justify-between text-xs">
                      <div>
                        <div className="font-bold text-gray-200">{skin.weaponName}</div>
                        <div className="text-[11px] text-gray-400">{skin.name}</div>
                      </div>
                      <span 
                        className="w-2.5 h-2.5 rounded-full" 
                        style={{ backgroundColor: skin.rarityColor }}
                        title={skin.rarity}
                      ></span>
                    </div>

                    {/* Center: Rarity bar line */}
                    <div 
                      className="h-0.5 w-full rounded my-1 opacity-70"
                      style={{ backgroundColor: skin.rarityColor }}
                    ></div>

                    {/* Bottom Row: Inspect & Equip */}
                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span className="font-mono text-cyan-400">${skin.priceUSD.toLocaleString()}</span>
                      <span className="group-hover:text-cyan-300 font-bold uppercase tracking-wider text-[10px]">
                        Inspect 🔍
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
