import type { AnchorHTMLAttributes } from 'react';

// Native navigation avoids the Vinext client-router failure in production.
// The server renders every destination, so links also work without JavaScript.
export default function PageLink(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a {...props} />;
}
