export const characterOrder = ['goku', 'spider-man', 'wolverine', 'harry-potter', 'ronaldo'] as const;
export type CharacterId = typeof characterOrder[number];
export type CharacterScene = {
  id: CharacterId; name: string; title: string; copy: string;
  renderer: 'gltf' | 'video' | 'poster' | 'vector'; asset: string; poster: string;
  clip: string; duration: number; accent: string; cta: string; href: string;
  active: boolean; status: 'ready' | 'asset-needed';
};
export const defaultScenes: CharacterScene[] = [
  {id:'goku', name:'Goku Ultra Instinct', title:'Go beyond your limits.', copy:'Silver-haired Ultra Instinct. The opening chapter of the GAME FROST journey.', renderer:'vector',asset:'/characters/goku-2d.svg',poster:'/characters/goku-2d.svg',clip:'Original connected vector performance',duration:4.8,accent:'#8beaff',cta:'Find your next upgrade',href:'/shop?platform=PlayStation',active:true,status:'ready'},
  {id:'spider-man', name:'Spider-Man', title:'Your city. Your next adventure.',copy:'A web-slinging chapter, followed by the games that bring your world to life.',renderer:'vector',asset:'/characters/spider-man-2d.svg',poster:'/characters/spider-man-2d.svg',clip:'Original connected vector performance',duration:4.8,accent:'#ff6a66',cta:'Explore the games',href:'/new-games',active:true,status:'ready'},
  {id:'wolverine',name:'Wolverine',title:'Built for the next round.',copy:'A low guard. A diagonal airborne strike. A grounded recovery. The supplied Wolverine performance, in the store.',renderer:'gltf',asset:'/characters/wolverine-attack.glb',poster:'/characters/wolverine-poster.webp',clip:'Wolverine - crouch, leap, screen strike, landing and facial performance',duration:4.8,accent:'#ffc568',cta:'Gear up',href:'/shop?category=Accessories',active:true,status:'ready'},
  {id:'harry-potter',name:'Harry Potter',title:'A little magic. A new world.',copy:'A red wand-tip spell, cast from the wand and carried through its follow-through.',renderer:'vector',asset:'/characters/harry-potter-2d.svg',poster:'/characters/harry-potter-2d.svg',clip:'Original connected vector performance',duration:4.8,accent:'#ff737d',cta:'Discover your world',href:'/shop',active:true,status:'ready'},
  {id:'ronaldo',name:'Ronaldo',title:'Make your next move count.',copy:'Preparation, planted support foot, ball contact and follow-through. Then straight into the store.',renderer:'vector',asset:'/characters/ronaldo-2d.svg',poster:'/characters/ronaldo-2d.svg',clip:'Original connected vector performance',duration:4.8,accent:'#b0edac',cta:'Shop now',href:'/shop',active:true,status:'ready'},
];
/** Old documents gain scene fields without replacing existing products or edits. */
export function scenesFor(document: {scenes?: CharacterScene[]}): CharacterScene[] {
  return characterOrder.map(id => {
    const configured=document.scenes?.find(s => s.id === id);
    const builtIn=defaultScenes.find(s => s.id === id)!;
    // Existing CMS saves contain these exact empty placeholders. Upgrade only
    // those records; retain every title, copy, CTA, active flag and custom asset.
    if(configured&&configured.renderer==='poster'&&configured.status==='asset-needed'&&!configured.asset&&!configured.poster&&builtIn.renderer==='vector'){
      return {...configured,renderer:builtIn.renderer,asset:builtIn.asset,poster:builtIn.poster,clip:builtIn.clip,status:'ready'};
    }
    return configured ?? builtIn;
  });
}
