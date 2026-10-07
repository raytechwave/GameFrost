import React from 'react';
import {createRoot} from 'react-dom/client';
import {StoreProvider,SiteHeader,SiteFooter} from '../components/game-frost/store';
import {ContentProvider} from '../components/game-frost/content';
import {StorePage,preloadRoute} from '../components/game-frost/router';
import {loadLocalContent} from './local-cms';
import {contentRoute} from '../lib/cms-model';
import type {StoreDocument} from '../lib/cms-model';
import '../app/globals.css';
import '../app/showroom.css';
import '../app/mobile.css';

const originalFetch=window.fetch.bind(window);window.fetch=(input,init)=>{const url=new URL(input instanceof Request?input.url:String(input),location.href);if(url.origin===location.origin&&url.pathname.startsWith('/api/admin'))return import('./local-cms').then(m=>m.handleLocalCms(new Request(input instanceof Request?input:url,init)));if(url.origin===location.origin&&/^\/api\/(?:store|upload|files(?:\/|$))/.test(url.pathname))return Promise.all([import('./local-store'),import('./local-cms')]).then(async([store,cms])=>store.handleLocalRequest(new Request(input instanceof Request?input:url,init),await cms.currentContent()));return originalFetch(input,init)};
const path=location.pathname.replace(/\/$/,'')||'/';const query=Object.fromEntries(new URLSearchParams(location.search));
class DisplayBoundary extends React.Component<{children:React.ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return{failed:true}}render(){return this.state.failed?<main id="main" className="shell section"><h1>Let’s reset this display.</h1><p>Reload the page to open GAME FROST again.</p><a className="btn cyan" href="/">Return to the store</a></main>:this.props.children}}
async function start(){const[response]=await Promise.all([originalFetch('/store-content.json',{cache:'no-cache'}),preloadRoute(path)]);if(!response.ok)throw new Error('The content file could not load.');const initial=await response.json() as StoreDocument;const doc=await loadLocalContent(initial);document.title=(!contentRoute(path,doc)&&path!=='/admin'?'Page not found | GAME FROST':undefined)||(doc.seo[path]?.[0]||doc.products.find(p=>`/shop/${p.platform.toLowerCase().replace(/[^a-z0-9]+/g,'-')}/${p.id}`===path)?.name||doc.settings.name);createRoot(document.getElementById('root')!).render(<DisplayBoundary><ContentProvider initial={doc} local><StoreProvider local><a className="skip-link" href="#main">Skip to content</a><SiteHeader/><StorePage path={path} query={query}/><SiteFooter/></StoreProvider></ContentProvider></DisplayBoundary>)}
void start().catch(()=>{const root=document.getElementById('root')!;root.innerHTML='<main id="main" style="padding:60px;font:16px Arial"><h1>Let’s open your store.</h1><p>Please reload. If you downloaded the complete package, use START-WEBSITE.cmd to view the full site.</p><button onclick="location.reload()">Reload</button></main>'});
