"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format";

type ChartCardProps = {
  title: string;
  description: string;
  data: Record<string, number | string>[];
  dataKey: string;
  xKey: string;
  type: "area" | "bar";
  color?: string;
  valueFormat?: "currency" | "number";
};

export function ChartCard({
  title,
  description,
  data,
  dataKey,
  xKey,
  type,
  color = "#0f766e",
  valueFormat = "currency",
}: ChartCardProps) {
  const Chart = type === "area" ? AreaChart : BarChart;
  const valueFormatter = (value: number) => (valueFormat === "number" ? value.toString() : formatCurrency(value));
  const axisFormatter = (value: number) => {
    if (valueFormat === "number") {
      return value.toString();
    }

    const absoluteValue = Math.abs(value);
    if (absoluteValue >= 1000) {
      const compact = `${(value / 1000).toFixed(1)}k`.replace(".0k", "k");
      return value < 0 ? `-$${compact.slice(1)}` : `$${compact}`;
    }

    return formatCurrency(value);
  };

  return (
    <Card>
      <div>
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <div className="mt-5 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <Chart data={data} margin={{ top: 8, right: 12, left: 16, bottom: 8 }}>
            <CartesianGrid stroke="rgba(148, 163, 184, 0.2)" vertical={false} />
            <XAxis dataKey={xKey} tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
            <YAxis
              width={72}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#475569", fontSize: 12 }}
              tickMargin={10}
              tickFormatter={(value) => (typeof value === "number" ? axisFormatter(value) : value)}
            />
            <Tooltip
              formatter={(value: number) => valueFormatter(value)}
              contentStyle={{
                borderRadius: "16px",
                border: "1px solid rgba(148, 163, 184, 0.25)",
                background: "#fffaf0",
              }}
            />
            {type === "area" ? (
              <Area type="monotone" dataKey={dataKey} stroke={color} fill={color} fillOpacity={0.16} strokeWidth={3} />
            ) : (
              <Bar dataKey={dataKey} fill={color} radius={[8, 8, 0, 0]} />
            )}
          </Chart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
