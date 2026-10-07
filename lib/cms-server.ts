import {cache} from 'react';
import {getChatGPTUser} from '@/app/chatgpt-auth';
import {database} from './store-server';
import {defaultDocument} from './cms-default';
import type {StoreDocument} from './cms-model';
// Dispatch verifies the authenticated identity. Only the confirmed Site owner edits store content.
const ownerEmail='kingasadkhan1556@gmail.com';
export async function adminUser(){const user=await getChatGPTUser();return user?.email.toLowerCase()===ownerEmail?user:null}
export const getPublished=cache(async():Promise<StoreDocument>=>{const row=await database().prepare('SELECT published FROM gf_cms WHERE id=?').bind('store').first<{published:string}>();return row?.published?JSON.parse(row.published):defaultDocument});
