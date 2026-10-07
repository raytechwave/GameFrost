import {getPublished} from '@/lib/cms-server';
export async function GET(){try{return Response.json(await getPublished(),{headers:{'Cache-Control':'no-store'}})}catch(e){console.error('Content load failed',e);return Response.json({error:'Store content is temporarily unavailable.'},{status:503,headers:{'Cache-Control':'no-store'}})}}
