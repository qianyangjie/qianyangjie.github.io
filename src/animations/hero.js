import { gsap } from 'gsap';

export function initHero({ staticMode }) {
  const canvas = document.querySelector('#hero-canvas');
  const context = canvas.getContext('2d');
  if (!context) return () => {};
  const wrap = canvas.parentElement;
  const stage = document.querySelector('.hero-stage');
  const state = { progress: 0 };
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let size = 0;
  let visible = true;
  let frame = 0;
  let last = 0;
  // 固定随机种子生成粒子：每一帧重复使用同一组数据，不创建新 DOM。
  let seed = 27;
  const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const particles = Array.from({ length: staticMode ? 35 : 92 }, () => ({ x: random() - .5, y: random() - .5, a: random(), r: random() * 1.1 + .3 }));
  function draw(time = 0) {
    if (!size) return;
    context.clearRect(0, 0, size, size);
    const center = size / 2;
    const radius = size * .405;
    const progress = state.progress;
    const angle = motion.matches || staticMode ? -.85 : time / 16000 - .85;
    particles.forEach((point) => {
      const depth = 1 + progress * point.a * .5;
      context.beginPath();
      context.arc(center + point.x * size * depth, center + point.y * size * depth, point.r, 0, Math.PI * 2);
      context.fillStyle = `rgba(136,175,210,${.12 + point.a * .26})`;
      context.fill();
    });
    context.save();
    context.translate(center, center);
    context.rotate(-.12);
    context.scale(1, .86);
    const glow = context.createRadialGradient(0, 0, 0, 0, 0, radius);
    glow.addColorStop(0, 'rgba(18,61,92,.12)'); glow.addColorStop(.72, 'rgba(14,49,75,.03)'); glow.addColorStop(1, 'rgba(5,7,11,0)');
    context.fillStyle = glow;
    context.beginPath(); context.arc(0, 0, radius, 0, Math.PI * 2); context.fill();
    for (let ring = 1; ring <= 6; ring++) {
      context.beginPath(); context.arc(0, 0, radius * ring / 6, 0, Math.PI * 2);
      context.strokeStyle = ring === 6 ? 'rgba(102,155,197,.3)' : 'rgba(80,136,181,.2)';
      context.lineWidth = .7; context.stroke();
    }
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6;
      context.beginPath(); context.moveTo(0, 0); context.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
      context.strokeStyle = 'rgba(91,144,186,.105)'; context.lineWidth = .6; context.stroke();
    }
    for (let i = 0; i < 120; i++) {
      const a = i * Math.PI / 60;
      const inside = radius - (i % 5 === 0 ? 8 : 3);
      context.beginPath(); context.moveTo(Math.cos(a) * inside, Math.sin(a) * inside); context.lineTo(Math.cos(a) * (radius + 2), Math.sin(a) * (radius + 2));
      context.strokeStyle = i % 5 === 0 ? '#527e9e66' : '#527e9e30'; context.lineWidth = .6; context.stroke();
    }
    // 扫描光束由透明度逐渐衰减的扇形组成，无 GIF 或序列帧资源。
    for (let i = 0; i < 32; i++) {
      const a = angle - i * .012;
      context.beginPath(); context.moveTo(0, 0); context.arc(0, 0, radius, a - .014, a); context.closePath();
      context.fillStyle = `rgba(59,161,219,${.07 * (1 - i / 32)})`; context.fill();
    }
    context.beginPath(); context.moveTo(0, 0); context.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    context.strokeStyle = 'rgba(108,204,247,.45)'; context.lineWidth = .8; context.stroke();
    context.beginPath(); context.arc(0, 0, radius * .72, -.85, -.15); context.strokeStyle = '#48d9ff40'; context.lineWidth = 1; context.stroke();
    const strength = .22 + Math.min(1, progress * 2.2) * .78;
    const targetX = radius * .34;
    const targetY = -radius * .27;
    const pulse = motion.matches || staticMode ? 1 : .9 + Math.sin(time / 1600) * .1;
    const targetGlow = context.createRadialGradient(targetX, targetY, 0, targetX, targetY, 30 + progress * 25);
    targetGlow.addColorStop(0, `rgba(72,217,255,${.3 * strength})`); targetGlow.addColorStop(1, 'rgba(72,217,255,0)');
    context.fillStyle = targetGlow; context.beginPath(); context.arc(targetX, targetY, 30 + progress * 25, 0, Math.PI * 2); context.fill();
    context.beginPath(); context.arc(targetX, targetY, 2.5 * pulse, 0, Math.PI * 2); context.fillStyle = `rgba(164,235,255,${strength})`; context.fill();
    context.beginPath(); context.arc(targetX, targetY, 11 + progress * 12, 0, Math.PI * 2); context.strokeStyle = `rgba(72,217,255,${.32 * strength})`; context.lineWidth = .7; context.stroke();
    if (progress > .28) {
      context.beginPath(); context.moveTo(targetX - 28, targetY); context.lineTo(targetX - 15, targetY); context.moveTo(targetX + 15, targetY); context.lineTo(targetX + 28, targetY); context.moveTo(targetX, targetY - 28); context.lineTo(targetX, targetY - 15); context.moveTo(targetX, targetY + 15); context.lineTo(targetX, targetY + 28);
      context.strokeStyle = `rgba(100,207,245,${strength * .4})`; context.stroke();
    }
    context.restore();
  }
  function tick(time) {
    frame = 0;
    if (!visible || document.hidden || motion.matches || staticMode) return;
    // 限制绘制到约 30 fps；不可见或后台标签页中完全停止 RAF。
    if (time - last >= 32) { draw(time); last = time; }
    frame = requestAnimationFrame(tick);
  }
  function resume() { if (visible && !document.hidden && !motion.matches && !staticMode && !frame) frame = requestAnimationFrame(tick); else if (motion.matches || staticMode) draw(); }
  function pause() { cancelAnimationFrame(frame); frame = 0; }
  const resize = new ResizeObserver(() => {
    size = wrap.getBoundingClientRect().width;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(size * ratio); canvas.height = Math.round(size * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0); draw();
  });
  resize.observe(wrap);
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) resume(); else pause(); }, { threshold: 0 });
  observer.observe(stage);
  const onVisibility = () => { if (document.hidden) pause(); else resume(); };
  document.addEventListener('visibilitychange', onVisibility);
  motion.addEventListener('change', resume);
  wrap.classList.add('canvas-ready');
  const media = gsap.matchMedia();
  if (!staticMode) {
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const opening = gsap.timeline({ defaults: { ease: 'power2.out' } });
      opening.fromTo('.radar-wrap', { opacity: .2 }, { opacity: 1, duration: 1.5 }, 0)
        .fromTo('.hero-eyebrow, .hero h1, .hero-statement', { opacity: .1, y: 16 }, { opacity: 1, y: 0, duration: 1, stagger: .13 }, .15);
    });
    media.add('(min-width: 1024px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)', () => {
      // timeline 把 A→B→C→D 连成一条叙事；scrub 把时间映射为滚动进度。
      const timeline = gsap.timeline({ scrollTrigger: {
        id: 'hero-story', trigger: '#home', start: 'top top', end: () => `+=${innerHeight * 1.35}`,
        pin: stage, scrub: .65, invalidateOnRefresh: true,
      } });
      timeline.to(state, { progress: 1, duration: 1, ease: 'none', onUpdate: () => { if (motion.matches || staticMode) draw(); } }, 0)
        .to('.hero-copy', { y: -65, scale: .94, opacity: 0, duration: .28, ease: 'none' }, .04)
        .to('.radar-wrap', { xPercent: -25, scale: 1.35, duration: .55, ease: 'none' }, .04)
        .to('.radar-caption, .radar-coordinate', { opacity: 0, duration: .18 }, .2)
        .to('.hero-signal-copy', { opacity: 1, y: -12, duration: .15 }, .4)
        .to('.hero-signal-copy', { opacity: 0, y: -36, duration: .15 }, .74)
        .to('.radar-wrap', { scale: 2.1, opacity: .12, duration: .3, ease: 'none' }, .7);
    });
  }
  resume();
  return () => { pause(); resize.disconnect(); observer.disconnect(); media.revert(); document.removeEventListener('visibilitychange', onVisibility); motion.removeEventListener('change', resume); };
}
