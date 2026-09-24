// Counter-Strike 2 Buy Menu (Точная копия Скриншота 1)
// 5 Columns: Снаряжение, Пистолеты, Промежуточное, Винтовки, Гранаты
// Russian UI, Authentic CS2 layout, Agent preview, refund & purchase logic

import React, { useState, useEffect } from 'react';
import { BUY_MENU_ITEMS } from '../data/buyMenuDatabase';
import { BuyMenuItem, WeaponType } from '../types/cs2';
import { soundEngine } from '../audio/SoundEngine';

interface CS2BuyMenuProps {
  money: number;
  onBuyWeapon: (item: BuyMenuItem) => void;
  onClose: () => void;
}

export const CS2BuyMenu: React.FC<CS2BuyMenuProps> = ({ money, onBuyWeapon, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const [hoveredItem, setHoveredItem] = useState<BuyMenuItem | null>(null);

  // Timer countdown: 00:30
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (sec: number) => {
    const s = sec < 10 ? `0${sec}` : `${sec}`;
    return `00:${s}`;
  };

  // Weapon SVG Silhouettes matching CS2 icons
  const renderWeaponIcon = (icon: string, affordable: boolean) => {
    const fill = affordable ? '#d4a337' : '#555555';
    switch (icon) {
      case 'glock':
      case 'usp':
      case 'p250':
      case 'tec9':
      case 'deagle':
      case 'berettas':
        return (
          <svg viewBox="0 0 100 40" className="w-16 h-8 fill-current">
            <path d="M 10 15 L 60 15 L 60 8 L 85 8 L 85 18 L 78 20 L 72 38 L 52 38 L 56 22 L 35 22 L 30 30 L 20 30 L 15 22 Z" />
          </svg>
        );
      case 'ak47':
      case 'galil':
      case 'famas':
      case 'm4a4':
      case 'm4a1s':
      case 'sg553':
      case 'aug':
        return (
          <svg viewBox="0 0 120 40" className="w-20 h-7 fill-current">
            <path d="M 5 20 L 30 18 L 45 15 L 85 15 L 90 8 L 98 8 L 102 18 L 115 18 L 115 22 L 80 22 L 72 35 L 58 35 L 62 23 L 30 25 L 12 36 L 5 34 Z" />
          </svg>
        );
      case 'awp':
      case 'ssg08':
        return (
          <svg viewBox="0 0 130 40" className="w-24 h-7 fill-current">
            <path d="M 5 22 L 25 20 L 40 18 L 50 10 L 85 10 L 85 18 L 125 18 L 125 22 L 65 24 L 60 36 L 48 36 L 50 25 L 20 26 L 8 35 Z" />
          </svg>
        );
      case 'vest':
      case 'vest-helmet':
        return (
          <svg viewBox="0 0 80 80" className="w-10 h-10 fill-current">
            <path d="M 20 15 L 35 10 L 45 10 L 60 15 L 65 35 L 58 65 L 22 65 L 15 35 Z" />
          </svg>
        );
      case 'zeus':
        return (
          <svg viewBox="0 0 80 40" className="w-14 h-7 fill-current">
            <path d="M 10 15 L 60 15 L 60 10 L 75 10 L 75 25 L 50 25 L 45 35 L 30 35 L 35 25 L 10 25 Z" />
          </svg>
        );
      case 'hegrenade':
      case 'flashbang':
      case 'smokegrenade':
      case 'molotov':
      case 'decoy':
        return (
          <svg viewBox="0 0 50 70" className="w-8 h-10 fill-current">
            <circle cx="25" cy="45" r="18" />
            <rect x="21" y="15" width="8" height="15" />
            <path d="M 21 15 L 10 8 L 15 5 L 25 12" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 100 40" className="w-16 h-8 fill-current">
            <rect x="10" y="15" width="80" height="15" rx="3" />
          </svg>
        );
    }
  };

  const handleBuy = (item: BuyMenuItem) => {
    if (money >= item.price) {
      soundEngine.playBuySuccess();
      onBuyWeapon(item);
    } else {
      soundEngine.playBuyError();
    }
  };

  const columns = [
    { id: 1, title: '1  Снаряжение', items: BUY_MENU_ITEMS.filter(i => i.column === 1) },
    { id: 2, title: '2  Пистолеты', items: BUY_MENU_ITEMS.filter(i => i.column === 2) },
    { id: 3, title: '3  Промежуточное', items: BUY_MENU_ITEMS.filter(i => i.column === 3) },
    { id: 4, title: '4  Винтовки', items: BUY_MENU_ITEMS.filter(i => i.column === 4) },
    { id: 5, title: '5  Гранаты', items: BUY_MENU_ITEMS.filter(i => i.column === 5) }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col justify-between select-none"
      style={{
        background: 'radial-gradient(circle at 65% 50%, rgba(18, 22, 28, 0.88) 0%, rgba(10, 12, 16, 0.96) 100%)',
        fontFamily: '"Montserrat", "Chakra Petch", sans-serif'
      }}
    >
      {/* Top Header Bar (Screenshot 1) */}
      <div className="flex items-center justify-between px-10 py-5 border-b border-gray-800/80 bg-black/40">
        {/* Money Display */}
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold tracking-tight text-[#d4a337]">
            ${money.toLocaleString()}
          </span>
        </div>

        {/* Purchase Time Left */}
        <div className="flex items-center space-x-3 text-lg font-medium text-gray-300">
          <span>Оставшееся для покупки время:</span>
          <span className="px-3 py-1 bg-black/60 rounded border border-gray-700 text-white font-mono font-bold tracking-wider">
            {formatTimer(timeLeft)}
          </span>
        </div>

        {/* Minimum Next Round Cash */}
        <div className="text-sm font-semibold tracking-wide text-[#80b435]">
          Минимум в следующем раунде: 2 700 $
        </div>
      </div>

      {/* Main Center Area: Columns + Agent Preview */}
      <div className="flex-1 flex px-10 py-4 relative overflow-hidden">
        {/* Faint Watermark Text: "Брошенное оружие" (Screenshot 1) */}
        <div className="absolute left-10 bottom-6 pointer-events-none opacity-10 text-6xl font-black tracking-widest uppercase text-gray-400">
          Брошенное оружие
        </div>

        {/* 5 Weapon Columns Grid */}
        <div className="grid grid-cols-5 gap-4 z-10 w-full max-w-5xl">
          {columns.map(col => (
            <div key={col.id} className="flex flex-col space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 pl-1 pb-1 border-b border-gray-700/60">
                {col.title}
              </h3>

              <div className="flex flex-col space-y-2">
                {col.items.map(item => {
                  const affordable = money >= item.price;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleBuy(item)}
                      onMouseEnter={() => {
                        setHoveredItem(item);
                        soundEngine.playHover();
                      }}
                      className={`relative flex flex-col justify-between p-2.5 h-20 rounded bg-[#161a20]/90 border transition-all duration-150 text-left ${
                        affordable 
                          ? 'border-gray-700/80 hover:border-[#d4a337] hover:bg-[#202630] cursor-pointer' 
                          : 'border-gray-800/40 opacity-40 cursor-not-allowed'
                      }`}
                    >
                      {/* Top Row: Slot Number + Weapon Name */}
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-gray-500 font-mono">{item.slot}</span>
                        <span className={`truncate ml-2 ${affordable ? 'text-gray-200' : 'text-gray-500'}`}>
                          {item.nameRu}
                        </span>
                      </div>

                      {/* Center: Weapon Icon */}
                      <div className={`flex justify-center items-center my-1 ${affordable ? 'text-[#d4a337]' : 'text-gray-600'}`}>
                        {renderWeaponIcon(item.icon, affordable)}
                      </div>

                      {/* Bottom Row: Equipped Dots + Price */}
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <div className="flex space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block"></span>
                          <span className="w-1.5 h-1.5 rounded-full bg-pink-400 inline-block"></span>
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block"></span>
                        </div>
                        <span className={`font-mono ${affordable ? 'text-[#d4a337]' : 'text-gray-600'}`}>
                          ${item.price}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Terrorist Agent Standing Holding AWP (Screenshot 1) */}
        <div className="flex-1 flex flex-col justify-end items-center pointer-events-none relative">
          <div className="relative w-80 h-[520px] flex items-center justify-center">
            {/* High Definition CS2 Agent Graphic (SVG Illustration of Phoenix Connexion holding AWP) */}
            <svg viewBox="0 0 300 500" className="w-full h-full drop-shadow-2xl">
              {/* Balaclava Head */}
              <circle cx="150" cy="90" r="45" fill="#3a4832" />
              {/* Eye cutout & Eyes */}
              <rect x="130" y="80" width="40" height="12" rx="4" fill="#1b2416" />
              <circle cx="140" cy="86" r="3" fill="#e0a98b" />
              <circle cx="160" cy="86" r="3" fill="#e0a98b" />
              {/* Plaid Shirt Collar */}
              <path d="M 120 135 L 150 155 L 180 135 L 195 180 L 105 180 Z" fill="#d2c4b0" />
              {/* Tan Plate Carrier Vest */}
              <rect x="110" y="150" width="80" height="120" rx="10" fill="#9e8d72" stroke="#756750" strokeWidth="4" />
              <rect x="120" y="190" width="60" height="60" rx="6" fill="#80725a" />
              {/* Utility Belt */}
              <rect x="105" y="270" width="90" height="16" fill="#2d2922" />
              {/* Olive Cargo Pants */}
              <path d="M 110 286 L 145 286 L 140 450 L 105 450 Z" fill="#4d573d" />
              <path d="M 155 286 L 190 286 L 195 450 L 160 450 Z" fill="#4d573d" />
              {/* Combat Boots */}
              <rect x="102" y="450" width="38" height="25" rx="5" fill="#2b241e" />
              <rect x="160" y="450" width="38" height="25" rx="5" fill="#2b241e" />
              {/* Tactical Gloves & Arms */}
              <path d="M 95 160 L 70 230 L 110 250" stroke="#d2c4b0" strokeWidth="22" strokeLinecap="round" fill="none" />
              <circle cx="110" cy="250" r="14" fill="#333333" />
              {/* Held Green AWP Sniper Rifle */}
              <rect x="40" y="225" width="220" height="22" rx="4" fill="#45543c" stroke="#2b3625" strokeWidth="3" transform="rotate(-15 150 240)" />
              {/* Scope */}
              <rect x="100" y="200" width="90" height="14" rx="3" fill="#1b1c1e" transform="rotate(-15 150 240)" />
              {/* Barrel & Muzzle */}
              <rect x="230" y="232" width="60" height="8" rx="2" fill="#1b1c1e" transform="rotate(-15 150 240)" />
            </svg>
          </div>
        </div>
      </div>

      {/* Bottom Bar Controls & Hotkey Guides (Exact Screenshot 1) */}
      <div className="flex items-center justify-between px-10 py-3 bg-black/70 border-t border-gray-800/80 text-xs text-gray-400 font-semibold tracking-wide">
        <div className="flex items-center space-x-6">
          <span className="hover:text-white cursor-pointer">
            <span className="text-[#d4a337]">[ЛЕВЫЙ CTRL+ЛКМ]</span> КУПИТЬ И БРОСИТЬ
          </span>
          <span className="hover:text-white cursor-pointer">
            <span className="text-[#d4a337]">[F4]</span> КУПИТЬ ПРЕДЫДУЩЕЕ
          </span>
          <span className="hover:text-white cursor-pointer">
            <span className="text-[#d4a337]">[F3]</span> АВТОЗАКУПКА
          </span>
          <span className="hover:text-white cursor-pointer">
            <span className="text-[#d4a337]">[DEL]</span> ВЕРНУТЬ ВСЁ
          </span>
        </div>

        <button 
          onClick={onClose}
          className="px-4 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 transition"
        >
          <span className="text-[#d4a337] font-bold mr-1">[ESCAPE]</span> НАЗАД
        </button>
      </div>
    </div>
  );
};
