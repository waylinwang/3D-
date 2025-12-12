import React from 'react';
import { ShapeType, HandGestureState, ActionType } from '../types';

interface UIProps {
  currentShape: ShapeType;
  setShape: (s: ShapeType) => void;
  color: string;
  setColor: (c: string) => void;
  gestureState: HandGestureState;
  onToggleFullscreen: () => void;
  trackingError: string | null;
  gameData?: {
      status: 'idle' | 'playing' | 'finished';
      score: number;
      currentAction: ActionType;
      feedback: "success" | "failure" | "waiting" | null;
      round: number;
      totalRounds: number;
      timeLeft: number;
      onStartGame: () => void;
  };
}

export const UI: React.FC<UIProps> = ({ 
  currentShape, setShape, color, setColor, gestureState, onToggleFullscreen, trackingError, gameData
}) => {
  return (
    // Main Container: Flex Column
    <div className="absolute inset-0 z-10 pointer-events-none flex flex-col h-full overflow-hidden">
      
      {/* 1. Header (Fixed Height) */}
      <div className="flex-none flex justify-between items-start p-4 md:p-6 pointer-events-auto z-30 w-full bg-gradient-to-b from-black/80 to-transparent">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
            3D 手势粒子
          </h1>
          
          {/* Tracking Status */}
          {!gestureState.isTracking && (
             <div className="mt-2 text-xs md:text-sm text-gray-400 flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
               正在启动摄像头...
             </div>
          )}
          
          {trackingError && (
             <div className="mt-2 text-red-400 text-xs bg-red-900/30 p-2 rounded border border-red-800 max-w-[200px]">
               ⚠️ {trackingError}
             </div>
          )}
        </div>

        <button 
          onClick={onToggleFullscreen}
          className="bg-white/10 hover:bg-white/20 backdrop-blur text-white p-2 md:p-3 rounded-lg transition-all border border-white/10"
          title="全屏模式"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
          </svg>
        </button>
      </div>

      {/* 2. Middle Game Area (Flexible Grow) */}
      <div className="flex-1 min-h-0 flex flex-col justify-center items-center p-4 relative z-10">
        <div className="pointer-events-auto w-full max-w-2xl text-center">
            
            {/* IDLE / START SCREEN */}
            {gameData?.status === 'idle' && gestureState.isTracking && (
                <div className="bg-black/60 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl animate-fade-in mx-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">准备挑战</h2>
                    <p className="text-gray-300 mb-6 text-sm md:text-lg">
                        10 道手势题目，每题 10 秒。<br/>
                        考验你的反应速度！
                    </p>
                    <button 
                        onClick={gameData.onStartGame}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3 px-10 md:py-4 md:px-12 rounded-full text-lg md:text-xl shadow-lg transform transition hover:scale-105 active:scale-95"
                    >
                        开始游戏
                    </button>
                </div>
            )}

            {/* FINISHED SCREEN */}
            {gameData?.status === 'finished' && (
                <div className="bg-black/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl animate-fade-in mx-4">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">挑战结束</h2>
                    <div className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 my-4 md:my-6">
                        {gameData.score}
                        <span className="text-2xl md:text-3xl text-gray-400 font-medium ml-2">/ 100</span>
                    </div>
                    
                    <p className="text-lg md:text-xl text-gray-300 mb-6">
                        准确率: {Math.round((gameData.score / 100) * 100)}%
                    </p>

                    <button 
                        onClick={gameData.onStartGame}
                        className="bg-white text-black font-bold py-3 px-8 rounded-full text-lg hover:bg-gray-200 transition transform hover:scale-105"
                    >
                        再玩一次
                    </button>
                </div>
            )}

            {/* PLAYING HUD */}
            {gameData?.status === 'playing' && (
                <div className="flex flex-col items-center w-full">
                    {/* Timer Bar */}
                    <div className="w-full max-w-xs md:max-w-md h-2 bg-gray-700 rounded-full mb-4 md:mb-6 overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-1000 linear ${
                                gameData.timeLeft <= 3 ? 'bg-red-500' : 'bg-cyan-400'
                            }`}
                            style={{ width: `${(gameData.timeLeft / 10) * 100}%` }}
                        />
                    </div>

                    {/* Round Counter */}
                    <div className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">
                        Round {gameData.round} / {gameData.totalRounds}
                    </div>

                    {/* Main Instruction */}
                    <div className={`text-4xl md:text-6xl font-black transition-all duration-300 drop-shadow-lg break-words w-full ${
                        gameData.feedback === 'success' ? 'text-green-400 scale-110' : 
                        gameData.feedback === 'failure' ? 'text-red-500 scale-90 opacity-50' : 'text-white'
                    }`}>
                        {gameData.currentAction}
                    </div>

                    {/* Feedback Message */}
                    <div className="h-10 mt-2 flex items-center justify-center">
                        {gameData.feedback === 'success' && (
                            <div className="text-green-400 text-xl md:text-2xl font-bold animate-bounce flex items-center gap-2">
                                <span>✓</span> 正确! +10
                            </div>
                        )}
                        {gameData.feedback === 'failure' && (
                            <div className="text-red-500 text-xl md:text-2xl font-bold animate-pulse flex items-center gap-2">
                                <span>✕</span> 时间到
                            </div>
                        )}
                        {gameData.feedback === 'waiting' && (
                            <div className="text-cyan-300/50 text-lg font-mono">
                                {gameData.timeLeft}s
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* 3. Bottom Controls Area (Fixed at bottom on mobile, absolute on desktop) */}
      <div className="flex-none p-4 md:p-6 pointer-events-auto w-full z-20">
        <div className="flex flex-col gap-3 md:absolute md:bottom-6 md:right-6 md:w-72 md:items-end">
            
            {/* Row for Score and Color (Side-by-side on mobile to save height) */}
            <div className="flex gap-3 w-full justify-between">
                
                {/* Score Display */}
                {gameData?.status === 'playing' && (
                    <div className="flex-1 bg-black/60 backdrop-blur-md p-3 md:p-4 rounded-xl border border-white/10 shadow-xl text-center">
                        <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">得分</div>
                        <div className="text-2xl md:text-3xl font-mono text-cyan-300">{gameData.score}</div>
                    </div>
                )}

                {/* Color Picker */}
                <div className={`${gameData?.status === 'playing' ? 'flex-1' : 'w-full'} bg-black/60 backdrop-blur-md p-3 md:p-4 rounded-xl border border-white/10 shadow-xl flex flex-col justify-center`}>
                    <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 md:mb-2 block">粒子颜色</label>
                    <div className="flex items-center gap-2">
                        <input 
                        type="color" 
                        value={color} 
                        onChange={(e) => setColor(e.target.value)}
                        className="w-8 h-8 md:w-10 md:h-10 rounded cursor-pointer border-none bg-transparent"
                        />
                        <span className="text-xs font-mono text-gray-300 truncate hidden md:block">{color}</span>
                    </div>
                </div>
            </div>

            {/* Model Selector */}
            <div className="bg-black/60 backdrop-blur-md p-3 md:p-4 rounded-xl border border-white/10 shadow-xl w-full">
                <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">选择模型</label>
                <div className="grid grid-cols-3 md:grid-cols-2 gap-2 max-h-24 md:max-h-32 overflow-y-auto pr-1">
                    {Object.values(ShapeType).map((shape) => (
                    <button
                        key={shape}
                        onClick={() => setShape(shape)}
                        className={`text-center md:text-left text-[10px] md:text-xs font-bold px-2 py-2 rounded-lg transition-all border whitespace-nowrap overflow-hidden text-ellipsis ${
                        currentShape === shape 
                            ? 'bg-purple-600/80 border-purple-500 text-white shadow-lg shadow-purple-900/50' 
                            : 'bg-white/5 border-transparent hover:bg-white/10 text-gray-300'
                        }`}
                    >
                        {shape}
                    </button>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* Instructional Footer (Hidden on mobile) */}
      {gestureState.isTracking && (
        <div className="absolute bottom-6 left-6 pointer-events-none max-w-md hidden md:block z-10">
            <div className="bg-black/40 backdrop-blur p-4 rounded-xl border border-white/5 text-xs text-gray-400 leading-relaxed">
               <p className="font-bold text-gray-200 mb-1">交互说明</p>
               <ul className="list-disc pl-4 space-y-1">
                 <li>游戏模式：跟随屏幕中央提示做动作</li>
                 <li>自由模式：单手捏合控制大小，双手张开控制扩散</li>
               </ul>
            </div>
        </div>
      )}

    </div>
  );
};