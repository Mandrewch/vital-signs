import React, { useState, useMemo } from 'react';
import { VitalRecord } from '../../types/vital';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceLine,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  Scale, 
  Heart, 
  Activity, 
  Thermometer
} from 'lucide-react';
import { BpCategoryBadge } from '../vitals/BpCategoryBadge';

interface TrendsDashboardProps {
  records: VitalRecord[];
}

type TimeRange = '7d' | '30d' | '90d' | 'all';

export const TrendsDashboard: React.FC<TrendsDashboardProps> = ({ records }) => {
  const [range, setRange] = useState<TimeRange>('30d');

  // Filter records based on selected range and sort chronologically (oldest to newest for charts)
  const filteredData = useMemo(() => {
    if (!records || records.length === 0) return [];
    
    // Records are stored newest first; reverse for charts
    const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
    
    if (range === 'all') return sorted;
    
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    return sorted.filter(r => r.date >= cutoffStr);
  }, [records, range]);

  // Key performance indicators (KPIs)
  const stats = useMemo(() => {
    if (records.length === 0) return null;

    const latest = records[0];
    const prev = records.length > 1 ? records[1] : null;

    // Weight stats
    const weightRecords = records.filter(r => r.weightKg !== undefined);
    const avgWeight = weightRecords.length > 0
      ? (weightRecords.reduce((acc, r) => acc + (r.weightKg || 0), 0) / weightRecords.length).toFixed(1)
      : null;
    
    const weightDiff = (latest.weightKg !== undefined && prev?.weightKg !== undefined)
      ? (latest.weightKg - prev.weightKg).toFixed(1)
      : null;

    // BP stats
    const bpRecords = records.filter(r => r.bpSystolic !== undefined && r.bpDiastolic !== undefined);
    const avgSys = bpRecords.length > 0
      ? Math.round(bpRecords.reduce((acc, r) => acc + (r.bpSystolic || 0), 0) / bpRecords.length)
      : null;
    const avgDia = bpRecords.length > 0
      ? Math.round(bpRecords.reduce((acc, r) => acc + (r.bpDiastolic || 0), 0) / bpRecords.length)
      : null;

    // SpO2 stats
    const spo2Records = records.filter(r => r.spo2Percent !== undefined);
    const avgSpo2 = spo2Records.length > 0
      ? Math.round(spo2Records.reduce((acc, r) => acc + (r.spo2Percent || 0), 0) / spo2Records.length)
      : null;

    // Pulse stats
    const pulseRecords = records.filter(r => r.pulseBpm !== undefined);
    const avgPulse = pulseRecords.length > 0
      ? Math.round(pulseRecords.reduce((acc, r) => acc + (r.pulseBpm || 0), 0) / pulseRecords.length)
      : null;

    return {
      latest,
      avgWeight,
      weightDiff,
      avgSys,
      avgDia,
      avgSpo2,
      avgPulse,
      totalEntries: records.length
    };
  }, [records]);

  // Chart data formatters
  const chartData = useMemo(() => {
    return filteredData.map(r => ({
      date: r.date.slice(5), // "MM-DD"
      fullDate: r.date,
      weight: r.weightKg,
      systolic: r.bpSystolic,
      diastolic: r.bpDiastolic,
      spo2: r.spo2Percent,
      pulse: r.pulseBpm,
      temp: r.temperatureC
    }));
  }, [filteredData]);

  if (records.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center text-slate-400">
        <TrendingUp className="w-12 h-12 mx-auto mb-3 text-slate-600 opacity-60" />
        <h3 className="text-base font-semibold text-slate-200">No Vitals Recorded Yet</h3>
        <p className="text-xs text-slate-400 mt-1">
          Log your first morning entry or import your Google Sheet CSV to visualize trends!
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 pb-28 pt-2 space-y-4">
      {/* Time Range Filter Bar */}
      <div className="flex items-center justify-between bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/80">
        {(['7d', '30d', '90d', 'all'] as TimeRange[]).map((t) => (
          <button
            key={t}
            onClick={() => setRange(t)}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              range === t
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t === '7d' ? '7 Days' : t === '30d' ? '30 Days' : t === '90d' ? '90 Days' : 'All Time'}
          </button>
        ))}
      </div>

      {/* KPI Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 gap-2.5">
          {/* Weight Card */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-medium">
                <Scale className="w-3.5 h-3.5 text-blue-400" /> Weight
              </span>
              {stats.weightDiff && (
                <span className={`text-[10px] font-bold ${
                  Number(stats.weightDiff) > 0 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {Number(stats.weightDiff) > 0 ? `+${stats.weightDiff}` : stats.weightDiff} kg
                </span>
              )}
            </div>
            <div className="text-xl font-bold text-slate-100">
              {stats.latest.weightKg ?? '--'} <span className="text-xs font-normal text-slate-400">kg</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Avg: {stats.avgWeight ?? '--'} kg
            </div>
          </div>

          {/* Blood Pressure Card */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-medium">
                <Heart className="w-3.5 h-3.5 text-rose-400" /> Blood Pressure
              </span>
            </div>
            <div className="text-xl font-bold text-slate-100 truncate">
              {stats.latest.bpSystolic ?? '--'} / {stats.latest.bpDiastolic ?? '--'}
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">
                Avg: {stats.avgSys ?? '--'}/{stats.avgDia ?? '--'}
              </span>
              <BpCategoryBadge category={stats.latest.bpCategory} />
            </div>
          </div>

          {/* SpO2 Card */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-medium">
                <Activity className="w-3.5 h-3.5 text-cyan-400" /> SpO2 Oximeter
              </span>
            </div>
            <div className="text-xl font-bold text-slate-100">
              {stats.latest.spo2Percent !== undefined ? `${stats.latest.spo2Percent}%` : '--'}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Avg: {stats.avgSpo2 !== null ? `${stats.avgSpo2}%` : '--'}
            </div>
          </div>

          {/* Pulse Card */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-medium">
                <Heart className="w-3.5 h-3.5 text-indigo-400" /> Pulse Rate
              </span>
            </div>
            <div className="text-xl font-bold text-slate-100">
              {stats.latest.pulseBpm !== undefined ? `${stats.latest.pulseBpm}` : '--'}{' '}
              <span className="text-xs font-normal text-slate-400">bpm</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Avg: {stats.avgPulse !== null ? `${stats.avgPulse} bpm` : '--'}
            </div>
          </div>
        </div>
      )}

      {/* 1. Blood Pressure Trend Chart */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-sm backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Heart className="w-4 h-4 text-rose-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Blood Pressure (mmHg)
            </h3>
          </div>
          <div className="flex items-center space-x-3 text-[10px]">
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-400" /> Sys
            </span>
            <span className="flex items-center gap-1 text-teal-400">
              <span className="w-2 h-2 rounded-full bg-teal-400" /> Dia
            </span>
          </div>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.6} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} domain={['dataMin - 10', 'dataMax + 10']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px' }}
                labelFormatter={(label, items) => items[0]?.payload?.fullDate || label}
              />
              {/* Normal BP Reference Lines (120 / 80) */}
              <ReferenceLine y={120} stroke="#f43f5e" strokeDasharray="3 3" opacity={0.4} />
              <ReferenceLine y={80} stroke="#14b8a6" strokeDasharray="3 3" opacity={0.4} />
              <Line 
                type="monotone" 
                dataKey="systolic" 
                stroke="#fb7185" 
                strokeWidth={2.5} 
                dot={{ r: 2.5, fill: '#fb7185' }} 
                activeDot={{ r: 5 }}
                connectNulls
              />
              <Line 
                type="monotone" 
                dataKey="diastolic" 
                stroke="#2dd4bf" 
                strokeWidth={2.5} 
                dot={{ r: 2.5, fill: '#2dd4bf' }} 
                activeDot={{ r: 5 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Weight Trend Chart */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-sm backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Scale className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Weight Progression (kg)
            </h3>
          </div>
          {stats?.avgWeight && (
            <span className="text-[11px] text-blue-400 font-medium">
              Avg: {stats.avgWeight} kg
            </span>
          )}
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.6} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px' }}
                labelFormatter={(label, items) => items[0]?.payload?.fullDate || label}
              />
              <Area 
                type="monotone" 
                dataKey="weight" 
                stroke="#60a5fa" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#weightGrad)" 
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Pulse Oximeter & Heart Rate Chart */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-sm backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              SpO2 (%) & Pulse Rate (bpm)
            </h3>
          </div>
          <div className="flex items-center space-x-3 text-[10px]">
            <span className="flex items-center gap-1 text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400" /> SpO2
            </span>
            <span className="flex items-center gap-1 text-indigo-400">
              <span className="w-2 h-2 rounded-full bg-indigo-400" /> Pulse
            </span>
          </div>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.6} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} domain={['dataMin - 5', 'dataMax + 5']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px' }}
                labelFormatter={(label, items) => items[0]?.payload?.fullDate || label}
              />
              <Line 
                type="monotone" 
                dataKey="spo2" 
                stroke="#22d3ee" 
                strokeWidth={2} 
                dot={{ r: 2, fill: '#22d3ee' }} 
                connectNulls
              />
              <Line 
                type="monotone" 
                dataKey="pulse" 
                stroke="#818cf8" 
                strokeWidth={2} 
                dot={{ r: 2, fill: '#818cf8' }} 
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Temperature Trend Chart */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-sm backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Thermometer className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Temperature (°C)
            </h3>
          </div>
        </div>

        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.6} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} domain={[35.5, 38.5]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px' }}
                labelFormatter={(label, items) => items[0]?.payload?.fullDate || label}
              />
              <ReferenceLine y={37.0} stroke="#f59e0b" strokeDasharray="3 3" opacity={0.5} label={{ value: '37.0°C', fill: '#f59e0b', fontSize: 10 }} />
              <Line 
                type="monotone" 
                dataKey="temp" 
                stroke="#fbbf24" 
                strokeWidth={2} 
                dot={{ r: 2, fill: '#fbbf24' }} 
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
