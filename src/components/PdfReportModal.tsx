import React, { useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { X, Download, Printer } from 'lucide-react';

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

  // Handle Download PDF using jsPDF + html2canvas
  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;

    try {
      setIsGenerating(true);

      const element = reportRef.current;

      // Temporarily remove scroll/overflow effects
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png", 1.0);

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const margin = 5;
      const contentWidth = pageWidth - margin * 2;

      const imgHeight =
        (canvas.height * contentWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = margin;

      // First page
      pdf.addImage(
        imgData,
        "PNG",
        margin,
        position,
        contentWidth,
        imgHeight
      );

      heightLeft -= pageHeight - margin * 2;

      // Additional pages
      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;

        pdf.addPage();

        pdf.addImage(
          imgData,
          "PNG",
          margin,
          position,
          contentWidth,
          imgHeight
        );

        heightLeft -= pageHeight - margin * 2;
      }

      const today = new Date()
        .toISOString()
        .split("T")[0];

      pdf.save(`Routine-Performance-Report-${today}.pdf`);

    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle native browser print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#171717]/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl bg-[#F5F5F5] rounded-xl shadow-2xl border border-[#D4D4D4] overflow-hidden transform transition-all my-6 flex flex-col max-h-[92vh]"
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
              className="flex items-center gap-1.5 bg-white text-[#107C41] hover:bg-[#F5F5F5] px-4 py-1.5 rounded text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
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
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-[#E5E5E5]">
          <div
            ref={reportRef}
            id="printable-report"
            className="bg-white p-6 sm:p-8 rounded-lg shadow-md border border-[#D4D4D4] text-[#171717] mx-auto max-w-4xl"
          >
            {/* Report Header */}
            <div className="border-b-2 border-[#107C41] pb-4 mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">

                  <h1 className="text-2xl font-black text-[#171717] tracking-tight">
                    Routine Performance Report
                  </h1>
                </div>
                <p className="text-xs text-[#737373] mt-1">
                  Time Period: <strong className="text-[#262626]">{dates[0]?.dateStr}</strong> to{' '}
                  <strong className="text-[#262626]">{dates[dates.length - 1]?.dateStr}</strong> ({totalDates} Days)
                </p>
              </div>

              <div className="text-right">
                <div className="text-xs text-[#737373] font-mono">
                  Generated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="text-lg font-black text-[#107C41] font-mono mt-0.5">
                  {overallPct}% Success Rate
                </div>
              </div>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className="bg-[#FAFAFA] border border-[#D4D4D4] p-3 rounded text-center">
                <div className="text-[11px] font-bold text-[#737373] uppercase">Overall Rate</div>
                <div className="text-2xl font-black text-[#107C41] font-mono mt-0.5">{overallPct}%</div>
                <div className="text-[10px] text-[#A3A3A3] font-mono">{totalDone}/{totalBoxes} Boxes</div>
              </div>

              <div className="bg-[#FAFAFA] border border-[#D4D4D4] p-3 rounded text-center">
                <div className="text-[11px] font-bold text-[#737373] uppercase">Active Streak</div>
                <div className="text-2xl font-black text-[#EA580C] font-mono mt-0.5">{currentStreak} Days</div>
                <div className="text-[10px] text-[#A3A3A3]">Best: {maxStreak} Days</div>
              </div>

              <div className="bg-[#FAFAFA] border border-[#D4D4D4] p-3 rounded text-center">
                <div className="text-[11px] font-bold text-[#737373] uppercase">Total Routines</div>
                <div className="text-2xl font-black text-[#262626] font-mono mt-0.5">{totalRoutines}</div>
                <div className="text-[10px] text-[#A3A3A3]">Habits Tracked</div>
              </div>

              <div className="bg-[#FAFAFA] border border-[#D4D4D4] p-3 rounded text-center">
                <div className="text-[11px] font-bold text-[#737373] uppercase">Total Days</div>
                <div className="text-2xl font-black text-[#262626] font-mono mt-0.5">{totalDates}</div>
                <div className="text-[10px] text-[#A3A3A3]">Calendar Range</div>
              </div>
            </div>

            {/* Visual Consistency Breakdown Bars */}
            <div className="mb-6 bg-[#FAFAFA] border border-[#D4D4D4] p-4 rounded">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#404040] mb-3">
                Routine Performance Summary
              </h3>
              <div className="space-y-2">
                {routines.map((r, idx) => {
                  const doneCount = dates.filter((d) => completions[r.id]?.[d.dateStr]).length;
                  const pct = totalDates > 0 ? Math.round((doneCount / totalDates) * 100) : 0;
                  return (
                    <div key={r.id} className="text-xs">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold text-[#262626] truncate max-w-[65%]">
                          {idx + 1}. {r.name}
                        </span>
                        <span className="font-mono text-[#525252] font-bold">
                          {doneCount}/{totalDates} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-[#E5E5E5] h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${pct >= 80 ? 'bg-[#107C41]' : pct >= 50 ? 'bg-[#22C55E]' : 'bg-[#F59E0B]'
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
            <div className="mb-4 overflow-hidden border border-[#D4D4D4] rounded">
              <div className="bg-[#E6E6E6] px-3 py-1.5 border-b border-[#D4D4D4] text-xs font-bold text-[#404040] uppercase">
                Detailed Habit Log Matrix
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-[11px]">
                  <thead>
                    <tr className="bg-[#F2F2F2] border-b border-[#D4D4D4]">
                      <th className="border border-[#D4D4D4] p-1.5 font-bold text-[#262626] min-w-[140px]">
                        Routine
                      </th>
                      {dates.map((col) => {
                        const [y, m, d] = col.dateStr.split('-').map(Number);
                        return (
                          <th
                            key={col.id}
                            className="border border-[#D4D4D4] p-1 text-center font-mono font-bold text-[10px] min-w-[28px]"
                          >
                            {d}
                          </th>
                        );
                      })}
                      <th className="border border-[#D4D4D4] p-1 text-center font-bold text-[10px] min-w-[45px]">
                        Score
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {routines.map((r, rIdx) => {
                      const rowDone = dates.filter((d) => completions[r.id]?.[d.dateStr]).length;
                      return (
                        <tr key={r.id} className="border-b border-[#E5E5E5]">
                          <td className="border border-[#D4D4D4] p-1.5 font-medium text-[#171717] truncate">
                            {rIdx + 1}. {r.name}
                          </td>
                          {dates.map((col) => {
                            const isDone = Boolean(completions[r.id]?.[col.dateStr]);
                            return (
                              <td
                                key={col.id}
                                className={`border border-[#D4D4D4] p-0 text-center ${isDone ? 'bg-[#22C55E]' : 'bg-white'
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
                          <td className="border border-[#D4D4D4] p-1 text-center font-mono font-bold text-[10px] bg-[#FAFAFA]">
                            {rowDone}/{totalDates}
                          </td>
                        </tr>
                      );
                    })}
                    {/* Total row */}
                    <tr className="bg-[#EBEBEB] font-bold">
                      <td className="border border-[#D4D4D4] p-1.5 text-[#262626] text-[10px]">
                        DAILY DONE:
                      </td>
                      {dates.map((col) => {
                        const count = routines.filter((r) => completions[r.id]?.[col.dateStr]).length;
                        return (
                          <td
                            key={col.id}
                            className="border border-[#D4D4D4] p-1 text-center font-mono text-[9px]"
                          >
                            {count}
                          </td>
                        );
                      })}
                      <td className="border border-[#D4D4D4] p-1 text-center font-mono text-[10px] text-[#107C41]">
                        {overallPct}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Report Footer */}
            <div className="pt-4 border-t border-[#E5E5E5] flex items-center justify-between text-[10px] text-[#A3A3A3] font-mono">
              <span>Routine Tracker · Visual Productivity System</span>
              <span>All habits tracked successfully</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
