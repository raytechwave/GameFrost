import {productUrl} from '@/lib/catalog';
import {getPublished} from '@/lib/cms-server';
import {visibleProducts} from '@/lib/cms-model';
import {origin} from '@/lib/seo';
const escape=(v:string)=>v.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
export async function GET(){try{const doc=await getPublished();const paths=[...Object.keys(doc.seo).filter(p=>!['/cart','/checkout','/account','/brand','/admin'].includes(p)),...visibleProducts(doc).map(productUrl),...doc.guides.map(g=>`/guides/${g.slug}`),...doc.games.map(g=>`/games/${g.id}`),...doc.pages.filter(p=>p.visible).map(p=>'/pages/'+p.slug)];return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+[...new Set(paths)].map(p=>`<url><loc>${escape(origin+(p==='/'?'':p))}</loc></url>`).join('')+'</urlset>',{headers:{'Content-Type':'application/xml','Cache-Control':'no-cache'}})}catch{return new Response('Store temporarily unavailable',{status:503})}}
