'use client';
import {useContent,ContentText} from './content';
type EditorialAsset='lounge'|'services'|'retro';

const descriptions:Record<EditorialAsset,string>={
  lounge:'Cinematic concept artwork of a gaming lounge with glacier-inspired lighting.',
  services:'Illustrative controller diagnostics workbench with precision tools and cyan lighting.',
  retro:'Editorial still life of a vintage screen, controller and cartridges in amber and cyan light.',
};

export function EditorialImage({asset,className='',caption,sizes='(max-width: 760px) calc(100vw - 36px), 640px'}:{asset:EditorialAsset;className?:string;caption?:string;sizes?:string}){
  const{document}=useContent();const custom=document.settings.editorial[asset];
  return <figure className={`editorial-image ${className}`}>
    <img
      src={custom||`/images/editorial/${asset}-1536.webp`}
      srcSet={custom?undefined:`/images/editorial/${asset}-768.webp 768w, /images/editorial/${asset}-1536.webp 1536w`}
      sizes={sizes}
      alt={descriptions[asset]}
      width={1536}
      height={1024}
      loading="lazy"
      decoding="async"
    />
    {caption&&<figcaption><ContentText text={caption}/></figcaption>}
  </figure>;
}
