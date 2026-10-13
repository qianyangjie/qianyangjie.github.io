# Simon / 钱扬杰 · 个人科研主页 V1.0

基于 Vite、原生 HTML/CSS/JavaScript、GSAP 与 Canvas 的中英双语科研主页。

- 网站仓库：[qianyangjie/qianyangjie.github.io](https://github.com/qianyangjie/qianyangjie.github.io)
- 目标网站：https://qianyangjie.github.io/
- 展示的 GitHub 个人链接：[Simon-charming](https://github.com/Simon-charming)
- 邮箱：2428286976@qq.com

Simon-charming 是个人账号，qianyangjie 是该个人账号创建的组织；网站仓库属于 qianyangjie 组织，个人展示链接使用 Simon-charming。本次保留原有 Git 历史，旧版文件备份在 `legacy/`；没有执行 commit、push、远程设置修改或线上发布。

## 在 VS Code 中启动

通过“文件 → 打开文件夹”选择 `qianyangjie.github.io`，再打开“终端 → 新建终端”。推荐 Node.js 24，最低使用 Node.js 22.12。

```powershell
node --version
npm --version
npm ci
npm run dev
```

浏览器打开 http://127.0.0.1:5173/ 。保存源码后页面自动更新。停止服务按 Ctrl+C。

生产预览：

```powershell
npm run build
npm run preview
```

打开 http://127.0.0.1:4173/ 。`dist/` 是构建输出，不手动编辑或提交 Git。不要双击 index.html 或使用 Live Server：此项目需要 Vite 解析依赖。npm 脚本通过 node 直接启动 CLI，适配本机路径 `CV&web` 中的 & 字符。

## 文件与六个章节

| 文件 | 用途 |
| --- | --- |
| index.html | 六章节语义结构、英文初始内容、原创 SVG 与 SEO |
| src/styles/global.css | 设计变量、Grid/Flex 布局与响应式规则 |
| src/data/content.js | 个人资料、全部双语文案、项目与论文数据 |
| src/i18n/translations.js | 即时语言切换、记忆偏好、lang 与元数据 |
| src/components/navigation.js | 导航定位、移动菜单、键盘与焦点 |
| src/animations/hero.js | Canvas 雷达、开场与滚动时间轴 |
| src/animations/research.js | 按需加载的四阶段信号可视化 |
| src/animations/scroll.js | 标题渐入、正文高亮、卡片悬停与联系区光影 |
| src/main.js | 初始化、项目链接与真实论文列表渲染 |
| package.json / package-lock.json | 命令与精确锁定的依赖版本 |
| vite.config.js | 根路径 base、构建、服务端口 |
| public/ | SVG favicon、robots.txt、sitemap.xml |
| .github/workflows/deploy.yml | 官方 GitHub Pages Actions |
| playwright.config.js / tests/site.spec.js | 实际浏览器验收 |
| LEARNING.md / VERIFICATION.md | 中文学习链与本次验收记录 |
| legacy/ | 升级前的原始 index.html、README.md |

Home 使用大字号姓名、Canvas 雷达与 SVG 回退。About 使用字母图形与已确认的院校、专业，不添加学位或年份。Research 展示模拟信号、处理流程与四个研究兴趣。Projects 是三个明确标注的示例卡片。Publications 暂为空列表。Contact 使用真实 GitHub 和 mailto 链接。

## 两段滚动动画

首页开场 timeline 让姓名与雷达渐入。滚动 timeline 把姓名缩小淡出、雷达放大、目标增强与收尾连接起来。ScrollTrigger 的 `pin` 在叙事期间固定 `.hero-stage`，`scrub` 将滚动同步到时间轴。桌面首屏与滚动距离合计约 235vh。

Research 用一个 0–1 的进度控制画面：原始杂波 → 信号处理 → 目标峰值和定位线显现 → 图表收至左侧，研究兴趣依次进入。四个按钮可跳到对应阶段。手机、矮视口与减少动态模式取消 pin，按钮直接切换静态图。

研究模块通过动态 import 和 IntersectionObserver 按需初始化。点击导航时先完成必要初始化，再计算锚点，避免加载打断平滑滚动。切换语言只修改 textContent，不重建动画元素。

Canvas 像素比上限为 2。首页约 30 fps，仅在可见且标签页处于前台时绘制；研究图只在尺寸或进度改变时绘制。硬件线程数或内存提示值不超过 2 的设备使用静态模式。减少动态模式保留所有信息内容。

这些图都是原理示意，不是算法实验实现或真实测量结果。未来可替换 research.js 中的 `signal()` 与 `draw()`，保留导航和滚动逻辑。

## 修改内容

### 个人介绍与教育背景

编辑 `src/data/content.js` 的 `translations.en` 和 `translations.zh` 同名键，例如 `about.hello`、`about.p1`、`education.1.school`。HTML 的 `data-i18n="about.hello"` 指定对应文字。新增文案时同时补齐两种语言。

联系方式修改 `profile.github`、`profile.email`；为了在 JS 加载前也正确显示，请同步修改 index.html 的初始链接、邮箱与必要的 SEO 信息。

### 科研项目

修改对应 `project.keystone.*`、`project.clutter.*` 或 `project.lab.*` 的中英文标题、简介。projects 数组保存状态与真实仓库：

```javascript
{ id: 'keystone', repository: null, status: 'example' }
```

repository 为 null 时不生成链接。仅在提供真实项目后填完整 HTTPS 地址、替换真实状态，并更新 index.html 中的标签和图示。全部示例替换后同步修改 `projects.note`。当前三个样例不表示已经完成或公开的科研项目。

### 论文成果

给 publications 数组添加真实条目，空状态会自动变成列表：

```javascript
export const publications = [
  {
    title: { en: '真实英文题目', zh: '真实中文题目' },
    authors: '真实作者列表',
    venue: '真实期刊或会议',
    year: 2026, // 只填已确认的年份
    doi: null,
    pdf: null,
    github: null,
  },
];
```

有真实链接时再将 null 替换为完整 HTTPS URL，空链接不显示按钮。不要将上面的说明文字当作论文发布。

## 浏览器验收

本机使用已安装的 Edge：

```powershell
npm run build
$env:PLAYWRIGHT_CHANNEL = 'msedge'
npm test
```

其他环境默认使用 Playwright Chromium，首次可运行：

```powershell
node node_modules/@playwright/test/cli.js install chromium
npm test
```

测试启动或复用 4173 端口的生产预览服务。截图在忽略的 `.qa/`，失败信息在 `test-results/`。改源码后先 build，避免验证旧 dist。具体结果见 VERIFICATION.md。

## 提交到 GitHub（由你执行）

先检查 origin、main 分支和修改内容：

```powershell
git remote -v
git branch --show-current
git status
git diff
```

确认 origin 为 `https://github.com/qianyangjie/qianyangjie.github.io.git`，然后：

```powershell
git add index.html README.md .gitignore package.json package-lock.json vite.config.js playwright.config.js src public tests .github legacy LEARNING.md VERIFICATION.md
git commit -m "Build bilingual research homepage V1.0"
git push origin main
```

不要 force push 或重置历史。发生冲突或权限错误时先查明原因。

登录时使用个人账号 Simon-charming，仓库属于你创建的 qianyangjie 组织，无需把 origin 改到个人账号名下。仓库元数据已确认当前连接账号具有 admin 和 push 权限；此前协作者接口的 403 是该接口的集成访问限制。若本机 Git 提示登录，请使用 Simon-charming 完成认证。

## GitHub Pages 发布与确认

1. 用 Simon-charming 登录 GitHub，打开组织仓库的 Settings → Pages → Build and deployment。
2. Source 选择 **GitHub Actions**。
3. 提交并推送 main，在 Actions 查看 **Deploy research homepage to GitHub Pages**。
4. 确认 build、deploy 作业都成功，github-pages 环境显示目标地址。
5. 打开 https://qianyangjie.github.io/ ，核对六个章节、语言切换和交互。缓存旧页时刷新或使用隐私窗口。

工作流根据 [GitHub 官方 Pages 文档](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) 配置：npm ci → npm run build → 上传 dist → 部署。只有部署作业具有 pages: write 和 id-token: write 权限。

已确认 origin 是目标组织站点 qianyangjie/qianyangjie.github.io，域名根路径仍为 https://qianyangjie.github.io/，所以 Vite base 使用 `/`。将来迁移到其他仓库、子路径或域名时，重新核对 base、canonical、robots 和 sitemap。

本次未修改远程 Pages 设置、未推送，需按上述步骤选择 GitHub Actions 并完成线上发布。
