import {notFound} from 'next/navigation';
import {StorePage} from '@/components/game-frost/router';
import {schemaFor,pageMeta,validRoute} from '@/lib/seo';
import {getPublished} from '@/lib/cms-server';
export async function generateMetadata({params}:{params:Promise<{slug:string[]}>}){const{slug}=await params;return pageMeta('/'+slug.join('/'),await getPublished())}
export default async function Page({params,searchParams}:{params:Promise<{slug:string[]}>;searchParams:Promise<Record<string,string|string[]>>}){const{slug}=await params;const path='/'+slug.join('/'),doc=await getPublished();const q=await searchParams;if(!validRoute(path,doc)&&q.preview!=='draft')notFound();const query=Object.fromEntries(Object.entries(q).map(([k,v])=>[k,Array.isArray(v)?v[0]:v]));return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schemaFor(path,doc)).replace(/</g,'\\u003c')}}/><StorePage path={path} query={query}/></>}
