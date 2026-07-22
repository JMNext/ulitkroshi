export interface PetAnimConfig {
  height: string;
  translateY: string;
  overflowVisible?: boolean;
}

export const PET_ANIMS_CONFIG: Record<string, PetAnimConfig> = {
  wash: {
    height: '235.92%',
    translateY: '156px',
   
  },
  play: {
    height: '100%',
    translateY: '0px',
  },
  eat: {
    height: '100%',
    translateY: '0px',
  },
  sad_state: {
    height: '100%',
    translateY: '0px',
  },
  sleep_begin: {
    height: '100%',
    translateY: '0px',
  },
  sleep_circle: {
    height: '100%',
    translateY: '0px',
  },
  sleep_awake: {
    height: '100%',
    translateY: '0px',
  },
  prostoi1: {
    height: '100%',
    translateY: '0px',
  },
  prostoi2: {
    height: '100%',
    translateY: '0px',
  },
};
