import {StorePage} from '@/components/game-frost/router';
import {schemaFor,pageMeta} from '@/lib/seo';
import {getPublished} from '@/lib/cms-server';
export async function generateMetadata(){try{return pageMeta('/',await getPublished())}catch{return{title:'GAME FROST'}}}
export default async function Home(){const doc=await getPublished();return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schemaFor('/',doc)).replace(/</g,'\\u003c')}}/><StorePage path="/"/></>}
