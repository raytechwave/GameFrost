'use client';
import {createContext,useContext,useEffect,useMemo,useState} from 'react';
import type {StoreDocument} from '@/lib/cms-model';
import {visibleProducts,featured} from '@/lib/cms-model';
type ContentState={document:StoreDocument;local:boolean;preview:boolean;products:StoreDocument['products'];featuredProducts:StoreDocument['products'];games:StoreDocument['games'];guides:StoreDocument['guides'];faqs:StoreDocument['faqs'];serviceTypes:StoreDocument['services'];rooms:StoreDocument['rooms']};
const Context=createContext<ContentState|null>(null);
export function ContentProvider({initial,children,local=false}:{initial:StoreDocument;children:React.ReactNode;local?:boolean}){
 const [document,setDocument]=useState(initial),[preview,setPreview]=useState(false);
 useEffect(()=>{if(new URLSearchParams(location.search).get('preview')!=='draft')return;const receive=(e:MessageEvent)=>{if(e.origin!==location.origin||e.source!==window.parent||e.data?.type!=='gf-preview')return;setDocument(e.data.document);setPreview(true)};window.addEventListener('message',receive);window.parent.postMessage({type:'gf-preview-ready'},location.origin);return()=>window.removeEventListener('message',receive)},[]);
 useEffect(()=>{window.document.documentElement.style.setProperty('--brand-accent',document.settings.accent)},[document.settings.accent]);
 const value=useMemo(()=>({document,local,preview,products:visibleProducts(document),featuredProducts:featured(document),games:document.games,guides:document.guides,faqs:document.faqs,serviceTypes:document.services,rooms:document.rooms}),[document,local,preview]);
 return <Context.Provider value={value}>{preview&&<div className="cms-preview-label">Draft preview · changes are not published</div>}{children}</Context.Provider>;
}
export function useContent(){const state=useContext(Context);if(!state)throw new Error('Content unavailable');return state}
export function ContentText({text}:{text:string}){const{document}=useContent();return <>{document.copy[text]??text.replaceAll('GAME FROST',document.settings.name)}</>}
