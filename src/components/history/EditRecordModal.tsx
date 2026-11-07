import React, { useState } from 'react';
import { VitalRecord, VitalFormData } from '../../types/vital';
import { calculateBpCategory } from '../../utils/bpCategories';
import { BpCategoryBadge } from '../vitals/BpCategoryBadge';
import { X, Save, Scale, Thermometer, Heart, Activity } from 'lucide-react';
import { saveVitalRecord } from '../../services/vitalService';

interface EditRecordModalProps {
  userId: string;
  record: VitalRecord;
  onClose: () => void;
  onSaved: () => void;
}

export const EditRecordModal: React.FC<EditRecordModalProps> = ({ userId, record, onClose, onSaved }) => {
  const [date, setDate] = useState(record.date);
  const [time, setTime] = useState(record.time || '07:00');
  const [weightKg, setWeightKg] = useState(record.weightKg?.toString() ?? '');
  const [temperatureC, setTemperatureC] = useState(record.temperatureC?.toString() ?? '');
  const [bpSystolic, setBpSystolic] = useState(record.bpSystolic?.toString() ?? '');
  const [bpDiastolic, setBpDiastolic] = useState(record.bpDiastolic?.toString() ?? '');
  const [spo2Percent, setSpo2Percent] = useState(record.spo2Percent?.toString() ?? '');
  const [pulseBpm, setPulseBpm] = useState(record.pulseBpm?.toString() ?? '');
  const [notes, setNotes] = useState(record.notes ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const liveBpCategory = calculateBpCategory(
    bpSystolic ? parseFloat(bpSystolic) : undefined,
    bpDiastolic ? parseFloat(bpDiastolic) : undefined
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
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

      await saveVitalRecord(userId, formData, record.id);
      onSaved();
      onClose();
    } catch (err) {
      console.error("Failed to update record:", err);
      alert("Failed to update record.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <h2 className="text-base font-bold text-slate-100">Edit Record ({record.date})</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-slate-400 block mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Time</label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 flex items-center gap-1 mb-1">
              <Scale className="w-3.5 h-3.5 text-blue-400" /> Weight (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={weightKg}
              onChange={e => setWeightKg(e.target.value)}
              placeholder="78.4"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-semibold"
            />
          </div>

          <div>
            <label className="text-slate-400 flex items-center gap-1 mb-1">
              <Heart className="w-3.5 h-3.5 text-rose-400" /> Blood Pressure (mmHg)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={bpSystolic}
                onChange={e => setBpSystolic(e.target.value)}
                placeholder="Systolic (120)"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-semibold"
              />
              <input
                type="number"
                value={bpDiastolic}
                onChange={e => setBpDiastolic(e.target.value)}
                placeholder="Diastolic (80)"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-semibold"
              />
            </div>
            {liveBpCategory && (
              <div className="mt-1.5 flex justify-end">
                <BpCategoryBadge category={liveBpCategory} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-slate-400 flex items-center gap-1 mb-1">
                <Activity className="w-3.5 h-3.5 text-cyan-400" /> SpO2 (%)
              </label>
              <input
                type="number"
                value={spo2Percent}
                onChange={e => setSpo2Percent(e.target.value)}
                placeholder="98"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-semibold"
              />
            </div>
            <div>
              <label className="text-slate-400 flex items-center gap-1 mb-1">
                <Heart className="w-3.5 h-3.5 text-indigo-400" /> Pulse (bpm)
              </label>
              <input
                type="number"
                value={pulseBpm}
                onChange={e => setPulseBpm(e.target.value)}
                placeholder="68"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 flex items-center gap-1 mb-1">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" /> Temp (°C)
            </label>
            <input
              type="number"
              step="0.1"
              value={temperatureC}
              onChange={e => setTemperatureC(e.target.value)}
              placeholder="36.6"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-semibold"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-semibold hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-emerald-900/30"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Update'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
