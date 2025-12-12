
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Scene } from './components/Scene';
import { UI } from './components/UI';
import { useHandTracking } from './hooks/useHandTracking';
import { ShapeType, ActionType } from './types';

const GAME_DURATION = 10; // seconds per round
const TOTAL_ROUNDS = 10;

const App: React.FC = () => {
  const [currentShape, setCurrentShape] = useState<ShapeType>(ShapeType.HEART);
  
  // Track user selected color separately from transient effect color
  const [userColor, setUserColor] = useState<string>('#ff0066');
  const [particleColor, setParticleColor] = useState<string>('#ff0066');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const { gestureState, error } = useHandTracking(videoRef);

  // Game State
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [round, setRound] = useState(0);
  const [questionQueue, setQuestionQueue] = useState<ActionType[]>([]);
  const [currentAction, setCurrentAction] = useState<ActionType>(ActionType.NONE);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"success" | "failure" | "waiting" | null>(null);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);

  // Handle color change from UI
  const handleColorChange = (color: string) => {
    setUserColor(color);
    setParticleColor(color);
  };

  // Generate a random queue of 10 actions from the larger pool
  const generateQueue = () => {
    const allActions = [
      ActionType.RAISE_LEFT, 
      ActionType.RAISE_RIGHT, 
      ActionType.CLAP, 
      ActionType.VICTORY, 
      ActionType.THUMBS_UP,
      ActionType.OK_SIGN,
      ActionType.FIST,
      ActionType.SPIDERMAN,
      ActionType.POINT,
      ActionType.CALL_ME,
      ActionType.PALM,
      ActionType.THREE,
      ActionType.FOUR,
      ActionType.PINKY,
      ActionType.PISTOL
    ];
    
    // Shuffle the entire pool
    const shuffled = [...allActions].sort(() => Math.random() - 0.5);
    
    // Select the first 10 for this game session
    return shuffled.slice(0, TOTAL_ROUNDS);
  };

  const startGame = useCallback(() => {
    const queue = generateQueue();
    setQuestionQueue(queue);
    setScore(0);
    setRound(1);
    setGameStatus('playing');
    setCurrentAction(queue[0]);
    setTimeLeft(GAME_DURATION);
    setFeedback('waiting');
    setParticleColor(userColor);
  }, [userColor]);

  const nextRound = useCallback(() => {
    if (round >= TOTAL_ROUNDS) {
      setGameStatus('finished');
      setCurrentAction(ActionType.NONE);
    } else {
      const nextRoundNum = round + 1;
      setRound(nextRoundNum);
      setCurrentAction(questionQueue[nextRoundNum - 1]);
      setTimeLeft(GAME_DURATION);
      setFeedback('waiting');
      setParticleColor(userColor);
    }
  }, [round, questionQueue, userColor]);

  // Timer Effect
  useEffect(() => {
    if (gameStatus !== 'playing' || feedback !== 'waiting') return;

    if (timeLeft <= 0) {
      // Time's up - Failure
      setFeedback('failure');
      setParticleColor('#ff0000'); // Red flash
      
      setTimeout(() => {
        nextRound();
      }, 1500);
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [gameStatus, feedback, timeLeft, nextRound]);

  // Gesture Check Effect
  useEffect(() => {
    if (gameStatus !== 'playing' || feedback !== 'waiting' || currentAction === ActionType.NONE) return;

    let isActionMet = false;
    switch (currentAction) {
        case ActionType.RAISE_LEFT:
            if (gestureState.isLeftHandRaised) isActionMet = true;
            break;
        case ActionType.RAISE_RIGHT:
            if (gestureState.isRightHandRaised) isActionMet = true;
            break;
        case ActionType.CLAP:
            if (gestureState.isClapping) isActionMet = true;
            break;
        case ActionType.VICTORY:
            if (gestureState.isVictory) isActionMet = true;
            break;
        case ActionType.THUMBS_UP:
            if (gestureState.isThumbsUp) isActionMet = true;
            break;
        case ActionType.OK_SIGN:
            if (gestureState.isOkSign) isActionMet = true;
            break;
        case ActionType.FIST:
            if (gestureState.isFist) isActionMet = true;
            break;
        case ActionType.SPIDERMAN:
            if (gestureState.isSpiderman) isActionMet = true;
            break;
        case ActionType.POINT:
            if (gestureState.isPointing) isActionMet = true;
            break;
        case ActionType.CALL_ME:
            if (gestureState.isCallMe) isActionMet = true;
            break;
        case ActionType.PALM:
            if (gestureState.isPalm) isActionMet = true;
            break;
        case ActionType.THREE:
            if (gestureState.isThree) isActionMet = true;
            break;
        case ActionType.FOUR:
            if (gestureState.isFour) isActionMet = true;
            break;
        case ActionType.PINKY:
            if (gestureState.isPinky) isActionMet = true;
            break;
        case ActionType.PISTOL:
            if (gestureState.isPistol) isActionMet = true;
            break;
    }

    if (isActionMet) {
        setScore(s => s + 10);
        setFeedback("success");
        setParticleColor('#00ff88'); // Green flash
        
        setTimeout(() => {
            nextRound();
        }, 1500);
    }

  }, [gestureState, currentAction, feedback, gameStatus, nextRound]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      {/* Video Preview - Positioned to avoid UI overlap. 
          Moved down (top-16) on mobile to clear header. 
          Moved left slightly to avoid scrollbars/edge. 
      */}
      <div className="absolute top-20 right-4 md:top-20 md:right-6 z-20 flex flex-col items-end pointer-events-none">
        <video 
          ref={videoRef} 
          className="w-28 md:w-48 rounded-lg border border-white/20 opacity-70 scale-x-[-1] shadow-2xl transition-opacity hover:opacity-100 pointer-events-auto mb-2 bg-black/50" 
          playsInline 
          muted 
          autoPlay 
        />
        <div className="bg-black/50 backdrop-blur px-2 py-0.5 rounded text-[10px] text-gray-400 border border-white/10 hidden md:block">
           摄像头画面
        </div>
      </div>

      <Scene 
        currentShape={currentShape} 
        particleColor={particleColor} 
        gestureState={gestureState}
      />

      <UI 
        currentShape={currentShape}
        setShape={setCurrentShape}
        color={userColor}
        setColor={handleColorChange}
        gestureState={gestureState}
        onToggleFullscreen={toggleFullscreen}
        trackingError={error}
        gameData={{
            status: gameStatus,
            score,
            currentAction,
            feedback,
            round,
            totalRounds: TOTAL_ROUNDS,
            timeLeft,
            onStartGame: startGame
        }}
      />
    </div>
  );
};

export default App;
