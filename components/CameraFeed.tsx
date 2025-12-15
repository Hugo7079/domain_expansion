import React, { useRef, useEffect, useState } from 'react';
import { CHARACTERS } from '../constants';

interface CameraFeedProps {
  onCapture: (base64: string) => void;
  isAnalyzing: boolean;
  onBack: () => void;
}

export const CameraFeed: React.FC<CameraFeedProps> = ({ onCapture, isAnalyzing, onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMounted = useRef(true); 
  const activeStreamRef = useRef<MediaStream | null>(null);
  
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showHints, setShowHints] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    isMounted.current = true;
    startCamera();

    return () => {
      isMounted.current = false;
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      stopCamera();
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });

      if (!isMounted.current) {
        mediaStream.getTracks().forEach(track => track.stop());
        return;
      }

      activeStreamRef.current = mediaStream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      if (isMounted.current) {
        alert("領域展開にはカメラの許可が必要です (Permissions required).");
      }
    }
  };

  const stopCamera = () => {
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
          track.enabled = false;
        } catch (e) {
          console.warn("Failed to stop track:", e);
        }
      });
      activeStreamRef.current = null;
    }

    if (videoRef.current && videoRef.current.srcObject) {
      try {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => {
             try {
                 track.stop();
             } catch(e) {}
        });
        videoRef.current.srcObject = null;
      } catch (e) {
        console.warn("Failed to clean up video element source:", e);
      }
    }
  };

  const handleCaptureClick = () => {
    if (isAnalyzing || countdown !== null) return;
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Countdown finished.
      // Trigger flash immediately
      setFlash(true);
      
      // WAIT slightly for the user to react/freeze and for video to buffer the frame
      // This solves the "using previous gesture" issue
      setTimeout(() => {
          captureFrame();
          setFlash(false); 
      }, 150); 
      
      setCountdown(null);
    }
  }, [countdown]);

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Ensure we are drawing the current video frame
    if (video.readyState < 2) return; // Not ready data

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9); // High quality
      const base64 = dataUrl.split(',')[1];
      
      onCapture(base64);
    }
  };

  return (
    <div className="relative w-full h-screen bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Video Background */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        style={{ transform: 'scaleX(-1)' }} 
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Shutter Flash Effect */}
      <div className={`absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-75 ease-out ${flash ? 'opacity-100' : 'opacity-0'}`}></div>

      {/* Overlay UI */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between p-6 pointer-events-none">
        
        {/* Top Bar */}
        <div className="flex justify-between items-start w-full pointer-events-auto z-20">
            <button onClick={onBack} className="bg-black/40 backdrop-blur text-white/80 px-6 py-2 rounded-sm border-l-2 border-red-600 hover:bg-black/60 transition font-serif tracking-widest text-sm">
                撤退
            </button>
            <button 
                onClick={() => setShowHints(true)}
                className="bg-black/40 backdrop-blur text-white/90 px-5 py-2 rounded-sm border-r-2 border-indigo-500 hover:bg-black/60 transition font-serif tracking-widest text-sm flex items-center space-x-2"
            >
                <span>印ノ確認</span>
            </button>
        </div>

        {/* Center Guide / Countdown */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={`w-72 h-72 md:w-96 md:h-96 border border-white/20 rounded-full flex items-center justify-center transition-all relative ${isAnalyzing ? 'animate-pulse' : ''}`}>
                <div className="absolute top-0 bottom-0 w-[1px] bg-white/10"></div>
                <div className="absolute left-0 right-0 h-[1px] bg-white/10"></div>
                
                {countdown !== null ? (
                    <span className="text-8xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-ping font-serif">
                        {countdown === 0 ? '' : countdown}
                    </span>
                ) : isAnalyzing ? (
                    <div className="flex flex-col items-center space-y-2">
                        <div className="w-12 h-12 border-4 border-t-red-500 border-white/20 rounded-full animate-spin"></div>
                        <span className="text-red-500 font-bold tracking-widest bg-black/80 px-2 animate-pulse">解析中...</span>
                    </div>
                ) : (
                    <span className="text-white/40 text-lg font-serif tracking-[0.2em] animate-pulse">印ヲ結ベ</span>
                )}
            </div>
        </div>

        {/* Bottom Controls */}
        <div className="w-full flex justify-center pb-12 pointer-events-auto">
            <button 
                onClick={handleCaptureClick}
                disabled={isAnalyzing || countdown !== null}
                className={`
                    group relative px-12 py-6 bg-transparent overflow-hidden rounded-sm transition-all
                    ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
                `}
            >
                 <div className="absolute inset-0 bg-red-900/80 skew-x-12 group-hover:bg-red-800 transition-colors"></div>
                 <div className="absolute inset-0 border-2 border-white/20 skew-x-12 group-hover:border-white/50 transition-colors"></div>
                 
                 <span className="relative text-3xl font-black text-white uppercase tracking-[0.5em] drop-shadow-md block font-serif">
                    領域展開
                 </span>
            </button>
        </div>
      </div>
      
      {/* Hints Modal */}
      {showHints && (
        <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col p-6 animate-fade-in pointer-events-auto">
           <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4 shrink-0">
              <div>
                  <h3 className="text-2xl font-serif text-white tracking-widest font-bold">術式開示</h3>
                  <p className="text-xs text-gray-500 font-mono mt-1">AVAILABLE DOMAIN EXPANSIONS</p>
              </div>
              <button 
                onClick={() => setShowHints(false)} 
                className="text-gray-400 hover:text-white text-4xl leading-none transition-colors"
              >
                &times;
              </button>
           </div>
           
           <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
              {CHARACTERS
                .filter(c => !c.hidden)
                .map(char => (
                <div key={char.id} className="bg-white/5 p-4 rounded-sm border-l-2 border-gray-700 hover:border-white/50 transition-colors">
                  <div className="flex items-baseline justify-between mb-2">
                     <span className={`text-lg font-bold ${char.accentColor} font-serif`}>{char.japaneseName}</span>
                     <span className="text-xs text-gray-500 uppercase tracking-wider">{char.name}</span>
                  </div>
                  <div className="text-sm text-gray-300 leading-relaxed font-sans opacity-90">
                    {char.handSignDescription}
                  </div>
                </div>
              ))}
              <div className="h-12"></div>
           </div>
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,transparent_40%,rgba(0,0,0,0.9)_100%)]"></div>
    </div>
  );
};