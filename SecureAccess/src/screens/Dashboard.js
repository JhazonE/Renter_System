import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Text, Avatar, ActivityIndicator } from 'react-native-paper';
import axios from 'axios';
import { colors } from '../theme/colors';
import { usePermissions } from '../context/PermissionContext';
import Svg, {
  Rect,
  Line,
  Polyline,
  Polygon,
  Text as SvgText,
  Circle,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

import { API_BASE_URL } from '../utils/api';

const API_URL = `${API_BASE_URL}/registrations`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getLastNDays(n) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

function shortDay(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Custom Bar Chart ─────────────────────────────────────────────────────────

const BAR_COLOR = colors.primary || '#6366F1';
const LINE_COLOR = colors.emerald500 || '#10B981';

const BarChart = ({ data }) => {
  const W = 500;
  const H = 220;
  const padL = 36;
  const padR = 16;
  const padT = 16;
  const padB = 40;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  if (!data || data.length === 0) return null;

  const maxY = Math.max(...data.map(d => d.y), 1);
  const barW = Math.min(48, (chartW / data.length) * 0.55);
  const gap = chartW / data.length;

  const yTicks = [0, Math.ceil(maxY / 2), maxY];

  return (
    <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
      <Defs>
        <LinearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={BAR_COLOR} stopOpacity="0.9" />
          <Stop offset="1" stopColor={BAR_COLOR} stopOpacity="0.5" />
        </LinearGradient>
      </Defs>

      {/* Y-axis grid lines */}
      {yTicks.map((tick, i) => {
        const y = padT + chartH - (tick / maxY) * chartH;
        return (
          <React.Fragment key={i}>
            <Line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4,3" />
            <SvgText x={padL - 6} y={y + 4} fontSize="10" fill="#94A3B8" textAnchor="end">{tick}</SvgText>
          </React.Fragment>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const barH = (d.y / maxY) * chartH;
        const x = padL + i * gap + gap / 2 - barW / 2;
        const y = padT + chartH - barH;
        return (
          <React.Fragment key={i}>
            <Rect
              x={x} y={y}
              width={barW} height={Math.max(barH, 2)}
              fill="url(#barGrad)"
              rx="4" ry="4"
            />
            {/* Value label on top of bar */}
            {d.y > 0 && (
              <SvgText x={x + barW / 2} y={y - 4} fontSize="10" fill={BAR_COLOR} textAnchor="middle" fontWeight="bold">
                {d.y}
              </SvgText>
            )}
            {/* X-axis label */}
            <SvgText
              x={x + barW / 2} y={padT + chartH + 16}
              fontSize="10" fill="#94A3B8" textAnchor="middle"
            >
              {d.x}
            </SvgText>
          </React.Fragment>
        );
      })}

      {/* X axis */}
      <Line x1={padL} y1={padT + chartH} x2={W - padR} y2={padT + chartH} stroke="#E2E8F0" strokeWidth="1" />
    </Svg>
  );
};

// ─── Custom Line/Area Chart ───────────────────────────────────────────────────

const LineChart = ({ data, labels }) => {
  const W = 500;
  const H = 220;
  const padL = 36;
  const padR = 16;
  const padT = 16;
  const padB = 40;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  if (!data || data.length === 0) return null;

  const maxY = Math.max(...data, 1);
  const yTicks = [0, Math.ceil(maxY / 2), maxY];
  const n = data.length;

  const pts = data.map((v, i) => ({
    x: padL + (i / (n - 1)) * chartW,
    y: padT + chartH - (v / maxY) * chartH,
  }));

  const polyPoints = pts.map(p => `${p.x},${p.y}`).join(' ');
  const areaPoints = [
    `${pts[0].x},${padT + chartH}`,
    ...pts.map(p => `${p.x},${p.y}`),
    `${pts[pts.length - 1].x},${padT + chartH}`,
  ].join(' ');

  return (
    <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
      <Defs>
        <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={LINE_COLOR} stopOpacity="0.25" />
          <Stop offset="1" stopColor={LINE_COLOR} stopOpacity="0.02" />
        </LinearGradient>
      </Defs>

      {/* Y grid */}
      {yTicks.map((tick, i) => {
        const y = padT + chartH - (tick / maxY) * chartH;
        return (
          <React.Fragment key={i}>
            <Line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4,3" />
            <SvgText x={padL - 6} y={y + 4} fontSize="10" fill="#94A3B8" textAnchor="end">{tick}</SvgText>
          </React.Fragment>
        );
      })}

      {/* Area fill */}
      <Polygon points={areaPoints} fill="url(#areaGrad)" />

      {/* Line */}
      <Polyline points={polyPoints} fill="none" stroke={LINE_COLOR} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

      {/* Data points + x-labels */}
      {pts.map((p, i) => (
        <React.Fragment key={i}>
          <Circle cx={p.x} cy={p.y} r="4" fill="white" stroke={LINE_COLOR} strokeWidth="2" />
          {data[i] > 0 && (
            <SvgText x={p.x} y={p.y - 10} fontSize="10" fill={LINE_COLOR} textAnchor="middle" fontWeight="bold">
              {data[i]}
            </SvgText>
          )}
          <SvgText
            x={p.x} y={padT + chartH + 16}
            fontSize="9" fill="#94A3B8" textAnchor="middle"
          >
            {labels[i]}
          </SvgText>
        </React.Fragment>
      ))}

      {/* X axis */}
      <Line x1={padL} y1={padT + chartH} x2={W - padR} y2={padT + chartH} stroke="#E2E8F0" strokeWidth="1" />
    </Svg>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({ title, value, subtext, icon, color, loading }) => (
  <Card style={styles.statCard}>
    <Card.Content>
      <View style={styles.statHeader}>
        <Text variant="labelLarge" style={{ color: colors.slate500 }}>{title}</Text>
        <Avatar.Icon
          size={40}
          icon={icon}
          style={{ backgroundColor: `${color}20` }}
          color={color}
        />
      </View>
      <View style={styles.statValueContainer}>
        {loading ? (
          <ActivityIndicator size="small" color={color} style={{ marginVertical: 6 }} />
        ) : (
          <Text variant="headlineLarge" style={styles.statValue}>{value}</Text>
        )}
      </View>
      <Text variant="bodySmall" style={{ color: colors.slate400, marginTop: 8 }}>{subtext}</Text>
    </Card.Content>
  </Card>
);

// ─── Chart Card ───────────────────────────────────────────────────────────────

const ChartCard = ({ title, subtitle, children, loading, empty }) => (
  <Card style={styles.chartCard}>
    <Card.Content>
      <View style={styles.chartCardHeader}>
        <View>
          <Text variant="titleMedium" style={{ fontWeight: '700', color: colors.slate800 || '#1E293B' }}>{title}</Text>
          <Text variant="bodySmall" style={{ color: colors.slate400, marginTop: 2 }}>{subtitle}</Text>
        </View>
      </View>
      {loading ? (
        <View style={styles.centeredBox}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : empty ? (
        <View style={styles.centeredBox}>
          <Text variant="bodySmall" style={{ color: colors.slate400, textAlign: 'center' }}>
            No data to display yet.
          </Text>
        </View>
      ) : children}
    </Card.Content>
  </Card>
);

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const Dashboard = () => {
  const { userRole, isAuthenticated } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, userRole]);

  const fetchData = async () => {
    try {
      console.log('Dashboard: Fetching data from', API_URL, 'as', userRole);
      setLoading(true);
      const res = await axios.get(API_URL, {
        headers: {
          'x-user-role': userRole,
        }
      });
      console.log('Dashboard: Data received, count:', res.data.length);
      setRegistrations(res.data);
    } catch (e) {
      console.error('Dashboard: fetch error', e.message);
    } finally {
      setLoading(false);
    }
  };

  // Stat values
  const totalRenters = registrations.length;
  const bioEnrolled = registrations.filter(r => r.hasFingerprint || r.has_fingerprint).length;

  // Bar chart: renters per floor
  const floorData = useMemo(() => {
    const counts = {};
    registrations.forEach(r => {
      const f = r.floorNo || r.floor_no;
      if (f) {
        const key = `Floor ${f}`;
        counts[key] = (counts[key] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .sort((a, b) => {
        const na = parseInt(a[0].replace('Floor ', ''), 10);
        const nb = parseInt(b[0].replace('Floor ', ''), 10);
        return na - nb;
      })
      .map(([x, y]) => ({ x, y }));
  }, [registrations]);

  // Line chart: last 7 days
  const last7Days = useMemo(() => getLastNDays(7), []);
  const trendValues = useMemo(() => {
    const counts = {};
    last7Days.forEach(d => { counts[d] = 0; });
    registrations.forEach(r => {
      const dateStr = r.date ? String(r.date).split('T')[0] : null;
      if (dateStr && dateStr in counts) counts[dateStr]++;
    });
    return last7Days.map(d => counts[d]);
  }, [registrations, last7Days]);
  const trendLabels = useMemo(() => last7Days.map(shortDay), [last7Days]);
  const hasTrend = trendValues.some(v => v > 0);

  const primary = colors.primary || '#6366F1';
  const emerald = colors.emerald500 || '#10B981';
  const amber = colors.amber500 || '#F59E0B';

  return (
    <View style={styles.container}>
      <View style={styles.content}>

        {/* Stat Cards */}
        <View style={styles.statsGrid}>
          <StatCard title="Active Renters" value={totalRenters.toLocaleString()} subtext="Total renters currently registered" icon="account-group" color={primary} loading={loading} />
          <StatCard title="Biometric Enrolled" value={bioEnrolled.toLocaleString()} subtext="Renters with fingerprint on file" icon="fingerprint" color={emerald} loading={loading} />
          <StatCard title="Security Alerts" value="0" subtext="No active alerts" icon="alert-decagram" color={amber} loading={false} />
        </View>

        {/* Charts */}
        <View style={styles.chartsRow}>
          <ChartCard
            title="Renters by Floor"
            subtitle="Registered renters grouped by floor"
            loading={loading}
            empty={floorData.length === 0}
          >
            <BarChart data={floorData} />
          </ChartCard>

          <ChartCard
            title="Registration Trend"
            subtitle="New registrations over the last 7 days"
            loading={loading}
            empty={!hasTrend}
          >
            <LineChart data={trendValues} labels={trendLabels} />
          </ChartCard>
        </View>

      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, maxWidth: 1200, alignSelf: 'center', width: '100%' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', margin: -8, marginBottom: 16 },
  statCard: { flex: 1, minWidth: 240, margin: 8, backgroundColor: 'white', borderRadius: 16 },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statValueContainer: { flexDirection: 'row', alignItems: 'baseline', gap: 8, minHeight: 48 },
  statValue: { fontWeight: '900', color: '#0F172A' },
  chartsRow: { flexDirection: 'row', flexWrap: 'wrap', margin: -8 },
  chartCard: { flex: 1, minWidth: 300, margin: 8, backgroundColor: 'white', borderRadius: 16 },
  chartCardHeader: { marginBottom: 12 },
  centeredBox: { height: 200, justifyContent: 'center', alignItems: 'center' },
});
