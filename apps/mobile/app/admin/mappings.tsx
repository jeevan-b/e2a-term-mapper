import { useQuery } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { Text } from 'react-native';
import { Screen } from '@/components/Screen';
import { api } from '@/lib/api-client';
const auth=async()=>({Authorization:`Bearer ${(await SecureStore.getItemAsync('token')) ?? ''}`});
export default function Mappings(){const r=useQuery({queryKey:['mappings'],queryFn:async()=>api.get('v1/admin/mappings',{headers:await auth()}).json<any>()}); return <Screen title="Mappings">{r.data?.items?.map((m:any)=><Text key={m.id}>{m.english_id} ↔ {m.assamese_id}</Text>)}</Screen>}
