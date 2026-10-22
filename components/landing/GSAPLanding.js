'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Cinematic, scroll-linked motion for large scene wrappers. Component-level
// entrances and interactions remain in Motion so the two libraries never
// compete for the same transform.
export default function GSAPLanding() {
  useEffect(() => {
    const root = document.querySelector('.landing');
    if (!root) return undefined;

    gsap.registerPlugin(ScrollTrigger);

    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.to('.hero-grid', {
          backgroundPosition: '64px 128px',
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        });

        gsap.to('.hero-glow', {
          xPercent: -18,
          yPercent: 24,
          scale: 1.2,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1.2,
          },
        });

        gsap.utils.toArray('.sec-ghost').forEach((ghost) => {
          gsap.fromTo(
            ghost,
            { xPercent: -18, opacity: 0.04 },
            {
              xPercent: 18,
              opacity: 0.55,
              ease: 'none',
              scrollTrigger: {
                trigger: ghost.closest('.sec-head'),
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
              },
            }
          );
        });

        gsap.fromTo(
          '.pain',
          { clipPath: 'inset(0 100% 0 0)' },
          {
            clipPath: 'inset(0 0% 0 0)',
            duration: 1.15,
            ease: 'power4.out',
            scrollTrigger: {
              trigger: '.pain',
              start: 'top 82%',
              once: true,
            },
          }
        );

        gsap.from('.trust-cell', {
          y: 52,
          opacity: 0,
          duration: 0.9,
          stagger: 0.09,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.trust-grid',
            start: 'top 80%',
            once: true,
          },
        });

        gsap.from('.close-inner > *', {
          y: 64,
          opacity: 0,
          duration: 1,
          stagger: 0.08,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: '.close',
            start: 'top 72%',
            once: true,
          },
        });

        gsap.to('.close-grid', {
          backgroundPosition: '-96px 96px',
          ease: 'none',
          scrollTrigger: {
            trigger: '.close',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.1,
          },
        });

        gsap.from('.footer-stripe span', {
          scaleX: 0,
          transformOrigin: 'left center',
          duration: 0.75,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.footer',
            start: 'top 96%',
            once: true,
          },
        });
      });

      media.add(
        '(prefers-reduced-motion: no-preference) and (min-width: 768px)',
        () => {
          gsap.to('.hero-inner', {
            yPercent: 14,
            scale: 0.965,
            opacity: 0.22,
            ease: 'none',
            scrollTrigger: {
              trigger: '.hero',
              start: 'top top',
              end: 'bottom top',
              scrub: 0.8,
            },
          });

          gsap.fromTo(
            '.caps',
            { xPercent: -2.5, scale: 0.985 },
            {
              xPercent: 2.5,
              scale: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: '.caps',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
              },
            }
          );

          gsap.fromTo(
            '.use',
            { clipPath: 'inset(8% 0 8% 0)', y: 48 },
            {
              clipPath: 'inset(0% 0 0% 0)',
              y: 0,
              ease: 'none',
              scrollTrigger: {
                trigger: '.use',
                start: 'top 92%',
                end: 'top 48%',
                scrub: 0.8,
              },
            }
          );
        }
      );
    }, root);

    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      media.revert();
      context.revert();
    };
  }, []);

  return null;
}
