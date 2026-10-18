import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { api, loadProfile } from '../lib/api';
import AnalyticsRecords, { type RecordKind } from '../components/analytics-records';

type Stats = {
  total_scans: number; cases: number; high_risk: number;
  diseases: { disease: string; count: number }[];
  statuses: { status: string; count: number }[];
  generated_at: string;
};

export default function OutbreakAnalytics() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const days = 0;
  const [revision, setRevision] = useState(0);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [kind, setKind] = useState<RecordKind | null>(null);
  const [canOpen, setCanOpen] = useState(false);
  useFocusEffect(useCallback(() => {
    let active = true;
    let inFlight = false;
    setStats(null); setBusy(true); setError('');
    const load = async () => {
      if (inFlight) return;
      inFlight = true;
      try {
        const me = await loadProfile();
        if (!active) return;
        if (!me) { router.replace('/secure-auth'); return; }
        if (me.role === 'farmer') { router.replace('/case-board'); return; }
        setCanOpen(me.role === 'officer' || me.role === 'admin');
        const data = await api<Stats>(`/analytics?days=${days}`);
        if (!active) return;
        // Older servers omit these fields. Never display missing counts as zero.
        if (!Array.isArray(data.statuses) || !Number.isFinite(Date.parse(data.generated_at))) {
          throw new Error('Analytics service needs a restart. Restart the backend, then tap Retry.');
        }
        setStats(data); setError('');
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Unable to update reports.');
      } finally { inFlight = false; if (active) setBusy(false); }
    };
    void load();
    const timer = setInterval(() => { void load(); }, 15000);
    return () => { active = false; clearInterval(timer); };
  }, [router, days, revision]));
  const reviewed = Number(stats?.statuses.find(x => x.status === 'reviewed')?.count || 0);
  return <View style={s.root}>
    <AnalyticsRecords kind={kind} days={days} onClose={() => { setKind(null); setRevision(v => v + 1); }} />
    <View style={s.header}>
      <TouchableOpacity accessibilityRole="button" style={s.tap} onPress={() => router.back()}><Text style={s.back}>‹ Dashboard</Text></TouchableOpacity>
      <Text style={s.title}>Outbreak analytics</Text><Text style={s.sub}>All districts · Includes archived cases</Text>
    </View>
    <ScrollView contentContainerStyle={s.body} refreshControl={<RefreshControl refreshing={busy} onRefresh={() => setRevision(v => v + 1)} />}>
      {!!error && <View style={s.card}><Text style={s.error}>{error}</Text><TouchableOpacity accessibilityRole="button" style={s.tap} onPress={() => setRevision(v => v + 1)}><Text style={s.link}>Retry</Text></TouchableOpacity></View>}
      {busy && !stats && <ActivityIndicator color="#176B3A" style={s.tap} />}
      {stats && <>
        <Text style={s.periodTitle}>{days ? `Last ${days} days` : 'All recorded reports'}</Text>
        {canOpen && <Text style={s.caption}>Tap a total to view its records.</Text>}
        <View style={s.metrics}>{[
          { label: 'Scans', kind: 'scans' as const, value: stats.total_scans, color: '#E4F4E8' },
          { label: 'Cases', kind: 'cases' as const, value: stats.cases, color: '#E8EFFB' },
          { label: 'High urgency', kind: 'high' as const, value: stats.high_risk, color: '#FCE8E8' },
        ].map(item => <TouchableOpacity key={item.label} accessibilityRole="button" disabled={!canOpen} onPress={() => setKind(item.kind)} style={[s.metric, { backgroundColor: item.color }]}><Text style={s.value}>{item.value}</Text><Text style={s.label}>{item.label}{canOpen ? ' ›' : ''}</Text></TouchableOpacity>)}</View>
        <View style={s.card}><View style={s.row}><Text style={s.name}>Reviewed</Text><Text style={s.count}>{reviewed} / {stats.cases}</Text></View><View style={s.track}><View style={[s.fill, { width: `${stats.cases ? reviewed / stats.cases * 100 : 0}%` }]} /></View><Text style={s.caption}>{Number(stats.cases) - reviewed} awaiting review</Text></View>
        {canOpen && <View style={s.row}><TouchableOpacity style={s.tap} onPress={() => setKind('reviewed')}><Text style={s.link}>Reviewed ({reviewed}) →</Text></TouchableOpacity><TouchableOpacity style={s.tap} onPress={() => setKind('pending')}><Text style={s.link}>Awaiting review ({Number(stats.cases) - reviewed}) →</Text></TouchableOpacity></View>}
        <Text style={s.section}>Reported conditions</Text>
        <View style={s.card}>{stats.diseases.length ? stats.diseases.map(item => <View key={item.disease} style={{paddingVertical: 7}}><View style={s.diseaseRow}><Text style={s.name}>{item.disease}</Text><Text style={s.count}>{item.count}</Text></View><View style={s.track}><View style={[s.fill, {width: `${stats.total_scans ? Number(item.count) / Number(stats.total_scans) * 100 : 0}%`}]} /></View></View>) : <Text style={s.caption}>No scans in this period.</Text>}</View>
        <View style={s.row}><Text style={s.caption}>{error ? 'Last successful update' : 'Updated'} {new Date(stats.generated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text><TouchableOpacity accessibilityRole="button" style={s.tap} onPress={() => setRevision(v => v + 1)}><Text style={s.link}>Refresh</Text></TouchableOpacity></View>
      </>}
    </ScrollView>
  </View>;
}

const s = StyleSheet.create({
  periodTitle: {fontSize: 16, fontWeight: '800', color: '#1B4A2F', marginBottom: 4},
  root: { flex: 1, backgroundColor: '#F7FAF7' }, header: { backgroundColor: '#155C38', paddingHorizontal: 22, paddingTop: 12, paddingBottom: 22, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }, tap: { paddingVertical: 13 }, back: { color: '#D6EFDD', fontWeight: '700' }, title: { color: 'white', fontSize: 26, fontWeight: '900', marginTop: 8 }, sub: { color: '#C4DFC9', marginTop: 6, fontSize: 12 }, body: { padding: 18, paddingBottom: 35, width: '100%', maxWidth: 700, alignSelf: 'center' }, filters: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' }, pill: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 24, backgroundColor: '#EAF1EC' }, selected: { backgroundColor: '#155C38' }, pillText: { color: '#31523B', fontSize: 12, fontWeight: '700' }, white: { color: 'white' }, metrics: { flexDirection: 'row', gap: 8 }, metric: { flex: 1, borderRadius: 15, padding: 13 }, value: { fontSize: 27, fontWeight: '900', color: '#155C38' }, label: { fontSize: 12, fontWeight: '700', color: '#31523B', marginTop: 7 }, card: { backgroundColor: 'white', borderWidth: 1, borderColor: '#E2EDE5', borderRadius: 16, padding: 16, marginTop: 14 }, row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }, name: { flex: 1, fontSize: 14, fontWeight: '700', color: '#31523B' }, count: { color: '#155C38', fontWeight: '800', fontSize: 15 }, track: { height: 7, borderRadius: 6, backgroundColor: '#E8F1E9', overflow: 'hidden', marginTop: 12 }, fill: { height: '100%', backgroundColor: '#26905A' }, caption: { color: '#64796A', fontSize: 12, marginTop: 7, lineHeight: 19 }, section: { color: '#1B4A2F', fontSize: 18, fontWeight: '800', marginTop: 22 }, diseaseRow: { flexDirection: 'row', gap: 12, justifyContent: 'space-between', paddingVertical: 9 }, link: { color: '#176B3A', fontWeight: '700', fontSize: 12 }, error: { color: '#B72929', lineHeight: 21 },
});
