import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, BackHandler, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { api } from '../lib/api';

export type RecordKind = 'scans' | 'cases' | 'high' | 'reviewed' | 'pending';
type Record = { id: number; crop: string; disease: string; confirmed_disease?: string; farmer_name: string; status: string; urgency?: string; location?: string; archived?: number; created_at: string };
export default function AnalyticsRecords({ kind, onClose, days = 0 }: { kind: RecordKind | null; onClose: () => void; days?: number }) {
  const router = useRouter();
  const [rows, setRows] = useState<Record[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!kind) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => { onClose(); return true; });
    return () => subscription.remove();
  }, [kind, onClose]);
  useEffect(() => {
    if (!kind) return;
    let active = true;
    setBusy(true); setError(''); setRows([]);
    api<Record[]>(`/analytics/records?kind=${kind}&days=${days}`).then(data => { if (active) setRows(data); })
      .catch(e => { if (active) setError(e.message || 'Unable to load records.'); })
      .finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [kind, retry, days]);
  const title = kind === 'scans' ? 'Total scans' : kind === 'high' ? 'High-risk cases' : kind === 'reviewed' ? 'Reviewed cases' : kind === 'pending' ? 'Awaiting review' : 'Expert cases';
  if (!kind) return null;
  return <View style={s.overlay} accessibilityViewIsModal>
    <View style={s.root}><View style={s.header}><TouchableOpacity accessibilityRole="button" onPress={onClose} style={s.close}><Text style={s.link}>‹ Back to dashboard</Text></TouchableOpacity><Text style={s.title}>{title}</Text><Text style={s.meta}>{days ? `Last ${days} days` : 'All time'} · {kind === 'scans' ? 'Recorded plant screenings' : 'Includes archived cases'}</Text></View>
      <ScrollView contentContainerStyle={s.body}>
        {busy ? <ActivityIndicator color="#176B3A" /> : error ? <View><Text style={s.error}>{error}</Text><TouchableOpacity style={s.close} onPress={() => setRetry(v => v + 1)}><Text style={s.link}>Try again</Text></TouchableOpacity></View> : <>
          <Text style={s.meta}>{rows.length} {kind === 'scans' ? 'scans' : 'cases'} found</Text>
          {!rows.length && <Text style={s.meta}>No matching records yet.</Text>}
          {rows.map(row => <View key={row.id} style={s.card}>
            <Text style={s.name}>{row.crop} · {row.confirmed_disease || row.disease}</Text>
            <Text style={s.meta}>#{row.id} · {row.farmer_name}</Text>
            <Text style={s.meta}>{row.status}{row.urgency ? ` · ${row.urgency} urgency` : ''}{row.archived ? ' · Archived' : ''}</Text>
            {!!row.location && <Text style={s.meta}>{row.location}</Text>}
            <Text style={s.meta}>{new Date(row.created_at).toLocaleString()}</Text>
            {kind !== 'scans' && <TouchableOpacity accessibilityRole="button" style={s.close} onPress={() => { onClose(); router.push({ pathname: '/case-detail', params: { id: String(row.id) } }); }}><Text style={s.link}>View case and feedback →</Text></TouchableOpacity>}
          </View>)}
        </>}
      </ScrollView>
    </View>
  </View>;
}
const s = StyleSheet.create({ overlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 20, elevation: 20, backgroundColor: '#F7FAF7', overflow: 'hidden' }, root: { flex: 1, backgroundColor: '#F7FAF7' }, header: { padding: 22, paddingTop: 20, backgroundColor: '#E5F2E9' }, title: { fontSize: 26, fontWeight: '800', color: '#155C38' }, close: { paddingVertical: 14 }, link: { color: '#176B3A', fontWeight: '800' }, body: { padding: 18, paddingBottom: 45, width: '100%', maxWidth: 800, alignSelf: 'center' }, card: { backgroundColor: 'white', borderRadius: 15, padding: 17, borderWidth: 1, borderColor: '#DFEAE1', marginTop: 14 }, name: { color: '#17472E', fontSize: 16, fontWeight: '800' }, meta: { color: '#637769', marginTop: 8, lineHeight: 20 }, error: { color: '#B32B2B' } });
