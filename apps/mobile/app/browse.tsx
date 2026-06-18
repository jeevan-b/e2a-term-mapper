import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
const en='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''); const ass=['অ','আ','ই','ঈ','উ','ঊ','এ','ঐ','ও','ঔ','ক','খ','গ','চ','জ','ট','ড','ত','দ','ন','প','ব','ম','য','ৰ','ল','শ','স','হ'];
export default function Browse(){return <Screen title="Browse"><Text>English</Text><View style={{flexDirection:'row',flexWrap:'wrap',gap:12}}>{en.map(l=><Link key={l} href={`/browse/en/${l.toLowerCase()}`}><Text>{l}</Text></Link>)}</View><Text>অসমীয়া</Text><View style={{flexDirection:'row',flexWrap:'wrap',gap:12}}>{ass.map(l=><Link key={l} href={`/browse/as/${l}`}><Text>{l}</Text></Link>)}</View></Screen>}
