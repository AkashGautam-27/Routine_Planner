import React, { useRef, useState } from 'react';
import { X, Download, Printer, Check, Calendar, Award, Flame, CheckCircle2 } from 'lucide-react';

interface RoutineRow {
  id: string;
  name: string;
}

interface DateCol {
  id: string;
  dateStr: string;
}

interface PdfReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  routines: RoutineRow[];
  dates: DateCol[];
  completions: Record<string, Record<string, boolean>>;
}

export const PdfReportModal: React.FC<PdfReportModalProps> = ({
  isOpen,
  onClose,
  routines,
  dates,
  completions,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const totalRoutines = routines.length;
  const totalDates = dates.length;
  const totalBoxes = totalRoutines * totalDates;

  let totalDone = 0;
  routines.forEach((r) => {
    dates.forEach((d) => {
      if (completions[r.id]?.[d.dateStr]) {
        totalDone++;
      }
    });
  });

  const overallPct = totalBoxes > 0 ? Math.round((totalDone / totalBoxes) * 100) : 0;

  // Streak calculation
  let currentStreak = 0;
  let maxStreak = 0;
  let running = 0;
  dates.forEach((d) => {
    const anyDone = routines.some((r) => completions[r.id]?.[d.dateStr]);
    if (anyDone) {
      running++;
      if (running > maxStreak) maxStreak = running;
    } else {
      running = 0;
    }
  });
  for (let i = dates.length - 1; i >= 0; i--) {
    const anyDone = routines.some((r) => completions[r.id]?.[dates[i].dateStr]);
    if (anyDone) {
      currentStreak++;
    } else if (currentStreak > 0) {
      break;
    }
  }

  // Handle Download PDF
  const handleDownloadPdf = () => {
    window.print();
  };

  // Handle native browser print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-neutral-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl bg-neutral-100 rounded-xl shadow-2xl border border-neutral-300 overflow-hidden transform transition-all my-6 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="bg-[#107C41] text-white px-5 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">

            <h2 className="font-bold text-base">Routine Report</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-[#0C5E31] hover:bg-[#094725] text-white px-3 py-1.5 rounded text-xs font-semibold border border-white/20 transition-colors cursor-pointer"
              title="Print directly or save via browser print dialog"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save </span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="flex items-center gap-1.5 bg-white text-[#107C41] hover:bg-neutral-100 px-4 py-1.5 rounded text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'Generating PDF...' : 'Download '}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1 text-white/80 hover:text-white rounded hover:bg-white/10 transition-colors ml-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable/Canvas Container */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-neutral-200">
          <div
            ref={reportRef}
            id="printable-report"
            className="bg-white p-6 sm:p-8 rounded-lg shadow-md border border-neutral-300 text-neutral-900 mx-auto max-w-4xl"
          >
            {/* Report Header */}
            <div className="border-b-2 border-[#107C41] pb-4 mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">

                  <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
                    Routine Performance Report
                  </h1>
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  Time Period: <strong className="text-neutral-800">{dates[0]?.dateStr}</strong> to{' '}
                  <strong className="text-neutral-800">{dates[dates.length - 1]?.dateStr}</strong> ({totalDates} Days)
                </p>
              </div>

              <div className="text-right">
                <div className="text-xs text-neutral-500 font-mono">
                  Generated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="text-lg font-black text-[#107C41] font-mono mt-0.5">
                  {overallPct}% Success Rate
                </div>
              </div>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className="bg-neutral-50 border border-neutral-300 p-3 rounded text-center">
                <div className="text-[11px] font-bold text-neutral-500 uppercase">Overall Rate</div>
                <div className="text-2xl font-black text-[#107C41] font-mono mt-0.5">{overallPct}%</div>
                <div className="text-[10px] text-neutral-400 font-mono">{totalDone}/{totalBoxes} Boxes</div>
              </div>

              <div className="bg-neutral-50 border border-neutral-300 p-3 rounded text-center">
                <div className="text-[11px] font-bold text-neutral-500 uppercase">Active Streak</div>
                <div className="text-2xl font-black text-orange-600 font-mono mt-0.5">{currentStreak} Days</div>
                <div className="text-[10px] text-neutral-400">Best: {maxStreak} Days</div>
              </div>

              <div className="bg-neutral-50 border border-neutral-300 p-3 rounded text-center">
                <div className="text-[11px] font-bold text-neutral-500 uppercase">Total Routines</div>
                <div className="text-2xl font-black text-neutral-800 font-mono mt-0.5">{totalRoutines}</div>
                <div className="text-[10px] text-neutral-400">Habits Tracked</div>
              </div>

              <div className="bg-neutral-50 border border-neutral-300 p-3 rounded text-center">
                <div className="text-[11px] font-bold text-neutral-500 uppercase">Total Days</div>
                <div className="text-2xl font-black text-neutral-800 font-mono mt-0.5">{totalDates}</div>
                <div className="text-[10px] text-neutral-400">Calendar Range</div>
              </div>
            </div>

            {/* Visual Consistency Breakdown Bars */}
            <div className="mb-6 bg-neutral-50 border border-neutral-300 p-4 rounded">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-3">
                Routine Performance Summary
              </h3>
              <div className="space-y-2">
                {routines.map((r, idx) => {
                  const doneCount = dates.filter((d) => completions[r.id]?.[d.dateStr]).length;
                  const pct = totalDates > 0 ? Math.round((doneCount / totalDates) * 100) : 0;
                  return (
                    <div key={r.id} className="text-xs">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold text-neutral-800 truncate max-w-[65%]">
                          {idx + 1}. {r.name}
                        </span>
                        <span className="font-mono text-neutral-600 font-bold">
                          {doneCount}/{totalDates} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${pct >= 80 ? 'bg-[#107C41]' : pct >= 50 ? 'bg-[#22C55E]' : 'bg-amber-500'
                            }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Visual Excel Spreadsheet Grid */}
            <div className="mb-4 overflow-hidden border border-neutral-300 rounded">
              <div className="bg-[#E6E6E6] px-3 py-1.5 border-b border-neutral-300 text-xs font-bold text-neutral-700 uppercase">
                Detailed Habit Log Matrix
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-[11px]">
                  <thead>
                    <tr className="bg-[#F2F2F2] border-b border-neutral-300">
                      <th className="border border-neutral-300 p-1.5 font-bold text-neutral-800 min-w-[140px]">
                        Routine
                      </th>
                      {dates.map((col) => {
                        const [y, m, d] = col.dateStr.split('-').map(Number);
                        return (
                          <th
                            key={col.id}
                            className="border border-neutral-300 p-1 text-center font-mono font-bold text-[10px] min-w-[28px]"
                          >
                            {d}
                          </th>
                        );
                      })}
                      <th className="border border-neutral-300 p-1 text-center font-bold text-[10px] min-w-[45px]">
                        Score
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {routines.map((r, rIdx) => {
                      const rowDone = dates.filter((d) => completions[r.id]?.[d.dateStr]).length;
                      return (
                        <tr key={r.id} className="border-b border-neutral-200">
                          <td className="border border-neutral-300 p-1.5 font-medium text-neutral-900 truncate">
                            {rIdx + 1}. {r.name}
                          </td>
                          {dates.map((col) => {
                            const isDone = Boolean(completions[r.id]?.[col.dateStr]);
                            return (
                              <td
                                key={col.id}
                                className={`border border-neutral-300 p-0 text-center ${isDone ? 'bg-[#22C55E]' : 'bg-white'
                                  }`}
                              >
                                {isDone ? (
                                  <div className="flex items-center justify-center h-5">
                                    <span className="text-white font-bold text-[12px]">✔</span>
                                  </div>
                                ) : (
                                  <div className="h-5" />
                                )}
                              </td>
                            );
                          })}
                          <td className="border border-neutral-300 p-1 text-center font-mono font-bold text-[10px] bg-neutral-50">
                            {rowDone}/{totalDates}
                          </td>
                        </tr>
                      );
                    })}
                    {/* Total row */}
                    <tr className="bg-[#EBEBEB] font-bold">
                      <td className="border border-neutral-300 p-1.5 text-neutral-800 text-[10px]">
                        DAILY DONE:
                      </td>
                      {dates.map((col) => {
                        const count = routines.filter((r) => completions[r.id]?.[col.dateStr]).length;
                        return (
                          <td
                            key={col.id}
                            className="border border-neutral-300 p-1 text-center font-mono text-[9px]"
                          >
                            {count}
                          </td>
                        );
                      })}
                      <td className="border border-neutral-300 p-1 text-center font-mono text-[10px] text-[#107C41]">
                        {overallPct}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Report Footer */}
            <div className="pt-4 border-t border-neutral-200 flex items-center justify-between text-[10px] text-neutral-400 font-mono">
              <span>Routine Tracker · Visual Productivity System</span>
              <span>All habits tracked successfully</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
