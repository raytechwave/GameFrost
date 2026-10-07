import type {Product,Game} from './catalog';
import type {Room} from '@/components/game-frost/showroom-data';
import type {CharacterScene} from './scenes';
export type Guide={slug:string;tag:string;title:string;summary:string;body:string[][]};
export type CustomPage={slug:string;title:string;eyebrow:string;summary:string;visible:boolean;blocks:{heading:string;text:string;image:string}[]};
export type StoreDocument={
 version:1;
 settings:{name:string;tagline:string;city:string;address:string;hours:string;phone:string;whatsapp:string;email:string;mapUrl:string;announcement:string;accent:string;showroom:'on-demand'|'auto';quality:'economy'|'balanced'|'high';priceMode:'sample'|'live';editorial:Record<'lounge'|'services'|'retro',string>;};
 navigation:{label:string;href:string}[];
 products:Product[];games:Game[];guides:Guide[];faqs:{q:string;a:string}[];
 services:{id:string;name:string;estimate:number;copy:string}[];
 rooms:Room[];copy:Record<string,string>;seo:Record<string,[string,string]>;pages:CustomPage[];
 scenes?:CharacterScene[];
};
export type CmsSnapshot={document:StoreDocument;published:StoreDocument;revision:number;updated:string|null;history:{id:string;action:string;created:string}[];user?:{name:string;email:string};local?:boolean};
export function visibleProducts(doc:StoreDocument){return doc.products.filter(p=>p.active!==false)}
export function featured(doc:StoreDocument){return visibleProducts(doc).filter(p=>p.featured)}
export function canPurchase(p:Product){return p.active!==false&&p.price!==null&&p.stock!=='sold-out'}
export function contentRoute(path:string,doc:StoreDocument){return path in doc.seo||doc.products.some(p=>p.active!==false&&path===`/shop/${p.platform.toLowerCase().replace(/[^a-z0-9]+/g,'-')}/${p.id}`)||doc.games.some(g=>path===`/games/${g.id}`)||doc.guides.some(g=>path===`/guides/${g.slug}`)||doc.pages.some(p=>p.visible&&path===`/pages/${p.slug}`)}
