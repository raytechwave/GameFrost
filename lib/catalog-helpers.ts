import type {Product} from './catalog';
const formatter=new Intl.NumberFormat('en-IN',{maximumFractionDigits:0});
export const money=(n:number)=>`Rs. ${formatter.format(n)}`;
export const productUrl=(p:Product)=>`/shop/${p.platform.toLowerCase().replace(/[^a-z0-9]+/g,'-')}/${p.id}`;
export function matchesProduct(p:Product,query:string){
 const text=`${p.id} ${p.name} ${p.platform} ${p.category} ${p.storage}`.toLowerCase().replace(/[^a-z0-9]+/g,' ');
 return query.trim().toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).every(word=>text.includes(word));
}
export function tradeEstimate(model:string,seal:string,condition:string){const base:Record<string,number>={'PS5 Slim':115000,'PS5 Disc':105000,'PS4 Slim':37000,'PS4 Pro':49000,'Xbox Series S':62000,'Xbox Series X':105000,'Switch OLED':57000,'Switch Lite':33000};const value=(base[model]||35000)*(seal==='Original seal intact'?1:seal==='Not sure'?.82:.65)*(condition==='Excellent'?1:condition==='Good'?.88:.65);return {low:Math.round(value*.85/1000)*1000,high:Math.round(value/1000)*1000};}
