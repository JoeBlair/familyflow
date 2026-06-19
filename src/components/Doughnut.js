import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { domainColors, domainLabels, colors, fonts, DOMAINS } from '../theme/colors';

const SIZE = 150;
const STROKE = 26;
const R = (SIZE - STROKE) / 2;
const CX = SIZE / 2;
const CY = SIZE / 2;

// Build an SVG arc path for a slice between two angles (degrees, 0 = top, clockwise)
function arcPath(startAngle, endAngle) {
  const toXY = (angle) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return [CX + R * Math.cos(rad), CY + R * Math.sin(rad)];
  };
  const [x1, y1] = toXY(startAngle);
  const [x2, y2] = toXY(endAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`;
}

// counts: { household, baby, admin, social }
export default function Doughnut({ counts }) {
  const total = DOMAINS.reduce((s, d) => s + (counts[d] || 0), 0);

  let angle = 0;
  const slices = [];
  if (total > 0) {
    DOMAINS.forEach((d) => {
      const v = counts[d] || 0;
      if (v === 0) return;
      const sweep = (v / total) * 360;
      // Avoid full 360 (renders nothing) when a single domain owns everything
      const end = Math.min(angle + sweep, 359.999);
      slices.push({ d, start: angle, end });
      angle += sweep;
    });
  }

  return (
    <View style={styles.wrap}>
      <Svg width={SIZE} height={SIZE}>
        {/* Track */}
        <Circle cx={CX} cy={CY} r={R} stroke={colors.line} strokeWidth={STROKE} fill="none" />
        <G>
          {slices.map((s) => (
            <Path
              key={s.d}
              d={arcPath(s.start, s.end)}
              stroke={domainColors[s.d]}
              strokeWidth={STROKE}
              strokeLinecap="butt"
              fill="none"
            />
          ))}
        </G>
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text style={styles.total}>{total}</Text>
        <Text style={styles.totalLabel}>chores</Text>
      </View>
    </View>
  );
}

export function DoughnutLegend({ counts }) {
  return (
    <View style={styles.legend}>
      {DOMAINS.map((d) => (
        <View key={d} style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: domainColors[d] }]} />
          <Text style={styles.legendText}>
            {domainLabels[d]} <Text style={styles.legendCount}>{counts[d] || 0}</Text>
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  center: { position: 'absolute', alignItems: 'center' },
  total: { fontFamily: fonts.serif, fontSize: 36, color: colors.ink },
  totalLabel: { fontSize: 9, color: colors.muted, marginTop: 0, letterSpacing: 1.5, textTransform: 'uppercase' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  legendText: { fontSize: 10, color: colors.charcoal, letterSpacing: 0.8, textTransform: 'uppercase', fontWeight: '600' },
  legendCount: { fontWeight: '800', color: colors.ink },
});
