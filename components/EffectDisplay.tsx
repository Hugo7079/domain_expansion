import React, { useEffect, useState } from 'react';
import { Character } from '../types';

interface EffectDisplayProps {
  character: Character;
  onReset: () => void;
}

export const EffectDisplay: React.FC<EffectDisplayProps> = ({ character, onReset }) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`relative w-full h-screen overflow-hidden flex items-center justify-center ${character.color}`}>
      
      {/* Background Ambience */}
      <div className={`absolute inset-0 bg-gradient-to-br from-black via-transparent to-black opacity-90 z-0`}></div>
      <div className={`absolute inset-0 opacity-40 animate-pulse ${character.color} blur-[100px] z-0`}></div>

      {/* Cinematic Flash */}
      <div className="absolute inset-0 bg-white animate-[fadeOut_2s_ease-out_forwards] pointer-events-none z-50"></div>

      {/* Main Content */}
      <div className={`relative z-20 flex flex-col items-center justify-center transition-all duration-1000 transform ${showContent ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
        
        <div className="flex flex-col items-center space-y-6">
            <h2 className="text-xl md:text-2xl text-white/80 tracking-[1em] font-serif border-b border-white/30 pb-4 mb-4 animate-[slideIn_1.2s_ease-out]">
            領域展開
            </h2>
            
            <h1 className={`text-6xl md:text-9xl font-black ${character.accentColor} drop-shadow-[0_0_30px_rgba(255,255,255,0.4)] tracking-tighter text-center animate-[zoomIn_0.4s_cubic-bezier(0,0,0.2,1)] whitespace-nowrap font-serif`}>
            {character.domainNameKanji}
            </h1>

            <p className="text-white/60 font-mono tracking-widest text-sm uppercase mt-4">
                {character.domainName}
            </p>
        </div>

      </div>

      {/* Persistent Controls */}
      <div className="absolute bottom-12 left-0 right-0 flex justify-center z-30 opacity-0 animate-[fadeIn_2s_ease-in_forwards_2s]">
        <button 
          onClick={onReset}
          className="group bg-transparent border border-white/30 text-white px-10 py-3 rounded-sm font-serif tracking-widest transition-all hover:bg-white hover:text-black hover:border-white"
        >
          術式解除
        </button>
      </div>

      <style>{`
        @keyframes fadeOut {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes slideIn {
          0% { transform: translateY(-30px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes zoomIn {
          0% { transform: scale(1.5); opacity: 0; filter: blur(10px); }
          100% { transform: scale(1); opacity: 1; filter: blur(0); }
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};
