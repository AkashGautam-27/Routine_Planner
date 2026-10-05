import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  RotateCcw,
  Calendar,
  Check,
  BarChart3,
  Table as TableIcon
} from 'lucide-react';
import { VisualAnalytics } from './components/VisualAnalytics';

interface RoutineRow {
  id: string;
  name: string;
}

interface DateCol {
  id: string;
  dateStr: string; // YYYY-MM-DD
}

const STORAGE_KEY = 'excel_routine_tracker_data';

// Helper to format ISO date to readable (e.g. "01 Oct (Tue)")
function formatDateHeader(isoStr: string): {
  dayNum: string;
  monthName: string;
  dayName: string;
  formatted: string;
} {
  if (!isoStr) return { dayNum: '', monthName: '', dayName: '', formatted: '' };
  try {
    const [year, month, day] = isoStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    return {
      dayNum: String(day).padStart(2, '0'),
      monthName,
      dayName,
      formatted: `${day} ${monthName}`,
    };
  } catch {
    return { dayNum: isoStr, monthName: '', dayName: '', formatted: isoStr };
  }
}

// Helper to add days to ISO string
function addDaysToISO(isoStr: string, days: number): string {
  const [year, month, day] = isoStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export default function App() {
  // Active Tab: 'table' (Excel Spreadsheet) or 'visual' (Analytics & Charts)
  const [activeTab, setActiveTab] = useState<'table' | 'visual'>('table');

  // State for rows (Routines)
  const [routines, setRoutines] = useState<RoutineRow[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.routines) && parsed.routines.length > 0) {
          return parsed.routines;
        }
      }
    } catch { }
    return [
      { id: 'r-1', name: 'Morning Exercise & Stretch' },
      { id: 'r-2', name: 'Drink 3 Liters Water' },
      { id: 'r-3', name: 'Read 20 Pages Non-Fiction' },
      { id: 'r-4', name: '1 Hour Dedicated Focus / Work' },
      { id: 'r-5', name: '10 Mins Meditation & Journal' },
    ];
  });

  // State for columns (Dates)
  const [dates, setDates] = useState<DateCol[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.dates) && parsed.dates.length > 0) {
          return parsed.dates;
        }
      }
    } catch { }

    // Default: 14 days starting from today
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const startIso = `${y}-${m}-${d}`;

    return Array.from({ length: 14 }, (_, i) => ({
      id: `d-${i + 1}`,
      dateStr: addDaysToISO(startIso, i),
    }));
  });

  // State for checked cells: completions[routineId][dateStr] = boolean
  const [completions, setCompletions] = useState<Record<string, Record<string, boolean>>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.completions) {
          return parsed.completions;
        }
      }
    } catch { }
    return {};
  });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ routines, dates, completions })
      );
    } catch (e) {
      console.error('Storage save error', e);
    }
  }, [routines, dates, completions]);

  // Click on a box -> Turn green (toggle)
  const handleToggleCell = (routineId: string, dateStr: string) => {
    setCompletions((prev) => {
      const rowCompletions = { ...(prev[routineId] || {}) };
      rowCompletions[dateStr] = !rowCompletions[dateStr];
      return {
        ...prev,
        [routineId]: rowCompletions,
      };
    });
  };

  // Add new routine row
  const handleAddRoutine = () => {
    const newId = `r-${Date.now()}`;
    const newRoutine: RoutineRow = {
      id: newId,
      name: `New Routine ${routines.length + 1}`,
    };
    setRoutines([...routines, newRoutine]);
  };

  // Update routine name
  const handleUpdateRoutineName = (id: string, newName: string) => {
    setRoutines(routines.map((r) => (r.id === id ? { ...r, name: newName } : r)));
  };

  // Delete routine row
  const handleDeleteRoutine = (id: string) => {
    if (routines.length <= 1) return;
    setRoutines(routines.filter((r) => r.id !== id));
    setCompletions((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  // Add new date column (+1 day from last column)
  const handleAddDateCol = () => {
    const lastDate = dates[dates.length - 1]?.dateStr || new Date().toISOString().split('T')[0];
    const nextDate = addDaysToISO(lastDate, 1);
    const newCol: DateCol = {
      id: `d-${Date.now()}`,
      dateStr: nextDate,
    };
    setDates([...dates, newCol]);
  };

  // Update date for a specific column
  const handleUpdateDate = (id: string, newDateStr: string) => {
    if (!newDateStr) return;
    setDates(dates.map((d) => (d.id === id ? { ...d, dateStr: newDateStr } : d)));
  };

  // Delete date column
  const handleDeleteDateCol = (id: string) => {
    if (dates.length <= 1) return;
    setDates(dates.filter((d) => d.id !== id));
  };

  // Reset all boxes (unmark all green)
  const handleResetAll = () => {
    setCompletions({});
  };

  // Quick Start Date Change: Shift all dates starting from a new date
  const handleSetStartDate = (startDate: string) => {
    if (!startDate) return;
    const newDates = dates.map((col, idx) => ({
      ...col,
      dateStr: addDaysToISO(startDate, idx),
    }));
    setDates(newDates);
  };

  // Set End Date Change: Adjust number of columns to end exactly on this date
  const handleSetEndDate = (endDate: string) => {
    if (!endDate || dates.length === 0) return;
    const startDate = dates[0].dateStr;
    const startObj = new Date(startDate);
    const endObj = new Date(endDate);

    if (endObj < startObj) {
      alert('End date cannot be before start date.');
      return;
    }

    const diffTime = endObj.getTime() - startObj.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const newDates = Array.from({ length: diffDays + 1 }, (_, idx) => {
      const dStr = addDaysToISO(startDate, idx);
      const existing = dates.find((d) => d.dateStr === dStr);
      return existing || { id: `d-${Date.now()}-${idx}`, dateStr: dStr };
    });
    setDates(newDates);
  };

  // Calculate totals
  const totalBoxes = routines.length * dates.length;
  let completedBoxes = 0;
  routines.forEach((r) => {
    dates.forEach((d) => {
      if (completions[r.id]?.[d.dateStr]) {
        completedBoxes++;
      }
    });
  });
  const overallPercentage = totalBoxes > 0 ? Math.round((completedBoxes / totalBoxes) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-neutral-900 flex flex-col font-sans">
      <div className="flex flex-col flex-1">
        {/* Excel Style Green Top Bar */}
        <header className="bg-[#107C41] text-white p-3 sm:px-4 sm:py-3 shadow-sm border-b border-[#0C5E31] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 no-print">
          <div className="flex items-center justify-between w-full sm:w-auto gap-3">
            <h1 className="font-bold text-base sm:text-lg tracking-tight">
              Routine Tracker
            </h1>

            {/* View Switcher: Table vs Visual Charts */}
            <div className="flex items-center bg-[#0C5E31] p-0.5 rounded border border-white/20 ml-2">
              <button
                type="button"
                onClick={() => setActiveTab('table')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${activeTab === 'table'
                  ? 'bg-white text-[#107C41] shadow-xs'
                  : 'text-white/80 hover:text-white'
                  }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('visual')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${activeTab === 'visual'
                  ? 'bg-white text-[#107C41] shadow-xs'
                  : 'text-white/80 hover:text-white'
                  }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Visual</span>
              </button>
            </div>
          </div>

          {/* Quick Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2.5 text-xs w-full sm:w-auto">
            {/* Dates Row */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex flex-1 sm:flex-none items-center bg-[#0C5E31] rounded px-2 sm:px-2.5 py-1 gap-1 border border-white/20 justify-center min-w-0">
                <Calendar className="hidden sm:block w-3.5 h-3.5 text-white/80" />
                <span className="text-white/90 font-medium">Start:</span>
                <input
                  type="date"
                  value={dates[0]?.dateStr || ''}
                  onChange={(e) => handleSetStartDate(e.target.value)}
                  className="bg-transparent text-white font-mono text-xs focus:outline-hidden cursor-pointer min-w-0"
                  title="Change start date to shift all columns"
                />
              </div>

              <div className="flex flex-1 sm:flex-none items-center bg-[#0C5E31] rounded px-2 sm:px-2.5 py-1 gap-1 border border-white/20 justify-center min-w-0">
                <Calendar className="hidden sm:block w-3.5 h-3.5 text-white/80" />
                <span className="text-white/90 font-medium">End:</span>
                <input
                  type="date"
                  value={dates[dates.length - 1]?.dateStr || ''}
                  onChange={(e) => handleSetEndDate(e.target.value)}
                  className="bg-transparent text-white font-mono text-xs focus:outline-hidden cursor-pointer min-w-0"
                  title="Change end date to adjust tracking duration"
                />
              </div>
            </div>

            {/* Actions Row */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <button
                type="button"
                onClick={handleAddRoutine}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-white text-[#107C41] font-semibold px-2 sm:px-2.5 py-1 rounded shadow-xs hover:bg-neutral-100 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Row</span>
              </button>

              <button
                type="button"
                onClick={handleAddDateCol}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-[#0C5E31] hover:bg-[#094725] text-white font-semibold px-2 sm:px-2.5 py-1 rounded border border-white/30 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Date</span>
              </button>

              <button
                type="button"
                onClick={handleResetAll}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-rose-700/80 hover:bg-rose-700 text-white px-2 py-1 rounded border border-rose-400/40 transition-colors cursor-pointer whitespace-nowrap"
                title="Reset all checkboxes"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </header>

        {/* Info Status Bar */}
        <div className="bg-white border-b border-neutral-300 px-4 py-2 flex flex-wrap items-center justify-between text-xs text-neutral-600 gap-2 no-print">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-neutral-800">
              📊 Rows: <span className="font-mono text-neutral-900">{routines.length} Routines</span>
            </span>
            <span className="text-neutral-300">|</span>
            <span className="font-semibold text-neutral-800">
              📅 Columns: <span className="font-mono text-neutral-900">{dates.length} Days</span>
            </span>
            <span className="text-neutral-300">|</span>

          </div>

          <div className="flex items-center gap-3">
            <span className="font-bold text-neutral-800 font-mono">
              {completedBoxes} / {totalBoxes} Completed ({overallPercentage}%)
            </span>
            <div className="w-24 bg-neutral-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#107C41] h-full rounded-full transition-all duration-300"
                style={{ width: `${overallPercentage}%` }}
              />
            </div>

          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-2 sm:p-4 overflow-auto">
          {activeTab === 'visual' ? (
            /* View 1: Visual Analytics & Charts */
            <div className="max-w-6xl mx-auto space-y-4">
              <div className="flex items-center justify-between bg-white border border-neutral-300 p-3.5 rounded-lg shadow-xs">
                <div>
                  <h2 className="font-bold text-base text-neutral-900">
                    Visual Routine Performance Analytics
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Graphical trends, consistency streaks, and habit comparison breakdown
                  </p>
                </div>
              </div>

              <VisualAnalytics
                routines={routines}
                dates={dates}
                completions={completions}
              />
            </div>
          ) : (
            /* View 2: Excel Spreadsheet Grid */
            <>
            {/* Desktop View */}
            <div className="hidden sm:inline-block bg-white border-2 border-neutral-400 shadow-md min-w-full">
              <table className="w-full border-collapse text-left border border-neutral-300 select-none">
                <thead>
                  {/* Row 1: Header Dates */}
                  <tr className="bg-[#E6E6E6] text-neutral-800 border-b-2 border-neutral-400 sticky top-0 z-20">
                    {/* Corner: Routine Row Header */}
                    <th className="border border-neutral-300 p-2.5 text-xs font-bold text-neutral-800 min-w-[220px] sm:min-w-[280px] bg-[#E1DFDD] sticky left-0 z-30 shadow-[2px_0_0_0_#9CA3AF]">
                      <div className="flex items-center justify-between">
                        <span className="font-bold uppercase tracking-wider text-[11px] text-neutral-700">
                          # Routine / Habit
                        </span>
                        <button
                          type="button"
                          onClick={handleAddRoutine}
                          className="text-[11px] text-[#107C41] hover:underline font-bold"
                        >
                          + Row
                        </button>
                      </div>
                    </th>

                    {/* Date Columns Headers */}
                    {dates.map((col) => {
                      const header = formatDateHeader(col.dateStr);
                      const isTodayCol =
                        col.dateStr === new Date().toISOString().split('T')[0];

                      return (
                        <th
                          key={col.id}
                          className={`border border-neutral-300 p-1.5 text-center min-w-[70px] sm:min-w-[80px] ${isTodayCol ? 'bg-[#D1E7DD] text-[#0F5132] font-black' : 'bg-[#F2F2F2]'
                            }`}
                        >
                          <div className="flex flex-col items-center group relative">
                            <span className="text-[10px] text-neutral-500 font-semibold uppercase">
                              {header.dayName}
                            </span>
                            <span className="text-xs font-bold font-mono text-neutral-900 leading-tight">
                              {header.formatted}
                            </span>

                            {/* Inline date editor input */}
                            <div className="mt-1 flex items-center gap-1">
                              <input
                                type="date"
                                value={col.dateStr}
                                onChange={(e) => handleUpdateDate(col.id, e.target.value)}
                                className="w-4 h-4 p-0 opacity-40 hover:opacity-100 cursor-pointer bg-transparent"
                                title="Click to customize this date"
                              />
                              {dates.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDateCol(col.id)}
                                  className="text-neutral-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                                  title="Delete column"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </th>
                      );
                    })}

                    {/* Add column quick header button */}
                    <th className="border border-neutral-300 p-1 bg-[#F9F9F9] text-center min-w-[36px]">
                      <button
                        type="button"
                        onClick={handleAddDateCol}
                        className="w-full py-1 text-neutral-600 hover:text-[#107C41] hover:bg-neutral-200 text-xs font-bold flex items-center justify-center cursor-pointer"
                        title="Add date column"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </th>

                    {/* Row Total Completed */}
                    <th className="border border-neutral-300 p-2 text-center text-xs font-bold text-neutral-800 bg-[#E1DFDD] min-w-[80px]">
                      Done
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {routines.map((routine, rIdx) => {
                    const rowDoneCount = dates.filter(
                      (d) => completions[routine.id]?.[d.dateStr]
                    ).length;
                    const rowPct =
                      dates.length > 0 ? Math.round((rowDoneCount / dates.length) * 100) : 0;

                    return (
                      <tr
                        key={routine.id}
                        className="hover:bg-neutral-50 border-b border-neutral-300"
                      >
                        {/* Routine Name (Editable cell) */}
                        <td className="border border-neutral-300 p-1.5 bg-white sticky left-0 z-10 shadow-[2px_0_0_0_#9CA3AF]">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-mono text-neutral-400 w-5 text-right font-semibold select-none">
                              {rIdx + 1}.
                            </span>
                            <input
                              type="text"
                              value={routine.name}
                              onChange={(e) => handleUpdateRoutineName(routine.id, e.target.value)}
                              className="w-full px-1.5 py-1 text-xs sm:text-sm font-medium text-neutral-900 bg-transparent hover:bg-neutral-100 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#107C41] rounded border border-transparent hover:border-neutral-300"
                              placeholder="Routine name..."
                            />
                            {routines.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleDeleteRoutine(routine.id)}
                                className="p-1 text-neutral-300 hover:text-rose-600 rounded transition-colors"
                                title="Delete routine row"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Date Checkbox Cells -> Box ko click karne pe GREEN ho jaye */}
                        {dates.map((col) => {
                          const isDone = Boolean(completions[routine.id]?.[col.dateStr]);

                          return (
                            <td
                              key={col.id}
                              onClick={() => handleToggleCell(routine.id, col.dateStr)}
                              className={`border border-neutral-300 p-1 text-center cursor-pointer transition-colors select-none ${isDone
                                ? 'bg-[#22C55E] hover:bg-[#16A34A]'
                                : 'bg-white hover:bg-neutral-100'
                                }`}
                              title={`${routine.name} - ${col.dateStr}: Click to toggle green`}
                            >
                              <div className="w-full h-8 sm:h-9 flex items-center justify-center">
                                {isDone ? (
                                  <Check className="w-5 h-5 text-white stroke-[3] drop-shadow-xs" />
                                ) : (
                                  <div className="w-4 h-4 rounded-xs border border-neutral-300/80 bg-neutral-50/50" />
                                )}
                              </div>
                            </td>
                          );
                        })}

                        {/* Empty cell under plus button */}
                        <td className="border border-neutral-300 bg-neutral-50" />

                        {/* Row Done Score */}
                        <td className="border border-neutral-300 p-1.5 text-center font-mono font-bold text-xs bg-[#FAFAFA]">
                          <span className={rowDoneCount > 0 ? 'text-[#107C41]' : 'text-neutral-500'}>
                            {rowDoneCount} / {dates.length}
                          </span>
                          <div className="text-[10px] text-neutral-400 font-normal">
                            ({rowPct}%)
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Bottom Summary Row (Excel Formula SUM Style) */}
                  <tr className="bg-[#EBEBEB] font-bold text-neutral-800 border-t-2 border-neutral-400">
                    <td className="border border-neutral-300 p-2 text-xs text-neutral-900 sticky left-0 z-10 bg-[#E1DFDD] shadow-[2px_0_0_0_#9CA3AF]">
                      <div className="flex items-center justify-between font-bold text-xs">
                        <span>DAILY TOTAL DONE:</span>
                        <span className="text-[10px] font-mono text-neutral-500 font-normal">
                          (Routines)
                        </span>
                      </div>
                    </td>

                    {dates.map((col) => {
                      const dailyDoneCount = routines.filter(
                        (r) => completions[r.id]?.[col.dateStr]
                      ).length;
                      const isAllDone =
                        routines.length > 0 && dailyDoneCount === routines.length;

                      return (
                        <td
                          key={col.id}
                          className={`border border-neutral-300 p-2 text-center font-mono text-xs font-bold ${isAllDone
                            ? 'bg-[#198754] text-white'
                            : dailyDoneCount > 0
                              ? 'text-[#107C41] bg-[#E8F5E9]'
                              : 'text-neutral-500'
                            }`}
                        >
                          {dailyDoneCount}/{routines.length}
                        </td>
                      );
                    })}

                    <td className="border border-neutral-300 bg-[#EBEBEB]" />

                    {/* Grand Total */}
                    <td className="border border-neutral-300 p-2 text-center font-mono font-black text-xs text-[#107C41] bg-[#D1E7DD]">
                      {completedBoxes}/{totalBoxes}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mobile View (Transposed) */}
            <div className="sm:hidden bg-white border-2 border-neutral-400 shadow-md w-full overflow-x-auto">
              <table className="w-full border-collapse text-left border border-neutral-300 select-none">
                <thead>
                  <tr className="bg-[#E6E6E6] text-neutral-800 border-b-2 border-neutral-400 sticky top-0 z-20">
                    <th className="border border-neutral-300 p-2 text-xs font-bold text-neutral-800 min-w-[120px] bg-[#E1DFDD] sticky left-0 z-30 shadow-[2px_0_0_0_#9CA3AF]">
                      <div className="flex items-center justify-between">
                        <span className="font-bold uppercase tracking-wider text-[11px] text-neutral-700">Date</span>
                        <button
                          type="button"
                          onClick={handleAddDateCol}
                          className="text-[11px] text-[#107C41] hover:underline font-bold"
                        >
                          + Date
                        </button>
                      </div>
                    </th>
                    {routines.map((routine, rIdx) => (
                      <th key={routine.id} className="border border-neutral-300 p-1.5 text-center min-w-[140px] bg-[#F2F2F2]">
                        <div className="flex flex-col items-center group relative">
                          <span className="text-[10px] text-neutral-500 font-semibold">{rIdx + 1}.</span>
                          <input
                            type="text"
                            value={routine.name}
                            onChange={(e) => handleUpdateRoutineName(routine.id, e.target.value)}
                            className="w-full px-1 py-0.5 text-xs font-bold font-mono text-neutral-900 bg-transparent text-center focus:outline-hidden"
                            placeholder="Routine..."
                          />
                          {routines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteRoutine(routine.id)}
                              className="text-neutral-400 hover:text-rose-600 p-0.5 mt-1"
                              title="Delete routine"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="border border-neutral-300 p-1 bg-[#F9F9F9] text-center min-w-[36px]">
                      <button
                        type="button"
                        onClick={handleAddRoutine}
                        className="w-full py-1 text-neutral-600 hover:text-[#107C41] hover:bg-neutral-200 text-xs font-bold flex items-center justify-center"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </th>
                    <th className="border border-neutral-300 p-2 text-center text-xs font-bold text-neutral-800 bg-[#E1DFDD] min-w-[60px]">
                      Done
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dates.map((col) => {
                    const header = formatDateHeader(col.dateStr);
                    const isTodayCol = col.dateStr === new Date().toISOString().split('T')[0];
                    const rowDoneCount = routines.filter((r) => completions[r.id]?.[col.dateStr]).length;

                    return (
                      <tr key={col.id} className="hover:bg-neutral-50 border-b border-neutral-300">
                        <td className={`border border-neutral-300 p-1.5 sticky left-0 z-10 shadow-[2px_0_0_0_#9CA3AF] ${isTodayCol ? 'bg-[#D1E7DD]' : 'bg-white'}`}>
                          <div className="flex items-center gap-1 justify-between">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-neutral-500 font-semibold uppercase">{header.dayName}</span>
                              <input
                                type="date"
                                value={col.dateStr}
                                onChange={(e) => handleUpdateDate(col.id, e.target.value)}
                                className={`w-[90px] text-xs font-bold font-mono leading-tight focus:outline-hidden bg-transparent ${isTodayCol ? 'text-[#0F5132]' : 'text-neutral-900'}`}
                              />
                            </div>
                            {dates.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleDeleteDateCol(col.id)}
                                className="p-1 text-neutral-400 hover:text-rose-600 rounded"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </td>
                        {routines.map((routine) => {
                          const isDone = Boolean(completions[routine.id]?.[col.dateStr]);
                          return (
                            <td
                              key={routine.id}
                              onClick={() => handleToggleCell(routine.id, col.dateStr)}
                              className={`border border-neutral-300 p-1 text-center cursor-pointer transition-colors select-none ${isDone ? 'bg-[#22C55E] hover:bg-[#16A34A]' : 'bg-white hover:bg-neutral-100'}`}
                            >
                              <div className="w-full h-9 flex items-center justify-center">
                                {isDone ? (
                                  <Check className="w-5 h-5 text-white stroke-[3] drop-shadow-xs" />
                                ) : (
                                  <div className="w-4 h-4 rounded-xs border border-neutral-300/80 bg-neutral-50/50" />
                                )}
                              </div>
                            </td>
                          );
                        })}
                        <td className="border border-neutral-300 bg-neutral-50" />
                        <td className="border border-neutral-300 p-1.5 text-center font-mono font-bold text-xs bg-[#FAFAFA]">
                          <span className={rowDoneCount > 0 ? 'text-[#107C41]' : 'text-neutral-500'}>
                            {rowDoneCount} / {routines.length}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-[#EBEBEB] font-bold text-neutral-800 border-t-2 border-neutral-400">
                    <td className="border border-neutral-300 p-2 text-xs text-neutral-900 sticky left-0 z-10 bg-[#E1DFDD] shadow-[2px_0_0_0_#9CA3AF]">
                      TOTAL
                    </td>
                    {routines.map((routine) => {
                      const routineDoneCount = dates.filter((d) => completions[routine.id]?.[d.dateStr]).length;
                      return (
                        <td key={routine.id} className="border border-neutral-300 p-2 text-center font-mono text-xs font-bold text-[#107C41]">
                          {routineDoneCount}/{dates.length}
                        </td>
                      );
                    })}
                    <td className="border border-neutral-300 bg-[#EBEBEB]" />
                    <td className="border border-neutral-300 p-2 text-center font-mono font-black text-xs text-[#107C41] bg-[#D1E7DD]">
                      {completedBoxes}/{totalBoxes}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            </>
          )}
        </main>
      </div>

      {/* Simple Excel Status Footer */}

    </div>
  );
}
