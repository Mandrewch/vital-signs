import React, { useState } from 'react';
import { VitalRecord } from '../../types/vital';
import { ChevronDown, ChevronUp, History, Scale, Thermometer, Heart, Activity } from 'lucide-react';
import { BpCategoryBadge } from './BpCategoryBadge';

interface YesterdayCardProps {
  previousRecord: VitalRecord | null;
}

export const YesterdayCard: React.FC<YesterdayCardProps> = ({ previousRecord }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!previousRecord) {
    return null;
  }

  const formatDisplayDate = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (dateStr === yesterday) return 'Yesterday';
    if (dateStr === today) return 'Earlier Today';
    return dateStr;
  };

  return (
    <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 mb-4 backdrop-blur-sm">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center space-x-2">
          <History className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Previous Entry ({formatDisplayDate(previousRecord.date)})
          </span>
        </div>
        <button className="text-slate-400 hover:text-slate-200 p-0.5">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-700/40 text-xs">
          {previousRecord.weightKg !== undefined && (
            <div className="flex items-center space-x-2 bg-slate-900/50 p-2 rounded-xl">
              <Scale className="w-3.5 h-3.5 text-blue-400" />
              <div>
                <div className="text-[10px] text-slate-400">Weight</div>
                <div className="font-semibold text-slate-100">{previousRecord.weightKg} kg</div>
              </div>
            </div>
          )}

          {previousRecord.temperatureC !== undefined && (
            <div className="flex items-center space-x-2 bg-slate-900/50 p-2 rounded-xl">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              <div>
                <div className="text-[10px] text-slate-400">Temp</div>
                <div className="font-semibold text-slate-100">{previousRecord.temperatureC} °C</div>
              </div>
            </div>
          )}

          {(previousRecord.bpSystolic !== undefined || previousRecord.bpDiastolic !== undefined) && (
            <div className="flex items-center justify-between col-span-2 bg-slate-900/50 p-2 rounded-xl">
              <div className="flex items-center space-x-2">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <div>
                  <div className="text-[10px] text-slate-400">Blood Pressure</div>
                  <div className="font-semibold text-slate-100">
                    {previousRecord.bpSystolic ?? '--'} / {previousRecord.bpDiastolic ?? '--'}{' '}
                    <span className="text-[10px] font-normal text-slate-400">mmHg</span>
                  </div>
                </div>
              </div>
              <BpCategoryBadge category={previousRecord.bpCategory} />
            </div>
          )}

          {(previousRecord.spo2Percent !== undefined || previousRecord.pulseBpm !== undefined) && (
            <div className="col-span-2 grid grid-cols-2 gap-2 bg-slate-900/50 p-2 rounded-xl">
              <div className="flex items-center space-x-2">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <div>
                  <div className="text-[10px] text-slate-400">SpO2</div>
                  <div className="font-semibold text-slate-100">
                    {previousRecord.spo2Percent !== undefined ? `${previousRecord.spo2Percent}%` : '--'}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="w-3.5 h-3.5 text-indigo-400" />
                <div>
                  <div className="text-[10px] text-slate-400">Pulse</div>
                  <div className="font-semibold text-slate-100">
                    {previousRecord.pulseBpm !== undefined ? `${previousRecord.pulseBpm} bpm` : '--'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {previousRecord.notes && (
            <div className="col-span-2 text-[11px] text-slate-300 bg-slate-900/40 p-2 rounded-xl italic">
              "{previousRecord.notes}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};
