import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { translate } from '../i18n/translations.js';

export function initResearch({ staticMode }) {
  const scene = document.querySelector('.research-scene');
  const canvas = document.querySelector('#signal-canvas');
  const context = canvas.getContext('2d');
  const buttons = [...scene.querySelectorAll('[data-stage]')];
  const description = scene.querySelector('#stage-description');
  const state = { progress: staticMode ? .95 : 0 };
  const stops = [.02, .37, .65, .96];
  let width = 0;
  let height = 0;
  let frame = 0;
  let stage = -1;
  let story = null;

  // 独立的绘图函数：以后可用真实数据替换 signal(x, progress)，不必改导航与动画。
  // 这里是设计用模拟信号，不是算法实现或实验结果，也不报告性能数字。
  const smooth = (x) => { const value = Math.max(0, Math.min(1, x)); return value * value * (3 - 2 * value); };
  function signal(x, progress) {
    const suppression = smooth((progress - .2) / .42);
    const clutter = Math.sin(x * 80) * .045 + Math.sin(x * 219 + .5) * .075 + Math.sin(x * 517) * .023 + Math.sin(x * 43) * .055;
    const background = clutter * (1 - suppression * .94) * (1 + Math.sin(progress * Math.PI / .4) * .16 * (progress < .2 ? 1 : 0));
    const target = Math.exp(-Math.pow((x - .68) / .017, 2)) * (.075 + smooth((progress - .32) / .36) * .55);
    return .23 + background + target;
  }
  function draw() {
    frame = 0;
    if (!context || !width || !height || document.hidden) return;
    context.clearRect(0, 0, width, height);
    const left = 18, right = width - 14, top = 25, bottom = height - 30;
    const plotWidth = right - left, plotHeight = bottom - top;
    context.strokeStyle = 'rgba(108,135,167,.11)'; context.lineWidth = .6;
    for (let i = 0; i <= 8; i++) {
      const x = left + plotWidth * i / 8;
      context.beginPath(); context.moveTo(x, top); context.lineTo(x, bottom); context.stroke();
    }
    for (let i = 0; i <= 4; i++) {
      const y = top + plotHeight * i / 4;
      context.beginPath(); context.moveTo(left, y); context.lineTo(right, y); context.stroke();
    }
    const progress = state.progress;
    const emergence = smooth((progress - .37) / .32);
    // 固定杂波轨迹随进度减弱。绘制只在进度或尺寸变化时执行，无后台循环。
    for (let trace = 0; trace < 3; trace++) {
      context.beginPath();
      for (let pixel = 0; pixel <= plotWidth; pixel += 2) {
        const x = pixel / plotWidth;
        const value = .31 + .035 * trace + (Math.sin(x * 130 + trace) * .095 + Math.sin(x * 397 + trace) * .035) * (1 - emergence * .95);
        const y = bottom - value * plotHeight;
        if (!pixel) context.moveTo(left, y); else context.lineTo(left + pixel, y);
      }
      context.strokeStyle = `rgba(64,111,151,${.22 * (1 - emergence)})`; context.lineWidth = .75; context.stroke();
    }
    context.beginPath();
    for (let pixel = 0; pixel <= plotWidth; pixel++) {
      const y = bottom - signal(pixel / plotWidth, progress) * plotHeight;
      if (!pixel) context.moveTo(left, y); else context.lineTo(left + pixel, y);
    }
    context.strokeStyle = `rgba(${88 + Math.round(emergence * 10)},${159 + Math.round(emergence * 58)},${210 + Math.round(emergence * 45)},.95)`;
    context.lineWidth = 1.45; context.stroke();
    context.lineTo(right, bottom); context.lineTo(left, bottom); context.closePath();
    const fill = context.createLinearGradient(0, top, 0, bottom);
    fill.addColorStop(0, 'rgba(72,217,255,.12)'); fill.addColorStop(1, 'rgba(41,151,255,0)'); context.fillStyle = fill; context.fill();
    const targetX = left + plotWidth * .68;
    const targetY = bottom - signal(.68, progress) * plotHeight;
    if (emergence > 0) {
      const glow = context.createRadialGradient(targetX, targetY, 0, targetX, targetY, 28);
      glow.addColorStop(0, `rgba(72,217,255,${.3 * emergence})`); glow.addColorStop(1, 'rgba(72,217,255,0)');
      context.fillStyle = glow; context.beginPath(); context.arc(targetX, targetY, 28, 0, Math.PI * 2); context.fill();
      context.setLineDash([3, 5]); context.beginPath(); context.moveTo(targetX, top); context.lineTo(targetX, bottom); context.moveTo(left, targetY); context.lineTo(right, targetY);
      context.strokeStyle = `rgba(72,217,255,${.23 * emergence})`; context.lineWidth = .7; context.stroke(); context.setLineDash([]);
      context.beginPath(); context.arc(targetX, targetY, 3, 0, Math.PI * 2); context.fillStyle = `rgba(180,239,255,${emergence})`; context.fill();
      context.beginPath(); context.arc(targetX, targetY, 9, 0, Math.PI * 2); context.strokeStyle = `rgba(72,217,255,${.6 * emergence})`; context.stroke();
    }
    scene.querySelector('.target-label').style.opacity = String(emergence);
  }
  function scheduleDraw() { if (!frame && !document.hidden) frame = requestAnimationFrame(draw); }
  function update() {
    const next = Math.min(3, Math.floor(state.progress * 4));
    if (stage !== next) {
      stage = next;
      buttons.forEach((button, index) => button.setAttribute('aria-pressed', String(index === stage)));
      description.dataset.i18n = `research.desc${stage + 1}`;
      description.textContent = translate(description.dataset.i18n);
      scene.querySelector('.stage-number').textContent = `0${stage + 1} — 04`;
      scene.dataset.activeStage = String(stage);
    }
    scene.querySelector('.processing-node').style.borderColor = state.progress > .25 ? '#48d9ff80' : '#48d9ff30';
    scheduleDraw();
  }
  const resize = new ResizeObserver(() => {
    const bounds = canvas.getBoundingClientRect();
    width = bounds.width; height = bounds.height;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    context?.setTransform(ratio, 0, 0, ratio, 0, 0);
    scheduleDraw();
  });
  resize.observe(canvas);
  if (context) canvas.closest('.signal-panel').classList.add('canvas-ready');
  const media = gsap.matchMedia();
  if (!staticMode && context) {
    media.add('(min-width: 1024px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)', () => {
      scene.classList.add('is-story');
      gsap.set('.research-areas', { autoAlpha: 0, x: 25 });
      story = gsap.timeline({ scrollTrigger: {
        id: 'research-story', trigger: scene, start: 'top 96px', end: () => `+=${innerHeight * 1.85}`,
        pin: true, scrub: .5, invalidateOnRefresh: true,
      } });
      // 单一进度负责信号、按钮、说明。末段将图表收至左侧并依次引入研究兴趣。
      story.to(state, { progress: 1, duration: 1, ease: 'none', onUpdate: update }, 0)
        .to('.signal-panel', { width: '62%', duration: .22, ease: 'power1.inOut' }, .72)
        .to('.research-areas', { autoAlpha: 1, x: 0, duration: .18 }, .78)
        .fromTo('.research-areas article', { y: 15, opacity: .1 }, { y: 0, opacity: 1, stagger: .035, duration: .1 }, .79);
      return () => { story = null; scene.classList.remove('is-story'); state.progress = .95; update(); };
    });
  }
  function select(event) {
    const next = Number(event.currentTarget.dataset.stage);
    if (story?.scrollTrigger) {
      const trigger = story.scrollTrigger;
      window.scrollTo({ top: trigger.start + (trigger.end - trigger.start) * stops[next], behavior: 'instant' });
      ScrollTrigger.update();
    } else { state.progress = stops[next]; update(); }
  }
  buttons.forEach((button) => button.addEventListener('click', select));
  const onVisibility = () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else scheduleDraw(); };
  document.addEventListener('visibilitychange', onVisibility);
  update();
  ScrollTrigger.refresh();
  return () => { media.revert(); resize.disconnect(); cancelAnimationFrame(frame); document.removeEventListener('visibilitychange', onVisibility); buttons.forEach((button) => button.removeEventListener('click', select)); };
}
