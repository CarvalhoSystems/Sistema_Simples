import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Formata os valores do eixo Y (vertical) como moeda
const formatCurrency = (value) => `R$${value.toFixed(0)}`;

// Formata o conteúdo da caixa de informações (tooltip)
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-slate-300 rounded shadow-lg">
        <p className="font-bold">{`Data: ${label}`}</p>
        <p className="text-blue-600">{`Total: R$ ${payload[0].value.toFixed(2)}`}</p>
      </div>
    );
  }
  return null;
};

export default function SalesChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="name" stroke="#555" />
        <YAxis tickFormatter={formatCurrency} stroke="#555" />
        <Tooltip content={<CustomTooltip />} />
        <Line type="monotone" dataKey="Total" stroke="#1e3a8a" strokeWidth={2} activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}