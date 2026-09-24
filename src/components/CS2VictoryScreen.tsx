// Counter-Strike 2 Victory / End of Match Accolades Screen (Точная копия Скриншота 9)
// "7 - 0 VICTORY" Banner, 5 Agents standing, 5 Accolades Cards (The Most Valuable MVP, etc.)

import React, { useEffect } from 'react';
import { soundEngine } from '../audio/SoundEngine';

interface CS2VictoryScreenProps {
  scoreCT: number;
  scoreT: number;
  onContinue: () => void;
}

export const CS2VictoryScreen: React.FC<CS2VictoryScreenProps> = ({ scoreCT, scoreT, onContinue }) => {
  useEffect(() => {
    soundEngine.playRoundVictory();
    soundEngine.playRadioCTWin();
  }, []);

  const accolades = [
    {
      id: '1',
      name: 'JediMindTricks',
      title: 'The Most Valuable MVP',
      subtitle: 'Most Kills: 7',
      avatarBg: 'bg-red-600',
      adr: 100,
      kda: '7-0-0',
      hs: '100%',
      isMvp: true
    },
    {
      id: '2',
      name: 'H5arpie',
      title: 'The Rearguard',
      subtitle: 'First Blood Survivor',
      avatarBg: 'bg-amber-600',
      adr: 12,
      kda: '0-0-0',
      hs: '0%',
      isMvp: false
    },
    {
      id: '3',
      name: 'In74fusion',
      title: 'The Unknown Soldier',
      subtitle: 'Site Anchor',
      avatarBg: 'bg-pink-600',
      adr: 35,
      kda: '1-0-1',
      hs: '50%',
      isMvp: false
    },
    {
      id: '4',
      name: 'I24ndigo',
      title: 'The Reservist',
      subtitle: 'Support Smoke Utility',
      avatarBg: 'bg-red-800',
      adr: 40,
      kda: '1-0-2',
      hs: '0%',
      isMvp: false
    },
    {
      id: '5',
      name: 'Ji65gsaw',
      title: 'The Backup Plan',
      subtitle: 'Flank Watcher',
      avatarBg: 'bg-emerald-700',
      adr: 18,
      kda: '0-0-1',
      hs: '0%',
      isMvp: false
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col justify-between text-white select-none overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(14, 22, 33, 0.95) 0%, rgba(8, 12, 18, 0.98) 100%)',
        fontFamily: '"Montserrat", "Chakra Petch", sans-serif'
      }}
    >
      {/* Top Banner: "7 - 0 VICTORY" (Screenshot 9) */}
      <div className="pt-8 text-center flex flex-col items-center">
        {/* Score Pill */}
        <div className="px-6 py-1 rounded bg-[#0d2818]/90 border border-[#22c55e]/40 text-xl font-black font-mono tracking-widest text-[#4ade80] shadow-[0_0_15px_rgba(74,222,128,0.3)]">
          {scoreCT} - {scoreT}
        </div>

        {/* Big Glowing VICTORY Banner */}
        <h1 
          className="text-6xl font-black tracking-widest uppercase mt-2 text-[#22c55e] drop-shadow-[0_0_25px_rgba(34,197,94,0.6)]"
          style={{ letterSpacing: '0.25em' }}
        >
          VICTORY
        </h1>
        <div className="h-0.5 w-96 bg-gradient-to-r from-transparent via-[#22c55e] to-transparent mt-2"></div>
      </div>

      {/* Center 5 Agents Standing Side by Side (Screenshot 9) */}
      <div className="flex-1 flex justify-center items-end pb-8 max-w-6xl mx-auto w-full px-4 space-x-4">
        {accolades.map((acc, index) => (
          <div key={acc.id} className="flex-1 flex flex-col items-center group">
            {/* 3D Agent Standing Graphic */}
            <div className="w-44 h-64 relative flex items-center justify-center transform transition duration-300 group-hover:-translate-y-2">
              <svg viewBox="0 0 160 260" className="w-full h-full drop-shadow-2xl">
                {/* Agent Balaclava / Helmet */}
                <circle cx="80" cy="50" r="24" fill={acc.isMvp ? "#3f4d36" : "#2d3727"} />
                {/* Eye slits */}
                <rect x="70" y="46" width="20" height="6" rx="2" fill="#151b12" />
                {/* Vest */}
                <rect x="58" y="76" width="44" height="65" rx="6" fill="#998870" stroke="#756750" strokeWidth="2" />
                {/* Shirt arms */}
                <path d="M 54 80 L 35 130 L 60 145" stroke="#d5c8b5" strokeWidth="12" strokeLinecap="round" fill="none" />
                <path d="M 106 80 L 125 130 L 100 145" stroke="#d5c8b5" strokeWidth="12" strokeLinecap="round" fill="none" />
                {/* Cargo Pants */}
                <path d="M 60 145 L 75 145 L 73 235 L 56 235 Z" fill="#4d573d" />
                <path d="M 85 145 L 100 145 L 104 235 L 87 235 Z" fill="#4d573d" />
                {/* Boots */}
                <rect x="54" y="235" width="22" height="14" rx="3" fill="#2b231d" />
                <rect x="86" y="235" width="22" height="14" rx="3" fill="#2b231d" />
                {/* Weapon Held */}
                {acc.isMvp ? (
                  <rect x="15" y="115" width="130" height="12" rx="2" fill="#384332" transform="rotate(-25 80 120)" />
                ) : (
                  <rect x="35" y="125" width="90" height="10" rx="2" fill="#2b2b2b" transform="rotate(-15 80 130)" />
                )}
              </svg>
            </div>

            {/* Accolade Card (Screenshot 9) */}
            <div 
              className={`w-full p-3 rounded-lg border flex flex-col justify-between transition-all duration-300 ${
                acc.isMvp 
                  ? 'bg-gradient-to-b from-[#eab308]/20 to-black/90 border-[#eab308] shadow-[0_0_20px_rgba(234,179,8,0.4)] scale-105' 
                  : 'bg-black/80 border-gray-800 group-hover:border-gray-600'
              }`}
              style={{ minHeight: '140px' }}
            >
              {/* Card Header: Avatar Circle + Stats */}
              <div className="flex items-center space-x-2">
                <div className={`w-10 h-10 rounded-full border-2 ${acc.isMvp ? 'border-[#eab308]' : 'border-gray-600'} ${acc.avatarBg} flex items-center justify-center font-bold text-sm shadow`}>
                  👤
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-black text-xs truncate ${acc.isMvp ? 'text-[#eab308]' : 'text-gray-200'}`}>
                    {acc.name}
                  </div>
                  <div className="text-[10px] text-gray-400 font-semibold truncate">
                    {acc.title}
                  </div>
                </div>
              </div>

              {/* Accolade Subtitle / Reason */}
              <div className="text-[11px] font-bold text-gray-300 mt-2 bg-black/40 py-1 px-2 rounded border border-gray-800/60 truncate">
                {acc.subtitle}
              </div>

              {/* Stat Chips */}
              <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 pt-2 border-t border-gray-800/40">
                <span>ADR: <strong className="text-gray-200">{acc.adr}</strong></span>
                <span>KDA: <strong className="text-gray-200">{acc.kda}</strong></span>
                <span>HS: <strong className="text-green-400">{acc.hs}</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Bar Button */}
      <div className="flex items-center justify-center py-4 bg-black/70 border-t border-gray-800">
        <button
          onClick={onContinue}
          className="px-12 py-3 rounded bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] text-white font-black tracking-widest text-sm uppercase shadow-[0_0_20px_rgba(34,197,94,0.4)] transition active:scale-95"
        >
          CONTINUE TO NEXT ROUND
        </button>
      </div>
    </div>
  );
};
