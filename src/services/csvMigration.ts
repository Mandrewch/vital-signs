import Papa from 'papaparse';
import { VitalFormData } from '../types/vital';

export interface ParseResult {
  validRecords: VitalFormData[];
  ignoredCount: number;
  warnings: string[];
}

const MONTHS: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
};

/**
 * Normalizes varied date formats into "YYYY-MM-DD":
 * - "Thu, 1 Jan 26" / "1 Jan 26" / "1 Jan 2026"
 * - "2026-01-01"
 * - "01/01/2026" or "01-01-2026"
 */
function normalizeDate(rawDate: string): string | null {
  if (!rawDate) return null;
  const trimmed = rawDate.trim();

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // Handle format like "Thu, 1 Jan 26" or "1 Jan 26" or "15 Mar 2026"
  const textDateMatch = trimmed.match(/(?:[A-Za-z]+,\s*)?(\d{1,2})\s+([A-Za-z]{3})\s+(\d{2,4})/);
  if (textDateMatch) {
    const day = textDateMatch[1].padStart(2, '0');
    const monthKey = textDateMatch[2].toLowerCase();
    const month = MONTHS[monthKey];
    let year = textDateMatch[3];
    if (year.length === 2) {
      year = '20' + year;
    }
    if (month) {
      return `${year}-${month}-${day}`;
    }
  }

  // DD/MM/YYYY or MM/DD/YYYY or DD-MM-YYYY
  const slashParts = trimmed.split(/[/.-]/);
  if (slashParts.length === 3) {
    let [p1, p2, p3] = slashParts.map(s => parseInt(s, 10));
    if (p3 > 1000) {
      let day = p1;
      let month = p2;
      if (p1 <= 12 && p2 > 12) {
        month = p1;
        day = p2;
      }
      return `${p3}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  // Try standard JS Date parsing fallback
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }

  return null;
}

function cleanNumber(val: any): number | undefined {
  if (val === undefined || val === null || val === '') return undefined;
  if (typeof val === 'number') return isNaN(val) ? undefined : val;
  // Remove all non-numeric characters except '.' and '-'
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? undefined : parsed;
}

/**
 * Intelligent parser that handles both:
 * 1. Multi-tier Google Sheets format (like "Weight and BP - 2026.csv")
 * 2. Standard single-header CSV exports
 */
export function parseGoogleSheetCsv(csvString: string): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse(csvString, {
      skipEmptyLines: false,
      complete: (results) => {
        const rawRows = results.data as string[][];
        const validRecords: VitalFormData[] = [];
        const warnings: string[] = [];
        let ignoredCount = 0;

        if (!rawRows || rawRows.length === 0) {
          resolve({ validRecords: [], ignoredCount: 0, warnings: ['Empty CSV file'] });
          return;
        }

        // Method 1: Row-by-row positional parsing (Matches Google Sheet layout)
        for (let i = 0; i < rawRows.length; i++) {
          const row = rawRows[i];
          if (!Array.isArray(row) || row.length === 0) {
            ignoredCount++;
            continue;
          }

          // Check column 0 for a valid date
          const col0 = String(row[0] || '').trim();
          const normalizedDate = normalizeDate(col0);

          if (!normalizedDate) {
            ignoredCount++;
            continue;
          }

          // Positional mapping matching user's Google Sheet:
          // Col 0: Date
          // Col 1: Weight (Kg)
          // Col 4: Temp (°C / ℃)
          // Col 5: O2 (SpO2 %)
          // Col 6: HR (Pulse Oximeter Heart Rate)
          // Col 8: Sys (BP Systolic)
          // Col 9: Dia (BP Diastolic)
          // Col 10: HR (BP Heart Rate)
          // Col 11+: Notes
          const weight = cleanNumber(row[1]);
          const temp = cleanNumber(row[4]);
          const spo2 = cleanNumber(row[5]);
          const o2Pulse = cleanNumber(row[6]);
          const systolic = cleanNumber(row[8]);
          const diastolic = cleanNumber(row[9]);
          const bpPulse = cleanNumber(row[10]);

          // Pick pulse: if o2Pulse is a valid physiological rate (>= 30), use it;
          // otherwise fallback to BP pulse (fixes sensor reading glitches like HR=5)
          let pulse: number | undefined = undefined;
          if (o2Pulse !== undefined && o2Pulse >= 30) {
            pulse = o2Pulse;
          } else if (bpPulse !== undefined && bpPulse >= 30) {
            pulse = bpPulse;
          } else if (o2Pulse !== undefined) {
            pulse = o2Pulse;
          }

          // Extract notes (from Col 11 onwards, find first non-numeric text)
          let notes: string | undefined = undefined;
          for (let c = 11; c < row.length; c++) {
            const cellVal = String(row[c] || '').trim();
            if (cellVal && isNaN(Number(cellVal)) && !/^\d+$/.test(cellVal)) {
              notes = cellVal;
              break;
            }
          }

          // If positional columns found at least one vital sign, save record
          if (
            weight !== undefined ||
            temp !== undefined ||
            systolic !== undefined ||
            spo2 !== undefined ||
            pulse !== undefined
          ) {
            validRecords.push({
              date: normalizedDate,
              time: '07:00',
              recordedAt: `${normalizedDate}T07:00:00Z`,
              weightKg: weight,
              temperatureC: temp,
              bpSystolic: systolic,
              bpDiastolic: diastolic,
              spo2Percent: spo2,
              pulseBpm: pulse,
              notes
            });
          } else {
            // Row had a date header but empty measurements (e.g. future dates in sheet)
            ignoredCount++;
          }
        }

        // Method 2: If positional parsing didn't find records, try header-name based parsing
        if (validRecords.length === 0) {
          Papa.parse(csvString, {
            header: true,
            skipEmptyLines: 'greedy',
            complete: (namedResults) => {
              const namedRows = namedResults.data as Record<string, any>[];
              for (const row of namedRows) {
                const keys = Object.keys(row);
                const dateKey = keys.find(k => /date|day|time/i.test(k));
                const rawDate = dateKey ? row[dateKey] : null;
                const d = normalizeDate(rawDate);
                if (!d) continue;

                const weightKey = keys.find(k => /weight|kg|wt/i.test(k));
                const tempKey = keys.find(k => /temp|temperature|deg|°c/i.test(k));
                const sysKey = keys.find(k => /sys|systolic/i.test(k));
                const diaKey = keys.find(k => /dia|diastolic/i.test(k));
                const spo2Key = keys.find(k => /spo2|o2|oximeter/i.test(k));
                const pulseKey = keys.find(k => /pulse|hr|bpm|heart/i.test(k));
                const noteKey = keys.find(k => /note|comment|remark/i.test(k));

                validRecords.push({
                  date: d,
                  time: '07:00',
                  recordedAt: `${d}T07:00:00Z`,
                  weightKg: cleanNumber(weightKey ? row[weightKey] : undefined),
                  temperatureC: cleanNumber(tempKey ? row[tempKey] : undefined),
                  bpSystolic: cleanNumber(sysKey ? row[sysKey] : undefined),
                  bpDiastolic: cleanNumber(diaKey ? row[diaKey] : undefined),
                  spo2Percent: cleanNumber(spo2Key ? row[spo2Key] : undefined),
                  pulseBpm: cleanNumber(pulseKey ? row[pulseKey] : undefined),
                  notes: noteKey && row[noteKey] ? String(row[noteKey]).trim() : undefined
                });
              }

              // Sort newest to oldest
              validRecords.sort((a, b) => b.date.localeCompare(a.date));
              resolve({ validRecords, ignoredCount, warnings });
            }
          });
          return;
        }

        // Sort descending by date (newest first)
        validRecords.sort((a, b) => b.date.localeCompare(a.date));

        resolve({
          validRecords,
          ignoredCount,
          warnings
        });
      },
      error: (error: Error) => {
        reject(error);
      }
    });
  });
}
