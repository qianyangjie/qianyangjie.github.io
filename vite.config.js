import { defineConfig } from 'vite';

export default defineConfig({
  // 已核对 origin 是 qianyangjie/qianyangjie.github.io，组织站点部署在根路径。
  base: '/',
  build: { target: 'es2022' },
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
});
