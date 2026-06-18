import { useQuery } from '@tanstack/react-query';
import { Link, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { api } from '@/lib/api-client';
import { detectLanguage } from '@/lib/detect-language';
export default function Search() { const { q='' } = useLocalSearchParams<{q:string}>(); const query = String(q); const result = useQuery({ queryKey:['search',query], queryFn:()=>api.get('v1/search',{searchParams:{q:query,lang:detectLanguage(query)}}).json<any>(), enabled:!!query }); return <Screen title={`Search: ${query}`}><Text>{result.isLoading?'Loading...':''}</Text>{result.data?.english_matches?.map((t:any)=><Link key={t.id} href={`/term/en/${t.slug}`}><Text>{t.term}</Text></Link>)}{result.data?.assamese_matches?.map((t:any)=><Link key={t.id} href={`/term/as/${t.slug}`}><Text>{t.term}</Text></Link>)}</Screen>; }
