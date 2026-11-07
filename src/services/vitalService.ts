import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  Unsubscribe,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { VitalRecord, VitalFormData } from '../types/vital';
import { calculateBpCategory } from '../utils/bpCategories';

function getVitalsCollection(userId: string) {
  return collection(db, 'users', userId, 'vitals');
}

/**
 * Subscribe in real-time to a user's vital records, ordered by date descending.
 * Works seamlessly offline via Firestore persistent cache.
 */
export function subscribeToVitals(
  userId: string, 
  onUpdate: (records: VitalRecord[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const colRef = getVitalsCollection(userId);
  const q = query(colRef, orderBy('date', 'desc'), orderBy('time', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const records: VitalRecord[] = [];
    snapshot.forEach((docSnap) => {
      records.push({
        id: docSnap.id,
        ...(docSnap.data() as Omit<VitalRecord, 'id'>)
      });
    });
    onUpdate(records);
  }, (err) => {
    console.error("Error subscribing to vitals:", err);
    if (onError) onError(err);
  });
}

/**
 * Save or update a vital record.
 */
export async function saveVitalRecord(
  userId: string, 
  formData: VitalFormData, 
  recordId?: string
): Promise<string> {
  const colRef = getVitalsCollection(userId);
  // If no recordId provided, generate one or use date
  const docRef = recordId ? doc(colRef, recordId) : doc(colRef);
  
  const bpCategory = calculateBpCategory(formData.bpSystolic, formData.bpDiastolic);
  const now = Date.now();

  const dataToSave: Omit<VitalRecord, 'id'> = {
    userId,
    date: formData.date,
    time: formData.time || '07:00',
    recordedAt: formData.recordedAt || new Date().toISOString(),
    weightKg: formData.weightKg !== undefined && !isNaN(formData.weightKg) ? Number(formData.weightKg) : undefined,
    temperatureC: formData.temperatureC !== undefined && !isNaN(formData.temperatureC) ? Number(formData.temperatureC) : undefined,
    bpSystolic: formData.bpSystolic !== undefined && !isNaN(formData.bpSystolic) ? Math.round(Number(formData.bpSystolic)) : undefined,
    bpDiastolic: formData.bpDiastolic !== undefined && !isNaN(formData.bpDiastolic) ? Math.round(Number(formData.bpDiastolic)) : undefined,
    bpCategory,
    spo2Percent: formData.spo2Percent !== undefined && !isNaN(formData.spo2Percent) ? Math.round(Number(formData.spo2Percent)) : undefined,
    pulseBpm: formData.pulseBpm !== undefined && !isNaN(formData.pulseBpm) ? Math.round(Number(formData.pulseBpm)) : undefined,
    notes: formData.notes?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };

  // Remove undefined fields for clean Firestore storage
  const cleanedData: Record<string, any> = {};
  Object.entries(dataToSave).forEach(([key, val]) => {
    if (val !== undefined) cleanedData[key] = val;
  });

  await setDoc(docRef, cleanedData, { merge: true });
  return docRef.id;
}

/**
 * Delete a vital record.
 */
export async function deleteVitalRecord(userId: string, recordId: string): Promise<void> {
  const docRef = doc(getVitalsCollection(userId), recordId);
  await deleteDoc(docRef);
}

/**
 * Batch save multiple records (used for Google Sheet CSV Migration).
 */
export async function batchSaveRecords(userId: string, records: VitalFormData[]): Promise<number> {
  const colRef = getVitalsCollection(userId);
  const batchSize = 400; // Firestore limit is 500 ops per batch
  let totalSaved = 0;

  for (let i = 0; i < records.length; i += batchSize) {
    const chunk = records.slice(i, i + batchSize);
    const batch = writeBatch(db);

    chunk.forEach((item) => {
      const docRef = doc(colRef);
      const bpCategory = calculateBpCategory(item.bpSystolic, item.bpDiastolic);
      const now = Date.now();

      const docData: Record<string, any> = {
        userId,
        date: item.date,
        time: item.time || '07:00',
        recordedAt: item.recordedAt || `${item.date}T07:00:00Z`,
        createdAt: now,
        updatedAt: now
      };

      if (item.weightKg !== undefined) docData.weightKg = Number(item.weightKg);
      if (item.temperatureC !== undefined) docData.temperatureC = Number(item.temperatureC);
      if (item.bpSystolic !== undefined) docData.bpSystolic = Math.round(Number(item.bpSystolic));
      if (item.bpDiastolic !== undefined) docData.bpDiastolic = Math.round(Number(item.bpDiastolic));
      if (bpCategory) docData.bpCategory = bpCategory;
      if (item.spo2Percent !== undefined) docData.spo2Percent = Math.round(Number(item.spo2Percent));
      if (item.pulseBpm !== undefined) docData.pulseBpm = Math.round(Number(item.pulseBpm));
      if (item.notes) docData.notes = item.notes;

      batch.set(docRef, docData);
    });

    await batch.commit();
    totalSaved += chunk.length;
  }

  return totalSaved;
}

/**
 * Find the most recent record strictly prior to the specified date.
 */
export function getYesterdayOrPreviousRecord(records: VitalRecord[], currentDate: string): VitalRecord | null {
  const previous = records.filter(r => r.date < currentDate);
  return previous.length > 0 ? previous[0] : null;
}

/**
 * Export records to CSV string and initiate download for doctor/backup.
 */
export function downloadVitalsCsv(records: VitalRecord[]) {
  const headers = [
    'Date',
    'Time',
    'Weight (kg)',
    'Temperature (°C)',
    'BP Systolic (mmHg)',
    'BP Diastolic (mmHg)',
    'BP Category',
    'SpO2 (%)',
    'Pulse (bpm)',
    'Notes'
  ];

  const rows = records.map(r => [
    r.date,
    r.time,
    r.weightKg ?? '',
    r.temperatureC ?? '',
    r.bpSystolic ?? '',
    r.bpDiastolic ?? '',
    r.bpCategory ?? '',
    r.spo2Percent ?? '',
    r.pulseBpm ?? '',
    `"${(r.notes ?? '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `vital_signs_export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
