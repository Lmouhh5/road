import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";

interface Props {
  data: { i: number; v: number }[];
  color?: string; // hsl variable name without var()
  height?: number;
}

export function Sparkline({ data, color = "primary", height = 32 }: Props) {
  return (
    <div style={{ height, width: 96 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 2, left: 2, bottom: 2 }}>
          <YAxis hide domain={["dataMin - 2", "dataMax + 2"]} />
          <Line
            type="monotone"
            dataKey="v"
            stroke={`hsl(var(--${color}))`}
            strokeWidth={2}
            dot={false}
            isAnimationActive
            animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}