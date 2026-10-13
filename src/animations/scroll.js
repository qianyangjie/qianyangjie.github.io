import { gsap } from 'gsap';

export function initScroll() {
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    // fromTo 定义起点和终点；ScrollTrigger 将动画和元素在视口中的位置关联。
    gsap.utils.toArray('.reveal').forEach((element) => {
      gsap.fromTo(element, { opacity: .35, y: 22 }, {
        opacity: 1, y: 0, duration: .8, ease: 'power2.out',
        scrollTrigger: { trigger: element, start: 'top 94%', toggleActions: 'play none none none', once: true },
      });
    });
    gsap.utils.toArray('.reading-line').forEach((element) => {
      gsap.fromTo(element, { color: '#788495' }, {
        color: '#d0d5dd', ease: 'none',
        scrollTrigger: { trigger: element, start: 'top 83%', end: 'top 44%', scrub: .5 },
      });
    });
    gsap.fromTo('.contact-glow', { opacity: .25 }, {
      opacity: 1, ease: 'none', scrollTrigger: { trigger: '#contact', start: 'top 90%', end: 'top 25%', scrub: .8 },
    });
  });
  media.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
    const removers = [];
    document.querySelectorAll('.project-card').forEach((card) => {
      const x = gsap.quickTo(card, 'rotationY', { duration: .5, ease: 'power2.out' });
      const y = gsap.quickTo(card, 'rotationX', { duration: .5, ease: 'power2.out' });
      const move = (event) => {
        const rect = card.getBoundingClientRect();
        x(((event.clientX - rect.left) / rect.width - .5) * 3);
        y(-((event.clientY - rect.top) / rect.height - .5) * 3);
      };
      const leave = () => { x(0); y(0); };
      card.addEventListener('pointermove', move);
      card.addEventListener('pointerleave', leave);
      removers.push(() => { card.removeEventListener('pointermove', move); card.removeEventListener('pointerleave', leave); });
    });
    return () => removers.forEach((remove) => remove());
  });
  return () => media.revert();
}
