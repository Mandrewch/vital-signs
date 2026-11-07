import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  Thermometer, 
  Heart, 
  Activity, 
  Calendar, 
  CheckCircle2, 
  Save, 
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { VitalFormData, VitalRecord } from '../../types/vital';
import { calculateBpCategory } from '../../utils/bpCategories';
import { BpCategoryBadge } from './BpCategoryBadge';
import { YesterdayCard } from './YesterdayCard';
import { saveVitalRecord, getYesterdayOrPreviousRecord } from '../../services/vitalService';

interface DailyEntryFormProps {
  userId: string;
  allRecords: VitalRecord[];
  onSaved?: () => void;
}

export const DailyEntryForm: React.FC<DailyEntryFormProps> = ({ userId, allRecords, onSaved }) => {
  const getTodayDateStr = () => new Date().toISOString().split('T')[0];
  const getCurrentTimeStr = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const [date, setDate] = useState<string>(getTodayDateStr());
  const [time, setTime] = useState<string>(getCurrentTimeStr());
  const [weightKg, setWeightKg] = useState<string>('');
  const [temperatureC, setTemperatureC] = useState<string>('');
  const [bpSystolic, setBpSystolic] = useState<string>('');
  const [bpDiastolic, setBpDiastolic] = useState<string>('');
  const [spo2Percent, setSpo2Percent] = useState<string>('');
  const [pulseBpm, setPulseBpm] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check if an entry already exists for this exact date to allow seamless updating
  const existingRecordForDate = allRecords.find(r => r.date === date);
  const previousRecord = getYesterdayOrPreviousRecord(allRecords, date);

  // When date changes, if there's already an existing record for that date, populate it
  useEffect(() => {
    if (existingRecordForDate) {
      setWeightKg(existingRecordForDate.weightKg?.toString() ?? '');
      setTemperatureC(existingRecordForDate.temperatureC?.toString() ?? '');
      setBpSystolic(existingRecordForDate.bpSystolic?.toString() ?? '');
      setBpDiastolic(existingRecordForDate.bpDiastolic?.toString() ?? '');
      setSpo2Percent(existingRecordForDate.spo2Percent?.toString() ?? '');
      setPulseBpm(existingRecordForDate.pulseBpm?.toString() ?? '');
      setNotes(existingRecordForDate.notes ?? '');
      setTime(existingRecordForDate.time ?? getCurrentTimeStr());
    } else {
      // If no record for today, prefill weight with yesterday's weight as a baseline convenience
      if (previousRecord?.weightKg && !weightKg) {
        setWeightKg(previousRecord.weightKg.toString());
      }
    }
  }, [date]);

  // Real-time calculated BP Category
  const liveBpCategory = calculateBpCategory(
    bpSystolic ? parseFloat(bpSystolic) : undefined,
    bpDiastolic ? parseFloat(bpDiastolic) : undefined
  );

  const handleAdjustWeight = (delta: number) => {
    const current = parseFloat(weightKg) || (previousRecord?.weightKg ?? 70.0);
    const updated = Math.round((current + delta) * 10) / 10;
    setWeightKg(updated.toFixed(1));
  };

  const handleAdjustTemp = (delta: number) => {
    const current = parseFloat(temperatureC) || 36.6;
    const updated = Math.round((current + delta) * 10) / 10;
    setTemperatureC(updated.toFixed(1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const formData: VitalFormData = {
        date,
        time,
        recordedAt: `${date}T${time}:00Z`,
        weightKg: weightKg ? parseFloat(weightKg) : undefined,
        temperatureC: temperatureC ? parseFloat(temperatureC) : undefined,
        bpSystolic: bpSystolic ? parseInt(bpSystolic, 10) : undefined,
        bpDiastolic: bpDiastolic ? parseInt(bpDiastolic, 10) : undefined,
        spo2Percent: spo2Percent ? parseInt(spo2Percent, 10) : undefined,
        pulseBpm: pulseBpm ? parseInt(pulseBpm, 10) : undefined,
        notes: notes.trim() || undefined
      };

      await saveVitalRecord(userId, formData, existingRecordForDate?.id);

      // Trigger subtle device haptic feedback if supported on phone
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(50);
      }

      setSuccessMessage(
        existingRecordForDate
          ? 'Morning vitals updated successfully!'
          : 'Morning vitals saved to Firebase!'
      );

      if (onSaved) onSaved();

      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } catch (err: any) {
      console.error('Failed to save vitals:', err);
      setErrorMessage(err.message || 'Failed to save record. Please check connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetToToday = () => {
    setDate(getTodayDateStr());
    setTime(getCurrentTimeStr());
  };

  return (
    <div className="max-w-md mx-auto px-4 pb-28 pt-2">
      {/* Yesterday Context Card */}
      <YesterdayCard previousRecord={previousRecord} />

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date & Time Selector */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              Recording Time
            </span>
            {date !== getTodayDateStr() && (
              <button
                type="button"
                onClick={resetToToday}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-3 h-3" /> Jump to Today
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Time</label>
              <div className="relative">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {existingRecordForDate && (
            <div className="mt-2 text-[11px] text-amber-400/90 flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              Editing existing entry recorded for {date}
            </div>
          )}
        </div>

        {/* Weight Section */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-blue-400" />
              Morning Weight
            </label>
            <span className="text-xs font-semibold text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded-full border border-slate-700/60">
              kg
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
              <input
                type="number"
                step="0.1"
                min="30"
                max="300"
                placeholder="e.g. 78.4"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-2xl font-bold text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                kg
              </span>
            </div>
          </div>

          {/* Quick Adjustment Steppers */}
          <div className="flex items-center gap-2 mt-2.5">
            <button
              type="button"
              onClick={() => handleAdjustWeight(-0.5)}
              className="flex-1 bg-slate-900/80 hover:bg-slate-700 border border-slate-700 text-slate-300 active:scale-95 py-1.5 rounded-lg text-xs font-medium transition-all"
            >
              -0.5
            </button>
            <button
              type="button"
              onClick={() => handleAdjustWeight(-0.1)}
              className="flex-1 bg-slate-900/80 hover:bg-slate-700 border border-slate-700 text-slate-300 active:scale-95 py-1.5 rounded-lg text-xs font-medium transition-all"
            >
              -0.1
            </button>
            <button
              type="button"
              onClick={() => handleAdjustWeight(+0.1)}
              className="flex-1 bg-slate-900/80 hover:bg-slate-700 border border-slate-700 text-slate-300 active:scale-95 py-1.5 rounded-lg text-xs font-medium transition-all"
            >
              +0.1
            </button>
            <button
              type="button"
              onClick={() => handleAdjustWeight(+0.5)}
              className="flex-1 bg-slate-900/80 hover:bg-slate-700 border border-slate-700 text-slate-300 active:scale-95 py-1.5 rounded-lg text-xs font-medium transition-all"
            >
              +0.5
            </button>
          </div>
        </div>

        {/* Blood Pressure Section */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-400" />
              Blood Pressure
            </label>
            <span className="text-xs font-semibold text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded-full border border-slate-700/60">
              mmHg
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Systolic (Upper)
              </label>
              <input
                type="number"
                step="1"
                min="50"
                max="250"
                placeholder="120"
                value={bpSystolic}
                onChange={(e) => setBpSystolic(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xl font-bold text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Diastolic (Lower)
              </label>
              <input
                type="number"
                step="1"
                min="30"
                max="160"
                placeholder="80"
                value={bpDiastolic}
                onChange={(e) => setBpDiastolic(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xl font-bold text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
          </div>

          {/* Dynamic Real-time AHA Classification Badge */}
          {liveBpCategory && (
            <div className="mt-3 pt-2.5 border-t border-slate-700/40 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">AHA Category:</span>
              <BpCategoryBadge category={liveBpCategory} showDescription={true} />
            </div>
          )}
        </div>

        {/* Pulse Oximeter Section (SpO2 & Pulse) */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-400" />
              Pulse Oximeter
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] text-slate-400">SpO2 Oxygen</label>
                <span className="text-[10px] text-cyan-400 font-semibold">%</span>
              </div>
              <input
                type="number"
                step="1"
                min="70"
                max="100"
                placeholder="98"
                value={spo2Percent}
                onChange={(e) => setSpo2Percent(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xl font-bold text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] text-slate-400">Heart Pulse</label>
                <span className="text-[10px] text-indigo-400 font-semibold">bpm</span>
              </div>
              <input
                type="number"
                step="1"
                min="35"
                max="220"
                placeholder="68"
                value={pulseBpm}
                onChange={(e) => setPulseBpm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xl font-bold text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Body Temperature Section */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-amber-400" />
              Body Temperature
            </label>
            <span className="text-xs font-semibold text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded-full border border-slate-700/60">
              °C
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
              <input
                type="number"
                step="0.1"
                min="32"
                max="43"
                placeholder="36.6"
                value={temperatureC}
                onChange={(e) => setTemperatureC(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xl font-bold text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                °C
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <button
              type="button"
              onClick={() => handleAdjustTemp(-0.1)}
              className="flex-1 bg-slate-900/80 hover:bg-slate-700 border border-slate-700 text-slate-300 active:scale-95 py-1 rounded-lg text-xs font-medium transition-all"
            >
              -0.1 °C
            </button>
            <button
              type="button"
              onClick={() => setTemperatureC('36.6')}
              className="flex-1 bg-slate-900/80 hover:bg-slate-700 border border-slate-700 text-slate-400 active:scale-95 py-1 rounded-lg text-xs font-medium transition-all"
            >
              36.6 (Std)
            </button>
            <button
              type="button"
              onClick={() => handleAdjustTemp(+0.1)}
              className="flex-1 bg-slate-900/80 hover:bg-slate-700 border border-slate-700 text-slate-300 active:scale-95 py-1 rounded-lg text-xs font-medium transition-all"
            >
              +0.1 °C
            </button>
          </div>
        </div>

        {/* Notes / Context */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-sm backdrop-blur-sm">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Morning Notes (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Meds taken, slept 7.5 hours, felt energetic..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
          />
        </div>

        {/* Feedback Alerts */}
        {successMessage && (
          <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-2xl text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 px-4 py-3 rounded-2xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Large Primary Save Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-[0.98] text-white py-3.5 px-6 rounded-2xl font-bold text-base shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>{existingRecordForDate ? 'Update Morning Vitals' : 'Save Morning Vitals'}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
