export default function BrandLogo({english=false}:{english?:boolean}) {
 return <span className="identity-logo">
  <svg className="identity-bike" viewBox="0 0 280 140" fill="none" aria-hidden="true">
   <path d="M77 80a32 32 0 1 0 9 27" stroke="currentColor" strokeWidth="10"/>
   <path d="M45 106h19l51-34M83 42h16c4 0 7 3 9 7l25 55c2 5 6 7 11 7h57L161 22c-2-5-5-7-10-7h-22" stroke="currentColor" strokeWidth="10" strokeLinejoin="round" strokeLinecap="round"/>
   <path d="M196 107a30 30 0 0 0 58 0" stroke="currentColor" strokeWidth="10"/>
   <path d="M181 44h79c10 0 15 8 12 16l-15 33c-1 4-4 6-8 6h-42c-4 0-6-2-8-6l-22-43c-2-4 0-6 4-6Z" fill="#C46B5B"/>
   <path d="M181 44h79c10 0 15 8 12 16l-15 33c-1 4-4 6-8 6h-42c-4 0-6-2-8-6l-22-43c-2-4 0-6 4-6Z" fill="url(#cargo-box-shade)"/>
   <defs><linearGradient id="cargo-box-shade" x1="180" y1="42" x2="252" y2="102" gradientUnits="userSpaceOnUse"><stop stopColor="#F1AB96" stopOpacity=".45"/><stop offset="1" stopColor="#6B0F1F" stopOpacity=".45"/></linearGradient></defs>
  </svg>
  <span className="identity-type"><span className="identity-word">cargobajk<span>.sk</span></span><span className="identity-tagline">{english?'CARGO BIKES FOR EVERY DAY':'CARGO BICYKLE PRE KAŽDÝ DEŇ'}</span></span>
 </span>;
}
