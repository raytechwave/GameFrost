import {z} from 'zod';
import {products as defaultProducts,tradeEstimate,serviceTypes as defaultServices} from '../lib/catalog';

import {read,mutate} from './browser-db';
import type {StoreDocument} from '../lib/cms-model';
import {canPurchase} from '../lib/cms-model';
const line=z.object({id:z.string().max(100),qty:z.number().int().min(1).max(4)});
const cartSchema=z.array(line).max(30);
const contact=z.object({name:z.string().trim().min(2).max(100),phone:z.string().regex(/^(?:\+92|0092|0)3\d{9}$/,'Enter a Pakistani mobile number, e.g. 03001234567.'),city:z.string().trim().min(2).max(100)});
const uuid=z.string().uuid();
type RecordItem={id:string;kind:string;payload:any;created:string;status:string};
export function validateLocalCart(raw:unknown,products=defaultProducts){const items=cartSchema.parse(raw);if(items.some(x=>!products.some(p=>p.id===x.id&&canPurchase(p))))throw new Error('One of these models needs a quote first.');return Array.from(new Map(items.map(x=>[x.id,x])).values());}
export function validateLocalDraft(action:string,payload:any,products=defaultProducts,serviceTypes=defaultServices){
 if(action==='order'){
  const c=contact.extend({address:z.string().trim().min(8).max(500),payment:z.enum(['Cash on delivery','JazzCash','Easypaisa','Bank transfer']),items:cartSchema}).parse(payload);
  if(!c.items.length)throw new Error('Your cart is empty.');
  const items=validateLocalCart(c.items,products).map(x=>{const p=products.find(p=>p.id===x.id)!;return{...x,name:p.name,price:p.price!};});
  return{...c,items,total:items.reduce((sum,x)=>sum+x.price*x.qty,0),delivery:'To be confirmed',sample:true};
 }
 if(action==='trade-in'){
  const c=contact.extend({platform:z.enum(['PlayStation','Xbox','Nintendo']),model:z.string().max(80),seal:z.enum(['Original seal intact','Opened / broken seal','Not sure']),condition:z.enum(['Excellent','Good','Needs attention']),payout:z.enum(['Cash','Bank transfer','JazzCash','Easypaisa','Store credit']),handoff:z.enum(['Store drop-off','Karachi pickup']),notes:z.string().max(2000),photos:z.array(uuid).max(4)}).parse(payload);
  const models:Record<string,string[]>={PlayStation:['PS5 Slim','PS5 Disc','PS4 Slim','PS4 Pro'],Xbox:['Xbox Series S','Xbox Series X'],Nintendo:['Switch OLED','Switch Lite']};
  if(!models[c.platform].includes(c.model))throw new Error('Choose a model for the selected platform.');
  return{...c,estimate:tradeEstimate(c.model,c.seal,c.condition),sample:true};
 }
 if(action==='service'){
  const c=contact.extend({service:z.string().max(60),device:z.string().min(2).max(100),date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>{const d=new Date(v+'T12:00:00Z');return !isNaN(d.getTime())&&d.toISOString().slice(0,10)===v},'Choose a valid date.'),notes:z.string().max(2000)}).parse(payload);
  const service=serviceTypes.find(x=>x.id===c.service);if(!service)throw new Error('Choose a valid service.');
  const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Karachi',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());if(c.date<today)throw new Error('Choose today or a future date.');
  return{...c,serviceName:service.name,examplePrice:service.estimate,sample:true};
 }
 if(action==='review')return contact.extend({product:z.string().min(2).max(120),message:z.string().min(10).max(2000),videoUrl:z.string().url().max(500).optional().or(z.literal('')),consent:z.literal(true)}).parse(payload);
 if(action==='inquiry')return z.object({message:z.string().trim().min(3).max(2000)}).parse(payload);
 throw new Error('Unknown draft type.');
}

function reply(body:any,status=200){return Response.json(body,{status,headers:{'Cache-Control':'no-store'}});}
export async function handleLocalRequest(request:Request,document?:StoreDocument):Promise<Response>{
 const products=document?.products.filter(p=>p.active!==false)??defaultProducts,serviceTypes=document?.services??defaultServices;
 try{
  const path=new URL(request.url).pathname;
  if(path==='/api/store'&&request.method==='GET'){const [cart,records]=await Promise.all([read('cart',[]),read<RecordItem[]>('records',[])]);return reply({cart,records,user:null});}
  if(path==='/api/store'&&request.method==='POST'){
   const body=await request.json() as any;
   if(body.action==='cart'){const items=validateLocalCart(body.items,products);await mutate('cart',[],()=>items);return reply({cart:items});}
   const id=uuid.parse(body.id);
   if(body.action==='delete-draft'){await mutate<RecordItem[]>('records',[],previous=>previous.filter(record=>record.id!==id));return reply({ok:true});}
   const payload:any=validateLocalDraft(body.action,body.payload??{},products,serviceTypes);
   if(body.action==='trade-in')for(const photo of payload.photos){if(!await read('photo:'+photo,null))throw new Error('A photo could not be verified. Please upload it again.');}
   await mutate<RecordItem[]>('records',[],previous=>previous.some(record=>record.id===id)?previous:[{id,kind:body.action,payload,created:new Date().toISOString(),status:'draft'},...previous].slice(0,30));
   return reply({id,status:'draft',message:'Draft saved on this device. Nothing has been sent.'},201);
  }
  if(path==='/api/upload'&&request.method==='POST'){
   const form=await request.formData();const file=form.get('file');
   if(!(file instanceof File)||file.size>5*1024*1024||file.size<12)throw new Error('Upload a JPG, PNG or WebP photo under 5 MB.');
   const bytes=new Uint8Array(await file.arrayBuffer());
   const png=bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71;
   const jpg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
   const webp=new TextDecoder().decode(bytes.slice(0,4))==='RIFF'&&new TextDecoder().decode(bytes.slice(8,12))==='WEBP';
   if(!png&&!jpg&&!webp)throw new Error('This is not a supported image.');
   const ids=await read<string[]>('photo-ids',[]);if(ids.length>=20)throw new Error('You have reached the photo limit for this preview.');
   const id=crypto.randomUUID();await mutate<Blob|null>('photo:'+id,null,()=>file);await mutate<string[]>('photo-ids',[],previous=>[...previous,id]);
   const url=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error('Photo preview unavailable.'));reader.readAsDataURL(file);});
   return reply({id,url,name:file.name},201);
  }
  if(path.startsWith('/api/files/')){const id=uuid.parse(path.split('/').pop());const file=await read<Blob|null>('photo:'+id,null);return file?new Response(file,{headers:{'Content-Type':file.type,'Cache-Control':'private, no-store'}}):reply({error:'Photo not found.'},404);}
  return reply({error:'Unknown local operation.'},404);
 }catch(error){return reply({error:error instanceof z.ZodError?error.issues[0]?.message:error instanceof Error?error.message:'Please try again.'},400);}
}
/** Only this static distribution uses local storage; hosted APIs remain unchanged. */
export function installLocalStore(){const original=window.fetch.bind(window);window.fetch=(input,init)=>{const url=new URL(input instanceof Request?input.url:String(input),location.href);if(url.origin===location.origin&&/^\/api\/(?:store|upload|files(?:\/|$))/.test(url.pathname))return handleLocalRequest(new Request(input instanceof Request?input:url,init));return original(input,init);};}
