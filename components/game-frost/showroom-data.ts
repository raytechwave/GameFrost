import {featuredProducts} from '@/lib/catalog';

export type RoomId='lobby'|'consoles'|'handhelds'|'vr'|'retro'|'service';
export type Room={id:RoomId;number:string;label:string;title:string;copy:string;color:string;position:[number,number,number];look:[number,number,number];href:string;cta:string;productIds:string[]};
export const rooms:Room[]=[
 {id:'lobby',number:'00',label:'The lobby',title:'Your next world\nstarts here.',copy:'Step inside. Find your console. Make yourself at home.',color:'#8beaff',position:[0,2.35,8.5],look:[0,2,-7],href:'/shop',cta:'Browse the store',productIds:['ps5-slim-disc','nintendo-switch-oled']},
 {id:'consoles',number:'01',label:'Console gallery',title:'Big worlds.\nYour console.',copy:'PlayStation or Xbox. Follow the glow to your next adventure.',color:'#8beaff',position:[-1.7,2.05,1.7],look:[-4.8,1.65,-4],href:'/shop?category=Consoles',cta:'Explore consoles',productIds:['ps5-slim-disc','ps4-slim','xbox-series-s']},
 {id:'handhelds',number:'02',label:'Handheld studio',title:'Take your\nworld with you.',copy:'Nintendo Switch and Steam Deck. The next level goes wherever you go.',color:'#ffa58c',position:[1.7,2.05,1.7],look:[5,1.65,-3.5],href:'/shop?platform=PC%20Handhelds',cta:'Explore handhelds',productIds:['nintendo-switch-oled','steam-deck-oled']},
 {id:'vr',number:'03',label:'Beyond the screen',title:'A whole new\npoint of view.',copy:'Step closer to mixed reality. Build a setup that changes how you play.',color:'#baadff',position:[1.3,2.1,-5],look:[4.8,1.8,-9],href:'/shop?category=VR%20%26%20XR',cta:'Explore VR & XR',productIds:['meta-quest-3','logitech-g29']},
 {id:'retro',number:'04',label:'The retro vault',title:'Press start.\nFeel it again.',copy:'The games that made you a gamer. Some worlds are always worth revisiting.',color:'#ffd58b',position:[-2.2,2.1,-6.2],look:[-8.5,2.1,-9.5],href:'/shop?category=Retro',cta:'Open the retro vault',productIds:['ps4-slim','dualsense-white']},
 {id:'service',number:'05',label:'The service desk',title:'More life.\nMore play.',copy:'Repairs, setup and your next trade-in. Talk to people who know the gear.',color:'#9bffd0',position:[.5,2.1,-8],look:[5,2.2,-13],href:'/services',cta:'Visit the service desk',productIds:['logitech-g29','dualsense-white']},
];
export const displays=featuredProducts.map((product,index)=>({product,position:(
 [[-4.4,1.8,-1],[-6.4,1.8,-4.5],[-4.4,1.8,-8],[4.4,1.8,-1],[4.4,1.8,-8],[4.4,1.8,-11],[6.4,1.8,-4.5],[-4.4,1.8,-11]][index]
) as [number,number,number],color:index===4||index===5?'#baadff':index===3||index===6?'#ffa58c':index===2?'#9bffd0':'#8beaff'}));

/** Camera walking stays in the showroom and outside solid display plinths. */
export function walkPosition(x:number,z:number){
 x=Math.max(-9.3,Math.min(9.3,x));z=Math.max(-12.3,Math.min(10,z));
 for(const display of displays){const [px,,pz]=display.position;const dx=x-px,dz=z-pz;const length=Math.hypot(dx,dz);if(length<1.5){const angle=length>.001?Math.atan2(dz,dx):0;x=px+Math.cos(angle)*1.5;z=pz+Math.sin(angle)*1.5;}}
 return{x:Math.max(-9.3,Math.min(9.3,x)),z:Math.max(-12.3,Math.min(10,z))};
}
