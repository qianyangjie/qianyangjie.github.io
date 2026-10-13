# V1.0 验收记录

验证日期：2026-10-13（Asia/Shanghai）。项目目录：`C:\Users\Lenovo\Desktop\CV&web\qianyangjie.github.io`。

## 仓库检查

- 开发前 main 分支工作树干净，没有覆盖未提交的用户修改。
- origin 为 `https://github.com/qianyangjie/qianyangjie.github.io.git`，与目标一致。
- 原始 HEAD 为 `2ddc4a0`；没有提交、推送、重置或改变历史。
- 升级前的 index.html 和 README.md 原样复制到 legacy/。
- 本次连接的个人账号是 Simon-charming；qianyangjie 是其创建的组织。仓库元数据确认 owner.type 为 Organization，当前连接账号具有 admin 和 push 权限；此前协作者接口返回的集成 403 不代表账号没有仓库权限。

## 已实际执行并通过

| 检查 | 结果 |
| --- | --- |
| Node.js / npm | v24.18.0 / 11.16.0 |
| npm install | 成功，生成精确版本 lockfile；安装时审计 0 漏洞 |
| npm ci --offline --cache .npm-cache --no-audit --no-fund | 从本地已下载缓存重新安装成功 |
| npm run build | 成功，输出 dist；Vite 8.3.4 |
| npm run dev | 正常启动 5173，HTTP 200 |
| npm run preview | 正常启动 4173，HTTP 200 |
| npm test（PLAYWRIGHT_CHANNEL=msedge） | **12 passed，25.4 秒** |
| 双语键检查 | 中英文各 99 个键，HTML 文案与辅助标签没有缺失键 |
| git diff --check | 通过，没有空白错误 |

浏览器是本机 Microsoft Edge 155.0.4283.45，使用 Playwright 1.64.0。依赖 GSAP 3.15.0，均写入 package.json 与 package-lock.json。

## 12 项浏览器测试

1. 1920px：六章节、中英文、无横向溢出、联系方式与占位链接。
2. 1440px：同上。
3. 768px：同上。
4. 390px：同上。
5. 375px：同上。
6. 语言偏好跨刷新保存；切换保留滚动位置并更新 title、description、lang。
7. 移动菜单的 Enter、Escape、焦点与六个锚点；没有 pinned 区域。
8. 桌面两段固定滚动存在；四阶段按钮、Canvas 图像变化、研究兴趣显示、重复切换不增加 DOM 数量。
9. 减少动态模式没有 pin，仍可查看研究兴趣与切换阶段。
10. 禁用 JavaScript 时首屏文字、静态雷达与联系入口仍可见。
11. 将桌面固定叙事调整为 375px 后解除 pin，阶段按钮和语言切换继续工作。
12. 桌面首页、研究末段、完整页面、手机首页与中文全页截图。

截图位于 `.qa/desktop-home.png`、`.qa/desktop-research.png`、`.qa/desktop-full.png`、`.qa/mobile-home.png`、`.qa/mobile-full-zh.png`，已进行视觉检查。该目录忽略 Git。

测试发现并修复了：Windows 路径 & 对 npm 命令包装的影响、按需加载刷新中断移动导航、研究容器与阶段按钮属性重名、最后章节不足一屏时的导航状态。

## 仍需手动确认的范围

- GitHub Pages 当前是否已选择 GitHub Actions 发布，无法通过本次集成读取确认。
- 本机 Git 推送时是否已经使用 Simon-charming 完成登录；连接器权限不等同于本机 Git 的认证状态。
- workflow 的实际远程执行和线上 URL：本次按要求未推送，因此没有声称部署成功。
- Safari、Firefox、真实手机和不同 GPU 的表现：本次只在 Windows Edge 上验证。
- 长时间堆内存、耗电与低配置真实设备性能：做了重复交互 DOM 稳定性检查，实现了后台暂停与低配置静态模式，但没有进行持续性能分析。
- 联系方式已核对 href，未发送邮件或执行外部联络。

部署操作见 README.md。开发与预览服务完成验证后停止，可随时用 npm run dev / npm run preview 重新启动。
