// Counter-Strike 2 Settings Menu

import React, { useState } from 'react';
import { soundEngine } from '../audio/SoundEngine';

interface CS2SettingsProps {
  onClose: () => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
}

export const CS2Settings: React.FC<CS2SettingsProps> = ({ onClose, volume, onVolumeChange }) => {
  const [sens, setSens] = useState(1.8);
  const [crosshairColor, setCrosshairColor] = useState('#22d3ee');
  const [graphicsQuality, setGraphicsQuality] = useState('High');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md select-none font-['Montserrat',sans-serif]">
      <div className="w-[600px] bg-[#141a22] border border-gray-700 rounded-xl shadow-2xl p-6 text-white flex flex-col space-y-6">
        {/* Title */}
        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
          <h2 className="text-xl font-black uppercase tracking-wider text-cyan-400">Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-lg font-bold">✕</button>
        </div>

        {/* Options */}
        <div className="flex flex-col space-y-4 text-sm font-semibold">
          {/* Master Volume */}
          <div className="flex items-center justify-between">
            <span>Master Volume</span>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-48 accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Mouse Sensitivity */}
          <div className="flex items-center justify-between">
            <span>Mouse Sensitivity</span>
            <div className="flex items-center space-x-3">
              <input 
                type="range" 
                min="0.5" 
                max="4.0" 
                step="0.1"
                value={sens}
                onChange={(e) => setSens(parseFloat(e.target.value))}
                className="w-36 accent-cyan-400 cursor-pointer"
              />
              <span className="w-10 text-right font-mono text-cyan-400">{sens.toFixed(1)}</span>
            </div>
          </div>

          {/* Crosshair Color */}
          <div className="flex items-center justify-between">
            <span>Crosshair Color</span>
            <div className="flex space-x-2">
              {['#22d3ee', '#48bb78', '#f56565', '#ecc94b', '#ffffff'].map(c => (
                <button
                  key={c}
                  onClick={() => setCrosshairColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition ${crosshairColor === c ? 'border-white scale-110 shadow-md' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                ></button>
              ))}
            </div>
          </div>

          {/* Graphics Quality */}
          <div className="flex items-center justify-between">
            <span>Graphics Quality (Source 2 PBR)</span>
            <div className="flex space-x-2">
              {['Medium', 'High', 'Ultra'].map(q => (
                <button
                  key={q}
                  onClick={() => setGraphicsQuality(q)}
                  className={`px-3 py-1 rounded text-xs font-bold transition ${
                    graphicsQuality === q ? 'bg-cyan-600 text-white shadow' : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-3 border-t border-gray-700">
          <button
            onClick={() => { soundEngine.playClick(); onClose(); }}
            className="px-6 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider transition"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
