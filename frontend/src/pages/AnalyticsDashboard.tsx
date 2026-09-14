import React, { useEffect, useState } from 'react';
import { apiService, getApiBaseUrl } from '../services/api';
import { AUTH_TOKEN_KEY } from '../constants/auth';
import { Target, TrendingUp, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

export const AnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const baseUrl = getApiBaseUrl();
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const response = await fetch(`${baseUrl}/analytics/overview`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });
        const data = await response.json();
        setAnalyticsData(data);
      } catch (err) {
        console.error('Failed to load analytics data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading Analytics...</div>;
  }

  if (!analyticsData) {
    return <div className="p-8 text-center text-slate-500">Analytics Data Unavailable</div>;
  }

  const { kpi, status_distribution, verification_method_split, avg_confidence_over_time, common_non_compliance_reasons } = analyticsData;

  const pieData = [
    { name: 'Deterministic', value: verification_method_split.deterministic },
    { name: 'LLM Reasoning', value: verification_method_split.llm_reasoning }
  ];
  const COLORS = ['#3b82f6', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-slate-900">System Analytics & Accuracy Engine</h1>
        <p className="text-sm text-slate-500">Real-time aggregate analytics across all evaluated bids.</p>
      </div>

      {/* (e) KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total Tenders</span>
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{kpi.total_tenders}</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Bids Evaluated</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-700">{kpi.total_bids_evaluated}</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>System Pass Rate</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-extrabold text-purple-700">{kpi.system_pass_rate}%</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Avg Time to Decision</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-amber-700">{kpi.avg_time_to_decision_hrs} hrs</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* (a) Stacked Bar Chart */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-96">
          <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">Compliance by Category</h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={status_distribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="category" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="COMPLIANT" stackId="a" fill="#10b981" />
              <Bar dataKey="PARTIALLY_COMPLIANT" stackId="a" fill="#f59e0b" />
              <Bar dataKey="NON_COMPLIANT" stackId="a" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* (b) Donut Chart */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-96">
          <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">Verification Method Split</h2>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={80}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* (c) Line Chart */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-96">
          <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">Avg Confidence Over Time</h2>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={avg_confidence_over_time} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <RechartsTooltip />
              <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* (d) Horizontal Bar Chart */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-96">
          <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">Common Non-Compliance Reasons</h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={common_non_compliance_reasons} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis dataKey="reason" type="category" width={150} tick={{ fontSize: 11 }} />
              <RechartsTooltip />
              <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
