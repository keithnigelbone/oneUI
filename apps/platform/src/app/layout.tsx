import '@oneui/tokens/css/layers';
import '@oneui/tokens/css/dimensions/scale';
import '@oneui/tokens/css/dimensions/grid';
import '@oneui/tokens/css/typography';
import '@oneui/tokens/css';
import '@oneui/tokens/css/semantic';
import '@oneui/tokens/css/light';
import '@oneui/tokens/css/dark';
// dim.css removed — V4 dropped dim mode (light/dark only)
import '@oneui/tokens/css/density/compact';
import '@oneui/tokens/css/density/open';
import './globals.css';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Inter } from 'next/font/google';
import { AppPreloader } from '@/components/AppPreloader';

// Inter is loaded via next/font/google with display: 'optional' to eliminate
// font reflow on cached loads. This is Layer 6 of FOUC prevention — see
// docs/fouc-prevention.md. If you hit corporate TLS errors fetching Google Fonts
// during `pnpm dev`, set NEXT_FONT_GOOGLE_MOCK=1 in your shell env instead of
// modifying this file — the workaround must remain environment-scoped.
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'optional',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'One UI Studio',
  description: 'Multi-brand design system platform',
  icons: {
    icon: '/JioLogo.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} data-mode="light" data-density="default" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preload" href="/fonts/JioTypeVar.ttf" as="font" type="font/ttf" crossOrigin="" />
        {/*
          Placeholder for injected brand CSS. Must come BEFORE the blocking script so
          the script can find it via getElementById and update it in-place — preventing
          the React hydration mismatch that occurred when the script appended a new style
          element after the SSR-rendered styles, shifting their DOM positions.
        */}
        {/* eslint-disable-next-line react/no-danger */}
        <style id="oneui-foundation-tokens" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: '' }} />
        {/* Blocking script: restores theme, density, platform, and cached brand CSS before any paint */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{
var t=localStorage.getItem('oneui-studio:theme');
if(t==='dim'){t='dark';localStorage.setItem('oneui-studio:theme','dark')}
document.documentElement.setAttribute('data-mode',(t==='light'||t==='dark')?t:'light');
var d=localStorage.getItem('oneui-studio:density');
var dv=(d==='compact'||d==='default'||d==='open')?d:'default';
document.documentElement.setAttribute('data-density',dv);
document.documentElement.setAttribute('data-6-Density',dv);
var w=window.innerWidth;
var b=w<=619?'S':w<=990?'M':'L';
document.documentElement.setAttribute('data-Breakpoint',b);
var scope=localStorage.getItem('oneui-studio:theme-scope');
if(scope!=='global'){localStorage.setItem('oneui-studio:theme-scope','global');localStorage.removeItem('oneui-studio:brand-css');localStorage.removeItem('oneui-studio:brand-css-meta');}
document.documentElement.setAttribute('data-theme-scope','global');
var bc=localStorage.getItem('oneui-studio:brand-css');
if(bc){var s=document.getElementById('oneui-foundation-tokens');if(s){s.textContent=bc;}else{s=document.createElement('style');s.id='oneui-foundation-tokens';s.textContent=bc;document.head.appendChild(s);}}
window.addEventListener('unhandledrejection',function(e){
if(e.reason&&typeof e.reason.message==='string'&&e.reason.message.indexOf('unrecognized HMR message')!==-1){e.preventDefault();}
});
}catch(e){
document.documentElement.setAttribute('data-mode','light');
document.documentElement.setAttribute('data-density','default');
document.documentElement.setAttribute('data-6-Density','default');
var w2=window.innerWidth;
var b2=w2<=619?'S':w2<=990?'M':'L';
document.documentElement.setAttribute('data-Breakpoint',b2);
}
})();`}} />
        {/* Transition-block: suppresses animated flicker during atomic brand CSS swaps */}
        <style dangerouslySetInnerHTML={{ __html: `[data-brand-switching],[data-brand-switching] *{transition:none!important;}` }} />
        {/* Preloader styles — inlined so they apply before any CSS bundle loads */}
        <style dangerouslySetInnerHTML={{ __html: `
          #app-preloader {
            position: fixed;
            inset: 0;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 14px;
            background-color: #fafafa;
            opacity: 1;
            transition: opacity 0.4s ease;
          }
          [data-mode="dark"] #app-preloader {
            background-color: #111111;
          }
          #app-preloader[data-ready="true"] {
            opacity: 0;
            pointer-events: none;
          }
          #app-preloader[data-auth-page] {
            display: none !important;
          }
          .preloader-lockup {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 14px;
          }
          .preloader-mark {
            width: 52px;
            height: 52px;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            user-select: none;
            color: #1a1a1a;
          }
          [data-mode="dark"] .preloader-mark {
            color: #f0f0f0;
          }
          .preloader-mark img {
            width: 52px;
            height: 52px;
            display: block;
            object-fit: contain;
          }
          .preloader-mark svg {
            width: 52px;
            height: 52px;
            display: block;
          }
          [data-mode="dark"] .preloader-mark img {
            /* No invert — brand logos have their own colors */
          }
          .preloader-logo-slot {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.35s ease;
          }
          .preloader-logo-slot[data-active="true"] {
            opacity: 1;
          }
          .preloader-text {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            text-align: center;
          }
          .preloader-wordmark {
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 15px;
            font-weight: 600;
            letter-spacing: -0.2px;
            color: #1a1a1a;
            user-select: none;
          }
          [data-mode="dark"] .preloader-wordmark {
            color: #f0f0f0;
          }
          /* Single rotating message line — shows current loading state.
             Replaced the previous stacked tagline + status pair so the preloader
             has only one row of text under the wordmark. */
          .preloader-status {
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 12px;
            font-weight: 400;
            color: rgba(0, 0, 0, 0.38);
            letter-spacing: 0.1px;
            user-select: none;
            min-height: 16px;
            transition: opacity 0.3s ease;
          }
          [data-mode="dark"] .preloader-status {
            color: rgba(255, 255, 255, 0.35);
          }
          /* Pre-hydration spinner — inline port of @oneui/ui <Spinner>.
             Brand tokens aren't available yet, so arcs use neutral rgba
             that auto-inverts in dark mode. Animation keyframes are the
             exact trim-path values shipped in Spinner.module.css. */
          .preloader-spinner {
            width: 28px;
            height: 28px;
            overflow: visible;
          }
          .preloader-arc {
            fill: none;
            transform-origin: 50px 50px;
            stroke-dasharray: 15 85;
            stroke-dashoffset: 0;
            stroke-linecap: round;
          }
          /* Arc colors mirror the design system Spinner's three-accent palette:
             arc1 = Sparkle             (green in Jio base)
             arc2 = Secondary           (orange in Jio base)
             arc3 = Primary             (purple in Jio base)
             Reads the live brand tokens the blocking script above has already
             injected into '#oneui-foundation-tokens' from localStorage, so
             the preloader paints in the user's actual brand colors on every
             load after the first. CSS variable lookups cross '@layer brand'
             boundaries, so these resolve against the brand CSS even though
             the preloader rules are unlayered. The hex fallbacks are Jio-
             base approximations used only on the first-ever visit (no cache). */
          .preloader-arc-1 { stroke: var(--Sparkle-Bold, #22C55E); animation: preloader-trim-sparkle 2000ms linear infinite; }
          .preloader-arc-2 { stroke: var(--Secondary-Bold, #F97316); animation: preloader-trim-secondary 2000ms linear infinite; }
          .preloader-arc-3 { stroke: var(--Primary-Bold, #5B38D6); animation: preloader-trim-primary 2000ms linear infinite; }
          @keyframes preloader-trim-primary {
            0%   { stroke-dasharray: 15 85;     stroke-dashoffset: 0;     transform: rotate(0deg); }
            25%  { stroke-dasharray: 50 50;     stroke-dashoffset: 0;     transform: rotate(89deg); }
            50%  { stroke-dasharray: 42.5 57.5; stroke-dashoffset: -42.5; transform: rotate(178deg); }
            75%  { stroke-dasharray: 15 85;     stroke-dashoffset: -85;   transform: rotate(267deg); }
            100% { stroke-dasharray: 15 85;     stroke-dashoffset: 0;     transform: rotate(720deg); }
          }
          @keyframes preloader-trim-secondary {
            0%   { stroke-dasharray: 15 85;     stroke-dashoffset: 0;     transform: rotate(0deg); }
            25%  { stroke-dasharray: 50 50;     stroke-dashoffset: 0;     transform: rotate(59deg); }
            50%  { stroke-dasharray: 42.5 57.5; stroke-dashoffset: -42.5; transform: rotate(58deg); }
            75%  { stroke-dasharray: 15 85;     stroke-dashoffset: -85;   transform: rotate(217deg); }
            100% { stroke-dasharray: 15 85;     stroke-dashoffset: 0;     transform: rotate(720deg); }
          }
          @keyframes preloader-trim-sparkle {
            0%   { stroke-dasharray: 15 85;     stroke-dashoffset: 0;     transform: rotate(0deg); }
            25%  { stroke-dasharray: 50 50;     stroke-dashoffset: 0;     transform: rotate(44deg); }
            50%  { stroke-dasharray: 42.5 57.5; stroke-dashoffset: -42.5; transform: rotate(-42deg); }
            75%  { stroke-dasharray: 15 85;     stroke-dashoffset: -85;   transform: rotate(187deg); }
            100% { stroke-dasharray: 15 85;     stroke-dashoffset: 0;     transform: rotate(720deg); }
          }
          @media (prefers-reduced-motion: reduce) {
            .preloader-arc-1, .preloader-arc-2, .preloader-arc-3 { animation: none; }
          }
        ` }} />
      </head>
      <body>
        {/* Server-rendered preloader — visible before JS loads */}
        <div id="app-preloader" aria-hidden="true" role="presentation" suppressHydrationWarning>
          <div className="preloader-lockup">
            {/* Default mark: OneUI logo. The inline script (below) replaces this
                <img> with <div class="preloader-logo-slot"> slots before React hydrates.
                dangerouslySetInnerHTML tells React to skip child reconciliation entirely
                (React returns early from the hydration walk for this subtree).
                suppressHydrationWarning suppresses the innerHTML string comparison so
                React 19's stricter hydration does not throw when the script has
                already replaced the <img> with logo-slot divs. */}
            {/* eslint-disable-next-line react/no-danger */}
            <div
              className="preloader-mark"
              suppressHydrationWarning
              dangerouslySetInnerHTML={{ __html: '<img src="/JioLogo.svg" alt="OneUIStudio" width="52" height="52">' }}
            />
            <div className="preloader-text">
              <div className="preloader-wordmark">OneUI Studio</div>
            </div>
          </div>
          <div className="preloader-status" id="preloader-status"></div>
          {/* Inline SVG spinner — same trim-path animation as @oneui/ui
              <Spinner>. Rotated -90 so pathLength 0% starts at 12 o'clock. */}
          <svg
            className="preloader-spinner"
            viewBox="0 0 100 100"
            fill="none"
            aria-hidden="true"
          >
            <g transform="rotate(-90 50 50)">
              <circle className="preloader-arc preloader-arc-1" cx="50" cy="50" r="41.665" pathLength={100} strokeWidth="16.67" />
              <circle className="preloader-arc preloader-arc-2" cx="50" cy="50" r="41.665" pathLength={100} strokeWidth="16.67" />
              <circle className="preloader-arc preloader-arc-3" cx="50" cy="50" r="41.665" pathLength={100} strokeWidth="16.67" />
            </g>
          </svg>
        </div>
        {/* Hide preloader on auth page — no Convex needed, dark bg would flash white */}
        <script dangerouslySetInnerHTML={{ __html: `if(location.pathname.startsWith('/auth')){var p=document.getElementById('app-preloader');if(p)p.setAttribute('data-auth-page','');}` }} />
        {/*
          Brand logo cycling: reads all cached brand logos from localStorage
          and cycles through them during loading. React calls
          window.__preloaderSetLogo(svg) to land on the active brand's logo.
          On first-ever load (no cache yet) we simply show the default <img>
          and wait for React — no placeholder icons.
        */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{
var mark=document.querySelector('.preloader-mark');
if(!mark)return;
var cachedLogos=[];
try{var raw=localStorage.getItem('oneui-studio:brand-logos');if(raw){var p=JSON.parse(raw);if(Array.isArray(p))cachedLogos=p.filter(function(x){return typeof x==='string'&&x.length>0;});}}catch(e){}
var cachedLogo='';
try{cachedLogo=localStorage.getItem('oneui-studio:brand-logo-svg')||'';}catch(e){}
function makeSlot(html){
  var d=document.createElement('div');
  d.className='preloader-logo-slot';
  d.innerHTML=html;
  var sv=d.querySelector('svg');
  if(sv){sv.removeAttribute('width');sv.removeAttribute('height');sv.style.cssText='width:52px;height:52px;display:block;';}
  return d;
}
function mountStatic(html){
  mark.innerHTML='';
  var s=makeSlot(html);
  s.setAttribute('data-active','true');
  mark.appendChild(s);
}
window.__preloaderSetLogo=function(svg){
  if(!svg)return;
  mountStatic(svg);
};
// Only cycle when we have >1 cached brand logo. Otherwise show the single
// cached logo statically, or leave the default <img> on first-ever load.
if(cachedLogos.length<=1){
  if(cachedLogo){mountStatic(cachedLogo);}
  else if(cachedLogos.length===1){mountStatic(cachedLogos[0]);}
  return;
}
// Always start the cycle at index 0 — guarantees every logo in the pool
// is shown before we settle on the active brand.
var pool=cachedLogos;
mark.innerHTML='';
var slotA=makeSlot(pool[0]);
var slotB=makeSlot(pool[1%pool.length]);
slotA.setAttribute('data-active','true');
mark.appendChild(slotA);
mark.appendChild(slotB);
var idx=0;
var active=slotA,inactive=slotB;
var interval=350;
var stopped=false;
var timer=null;
var shownCount=1;
var pendingSvg=null;
var startedAt=Date.now();
var MAX_HOLD=3000;
function applySettle(svg){
  stopped=true;
  if(timer){clearTimeout(timer);timer=null;}
  var finalHTML=svg||pool[idx];
  inactive.innerHTML=finalHTML;
  var sv=inactive.querySelector('svg');
  if(sv){sv.removeAttribute('width');sv.removeAttribute('height');sv.style.cssText='width:52px;height:52px;display:block;';}
  active.removeAttribute('data-active');
  inactive.setAttribute('data-active','true');
}
function cycle(){
  if(stopped)return;
  idx=(idx+1)%pool.length;
  inactive.innerHTML=pool[idx];
  var sv=inactive.querySelector('svg');
  if(sv){sv.removeAttribute('width');sv.removeAttribute('height');sv.style.cssText='width:52px;height:52px;display:block;';}
  active.removeAttribute('data-active');
  inactive.setAttribute('data-active','true');
  var tmp=active;active=inactive;inactive=tmp;
  shownCount++;
  var elapsed=Date.now()-startedAt;
  // Settle only after every logo has been shown at least once — OR after
  // the safety cap, so a stuck query never blocks dismissal.
  if(pendingSvg!==null&&(shownCount>=pool.length||elapsed>=MAX_HOLD)){
    var svg=pendingSvg;pendingSvg=null;applySettle(svg);return;
  }
  timer=setTimeout(cycle,interval);
}
timer=setTimeout(cycle,interval);
window.__preloaderSetLogo=function(svg){
  if(stopped)return;
  // Defer until the cycle finishes showing every logo (or hits MAX_HOLD).
  pendingSvg=svg||'';
  var elapsed=Date.now()-startedAt;
  if(shownCount>=pool.length||elapsed>=MAX_HOLD){
    var s=pendingSvg;pendingSvg=null;applySettle(s);
  }
};
}catch(e){}})();` }} />
        {/*
          Preloader status rotation: the single text row under the wordmark
          shows the current loading state. React calls window.__preloaderPushStatus(msg)
          as Convex queries resolve; the rotator fades between messages every ~2.6s.
          When no loading message is present, the line stays blank.
        */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{
var el=document.getElementById('preloader-status');
if(!el)return;
var messages=[''];
var idx=0;
var stopped=false;
function show(next){
  el.style.opacity='0';
  setTimeout(function(){if(stopped)return;el.textContent=next;el.style.opacity='1';},300);
}
function tick(){
  if(stopped)return;
  if(messages.length<2){setTimeout(tick,1200);return;}
  idx=(idx+1)%messages.length;
  show(messages[idx]);
  setTimeout(tick,2600);
}
setTimeout(tick,2200);
window.__preloaderPushStatus=function(msg){
  if(!msg){return;}
  // Keep TAGLINE at [0], dynamic message at [1]
  if(messages.length===1)messages.push(msg);
  else messages[1]=msg;
};
window.__preloaderStopStatus=function(){stopped=true;};
}catch(e){}})();` }} />
        {/* Removes preloader after React hydration */}
        <AppPreloader />
        <Suspense>{children}</Suspense>
      </body>
    </html>
  );
}
