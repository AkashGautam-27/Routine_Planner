import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  Flame,
  CheckCircle2,
  Calendar,
  Target,
  AlertCircle
} from 'lucide-react';

interface RoutineRow {
  id: string;
  name: string;
}

interface DateCol {
  id: string;
  dateStr: string;
}

interface VisualAnalyticsProps {
  routines: RoutineRow[];
  dates: DateCol[];
  completions: Record<string, Record<string, boolean>>;
}

export const VisualAnalytics: React.FC<VisualAnalyticsProps> = ({
  routines,
  dates,
  completions,
}) => {
  const totalRoutines = routines.length;
  const totalDates = dates.length;
  const totalBoxes = totalRoutines * totalDates;

  // Total completed check-ins
  let totalDone = 0;
  routines.forEach((r) => {
    dates.forEach((d) => {
      if (completions[r.id]?.[d.dateStr]) {
        totalDone++;
      }
    });
  });

  const overallPct = totalBoxes > 0 ? Math.round((totalDone / totalBoxes) * 100) : 0;

  // Calculate stats per routine
  const routineStats = routines.map((r) => {
    const doneCount = dates.filter((d) => completions[r.id]?.[d.dateStr]).length;
    const pct = totalDates > 0 ? Math.round((doneCount / totalDates) * 100) : 0;
    return {
      id: r.id,
      name: r.name,
      doneCount,
      totalCount: totalDates,
      pct,
    };
  });

  // Sort routines by completion rate
  const sortedRoutines = [...routineStats].sort((a, b) => b.pct - a.pct);
  const bestRoutine = sortedRoutines[0];
  const lowestRoutine = sortedRoutines[sortedRoutines.length - 1];

  // Calculate stats per date (Daily completion)
  const dailyStats = dates.map((col) => {
    const doneCount = routines.filter((r) => completions[r.id]?.[col.dateStr]).length;
    const pct = totalRoutines > 0 ? Math.round((doneCount / totalRoutines) * 100) : 0;
    const [year, month, day] = col.dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayLabel = dateObj.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
    const shortLabel = `${day}`;

    return {
      id: col.id,
      dateStr: col.dateStr,
      dayLabel,
      shortLabel,
      doneCount,
      totalCount: totalRoutines,
      pct,
    };
  });

  // Calculate current & longest streak (dates where >= 50% routines were completed)
  let currentStreak = 0;
  let longestStreak = 0;
  let running = 0;

  dailyStats.forEach((d) => {
    if (d.pct > 0) {
      running++;
      if (running > longestStreak) longestStreak = running;
    } else {
      running = 0;
    }
  });

  for (let i = dailyStats.length - 1; i >= 0; i--) {
    if (dailyStats[i].pct > 0) {
      currentStreak++;
    } else if (currentStreak > 0) {
      break;
    }
  }

  // Today's stats
  const todayISO = new Date().toISOString().split('T')[0];
  const todayStat = dailyStats.find((d) => d.dateStr === todayISO);

  return (
    <div className="space-y-5">
      {/* 4 Key Visual Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Overall Completion */}
        <div className="bg-white border-2 border-neutral-300 p-4 rounded-lg shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">Overall Progress</span>
            <CheckCircle2 className="w-4 h-4 text-[#107C41]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-neutral-900 tabular-nums">
              {overallPct}%
            </span>
            <span className="text-xs text-neutral-500 font-mono">
              ({totalDone}/{totalBoxes})
            </span>
          </div>
          <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden mt-3">
            <div
              className="bg-[#107C41] h-full rounded-full transition-all duration-500"
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>

        {/* Card 2: Streak */}
        <div className="bg-white border-2 border-neutral-300 p-4 rounded-lg shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">Consistency Streak</span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-neutral-900 tabular-nums">
              {currentStreak}
            </span>
            <span className="text-xs text-neutral-500">
              Days Active
            </span>
          </div>
          <div className="text-[11px] text-neutral-500 mt-2">
            Best streak: <strong className="text-neutral-800 font-mono">{longestStreak} days</strong>
          </div>
        </div>

        {/* Card 3: Top Performing Habit */}
        <div className="bg-white border-2 border-neutral-300 p-4 rounded-lg shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">Top Routine</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-sm font-bold text-neutral-900 truncate" title={bestRoutine?.name}>
              {bestRoutine ? bestRoutine.name : 'N/A'}
            </div>
            <div className="text-xs text-[#107C41] font-mono font-bold mt-0.5">
              {bestRoutine?.pct || 0}% Completion ({bestRoutine?.doneCount || 0}/{totalDates} days)
            </div>
          </div>
          <div className="text-[11px] text-neutral-400 mt-2">
            Most consistent habit
          </div>
        </div>

        {/* Card 4: Routine Needing Focus */}
        <div className="bg-white border-2 border-neutral-300 p-4 rounded-lg shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">Needs Focus</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="text-sm font-bold text-neutral-900 truncate" title={lowestRoutine?.name}>
              {lowestRoutine ? lowestRoutine.name : 'N/A'}
            </div>
            <div className="text-xs text-amber-700 font-mono font-bold mt-0.5">
              {lowestRoutine?.pct || 0}% Completion ({lowestRoutine?.doneCount || 0}/{totalDates} days)
            </div>
          </div>
          <div className="text-[11px] text-neutral-400 mt-2">
            Lowest completion rate
          </div>
        </div>
      </div>

      {/* Visual Chart 1: Daily Completion Trend (Bar Chart) */}
      <div className="bg-white border-2 border-neutral-300 rounded-lg p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#107C41]" />
            <h3 className="font-bold text-sm text-neutral-900 uppercase tracking-wide">
              Daily Completion Trend (%)
            </h3>
          </div>
          <span className="text-xs text-neutral-500 font-mono">
            {dates.length} Days Visualized
          </span>
        </div>

        {/* Bar Chart Visualization */}
        <div className="w-full overflow-x-auto pb-2">
          <div className="flex items-end gap-1.5 sm:gap-2 h-44 pt-6 min-w-max border-b-2 border-neutral-300 px-1">
            {dailyStats.map((d) => {
              const isToday = d.dateStr === todayISO;
              const barHeightPct = Math.max(d.pct, 4); // minimum visible height

              return (
                <div
                  key={d.id}
                  className="flex flex-col items-center group relative cursor-pointer min-w-[32px] sm:min-w-[36px]"
                >
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-neutral-900 text-white text-[10px] px-2 py-1 rounded shadow-md pointer-events-none z-30 whitespace-nowrap">
                    {d.dayLabel}: {d.doneCount}/{d.totalCount} ({d.pct}%)
                  </div>

                  {/* Percentage label on top of bar */}
                  <span className="text-[10px] font-mono font-bold text-neutral-600 mb-1">
                    {d.pct}%
                  </span>

                  {/* Visual Bar */}
                  <div className="w-full bg-neutral-100 rounded-t h-32 flex items-end">
                    <div
                      className={`w-full rounded-t transition-all duration-300 ${d.pct >= 100
                        ? 'bg-[#107C41]'
                        : d.pct >= 60
                          ? 'bg-[#22C55E]'
                          : d.pct > 0
                            ? 'bg-amber-400'
                            : 'bg-neutral-200'
                        }`}
                      style={{ height: `${barHeightPct}%` }}
                    />
                  </div>

                  {/* Date label at bottom */}
                  <span
                    className={`text-[10px] font-mono mt-1 font-semibold ${isToday ? 'text-[#107C41] font-black underline' : 'text-neutral-500'
                      }`}
                  >
                    {d.shortLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-[#107C41] rounded-xs inline-block" /> 100% Done
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-[#22C55E] rounded-xs inline-block" /> 60-99% Done
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-amber-400 rounded-xs inline-block" /> 1-59% Done
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-neutral-200 rounded-xs inline-block" /> 0% Done
            </span>
          </div>

        </div>
      </div>

      {/* Visual Chart 2: Routine-by-Routine Performance Comparison (Horizontal Progress Bars) */}
      <div className="bg-white border-2 border-neutral-300 rounded-lg p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#107C41]" />
            <h3 className="font-bold text-sm text-neutral-900 uppercase tracking-wide">
              Routine Consistency Breakdown
            </h3>
          </div>
          <span className="text-xs text-neutral-500">Ranked by completion</span>
        </div>

        <div className="space-y-3">
          {sortedRoutines.map((r, index) => (
            <div key={r.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 max-w-[70%] truncate">
                  <span className="font-mono text-neutral-400 w-4 font-bold">
                    {index + 1}.
                  </span>
                  <span className="font-semibold text-neutral-900 truncate">
                    {r.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-neutral-500 font-normal">
                    {r.doneCount}/{r.totalCount} days
                  </span>
                  <span className="font-bold text-[#107C41] w-12 text-right">
                    {r.pct}%
                  </span>
                </div>
              </div>

              {/* Horizontal Bar */}
              <div className="w-full bg-neutral-100 h-3 rounded-full overflow-hidden border border-neutral-200">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${r.pct >= 80
                    ? 'bg-[#107C41]'
                    : r.pct >= 50
                      ? 'bg-[#22C55E]'
                      : r.pct >= 20
                        ? 'bg-amber-500'
                        : 'bg-rose-400'
                    }`}
                  style={{ width: `${r.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
