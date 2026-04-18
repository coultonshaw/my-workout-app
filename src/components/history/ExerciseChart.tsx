import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { WorkoutSession } from '@/types';
import { formatDate } from '@/utils/formatters';

interface ExerciseChartProps {
  exerciseId: string;
  sessions: WorkoutSession[];
}

export function ExerciseChart({ exerciseId, sessions }: ExerciseChartProps) {
  const data = sessions
    .filter((s) => s.completedAt)
    .map((s) => {
      const log = s.exercises.find((l) => l.exerciseId === exerciseId);
      if (!log || log.sets.length === 0) return null;
      const maxWeight = Math.max(...log.sets.map((set) => set.weight));
      const avgReps = log.sets.reduce((a, b) => a + b.reps, 0) / log.sets.length;
      return {
        date: formatDate(s.startedAt),
        weight: maxWeight,
        reps: parseFloat(avgReps.toFixed(1)),
      };
    })
    .filter(Boolean)
    .reverse()
    .slice(-12);

  if (data.length < 2) {
    return (
      <div className="h-32 flex items-center justify-center text-gray-500 text-sm">
        Need at least 2 sessions to show progress
      </div>
    );
  }

  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#6b7280', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: '#141414', border: '1px solid #1e1e1e', borderRadius: 12 }}
            labelStyle={{ color: '#9ca3af', fontSize: 11 }}
            itemStyle={{ color: '#f59e0b' }}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ fill: '#f59e0b', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
