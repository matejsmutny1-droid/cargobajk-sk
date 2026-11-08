'use client';

import {useEffect, useRef, useState} from 'react';

export default function HeroVideo({english = false}: {english?: boolean}) {
  const video = useRef<HTMLVideoElement>(null);
  const [source, setSource] = useState<string>();
  const [ready, setReady] = useState(false);
  const [userPaused, setUserPaused] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = window.matchMedia('(max-width: 760px)');
    const connection = (navigator as Navigator & {
      connection?: EventTarget & {saveData?: boolean};
    }).connection;
    let activeSource: string | undefined;
    const update = () => {
      const next = motion.matches || connection?.saveData ? undefined :
        `/media/hero-life-${mobile.matches ? 'mobile' : 'desktop'}.mp4`;
      if (next !== activeSource) {
        activeSource = next;
        setReady(false);
        setSource(next);
      }
    };
    update();
    motion.addEventListener('change', update);
    mobile.addEventListener('change', update);
    connection?.addEventListener('change', update);
    return () => {
      motion.removeEventListener('change', update);
      mobile.removeEventListener('change', update);
      connection?.removeEventListener('change', update);
    };
  }, []);

  useEffect(() => {
    const element = video.current;
    if (!element || !source) return;
    let visible = true;
    const sync = () => {
      if (userPaused || document.hidden || !visible) element.pause();
      else void element.play().catch(() => { /* Keep the poster when autoplay is blocked. */ });
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(element);
    document.addEventListener('visibilitychange', sync);
    element.addEventListener('canplay', sync);
    sync();
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
      element.removeEventListener('canplay', sync);
      element.pause();
    };
  }, [source, userPaused]);

  return <>
    <div className="hero-media">
      <picture>
        <source media="(max-width: 760px)" srcSet="/media/hero-life-mobile.webp"/>
        <img src="/media/hero-life-desktop.webp" width="1600" height="900"
          fetchPriority="high" alt={english ? 'A mother and child enjoying a cargo bike ride in Sweden' : 'Mama s dieťaťom počas spoločnej jazdy cargo bicyklom vo Švédsku'}/>
      </picture>
      {source && <video ref={video} key={source} src={source} autoPlay muted loop playsInline
        preload="none" aria-hidden="true" tabIndex={-1}
        className={ready ? 'is-ready' : ''} onPlaying={() => setReady(true)}
        onError={() => {setSource(undefined); setReady(false);}}/>}
    </div>
    {source && ready && <button className="hero-video-toggle" type="button"
      onClick={() => setUserPaused(paused => !paused)} aria-pressed={userPaused}
      aria-label={userPaused ? (english ? 'Play background video' : 'Prehrať video na pozadí') : (english ? 'Pause background video' : 'Pozastaviť video na pozadí')}>
      <span aria-hidden="true">{userPaused ? '▶' : 'Ⅱ'}</span>
      {userPaused ? (english ? 'Play video' : 'Prehrať video') : (english ? 'Pause video' : 'Pozastaviť video')}
    </button>}
  </>;
}
