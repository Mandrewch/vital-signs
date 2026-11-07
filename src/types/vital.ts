export type BpCategory = 'normal' | 'elevated' | 'stage1' | 'stage2' | 'crisis';

export interface VitalRecord {
  id: string;                      // Firestore doc id
  userId: string;                  // Firebase Auth UID
  date: string;                    // YYYY-MM-DD
  time: string;                    // HH:mm (e.g. 07:30)
  recordedAt: string;              // ISO timestamp
  
  // Weight & Temperature (Metric)
  weightKg?: number;               // in kg (e.g., 78.4)
  temperatureC?: number;           // in °C (e.g., 36.6)
  
  // Blood Pressure
  bpSystolic?: number;             // in mmHg
  bpDiastolic?: number;            // in mmHg
  bpCategory?: BpCategory;
  
  // Pulse Oximeter
  spo2Percent?: number;            // in % (e.g., 98)
  pulseBpm?: number;               // in bpm (e.g., 72)
  
  // Notes / Context
  notes?: string;
  
  createdAt: number;
  updatedAt: number;
}

export type VitalFormData = Omit<VitalRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'bpCategory'>;
