import ts from 'typescript';
import {readFileSync,writeFileSync} from 'node:fs';
const groups={home:'Home',pages:'About, visit & policies',common:'Shared sections',store:'Header & footer',shop:'Shop & game pages',flows:'Cart, checkout & services',showroom:'Showroom controls','editorial-image':'Images','games-common':'Games & countdown'};
const entries=new Map();
const record=(text,group)=>{if(!entries.has(text))entries.set(text,{group,text})};
for(const[name,group]of Object.entries(groups)){
 const file=`components/game-frost/${name}.tsx`;let source=readFileSync(file,'utf8');const sf=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),edits=[];
 const labels={About:'About',Visit:'Visit the store',SealPage:'Seal promise',Reviews:'Customer stories',Guides:'Guides',FAQPage:'FAQs',Policies:'Warranty & privacy',BrandPage:'Brand page',Home:'Home',MiniTrade:'Trade-in widget',StoreProvider:'Contact dialog',SiteHeader:'Header & navigation',SiteFooter:'Footer',ProductCard:'Product cards',ProductDetail:'Product pages',Shop:'Shop',GamesPage:'Games',GameDetail:'Game details',TradeIn:'Trade-in',Services:'Services',Cart:'Cart',Checkout:'Checkout',Account:'Customer account'};
 function walk(node,currentGroup=group){if(ts.isFunctionDeclaration(node)&&node.name)currentGroup=labels[node.name.text]||currentGroup;if(ts.isJsxText(node)){const raw=node.getText(sf);const text=raw.replace(/\s+/g,' ').trim();if(text.length>=4&&!/^\d|^[+·✦/−≠]+$/.test(text)){record(text,currentGroup);const before=/^ /.test(raw)?"{' '}":'',after=/ $/.test(raw)?"{' '}":'';edits.push({start:node.getStart(sf),end:node.end,value:before+'<ContentText text={'+JSON.stringify(text)+'}/>'+after});}}
 if(ts.isJsxAttribute(node)&&node.name.getText(sf)==='text'&&node.initializer&&ts.isJsxExpression(node.initializer)&&node.initializer.expression&&ts.isStringLiteral(node.initializer.expression))record(node.initializer.expression.text,currentGroup);
 if(ts.isJsxAttribute(node)&&node.initializer&&ts.isStringLiteral(node.initializer)&&['title','copy','eyebrow','caption','text','label'].includes(node.name.getText(sf))){const value=node.initializer.text;if(value.length>=4)record(value,currentGroup)}
 // Read descriptive array content for steps and platform tiles; renderers resolve these through ContentText.
 if(ts.isStringLiteral(node)&&node.text.length>24&&!/^[\/\w-]*\/[\w-]/.test(node.text)&&!node.text.startsWith('http')&&node.parent&&ts.isArrayLiteralExpression(node.parent))record(node.text,currentGroup);
 if(ts.isStringLiteral(node)&&node.parent&&ts.isConditionalExpression(node.parent)){let ancestor=node.parent;while(ancestor&&!ts.isJsxAttribute(ancestor)&&!ts.isFunctionDeclaration(ancestor))ancestor=ancestor.parent;if(ancestor&&ts.isJsxAttribute(ancestor)&&['title','copy','eyebrow','text'].includes(ancestor.name.getText(sf))&&node.text.length>4)record(node.text,currentGroup)}
 ts.forEachChild(node,child=>walk(child,currentGroup))}walk(sf);
 for(const e of edits.sort((a,b)=>b.start-a.start))source=source.slice(0,e.start)+e.value+source.slice(e.end);
 if(!/import \{[^}]*ContentText[^}]*\} from '\.\/content'/.test(source))source=source.replace("'use client';","'use client';\nimport {ContentText} from './content';");
 if(source.includes('import {ContentText,useContent}')&&source.includes("import {ContentText} from './content';"))source=source.replace("import {ContentText} from './content';\n",'');
 writeFileSync(file,source);
}
writeFileSync('lib/cms-copy.ts','// Editable copy exposed as labeled fields in Store Manager.\nexport const copyFields='+JSON.stringify([...entries.values()],null,2)+';\n');
console.log(`Connected ${entries.size} content fields.`);
