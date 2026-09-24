// Counter-Strike 2 In-Game HUD (Точная копия интерфейса CS2 из скриншотов)
// Radar, 5v5 Team Avatar Bar, Health (+100), Armor (100), Money ($16,000), Ammo (30/90), Killfeed, Sniper Scope

import React, { useState, useEffect } from 'react';
import { PlayerStats, KillfeedEvent, BotEntity, WeaponType } from '../types/cs2';

interface CS2HUDProps {
  stats: PlayerStats;
  bots: BotEntity[];
  killfeed: KillfeedEvent[];
  roundTime: number;
  scoreCT: number;
  scoreT: number;
  currentCallout: string;
  isScoped: boolean;
  scopeLevel: number;
  hitmarker: boolean;
  lastDamage: number | null;
}

export const CS2HUD: React.FC<CS2HUDProps> = ({
  stats,
  bots,
  killfeed,
  roundTime,
  scoreCT,
  scoreT,
  currentCallout,
  isScoped,
  scopeLevel,
  hitmarker,
  lastDamage
}) => {
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const aliveCT = 1 + bots.filter(b => b.team === 'CT' && b.isAlive).length;
  const aliveT = bots.filter(b => b.team === 'T' && b.isAlive).length;

  return (
    <div className="fixed inset-0 pointer-events-none select-none z-30 font-['Montserrat',sans-serif]">
      {/* 1. AWP SNIPER SCOPE OVERLAY */}
      {isScoped && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          {/* Dual Thin Scope Crosshair Lines */}
          <div className="absolute w-full h-[1px] bg-black/90"></div>
          <div className="absolute h-full w-[1px] bg-black/90"></div>

          {/* Center Lens Circle Mask */}
          <div 
            className="w-[720px] h-[720px] rounded-full border-[180px] border-black/95 shadow-[inset_0_0_100px_rgba(0,0,0,0.9)]"
            style={{
              backdropFilter: 'blur(1px)'
            }}
          ></div>

          {/* Scope blur edges */}
          <div className="absolute inset-0 border-[80px] border-black pointer-events-none"></div>
        </div>
      )}

      {/* 2. TOP CENTER: 5v5 TEAM BAR & ROUND TIMER (Screenshot 10, 11) */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center space-x-4 bg-black/70 px-6 py-2 rounded-lg border border-gray-800/60 backdrop-blur-sm shadow-xl">
        {/* CT Team Score & 5 Player Avatars (Blue) */}
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            {/* Player (JediMindTricks) */}
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 rounded bg-blue-600 border border-blue-400 flex items-center justify-center text-xs font-bold shadow">
                🛡️
              </div>
              <div className="w-7 h-1 bg-green-500 rounded-full mt-1"></div>
            </div>
            {/* CT Bots */}
            {bots.filter(b => b.team === 'CT').map((b, i) => (
              <div key={b.id} className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded border flex items-center justify-center text-[10px] font-bold ${
                  b.isAlive ? 'bg-blue-900 border-blue-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-500'
                }`}>
                  {b.isAlive ? 'CT' : '💀'}
                </div>
                <div className={`w-7 h-1 rounded-full mt-1 ${b.isAlive ? 'bg-green-500' : 'bg-red-800'}`}></div>
              </div>
            ))}
          </div>
          <span className="text-2xl font-black text-blue-400 font-mono ml-2">{scoreCT}</span>
        </div>

        {/* Round Timer & Bomb Icon */}
        <div className="flex flex-col items-center px-4 border-x border-gray-700/60">
          <span className="text-sm font-black font-mono tracking-widest text-white">
            {formatTime(roundTime)}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
            Round 8
          </span>
        </div>

        {/* T Team Score & 5 Player Avatars (Yellow) */}
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-black text-yellow-400 font-mono mr-2">{scoreT}</span>
          <div className="flex space-x-1.5">
            {bots.filter(b => b.team === 'T').map(b => (
              <div key={b.id} className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded border flex items-center justify-center text-[10px] font-bold ${
                  b.isAlive ? 'bg-yellow-900 border-yellow-500 text-yellow-200' : 'bg-gray-800 border-gray-700 text-gray-500'
                }`}>
                  {b.isAlive ? 'T' : '💀'}
                </div>
                <div className={`w-7 h-1 rounded-full mt-1 ${b.isAlive ? 'bg-yellow-500' : 'bg-red-800'}`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. TOP LEFT: RADAR / MINIMAP & CALLOUT (Screenshot 10, 16) */}
      <div className="absolute top-4 left-4 flex flex-col space-y-1">
        <div className="relative w-36 h-36 rounded-full bg-black/80 border-2 border-gray-700 shadow-2xl overflow-hidden backdrop-blur-md">
          {/* Radar Sweep & Map Paths */}
          <div className="absolute inset-0 flex items-center justify-center opacity-40">
            <svg viewBox="0 0 100 100" className="w-full h-full stroke-gray-500" fill="none" strokeWidth="2">
              <path d="M 20 20 L 50 20 L 50 50 L 80 50 L 80 80" />
              <path d="M 20 80 L 50 80 L 50 50" />
              <circle cx="50" cy="50" r="40" strokeDasharray="3 3" />
            </svg>
          </div>

          {/* Site A & Site B markers */}
          <div className="absolute top-5 right-6 text-red-500 font-black text-xs">A</div>
          <div className="absolute bottom-6 left-6 text-red-500 font-black text-xs">B</div>

          {/* Player Centered Dot & Vision Cone */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            <div className="w-3 h-3 bg-cyan-400 rounded-full border border-white shadow-[0_0_8px_cyan]"></div>
            <div className="absolute -top-3 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-cyan-400"></div>
          </div>

          {/* Bots Dots on Radar */}
          {bots.map(b => {
            if (!b.isAlive) return null;
            // Map coordinates to radar circle
            const rx = 68 + (b.position[0] / 30) * 45;
            const ry = 68 + (b.position[2] / 80) * 45;
            return (
              <div 
                key={b.id} 
                className={`absolute w-2 h-2 rounded-full ${b.team === 'T' ? 'bg-red-500' : 'bg-blue-400'}`}
                style={{ left: `${rx}px`, top: `${ry}px` }}
              ></div>
            );
          })}
        </div>

        {/* Current Map Callout (Screenshot 10: "Bombsite B", "Left Alley", "Goose") */}
        <div className="text-xs font-bold text-gray-300 drop-shadow flex items-center space-x-1 pl-1">
          <span className="text-yellow-400">📍</span>
          <span>{currentCallout}</span>
        </div>
      </div>

      {/* 4. TOP RIGHT: KILLFEED (Screenshot 11) */}
      <div className="absolute top-4 right-4 flex flex-col space-y-1.5 z-40 max-w-sm">
        {killfeed.slice(-4).map(event => (
          <div 
            key={event.id}
            className="flex items-center space-x-2 px-3 py-1 bg-black/80 rounded border border-gray-800 text-xs font-bold shadow-lg animate-fadeIn"
          >
            <span className={event.killerTeam === 'CT' ? 'text-blue-400' : 'text-yellow-400'}>
              {event.killer}
            </span>
            <span className="text-gray-400 text-[11px] font-mono px-1">
              [{event.weaponName}]
            </span>
            {event.isHeadshot && (
              <span className="text-red-500 font-extrabold" title="Headshot">
                🎯
              </span>
            )}
            <span className={event.victimTeam === 'CT' ? 'text-blue-400' : 'text-yellow-400'}>
              {event.victim}
            </span>
          </div>
        ))}
      </div>

      {/* 5. CENTER SCREEN: CROSSHAIR & HITMARKER */}
      {!isScoped && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
          {/* Classic CS2 Crosshair */}
          <div className="relative w-4 h-4">
            <div className="absolute top-0 left-1.5 w-1 h-1.5 bg-cyan-400 shadow-[0_0_2px_black]"></div>
            <div className="absolute bottom-0 left-1.5 w-1 h-1.5 bg-cyan-400 shadow-[0_0_2px_black]"></div>
            <div className="absolute left-0 top-1.5 h-1 w-1.5 bg-cyan-400 shadow-[0_0_2px_black]"></div>
            <div className="absolute right-0 top-1.5 h-1 w-1.5 bg-cyan-400 shadow-[0_0_2px_black]"></div>
          </div>

          {/* Hitmarker X */}
          {hitmarker && (
            <div className="absolute text-red-500 font-black text-xl animate-ping">
              ✕
            </div>
          )}

          {/* Damage popup number */}
          {lastDamage && (
            <div className="absolute -top-6 text-red-400 font-black text-sm drop-shadow">
              -{lastDamage}
            </div>
          )}
        </div>
      )}

      {/* 6. BOTTOM LEFT: HEALTH, ARMOR, INSIGNIA, MONEY (Screenshot 10, 16) */}
      <div className="absolute bottom-6 left-6 flex items-end space-x-6">
        {/* Money Display */}
        <div className="flex flex-col mb-1">
          <div className="text-xl font-black text-[#d4a337] tracking-tight font-mono drop-shadow">
            ${stats.money.toLocaleString()}
          </div>
        </div>

        {/* Health (+ 100) */}
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-black text-red-500">+</span>
          <span className="text-4xl font-black text-white tracking-tight drop-shadow font-mono">
            {stats.health}
          </span>
        </div>

        {/* Armor (🛡️ 100) */}
        <div className="flex items-baseline space-x-2">
          <span className="text-xl">🛡️</span>
          <span className="text-4xl font-black text-white tracking-tight drop-shadow font-mono">
            {stats.armor}
          </span>
        </div>

        {/* CS2 Golden Star / Insignia */}
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-600 to-amber-300 text-black font-extrabold text-sm shadow-[0_0_12px_rgba(251,191,36,0.6)]">
          ★
        </div>
      </div>

      {/* 7. BOTTOM RIGHT: AMMO & WEAPON SLOTS (Screenshot 10, 16) */}
      <div className="absolute bottom-6 right-6 flex items-end space-x-6">
        {/* Ammo Counter: 30 / 90 */}
        <div className="flex items-baseline space-x-2 text-right">
          <span className="text-4xl font-black text-white tracking-tight drop-shadow font-mono">
            {stats.weaponAmmo[stats.currentWeapon]?.current ?? 30}
          </span>
          <span className="text-xl font-bold text-gray-500 font-mono">
            / {stats.weaponAmmo[stats.currentWeapon]?.reserve ?? 90}
          </span>
        </div>

        {/* Weapon Selection Icons */}
        <div className="flex items-center space-x-3 text-lg opacity-80">
          <span className={stats.currentWeapon.startsWith('knife') ? 'text-yellow-400 font-bold' : 'text-gray-500'}>
            🗡️
          </span>
          <span className={stats.currentWeapon === 'deagle' ? 'text-yellow-400 font-bold' : 'text-gray-500'}>
            🔫
          </span>
          <span className={['ak47', 'awp', 'm4a4'].includes(stats.currentWeapon) ? 'text-yellow-400 font-bold' : 'text-gray-500'}>
            🎯
          </span>
          <span className="text-gray-500">
            💣
          </span>
        </div>
      </div>

      {/* 8. BOTTOM CENTER: CONTROLS GUIDE */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] text-gray-400/80 font-semibold tracking-wider flex space-x-4 bg-black/40 px-4 py-1 rounded-full border border-gray-800/40">
        <span>[B] Магазин</span>
        <span>[F] Осмотр оружия</span>
        <span>[R] Перезарядка</span>
        <span>[ПКМ] Прицел</span>
        <span>[TAB] Таблица счёта</span>
        <span>[ESC] Меню</span>
      </div>
    </div>
  );
};
