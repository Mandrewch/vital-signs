import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileCheck, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink,
  Table,
  ArrowRight
} from 'lucide-react';
import { parseGoogleSheetCsv, ParseResult } from '../../services/csvMigration';
import { batchSaveRecords } from '../../services/vitalService';

interface CsvImporterProps {
  userId: string;
  onImportComplete: () => void;
}

export const CsvImporter: React.FC<CsvImporterProps> = ({ userId, onImportComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importCount, setImportCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setError(null);
    setParseResult(null);
    setImportCount(null);
    setIsParsing(true);

    try {
      const text = await selected.text();
      const result = await parseGoogleSheetCsv(text);
      setParseResult(result);
    } catch (err: any) {
      console.error("Failed to parse CSV:", err);
      setError("Failed to parse CSV file. Please make sure it is a valid Google Sheet CSV export.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleStartImport = async () => {
    if (!parseResult || parseResult.validRecords.length === 0) return;

    setIsImporting(true);
    setError(null);

    try {
      const count = await batchSaveRecords(userId, parseResult.validRecords);
      setImportCount(count);
      onImportComplete();
    } catch (err: any) {
      console.error("Batch import failed:", err);
      setError(err.message || "Failed to import records to Firebase.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-sm backdrop-blur-sm space-y-4">
      <div className="flex items-center space-x-2 pb-2 border-b border-slate-700/60">
        <UploadCloud className="w-5 h-5 text-emerald-400" />
        <div>
          <h3 className="text-sm font-bold text-slate-100">
            Import Google Sheet Data
          </h3>
          <p className="text-[11px] text-slate-400">
            One-time migration from your existing sheet to Firebase
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50 text-[11px] text-slate-300 space-y-1.5">
        <div className="font-semibold text-slate-200">How to export:</div>
        <ol className="list-decimal list-inside space-y-1 text-slate-400 pl-1">
          <li>
            Open your{' '}
            <a 
              href="https://docs.google.com/spreadsheets/d/1-_N1GToXdIFve7d-sgPJtNYEIXCmZ5xuhPJeQtEkWco/edit?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 underline inline-flex items-center gap-0.5"
            >
              Google Sheet <ExternalLink className="w-3 h-3" />
            </a>
          </li>
          <li>Click <strong className="text-slate-200">File &gt; Download &gt; Comma Separated Values (.csv)</strong></li>
          <li>Upload the downloaded <code className="text-emerald-300">.csv</code> file below</li>
        </ol>
      </div>

      {/* File Upload Drop Area */}
      <div className="relative border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-2xl p-5 text-center transition-colors">
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
          <UploadCloud className="w-8 h-8 text-slate-500" />
          <div className="text-xs font-semibold text-slate-200">
            {file ? file.name : 'Tap to choose CSV file'}
          </div>
          <div className="text-[10px] text-slate-400">
            {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Supports standard Google Sheets CSV export'}
          </div>
        </div>
      </div>

      {isParsing && (
        <div className="text-center py-2 text-xs text-slate-400 flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          Parsing records from CSV...
        </div>
      )}

      {/* Parsed Preview */}
      {parseResult && !importCount && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl text-emerald-300">
            <span className="flex items-center gap-1.5 font-medium">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              Found {parseResult.validRecords.length} valid vital records
            </span>
          </div>

          {/* Quick Preview of First 3 Rows */}
          {parseResult.validRecords.length > 0 && (
            <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-700/60 text-[10px]">
              <div className="text-slate-400 font-semibold mb-1 flex items-center gap-1">
                <Table className="w-3 h-3 text-emerald-400" /> Preview of first records:
              </div>
              <div className="space-y-1">
                {parseResult.validRecords.slice(0, 3).map((r, i) => (
                  <div key={i} className="flex justify-between border-b border-slate-800 pb-1 text-slate-300">
                    <span className="font-semibold text-slate-200">{r.date}</span>
                    <span>{r.weightKg ? `${r.weightKg} kg` : ''}</span>
                    <span>{r.bpSystolic ? `${r.bpSystolic}/${r.bpDiastolic}` : ''}</span>
                    <span>{r.spo2Percent ? `${r.spo2Percent}%` : ''}</span>
                    <span>{r.temperatureC ? `${r.temperatureC}°C` : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Start Import Button */}
          <button
            onClick={handleStartImport}
            disabled={isImporting || parseResult.validRecords.length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all disabled:opacity-50"
          >
            {isImporting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Import {parseResult.validRecords.length} Records to Firebase</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Success Notification */}
      {importCount !== null && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 p-3.5 rounded-xl text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Successfully imported {importCount} records!
          </div>
          <p className="text-[11px] text-emerald-400/90 pl-6">
            All your historical records from Google Sheets are now stored in Firestore and available in your Trends and History views.
          </p>
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
