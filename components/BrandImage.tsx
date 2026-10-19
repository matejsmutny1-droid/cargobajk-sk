/* eslint-disable @next/next/no-img-element -- Official library images are pre-optimized into responsive WebP files. */
import type { ImgHTMLAttributes } from 'react';
export default function BrandImage({ src, alt, width, height, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const square = typeof src === 'string' && !['hero', 'family', 'story', 'dog-life', 'city'].some(n => src === '/media/' + n + '.webp');
  const originalWidth = Number(width) || (square ? 1800 : 2200);
  const originalHeight = Number(height) || (square ? 1800 : 1467);
  const responsive = typeof src === 'string' ? src.replace('.webp', '') : '';
  const variants = [480, 960, 1600].filter(size => size < originalWidth).map(size => `${responsive}-${size}.webp ${size}w`);
  return <img src={src} alt={alt ?? ''} width={originalWidth} height={originalHeight} srcSet={[...variants, `${src} ${originalWidth}w`].join(', ')} sizes={square ? '(max-width:760px) 44vw, 23vw' : '(max-width:760px) 100vw, 65vw'} {...props} />;
}
