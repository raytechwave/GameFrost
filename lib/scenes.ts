export const characterOrder = ['goku', 'spider-man', 'wolverine', 'harry-potter', 'ronaldo'] as const;
export type CharacterId = typeof characterOrder[number];
export type CharacterScene = {
  id: CharacterId; name: string; title: string; copy: string;
  renderer: 'gltf' | 'video' | 'poster'; asset: string; poster: string;
  clip: string; duration: number; accent: string; cta: string; href: string;
  active: boolean; status: 'ready' | 'asset-needed';
};
export const defaultScenes: CharacterScene[] = [
  {id:'goku', name:'Goku Ultra Instinct', title:'Go beyond your limits.', copy:'Silver-haired Ultra Instinct. The opening chapter of the GAME FROST journey.', renderer:'poster',asset:'',poster:'',clip:'',duration:4.8,accent:'#8beaff',cta:'Find your next upgrade',href:'/shop?platform=PlayStation',active:true,status:'asset-needed'},
  {id:'spider-man', name:'Spider-Man', title:'Your city. Your next adventure.',copy:'A web-slinging chapter, followed by the games that bring your world to life.',renderer:'poster',asset:'',poster:'',clip:'',duration:4.8,accent:'#ff6a66',cta:'Explore the games',href:'/new-games',active:true,status:'asset-needed'},
  {id:'wolverine',name:'Wolverine',title:'Built for the next round.',copy:'A low guard. A diagonal airborne strike. A grounded recovery. The supplied Wolverine performance, in the store.',renderer:'gltf',asset:'/characters/wolverine-attack.glb',poster:'/characters/wolverine-poster.webp',clip:'Wolverine - crouch, leap, screen strike, landing and facial performance',duration:4.8,accent:'#ffc568',cta:'Gear up',href:'/shop?category=Accessories',active:true,status:'ready'},
  {id:'harry-potter',name:'Harry Potter',title:'A little magic. A new world.',copy:'A red, wand-tip Expelliarmus-style spell is the direction for this chapter.',renderer:'poster',asset:'',poster:'',clip:'',duration:4.8,accent:'#ff737d',cta:'Discover your world',href:'/shop',active:true,status:'asset-needed'},
  {id:'ronaldo',name:'Ronaldo',title:'Make your next move count.',copy:'Preparation, planted support foot, ball contact and follow-through. Then straight into the store.',renderer:'poster',asset:'',poster:'',clip:'',duration:4.8,accent:'#b0edac',cta:'Shop now',href:'/shop',active:true,status:'asset-needed'},
];
/** Old documents gain scene fields without replacing existing products or edits. */
export function scenesFor(document: {scenes?: CharacterScene[]}): CharacterScene[] {
  return characterOrder.map(id => document.scenes?.find(s => s.id === id) ?? defaultScenes.find(s => s.id === id)!);
}
