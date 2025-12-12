
export enum ShapeType {
  HEART = '爱心',
  FLOWER = '花朵',
  SATURN = '土星',
  BUDDHA = '佛像',
  FIREWORKS = '烟花',
  LOVE_TEXT = '告白',
}

export enum ActionType {
  NONE = '等待指令...',
  RAISE_LEFT = '举起左手',
  RAISE_RIGHT = '举起右手',
  CLAP = '鼓掌',
  VICTORY = '比个耶 (剪刀手)',
  THUMBS_UP = '点个赞 (大拇指)',
  OK_SIGN = 'OK 手势',
  FIST = '握紧拳头 (石头)',
  SPIDERMAN = '摇滚/蜘蛛侠',
  POINT = '伸出食指 (1)',
  CALL_ME = '打电话 (6)',
  // New Actions for the Pool
  PALM = '张开手掌 (布/5)',
  THREE = '数字 3 (W手势)',
  FOUR = '数字 4',
  PINKY = '伸出小指 (拉勾)',
  PISTOL = '手枪手势',
}

export interface ParticleConfig {
  count: number;
  color: string;
  size: number;
}

export interface HandGestureState {
  isTracking: boolean;
  pinchDistance: number;
  handDistance: number;
  handsDetected: number;
  // Game Actions
  isLeftHandRaised: boolean;  
  isRightHandRaised: boolean; 
  isClapping: boolean;
  isVictory: boolean;
  isThumbsUp: boolean;
  isOkSign: boolean;
  isFist: boolean;
  isSpiderman: boolean;
  isPointing: boolean;
  isCallMe: boolean;
  // New States
  isPalm: boolean;
  isThree: boolean;
  isFour: boolean;
  isPinky: boolean;
  isPistol: boolean;
}
