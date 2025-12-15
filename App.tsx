import React, { useState, useEffect } from 'react';
import { initializeGenAI, analyzeGesture } from './services/geminiService';
import { Character, GameState, AnalysisResult } from './types';
import { CHARACTERS } from './constants';
import { CharacterSelector } from './components/CharacterSelector';
import { CameraFeed } from './components/CameraFeed';
import { EffectDisplay } from './components/EffectDisplay';

interface AIStudioClient {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.API_KEY_CHECK);
  const [detectedCharacter, setDetectedCharacter] = useState<Character | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [lastImage, setLastImage] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [apiKeyError, setApiKeyError] = useState<string>('');

  useEffect(() => {
    checkApiKey();
  }, []);

  const getAIStudio = (): AIStudioClient | undefined => {
    return (window as any).aistudio;
  };

  const checkApiKey = async () => {
    // Check localStorage first
    const storedApiKey = localStorage.getItem('gemini_api_key');
    if (storedApiKey) {
      initializeGenAI(storedApiKey);
      setGameState(GameState.TITLE_SCREEN);
      return;
    }

    const aiStudio = getAIStudio();
    if (aiStudio) {
      const hasKey = await aiStudio.hasSelectedApiKey();
      if (hasKey) {
        initializeGenAI(); 
        setGameState(GameState.TITLE_SCREEN);
      } else {
        setGameState(GameState.API_KEY_CHECK);
      }
    } else {
      setGameState(GameState.API_KEY_CHECK);
    }
  };

  const handleSelectKey = async () => {
    const aiStudio = getAIStudio();
    if (aiStudio) {
        try {
            await aiStudio.openSelectKey();
            initializeGenAI();
            setGameState(GameState.TITLE_SCREEN);
        } catch (e) {
            console.error("Key selection failed", e);
            if (e instanceof Error && e.message.includes("Requested entity was not found")) {
               alert("認証に失敗しました。もう一度お試しください。");
            }
        }
    }
  };

  const handleSubmitApiKey = () => {
    setApiKeyError('');
    if (!apiKeyInput.trim()) {
      setApiKeyError('請輸入 API Key');
      return;
    }
    if (!apiKeyInput.startsWith('AIza')) {
      setApiKeyError('無效的 API Key 格式');
      return;
    }
    
    // Store in localStorage
    localStorage.setItem('gemini_api_key', apiKeyInput.trim());
    initializeGenAI(apiKeyInput.trim());
    setGameState(GameState.TITLE_SCREEN);
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKeyInput('');
    setApiKeyError('');
    setGameState(GameState.API_KEY_CHECK);
  };

  const handleStart = () => {
    setGameState(GameState.CAMERA_SETUP);
  };

  const handleRetry = () => {
    setAnalysisResult(null); 
    setDetectedCharacter(null);
    setGameState(GameState.CAMERA_SETUP);
  };

  const handleCapture = async (base64Image: string) => {
    setLastImage(base64Image);
    setGameState(GameState.ANALYZING);
    setAnalysisResult(null);
    setDetectedCharacter(null);

    try {
      const result = await analyzeGesture(base64Image);
      setAnalysisResult(result);

      // Robust Success Logic:
      // 1. isCorrect flag is true OR Score is very high (safety net)
      // 2. A character ID was returned
      const isSuccess = (result.isCorrect || result.score >= 90) && result.detectedCharacterId;

      if (isSuccess && result.detectedCharacterId) {
        // Normalize ID to lowercase to ensure matching
        const normalizedId = result.detectedCharacterId.toLowerCase();
        const character = CHARACTERS.find(c => c.id === normalizedId);
        
        if (character) {
            setDetectedCharacter(character);
            setGameState(GameState.DOMAIN_EXPANDED);
        } else {
            console.error(`Character ID '${normalizedId}' returned by AI not found in constants.`);
            setGameState(GameState.FAILURE);
        }
      } else {
        setGameState(GameState.FAILURE);
      }
    } catch (error) {
      console.error("Analysis failed", error);
      alert("解析エラーが発生しました。");
      setGameState(GameState.CAMERA_SETUP);
    }
  };

  if (gameState === GameState.API_KEY_CHECK) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-indigo-100 text-gray-900 flex items-center justify-center p-6">
        <div className="max-w-3xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="p-8 bg-white rounded-lg shadow-lg">
            <h1 className="text-4xl font-bold mb-2 font-serif">呪術廻戦</h1>
            <p className="text-lg text-gray-600 mb-6">領域展開 — 在鏡頭前做出特定手勢以觸發角色專屬特效。請先提供 API Key 後開始。</p>

            <label className="block text-sm font-medium mb-2 text-gray-700">API Key</label>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmitApiKey()}
              placeholder="AIza..."
              className="w-full bg-gray-50 border border-gray-300 rounded px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400 transition-colors mb-3"
            />
            {apiKeyError && (
              <p className="text-red-500 text-sm mb-3">{apiKeyError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleSubmitApiKey}
                className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded font-semibold hover:bg-indigo-700 transition-colors"
              >
                開始
              </button>
              <button
                onClick={handleSelectKey}
                className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded font-semibold hover:bg-gray-300 transition-colors"
              >
                選擇 API Key
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-4">API Key 僅儲存在你的瀏覽器（localStorage），請勿把金鑰提交到公開 repository。</p>
          </div>

          <div className="p-8 flex flex-col items-center justify-center">
            <div className="w-full h-56 rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 flex items-center justify-center text-white text-center shadow-md">
              <div>
                <h2 className="text-2xl font-bold">準備好開啟你的領域展開了嗎？</h2>
                <p className="mt-2 opacity-90">允許使用鏡頭，做出手勢，看看 AI 會辨識出哪位角色的領域。</p>
              </div>
            </div>
            <div className="text-sm text-gray-600 mt-6">（如果你已經有 API Key，請輸入後按「開始」）</div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === GameState.TITLE_SCREEN) {
    const storedApiKey = localStorage.getItem('gemini_api_key');
    return (
      <div className="relative">
        <CharacterSelector onStart={handleStart} />
        {storedApiKey && (
          <button
            onClick={handleClearApiKey}
            className="fixed top-4 right-4 bg-gray-800 hover:bg-gray-700 text-white text-xs px-3 py-2 rounded transition-colors z-50"
            title="變更 API Key"
          >
            變更 API Key
          </button>
        )}
      </div>
    );
  }

  if (gameState === GameState.CAMERA_SETUP || gameState === GameState.ANALYZING) {
    return (
        <div className="relative">
            <CameraFeed 
                onCapture={handleCapture} 
                isAnalyzing={gameState === GameState.ANALYZING}
                onBack={() => setGameState(GameState.TITLE_SCREEN)}
            />
        </div>
    );
  }

  if (gameState === GameState.FAILURE && analysisResult) {
    return (
        <div className="relative w-full h-screen bg-black flex flex-col items-center justify-center overflow-hidden animate-fade-in">
            {lastImage && (
                <div className="absolute inset-0 z-0">
                    <img 
                        src={`data:image/jpeg;base64,${lastImage}`} 
                        alt="Background" 
                        className="w-full h-full object-cover opacity-30 blur-sm"
                        style={{ transform: 'scaleX(-1)' }} 
                    />
                    <div className="absolute inset-0 bg-black/50"></div>
                </div>
            )}

            <div className="z-50 border-2 border-red-800 p-8 rounded-sm max-w-lg text-center bg-black relative overflow-hidden shadow-[0_0_50px_rgba(255,0,0,0.2)] mx-4">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none"></div>
                
                <h2 className="text-4xl font-black text-red-600 mb-2 font-serif tracking-widest relative z-10">不発</h2>
                <div className="text-xs text-gray-500 mb-6 uppercase tracking-[0.5em] relative z-10">Expansion Failed</div>
                
                <div className="text-6xl font-black text-white mb-6 font-mono relative z-10">{analysisResult.score}<span className="text-2xl text-gray-600">%</span></div>
                
                <p className="text-lg text-gray-200 mb-8 font-serif leading-relaxed relative z-10">
                    「{analysisResult.feedback}」
                </p>
                
                <button 
                    onClick={handleRetry}
                    className="relative z-20 bg-red-800 hover:bg-red-700 text-white px-8 py-3 rounded-sm uppercase tracking-widest font-bold transition-colors cursor-pointer w-full md:w-auto"
                >
                    再挑戦
                </button>
            </div>
        </div>
    );
  }

  if (gameState === GameState.DOMAIN_EXPANDED && detectedCharacter) {
    return (
        <EffectDisplay 
            character={detectedCharacter} 
            onReset={() => setGameState(GameState.TITLE_SCREEN)} 
        />
    );
  }

  return <div>Loading...</div>;
};

export default App;