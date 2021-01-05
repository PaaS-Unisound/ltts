export enum AiCode {
  TTSLong = 'tts-long',
  TTSLongPlus = 'tts-long-plus',
  TTSLongBase = 'tts-long-base',
}

export const Config = {
  [AiCode.TTSLong]: {
    appKey: 'appKey',
    secret: 'secret',
    path: 'servicePath',
  },
};
