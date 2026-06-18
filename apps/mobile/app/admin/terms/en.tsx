import { useQuery } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { Text } from 'react-native';
import { Screen } from '@/components/Screen';
import { api } from '@/lib/api-client';
const auth=async()=>({Authorization:`Bearer ${(await SecureStore.getItemAsync('token')) ?? ''}`});
export default function TermsEn(){const r=useQuery({queryKey:['admin-en'],queryFn:async()=>api.get('v1/admin/terms/en',{headers:await auth()}).json<any>()}); return <Screen title="English terms">{r.data?.items?.map((t:any)=><Text key={t.id}>{t.term}</Text>)}</Screen>}
