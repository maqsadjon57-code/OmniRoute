// Counter-Strike 2 Major Championship Stages & Invites Modal (Точная копия Скриншота 11)

import React from 'react';
import { CS2_PRO_TEAMS } from '../data/cs2Tournaments';
import { soundEngine } from '../audio/SoundEngine';

interface CS2TournamentsModalProps {
  onClose: () => void;
}

export const CS2TournamentsModal: React.FC<CS2TournamentsModalProps> = ({ onClose }) => {
  const stages = [
    { title: 'Stage 3 Invites', teams: CS2_PRO_TEAMS.filter(t => t.stage === 'Stage 3 Invites') },
    { title: 'Stage 2 Invites', teams: CS2_PRO_TEAMS.filter(t => t.stage === 'Stage 2 Invites') },
    { title: 'Stage 1 Qualifiers', teams: CS2_PRO_TEAMS.filter(t => t.stage === 'Stage 1 Qualifiers') },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md select-none font-['Montserrat',sans-serif] p-6">
      <div className="w-[1000px] max-h-[85vh] bg-[#12161f] border border-gray-700 rounded-xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-black/50 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🏆</span>
            <div>
              <h2 className="text-lg font-black uppercase tracking-wider text-cyan-400">CS2 Valve Regional Standings (VRS)</h2>
              <p className="text-xs text-gray-400">Official Major Championship Seeding & Direct Invites</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl font-bold">✕</button>
        </div>

        {/* Stages Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {stages.map((stage, sIdx) => (
            <div key={sIdx} className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-widest text-[#d4af37] border-b border-gray-800 pb-1 flex justify-between">
                <span>{stage.title}</span>
                <span className="text-gray-500 font-mono">{stage.teams.length} Teams</span>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {stage.teams.map(team => (
                  <div
                    key={team.id}
                    className="flex items-center space-x-3 p-3 rounded bg-[#18202b] border border-gray-800 hover:border-cyan-400 hover:bg-[#202c3c] transition cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-black/60 border border-gray-700 flex items-center justify-center text-xl shadow">
                      {team.logo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-black truncate text-gray-200">{team.name}</div>
                      <div className="text-[10px] text-gray-400 truncate">{team.region}</div>
                    </div>
                    <div className="text-[11px] font-mono font-bold text-cyan-400">
                      #{team.rank}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-3 bg-black/60 border-t border-gray-800">
          <button
            onClick={() => { soundEngine.playClick(); onClose(); }}
            className="px-6 py-2 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs uppercase tracking-wider"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
