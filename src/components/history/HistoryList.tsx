import React, { useState, useMemo } from 'react';
import { VitalRecord } from '../../types/vital';
import { 
  Search, 
  Trash2, 
  Edit3, 
  Calendar, 
  Scale, 
  Thermometer, 
  Heart, 
  Activity,
  FileSpreadsheet
} from 'lucide-react';
import { BpCategoryBadge } from '../vitals/BpCategoryBadge';
import { EditRecordModal } from './EditRecordModal';
import { deleteVitalRecord, downloadVitalsCsv } from '../../services/vitalService';

interface HistoryListProps {
  userId: string;
  records: VitalRecord[];
}

export const HistoryList: React.FC<HistoryListProps> = ({ userId, records }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingRecord, setEditingRecord] = useState<VitalRecord | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  // Extract unique months from records (e.g. "2026-11", "2026-10")
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => {
      if (r.date && r.date.length >= 7) {
        set.add(r.date.slice(0, 7));
      }
    });
    return Array.from(set).sort().reverse();
  }, [records]);

  // Filtered list
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchesSearch = 
        !searchTerm ||
        r.date.includes(searchTerm) ||
        (r.notes && r.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesMonth = 
        selectedMonth === 'all' || 
        r.date.startsWith(selectedMonth);

      return matchesSearch && matchesMonth;
    });
  }, [records, searchTerm, selectedMonth]);

  const handleDelete = async (recordId: string, date: string) => {
    if (window.confirm(`Are you sure you want to delete the entry for ${date}?`)) {
      try {
        await deleteVitalRecord(userId, recordId);
      } catch (err) {
        console.error("Delete failed:", err);
        alert("Failed to delete record.");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 pb-28 pt-2 space-y-3">
      {/* Top action bar: Search, Filter, and Export */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search date or note..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* CSV Export Button */}
        <button
          onClick={() => downloadVitalsCsv(records)}
          title="Export All to CSV for Doctor"
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 text-emerald-400 px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>

      {/* Month Filter Selector */}
      {availableMonths.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedMonth('all')}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors ${
              selectedMonth === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Months ({records.length})
          </button>
          {availableMonths.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMonth(m)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors ${
                selectedMonth === m
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      )}

      {/* Records Count */}
      <div className="text-[11px] text-slate-400 flex items-center justify-between px-1">
        <span>Showing {filteredRecords.length} of {records.length} records</span>
      </div>

      {/* Records List */}
      {filteredRecords.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-600 opacity-50" />
          <p className="text-xs">No records found matching your search.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredRecords.map((record) => (
            <div
              key={record.id}
              className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 shadow-sm backdrop-blur-sm transition-all hover:border-slate-600"
            >
              {/* Header: Date, Time & Actions */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700/50">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-100 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    {record.date}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {record.time || 'Morning'}
                  </span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setEditingRecord(record)}
                    className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-700/60 rounded-lg transition-colors"
                    title="Edit record"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(record.id, record.date)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 rounded-lg transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Vitals Summary Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Weight */}
                {record.weightKg !== undefined && (
                  <div className="flex items-center space-x-2 bg-slate-900/60 px-2.5 py-1.5 rounded-xl">
                    <Scale className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block">Weight</span>
                      <span className="font-bold text-slate-100">{record.weightKg} kg</span>
                    </div>
                  </div>
                )}

                {/* Temp */}
                {record.temperatureC !== undefined && (
                  <div className="flex items-center space-x-2 bg-slate-900/60 px-2.5 py-1.5 rounded-xl">
                    <Thermometer className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block">Temp</span>
                      <span className="font-bold text-slate-100">{record.temperatureC} °C</span>
                    </div>
                  </div>
                )}

                {/* Blood Pressure */}
                {(record.bpSystolic !== undefined || record.bpDiastolic !== undefined) && (
                  <div className="col-span-2 flex items-center justify-between bg-slate-900/60 px-2.5 py-1.5 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <Heart className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block">Blood Pressure</span>
                        <span className="font-bold text-slate-100">
                          {record.bpSystolic ?? '--'} / {record.bpDiastolic ?? '--'} <span className="text-[10px] font-normal text-slate-400">mmHg</span>
                        </span>
                      </div>
                    </div>
                    <BpCategoryBadge category={record.bpCategory} />
                  </div>
                )}

                {/* Pulse Ox */}
                {(record.spo2Percent !== undefined || record.pulseBpm !== undefined) && (
                  <div className="col-span-2 grid grid-cols-2 gap-2 bg-slate-900/60 px-2.5 py-1.5 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block">SpO2</span>
                        <span className="font-bold text-slate-100">
                          {record.spo2Percent !== undefined ? `${record.spo2Percent}%` : '--'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Heart className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block">Pulse</span>
                        <span className="font-bold text-slate-100">
                          {record.pulseBpm !== undefined ? `${record.pulseBpm} bpm` : '--'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              {record.notes && (
                <div className="mt-2 text-[11px] text-slate-300 bg-slate-900/40 px-2.5 py-1.5 rounded-xl italic">
                  "{record.notes}"
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingRecord && (
        <EditRecordModal
          userId={userId}
          record={editingRecord}
          onClose={() => setEditingRecord(null)}
          onSaved={() => setEditingRecord(null)}
        />
      )}
    </div>
  );
};
