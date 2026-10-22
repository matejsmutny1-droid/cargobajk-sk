'use client';
import { useEffect, useState } from 'react';
export default function LanguageSwitch({ english = false }: { english?: boolean }) {
  const [target, setTarget] = useState(english ? '/' : '/en');
  useEffect(() => {
    const url = new URL(window.location.href);
    url.pathname = english ? (url.pathname.replace(/^\/en(?=\/|$)/, '') || '/') : '/en' + (url.pathname === '/' ? '' : url.pathname);
    setTarget(url.pathname + url.search + url.hash);
  }, [english]);
  return <a className="language language-switch" href={target} hrefLang={english ? 'sk' : 'en'} lang={english ? 'sk' : 'en'} aria-label={english ? 'Prepnúť do slovenčiny' : 'Switch to English'}>{english ? 'EN / SK' : 'SK / EN'}</a>;
}
