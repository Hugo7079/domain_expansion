import React from 'react';

interface TitleScreenProps {
  onStart: () => void;
}

export const CharacterSelector: React.FC<TitleScreenProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-black text-white relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black z-0"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-900 to-transparent opacity-50"></div>

      <div className="z-10 text-center space-y-12 animate-fade-in">
        <div className="space-y-4">
            <h2 className="text-red-600 tracking-[0.5em] text-sm md:text-lg font-serif opacity-80">
                呪術廻戦
            </h2>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white glitch-text mb-4" data-text="領域展開">
                領域展開
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 font-serif border-t border-b border-gray-800 py-4 inline-block px-12">
                体感シミュレーター
            </p>
        </div>

        <div className="relative group cursor-pointer" onClick={onStart}>
             <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
             <button
                className="relative px-12 py-6 bg-black ring-1 ring-gray-800 text-2xl font-bold rounded-lg leading-none flex items-center divide-x divide-gray-600 group-hover:bg-gray-900 transition-colors"
             >
                <span className="pr-6 text-gray-100">特訓開始</span>
                <span className="pl-6 text-indigo-400 group-hover:text-indigo-300 transition-colors">&rarr;</span>
             </button>
        </div>
        
        <p className="text-xs text-gray-600 mt-12 max-w-xs mx-auto">
            カメラへのアクセスを許可し、術式の印を結んでください。
            <br/>AIがあなたの呪力（手）を解析します。
        </p>
      </div>
    </div>
  );
};
