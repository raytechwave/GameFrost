import {adminUser} from '@/lib/cms-server';
import {AdminPanel} from '@/components/game-frost/admin';
import {chatGPTSignInPath} from '@/app/chatgpt-auth';
export const dynamic='force-dynamic';
export const metadata={title:'Store Manager | GAME FROST',robots:{index:false,follow:false}};
export default async function Admin(){const user=await adminUser();if(!user)return <main id="main" className="shell section"><h1>Store owner access</h1><p>This editor is available to the GAME FROST owner.</p><a className="btn cyan" href={chatGPTSignInPath('/admin')} target="_top">Sign in with ChatGPT</a></main>;return <AdminPanel/>}
