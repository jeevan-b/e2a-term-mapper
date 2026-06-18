import { useQuery } from '@tanstack/react-query';
import { Link, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import { Screen } from '@/components/Screen';
import { api } from '@/lib/api-client';
export default function EnglishTerm() { const { slug } = useLocalSearchParams<{slug:string}>(); const r=useQuery({queryKey:['en',slug],queryFn:()=>api.get(`v1/terms/en/${slug}`).json<any>()}); return <Screen title={r.data?.term?.term ?? 'English term'}>{r.data?.equivalents?.map((t:any)=><Link key={t.id} href={`/term/as/${t.slug}`}><Text>{t.term}</Text></Link>)}</Screen>; }
