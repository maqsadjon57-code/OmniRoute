"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TimeBucket } from "@/lib/analytics";

export function TokensChart({ data }: { data: TimeBucket[] }) {
  const formatted = data.map((d) => ({ ...d, label: d.label.slice(5) }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={formatted}>
        <defs>
          <linearGradient id="tokens" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
        <XAxis dataKey="label" fontSize={11} stroke="currentColor" />
        <YAxis fontSize={11} stroke="currentColor" />
        <Tooltip />
        <Area type="monotone" dataKey="tokensIn" name="Input tokens" stroke="#7c3aed" fill="url(#tokens)" />
        <Area type="monotone" dataKey="tokensOut" name="Output tokens" stroke="#2563eb" fill="url(#tokens)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CostChart({ data }: { data: TimeBucket[] }) {
  const formatted = data.map((d) => ({ ...d, label: d.label.slice(5) }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={formatted}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
        <XAxis dataKey="label" fontSize={11} stroke="currentColor" />
        <YAxis fontSize={11} stroke="currentColor" />
        <Tooltip />
        <Bar dataKey="cost" name="Cost $" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ProviderPie({ data }: { data: { provider: string; tokensIn: number; tokensOut: number; cost: number; savings: number }[] }) {
  const colors = ["#7c3aed", "#2563eb", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#8b5cf6"];
  const formatted = data.slice(0, 8).map((d) => ({ name: d.provider, value: d.tokensIn + d.tokensOut }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={formatted} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
          {formatted.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
        </Pie>
        <Legend />
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
