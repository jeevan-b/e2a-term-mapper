import { useQuery } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { Link, router } from 'expo-router';
import { Button, Text } from 'react-native';
import { Screen } from '@/components/Screen';
import { api } from '@/lib/api-client';
const auth=async()=>({Authorization:`Bearer ${(await SecureStore.getItemAsync('token')) ?? ''}`});
export default function Admin(){async function logout(){await SecureStore.deleteItemAsync('token'); router.replace('/login');} const r=useQuery({queryKey:['stats'],queryFn:async()=>api.get('v1/admin/stats',{headers:await auth()}).json<any>()}); return <Screen title="Admin"><Text>English: {r.data?.english_terms}</Text><Text>Assamese: {r.data?.assamese_terms}</Text><Text>Mappings: {r.data?.mappings}</Text><Link href="/admin/mappings"><Text>Manage mappings</Text></Link><Link href="/admin/terms/en"><Text>Manage English</Text></Link><Link href="/admin/terms/as"><Text>Manage Assamese</Text></Link><Button title="Logout" onPress={logout}/></Screen>}
