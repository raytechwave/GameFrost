import {products,featuredProducts,games,guides,faqs,serviceTypes,routeMeta} from './catalog';
import {rooms} from '@/components/game-frost/showroom-data';
import type {StoreDocument} from './cms-model';
import {defaultScenes} from './scenes';
export const defaultDocument:StoreDocument={
 version:1,
 scenes:defaultScenes,
 settings:{name:'GAME FROST',tagline:'Chill prices. Hot games.',city:'Karachi, Pakistan',address:'13c Block, Block 13 C Gulshan-e-Iqbal, Karachi 75300, Pakistan',hours:'3:00 PM – 2:00 AM (Pakistan time)',phone:'+923350263448',whatsapp:'923350263448',email:'',mapUrl:'https://maps.google.com/maps?ftid=0x3eb33ff8424e9337:0x532ebab7c8d614ca',announcement:'STORE PREVIEW · Illustrative prices · No payments collected · Scene integration preview',accent:'#8beaff',showroom:'on-demand',quality:'balanced',priceMode:'sample',editorial:{lounge:'',services:'',retro:''}},
 navigation:[{label:'Explore',href:'/#showroom'},{label:'Shop',href:'/shop'},{label:'New games',href:'/new-games'},{label:'Sell / Trade-in',href:'/trade-in'},{label:'Services',href:'/services'},{label:'The seal promise',href:'/why-the-seal-matters'}],
 products:products.map(p=>({...p,active:true,featured:featuredProducts.some(f=>f.id===p.id),stock:'ask'})),games,guides,faqs,services:serviceTypes,rooms,copy:{},seo:{...routeMeta,'/showroom':['GAME FROST | Explore the showroom','Explore the optional six-department digital showroom.']},pages:[],
};
