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
    <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6">
      
      {/* Header */}
      <div className="flex justify-between items-start pointer-events-auto w-full">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
            3D 手势粒子
          </h1>
          
          {/* Tracking Status */}
          {!gestureState.isTracking && (
             <div className="mt-2 text-sm text-gray-400 flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
               正在启动摄像头...
             </div>
          )}
          
          {trackingError && (
             <div className="mt-2 text-red-400 text-sm bg-red-900/30 p-2 rounded border border-red-800">
               ⚠️ {trackingError}
             </div>
          )}
        </div>

        <button 
          onClick={onToggleFullscreen}
          className="bg-white/10 hover:bg-white/20 backdrop-blur text-white p-3 rounded-lg transition-all border border-white/10"
          title="全屏模式"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
          </svg>
        </button>
      </div>

      {/* CENTER GAME AREA */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-full max-w-2xl pointer-events-auto">
        
        {/* IDLE / START SCREEN */}
        {gameData?.status === 'idle' && gestureState.isTracking && (
            <div className="bg-black/60 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl animate-fade-in">
                <h2 className="text-4xl font-bold text-white mb-4">准备好了吗？</h2>
                <p className="text-gray-300 mb-8 text-lg">
                    挑战 10 道手势题目，每题 10 秒。<br/>
                    看谁的反应最快，准确率最高！
                </p>
                <button 
                    onClick={gameData.onStartGame}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-4 px-12 rounded-full text-xl shadow-lg transform transition hover:scale-105 active:scale-95"
                >
                    开始游戏
                </button>
            </div>
        )}

        {/* FINISHED SCREEN */}
        {gameData?.status === 'finished' && (
            <div className="bg-black/80 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl animate-fade-in">
                <h2 className="text-5xl font-bold text-white mb-2">挑战结束</h2>
                <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 my-6">
                    {gameData.score}
                    <span className="text-3xl text-gray-400 font-medium ml-2">/ 100</span>
                </div>
                
                <p className="text-xl text-gray-300 mb-8">
                    准确率: {Math.round((gameData.score / 100) * 100)}% <br/>
                    <span className="text-sm opacity-70">
                        {gameData.score === 100 ? "太神了！完美通关！🏆" : 
                         gameData.score >= 80 ? "非常棒！反应敏捷！🥈" : 
                         gameData.score >= 60 ? "还不错，继续加油！🥉" : "多练习一下再来挑战吧！"}
                    </span>
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
             <div className="flex flex-col items-center">
                {/* Timer Bar */}
                <div className="w-64 h-2 bg-gray-700 rounded-full mb-6 overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-1000 linear ${
                            gameData.timeLeft <= 3 ? 'bg-red-500' : 'bg-cyan-400'
                        }`}
                        style={{ width: `${(gameData.timeLeft / 10) * 100}%` }}
                    />
                </div>

                {/* Round Counter */}
                <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Round {gameData.round} / {gameData.totalRounds}
                </div>

                {/* Main Instruction */}
                <div className={`text-5xl md:text-6xl font-black transition-all duration-300 drop-shadow-lg ${
                    gameData.feedback === 'success' ? 'text-green-400 scale-110' : 
                    gameData.feedback === 'failure' ? 'text-red-500 scale-90 opacity-50' : 'text-white'
                }`}>
                    {gameData.currentAction}
                </div>

                {/* Feedback Message */}
                <div className="h-12 mt-4 flex items-center justify-center">
                    {gameData.feedback === 'success' && (
                        <div className="text-green-400 text-2xl font-bold animate-bounce flex items-center gap-2">
                            <span className="text-3xl">✓</span> 正确! +10
                        </div>
                    )}
                    {gameData.feedback === 'failure' && (
                        <div className="text-red-500 text-2xl font-bold animate-pulse flex items-center gap-2">
                            <span className="text-3xl">✕</span> 时间到
                        </div>
                    )}
                     {gameData.feedback === 'waiting' && (
                        <div className="text-cyan-300/50 text-xl font-mono">
                            {gameData.timeLeft}s
                        </div>
                    )}
                </div>
             </div>
        )}
      </div>

      {/* Controls & Mini-HUD - Bottom Right */}
      <div className="pointer-events-auto flex flex-col gap-4 max-w-xs absolute bottom-6 right-6">
        
        {/* Score Display (Always visible during game) */}
        {gameData?.status === 'playing' && (
            <div className="bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-xl text-center">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">当前得分</div>
                <div className="text-3xl font-mono text-cyan-300">{gameData.score}</div>
            </div>
        )}

        {/* Color Picker */}
        <div className="bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-xl">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">粒子颜色</label>
          <div className="flex items-center gap-3">
            <input 
              type="color" 
              value={color} 
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border-none bg-transparent"
            />
            <span className="text-sm font-mono text-gray-300">{color}</span>
          </div>
        </div>

        {/* Model Selector */}
        <div className="bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-xl">
           <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">选择模型</label>
           <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1">
             {Object.values(ShapeType).map((shape) => (
               <button
                 key={shape}
                 onClick={() => setShape(shape)}
                 className={`text-left text-xs font-bold px-3 py-2 rounded-lg transition-all border ${
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

      {/* Instructional Footer */}
      {gestureState.isTracking && (
        <div className="absolute bottom-6 left-6 pointer-events-none max-w-md hidden md:block">
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