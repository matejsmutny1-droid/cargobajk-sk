import type { AnchorHTMLAttributes } from 'react';
export default function PageLink({ href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const target = href?.startsWith('/') && !href.startsWith('//') && !/^\/en(?:\/|$)/.test(href) ? '/en' + (href === '/' ? '' : href) : href;
  return <a {...props} href={target} />;
}
