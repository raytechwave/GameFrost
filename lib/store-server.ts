import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '@/app/chatgpt-auth';
export async function ownerFor(request:Request){const user=await getChatGPTUser();if(user)return{owner:`user:${user.userId}`,user:{name:user.displayName,email:user.email},cookie:null};const raw=request.headers.get('cookie')?.match(/(?:^|;\s*)gf_session=([a-f0-9-]{36})(?:;|$)/)?.[1];const id=raw??crypto.randomUUID();return{owner:`guest:${id}`,user:null,cookie:raw?null:`gf_session=${id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${new URL(request.url).protocol==='https:'?'; Secure':''}`};}
export function database(){if(!env.DB)throw new Error('Store unavailable');return env.DB}
export function bucket(){if(!env.BUCKET)throw new Error('Uploads unavailable');return env.BUCKET}
export function reply(data:unknown,status=200,cookie:string|null=null){const headers=new Headers({'Cache-Control':'no-store'});if(cookie)headers.set('Set-Cookie',cookie);return Response.json(data,{status,headers})}
export function sameOrigin(req:Request){const origin=req.headers.get('origin');return !origin||origin===new URL(req.url).origin;}
