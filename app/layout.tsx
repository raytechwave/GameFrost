import type { Metadata } from 'next';
import './globals.css';
import './showroom.css';
import './mobile.css';
import {ContentProvider} from '@/components/game-frost/content';
import {getPublished} from '@/lib/cms-server';
import { StoreProvider, SiteHeader, SiteFooter } from '@/components/game-frost/store';
export const viewport={width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#080d17'};
export const metadata:Metadata={metadataBase:new URL('https://game-frost.kingasadkhan1556.chatgpt.site'),title:'GAME FROST | Original-Seal Consoles in Karachi',description:'Explore seal-intact pre-owned consoles, games and gaming gear. Buy, sell and trade with GAME FROST in Karachi. Nationwide delivery inquiries.',icons:{icon:'/favicon.svg',shortcut:'/favicon.svg'},robots:{index:false,follow:false}};
export default async function RootLayout({children}:{children:React.ReactNode}){let doc;try{doc=await getPublished()}catch(e){console.error('Content unavailable',e);return <html lang="en-PK"><body><main id="main" className="shell section"><h1>The store is temporarily unavailable.</h1><p>Please reload in a moment. Your saved items are safe.</p></main></body></html>};return <html lang="en-PK" suppressHydrationWarning><head><link rel="stylesheet" href="/fonts/fonts.css"/></head><body><ContentProvider initial={doc}><StoreProvider><a className="skip-link" href="#main">Skip to content</a><SiteHeader/>{children}<SiteFooter/></StoreProvider></ContentProvider></body></html>}
