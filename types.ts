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
  FIST = '握紧拳头',
  SPIDERMAN = '摇滚/蜘蛛侠',
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
}