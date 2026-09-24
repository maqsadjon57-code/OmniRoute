// Counter-Strike 2 Scoreboard Overlay (Точная копия Скриншота 11)
// CT vs T Teams, Ping, Kills, Deaths, Assists, MVPs, Score, Money

import React from 'react';
import { PlayerStats, BotEntity } from '../types/cs2';

interface CS2ScoreboardProps {
  stats: PlayerStats;
  bots: BotEntity[];
  scoreCT: number;
  scoreT: number;
}

export const CS2Scoreboard: React.FC<CS2ScoreboardProps> = ({ stats, bots, scoreCT, scoreT }) => {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm select-none"
      style={{ fontFamily: '"Montserrat", "Chakra Petch", sans-serif' }}
    >
      <div className="w-[840px] bg-[#14181f]/95 border border-gray-800 rounded-lg shadow-2xl overflow-hidden text-xs">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-black/50 border-b border-gray-800 text-gray-400 font-semibold">
          <div className="flex items-center space-x-2">
            <span className="text-white font-bold">Competitive</span>
            <span>•</span>
            <span>Dust II (Dust_2)</span>
          </div>
          <div className="flex items-center space-x-6 text-[11px]">
            <span>Server Tick: 64.0 (Sub-tick)</span>
            <span>Loss: 0%</span>
            <span>Ping: 18ms</span>
          </div>
        </div>

        {/* Column Headers */}
        <div className="grid grid-cols-12 gap-2 px-6 py-2 text-[10px] uppercase font-bold tracking-wider text-gray-500 border-b border-gray-800/60">
          <div className="col-span-1 text-center">Ping</div>
          <div className="col-span-5">Player</div>
          <div className="col-span-1 text-center">Kills</div>
          <div className="col-span-1 text-center">Deaths</div>
          <div className="col-span-1 text-center">Assists</div>
          <div className="col-span-1 text-center">MVPs</div>
          <div className="col-span-1 text-center">Score</div>
          <div className="col-span-1 text-right">Money</div>
        </div>

        {/* TEAM 1: COUNTER-TERRORISTS (Blue - Screenshot 11) */}
        <div className="bg-blue-950/20">
          <div className="flex items-center justify-between px-6 py-1.5 bg-blue-900/30 border-y border-blue-900/40 text-blue-400 font-bold">
            <div className="flex items-center space-x-2">
              <span className="text-base font-black font-mono">{scoreCT}</span>
              <span>COUNTER-TERRORISTS</span>
              <span className="text-[10px] text-gray-400 font-normal">Alive: 4</span>
            </div>
            <span className="text-[11px] font-mono">$16,000 Avg</span>
          </div>

          {/* Player Row (JediMindTricks) */}
          <div className="grid grid-cols-12 gap-2 px-6 py-2 items-center bg-blue-900/20 text-white font-semibold border-b border-gray-800/40">
            <div className="col-span-1 text-center text-green-400 font-mono">18</div>
            <div className="col-span-5 flex items-center space-x-2">
              <span className="text-blue-400 font-bold">🛡️</span>
              <span className="truncate text-cyan-300 font-bold">JediMindTricks</span>
              <span className="text-[10px] bg-blue-800 px-1 rounded text-white">YOU</span>
            </div>
            <div className="col-span-1 text-center font-mono">{stats.kills}</div>
            <div className="col-span-1 text-center font-mono text-gray-400">{stats.deaths}</div>
            <div className="col-span-1 text-center font-mono text-gray-400">{stats.assists}</div>
            <div className="col-span-1 text-center font-mono text-yellow-400">★ {stats.mvps}</div>
            <div className="col-span-1 text-center font-mono font-bold text-cyan-400">{stats.score}</div>
            <div className="col-span-1 text-right font-mono text-[#d4a337]">${stats.money}</div>
          </div>

          {/* CT Bots Rows */}
          {bots.filter(b => b.team === 'CT').map((b, i) => (
            <div key={b.id} className="grid grid-cols-12 gap-2 px-6 py-1.5 items-center text-gray-300 border-b border-gray-800/30 text-[11px]">
              <div className="col-span-1 text-center text-gray-500 font-mono">0</div>
              <div className="col-span-5 flex items-center space-x-2">
                <span className="text-gray-500">🤖</span>
                <span className="truncate">{b.name}</span>
              </div>
              <div className="col-span-1 text-center font-mono">{2 + i}</div>
              <div className="col-span-1 text-center font-mono text-gray-500">1</div>
              <div className="col-span-1 text-center font-mono text-gray-500">0</div>
              <div className="col-span-1 text-center font-mono text-gray-500">0</div>
              <div className="col-span-1 text-center font-mono">{(2 + i) * 2}</div>
              <div className="col-span-1 text-right font-mono text-gray-400">$3,400</div>
            </div>
          ))}
        </div>

        {/* TEAM 2: TERRORISTS (Yellow - Screenshot 11) */}
        <div className="bg-yellow-950/10 mt-2">
          <div className="flex items-center justify-between px-6 py-1.5 bg-yellow-900/30 border-y border-yellow-900/40 text-yellow-400 font-bold">
            <div className="flex items-center space-x-2">
              <span className="text-base font-black font-mono">{scoreT}</span>
              <span>TERRORISTS</span>
              <span className="text-[10px] text-gray-400 font-normal">Alive: {bots.filter(b => b.team === 'T' && b.isAlive).length}</span>
            </div>
            <span className="text-[11px] font-mono">$1,400 Avg</span>
          </div>

          {/* T Bots Rows (БОТ Колин, БОТ Муха, БОТ Тельсен...) */}
          {bots.filter(b => b.team === 'T').map((b, i) => (
            <div key={b.id} className="grid grid-cols-12 gap-2 px-6 py-1.5 items-center text-gray-300 border-b border-gray-800/30 text-[11px]">
              <div className="col-span-1 text-center text-gray-500 font-mono">0</div>
              <div className="col-span-5 flex items-center space-x-2">
                <span className={b.isAlive ? 'text-yellow-400' : 'text-red-500'}>
                  {b.isAlive ? '⚡' : '💀'}
                </span>
                <span className={`truncate ${b.isAlive ? 'text-gray-200' : 'text-gray-500 line-through'}`}>
                  {b.name}
                </span>
              </div>
              <div className="col-span-1 text-center font-mono">{i % 2 === 0 ? 1 : 0}</div>
              <div className="col-span-1 text-center font-mono text-gray-500">{b.isAlive ? 0 : 1}</div>
              <div className="col-span-1 text-center font-mono text-gray-500">0</div>
              <div className="col-span-1 text-center font-mono text-gray-500">0</div>
              <div className="col-span-1 text-center font-mono">{i % 2 === 0 ? 2 : 0}</div>
              <div className="col-span-1 text-right font-mono text-gray-400">$1,400</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-2.5 bg-black/60 border-t border-gray-800 flex justify-between items-center text-gray-500 text-[11px]">
          <span>Release TAB to close scoreboard</span>
          <span>Match ID: 394820194819284</span>
        </div>
      </div>
    </div>
  );
};
