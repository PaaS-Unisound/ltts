import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  hash: true,
  publicPath: './',
  history: { type: 'memory' },
  routes: [
    {
      path: '/',
      component: '@/pages/layout/index',
      routes: [
        {
          path: '/tts-long',
          component: '@/pages/layout/ttsLong/Test',
          title: '长文本语音合成_语音合成-云知声AI开放平台',
        },
        {
          path: '/',
          redirect: 'tts-long',
        },
      ],
    },
  ],

  theme: {
    'primary-color': '#1564FF',
    'border-radius-base': '4px',
  },
});
