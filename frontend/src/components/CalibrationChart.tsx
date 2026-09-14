import React, { useEffect, useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { apiService } from '../services/api';
import { AUTH_TOKEN_KEY } from '../constants/auth';

export const CalibrationChart: React.FC = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const response = await fetch(`${baseUrl}/admin/calibration`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });
        const resData = await response.json();
        setData(resData);
      } catch (err) {
        console.error('Failed to load calibration data', err);
      }
    }
    loadData();
  }, []);

  const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  if (data.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
      <h3 className="font-bold text-slate-900 text-sm">AI Confidence vs. Override Calibration</h3>
      <p className="text-[11px] text-slate-500">
        Scatter plot of AI confidence (X) against human override (Y = 1).
      </p>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
            <CartesianGrid />
            <XAxis type="number" dataKey="ai_confidence" name="Confidence" unit="%" />
            <YAxis type="number" dataKey="overridden" name="Overridden" domain={[0, 1]} tickCount={2} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Calibration" data={data}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
