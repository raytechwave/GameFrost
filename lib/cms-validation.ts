import {z} from 'zod';
import {defaultScenes,characterOrder} from './scenes';
const text=z.string().max(12000),short=z.string().trim().max(160),slug=z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/,'Use lowercase letters, numbers and hyphens for the URL.').max(100);
export const safeLink=z.string().max(2000).refine(v=>v===''||(/^\/(?!\/)/.test(v)&&!/[\\\x00-\x20]/.test(v))||/^https:\/\/[^\s\\]+$/i.test(v),'Use a relative path or a secure https:// link.');
const image=z.string().max(2000000).refine(v=>v===''||safeLink.safeParse(v).success||/^data:image\/(?:webp|png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(v),'Choose a JPG, PNG or WebP image.');
const price=z.number().int().min(0).max(100000000);
export const productSchema=z.object({id:slug,name:short.min(2),platform:short.min(1),category:short.min(1),price:price.nullable(),compare:price.optional(),image:image.optional(),storage:short,color:short,condition:short,description:text,jailbroken:z.boolean(),seal:z.boolean(),specs:z.record(z.string().max(100),z.string().max(2000)).refine(x=>Object.keys(x).length<=40,'Use up to 40 specifications.'),active:z.boolean().optional(),featured:z.boolean().optional(),stock:z.enum(['ask','available','preorder','sold-out']).optional()});
const date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>{const d=new Date(v+'T12:00:00Z');return !isNaN(d.getTime())&&d.toISOString().slice(0,10)===v},'Choose a valid release date.');
export const documentSchema=z.object({
 version:z.literal(1),
 scenes:z.array(z.object({id:z.enum(characterOrder),name:short.min(2),title:short.min(2),copy:text,renderer:z.enum(['gltf','video','poster','vector']),asset:safeLink,poster:image,clip:short,duration:z.number().min(.1).max(60),accent:z.string().regex(/^#[\da-fA-F]{6}$/),cta:short.min(1),href:safeLink.refine(v=>!!v),active:z.boolean(),status:z.enum(['ready','asset-needed'])})).length(5).default(defaultScenes).superRefine((scenes,ctx)=>{if(new Set(scenes.map(s=>s.id)).size!==5)ctx.addIssue({code:z.ZodIssueCode.custom,message:'Each required character must appear exactly once.'});for(const s of scenes)if(s.status==='ready'&&!(s.renderer==='poster'?s.poster:s.asset))ctx.addIssue({code:z.ZodIssueCode.custom,message:`${s.name} needs a ${s.renderer==='poster'?'poster':'motion asset'}.`});}),
 settings:z.object({name:short.min(2),tagline:short,city:short,address:z.string().max(2000),hours:z.string().max(2000),phone:short,whatsapp:z.string().max(20).refine(v=>v===''||/^\+?\d{10,15}$/.test(v),'Use the international number, for example 923001234567.'),email:z.string().email().max(160).or(z.literal('')),mapUrl:safeLink,announcement:z.string().max(500),accent:z.string().regex(/^#[\da-fA-F]{6}$/),showroom:z.enum(['on-demand','auto']),quality:z.enum(['economy','balanced','high']),priceMode:z.enum(['sample','live']),editorial:z.object({lounge:image,services:image,retro:image})}),
 navigation:z.array(z.object({label:short.min(1),href:safeLink.refine(v=>!!v)})).max(12),
 products:z.array(productSchema).max(500),
 games:z.array(z.object({id:slug,name:short.min(2),platform:short,image,status:short,release:date.optional().or(z.literal('')),source:safeLink,genre:short})).max(200),
 guides:z.array(z.object({slug,tag:short,title:short.min(2),summary:text,body:z.array(z.tuple([z.string().max(500),text])).max(40)})).max(100),
 faqs:z.array(z.object({q:z.string().trim().min(2).max(500),a:text})).max(100),
 services:z.array(z.object({id:slug,name:short.min(2),estimate:price,copy:text})).min(1).max(30),
 rooms:z.array(z.object({id:z.enum(['lobby','consoles','handhelds','vr','retro','service']),number:z.string().max(2),label:short,title:z.string().max(120),copy:z.string().max(500),color:z.string().regex(/^#[\da-fA-F]{6}$/),position:z.tuple([z.number(),z.number(),z.number()]),look:z.tuple([z.number(),z.number(),z.number()]),href:safeLink,cta:short,productIds:z.array(slug).max(8)})).length(6),
 copy:z.record(z.string().max(12000),text).refine(x=>Object.keys(x).length<=1500,'Too many content fields.'),
 seo:z.record(z.string().regex(/^\//).max(200),z.tuple([z.string().max(160),z.string().max(500)])),
 pages:z.array(z.object({slug,title:short.min(2),eyebrow:short,summary:text,visible:z.boolean(),blocks:z.array(z.object({heading:z.string().max(500),text,image})).max(40)})).max(100),
}).superRefine((doc,ctx)=>{
 for(const [key,rows,id] of [['products',doc.products,'id'],['games',doc.games,'id'],['guides',doc.guides,'slug'],['services',doc.services,'id'],['pages',doc.pages,'slug'],['rooms',doc.rooms,'id']] as const){const values=rows.map((v:any)=>v[id]);if(new Set(values).size!==values.length)ctx.addIssue({code:z.ZodIssueCode.custom,path:[key],message:`Each ${key} URL must be unique.`})}
});
