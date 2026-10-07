import {z} from 'zod';
import {adminUser} from '@/lib/cms-server';
import {database,bucket,reply,sameOrigin} from '@/lib/store-server';

export async function GET(request:Request){
 try{
  if(!await adminUser())return reply({error:'Only the store owner can read customer requests.'},403);
  const url=new URL(request.url),db=database();
  const photo=url.searchParams.get('photo'),requestId=url.searchParams.get('request');
  if(photo||requestId){
   if(!z.string().uuid().safeParse(photo).success||!z.string().uuid().safeParse(requestId).success)return reply({error:'Invalid photo reference.'},400);
   const record=await db.prepare("SELECT owner,payload FROM gf_requests WHERE id=? AND status!='draft'").bind(requestId).first<{owner:string;payload:string}>();
   if(!record||!JSON.parse(record.payload).photos?.includes(photo))return reply({error:'Not found.'},404);
   const upload=await db.prepare('SELECT mime FROM gf_uploads WHERE id=? AND owner=?').bind(photo,record.owner).first<{mime:string}>();
   const object=upload?await bucket().get(photo!):null;
   if(!object)return reply({error:'Not found.'},404);
   return new Response(object.body,{headers:{'Content-Type':upload!.mime,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
  }
  const cursor=url.searchParams.get('before');const before=cursor?z.tuple([z.string().datetime(),z.string().uuid()]).parse(JSON.parse(cursor)):null;
  const statement=before?db.prepare("SELECT id,kind,payload,created,status FROM gf_requests WHERE status!='draft' AND (created<? OR (created=? AND id<?)) ORDER BY created DESC,id DESC LIMIT 101").bind(before[0],before[0],before[1]):db.prepare("SELECT id,kind,payload,created,status FROM gf_requests WHERE status!='draft' ORDER BY created DESC,id DESC LIMIT 101");
  const rows=await statement.all<{id:string;kind:string;payload:string;created:string;status:string}>();
  const records=rows.results.slice(0,100).map(row=>({...row,payload:JSON.parse(row.payload)}));
  return reply({records,next:rows.results.length>100?JSON.stringify([records.at(-1)?.created,records.at(-1)?.id]):null});
 }catch{return reply({error:'Customer requests are temporarily unavailable.'},503)}
}
export async function POST(request:Request){
 if(!sameOrigin(request))return reply({error:'Request not allowed.'},403);
 try{
  if(!await adminUser())return reply({error:'Only the store owner can update customer requests.'},403);
  const raw=await request.text();if(raw.length>4000)return reply({error:'Request too large.'},413);
  const body=z.object({id:z.string().uuid(),previous:z.enum(['submitted','reviewing','quoted','closed','cancelled']),status:z.enum(['reviewing','quoted','closed','cancelled'])}).parse(JSON.parse(raw));
  const result=await database().prepare('UPDATE gf_requests SET status=? WHERE id=? AND status=? RETURNING id').bind(body.status,body.id,body.previous).all();
  if(!result.results.length)return reply({error:'The request changed in another tab. Refresh the queue.'},409);
  return reply({ok:true,status:body.status});
 }catch(error){return reply({error:error instanceof z.ZodError?'Choose a valid request and status.':'The status could not be saved.'},error instanceof z.ZodError?400:503)}
}
