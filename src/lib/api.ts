import AsyncStorage from '@react-native-async-storage/async-storage';
// A physical phone requires your computer's LAN IPv4 address, not localhost.
const BASE = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/,'');
export type Profile = {id:number;name:string;email:string;role:'farmer'|'officer'|'researcher'|'admin';preferred_language?:'en'|'si'|'ta'};
export async function api<T=any>(endpoint:string, options:RequestInit={}):Promise<T> {
 const token=await AsyncStorage.getItem('cropcare_token');
 const res=await fetch(`${BASE}/api${endpoint}`,{...options,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`} :{}),...options.headers}});
 const body=await res.json().catch(()=>({}));
 if(!res.ok)throw new Error(body.error||`Server error ${res.status}`);
 return body as T;
}
export async function saveSession(data:{token:string;user:Profile}){await AsyncStorage.multiSet([['cropcare_token',data.token],['cropcare_user',JSON.stringify(data.user)]]);}
export async function loadProfile():Promise<Profile|null>{const u=await AsyncStorage.getItem('cropcare_user');return u?JSON.parse(u):null;}
export async function signOut(){await AsyncStorage.multiRemove(['cropcare_token','cropcare_user']);}
