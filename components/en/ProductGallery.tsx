'use client';
import { useEffect, useRef, useState } from 'react';
import BrandImage from './BrandImage';
import { galleries, type GalleryImage } from '@/lib/en/galleries';

export default function ProductGallery({ name, image }: { name: string; image: string }) {
  const photos: GalleryImage[] = galleries[image] ?? [{ src: `/media/${image}.webp`, label: 'Overall view', width: 1800, height: 1800 }];
  const [selected, setSelected] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);
  const selectedThumb = useRef<HTMLButtonElement>(null);
  const photo = photos[selected] ?? photos[0];
  const move = (direction: number) => setSelected(value => (value + direction + photos.length) % photos.length);
  useEffect(() => {
    if (expanded) dialog.current?.showModal();
    else dialog.current?.close();
  }, [expanded]);
  useEffect(() => { const button = selectedThumb.current; const strip = button?.parentElement; if (button && strip) strip.scrollTo({ left: Math.max(0, button.offsetLeft - strip.offsetLeft - 12), behavior: 'smooth' }); }, [selected]);
  const renderImage = (large = false) => <BrandImage src={photo.src} width={photo.width} height={photo.height} alt={`${name} — ${photo.label}`} sizes={large ? '(max-width:760px) 100vw, 85vw' : '(max-width:760px) 100vw, 50vw'} />;
  return <div className="product-gallery" onTouchStart={event => { touchX.current = event.touches[0].clientX; }} onTouchEnd={event => {
    if (touchX.current === null || (expanded && zoomed)) return;
    const delta = event.changedTouches[0].clientX - touchX.current;
    if (Math.abs(delta) > 65) move(delta < 0 ? 1 : -1);
    touchX.current = null;
  }}>
    <div className="gallery-stage">
      <button className="product-photo gallery-enlarge" type="button" aria-label={`Enlarge: ${name} — ${photo.label}`} onClick={() => { setZoomed(false); setExpanded(true); }}>{renderImage()}<span className="zoom-label">Enlarge ↗︎</span></button>
      {photos.length > 1 && <><button className="gallery-prev" type="button" aria-label="Previous photo" onClick={() => move(-1)}>←</button><button className="gallery-next" type="button" aria-label="Next photo" onClick={() => move(1)}>→︎</button></>}
    </div>
    <div className="gallery-description" aria-live="polite"><span>{photo.label}</span><span>{selected + 1} / {photos.length}</span></div>
    <div className="gallery-thumbs" role="group" aria-label={`Photos of ${name}`}>
      {photos.map((item, i) => <button ref={i === selected ? selectedThumb : undefined} key={item.src} type="button" aria-pressed={selected === i} aria-label={`${i + 1}. ${item.label}`} onClick={() => setSelected(i)}><BrandImage src={item.src} alt="" loading="lazy" width={item.width} height={item.height} sizes="80px" /></button>)}
    </div>
    <dialog ref={dialog} className="gallery-dialog" aria-label={`${name} — enlarged photo`} onClose={() => setExpanded(false)} onClick={event => { if (event.target === event.currentTarget) setExpanded(false); }} onKeyDown={event => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
    }}>
      <div className="gallery-dialog-inner"><button className="gallery-zoom-toggle" type="button" aria-pressed={zoomed} onClick={() => setZoomed(value => !value)}>{zoomed ? 'Fit photo' : 'Zoom in 2×'}</button><button className="gallery-close" type="button" aria-label="Close enlarged photo" onClick={() => setExpanded(false)}>Close ×</button>
        <div className={zoomed ? "gallery-dialog-image zoomed" : "gallery-dialog-image"}>{renderImage(true)}</div>
        <div className="gallery-dialog-bottom"><button type="button" aria-label="Previous photo" onClick={() => move(-1)}>←</button><p aria-live="polite">{photo.label} <span>{selected + 1} / {photos.length}</span></p><button type="button" aria-label="Next photo" onClick={() => move(1)}>→︎</button></div>
      </div>
    </dialog>
  </div>;
}
