import { useQuery } from '@tanstack/react-query';
import { Link, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import { Screen } from '@/components/Screen';
import { api } from '@/lib/api-client';
export default function BrowseEnglish(){const {letter}=useLocalSearchParams<{letter:string}>(); const r=useQuery({queryKey:['browse-en',letter],queryFn:()=>api.get('v1/browse/en',{searchParams:{letter}}).json<any>()}); return <Screen title={`English ${letter}`}>{r.data?.items?.map((t:any)=><Link key={t.id} href={`/term/en/${t.slug}`}><Text>{t.term}</Text></Link>)}</Screen>}
