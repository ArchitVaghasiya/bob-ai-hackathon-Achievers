import type { ReactNode } from 'react';
import { Zap, AlertTriangle, BatteryWarning, Users } from 'lucide-react';
import { cn } from '../utils';
import { type Asset } from '../data/mockData';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  alert?: boolean;
}

function StatCard({ title, value, icon, trend, trendUp, alert }: StatCardProps) {
  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-textMuted">{title}</span>
        <div className={cn("p-2 rounded-lg bg-slate-100", alert ? "text-danger" : "text-primary")}>
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold">{value}</span>
        {trend && (
          <span className={cn("text-xs font-medium", trendUp ? "text-danger" : "text-success")}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

interface StatsBarProps {
  assets: Asset[];
  availableCrews: number;
  totalCrews: number;
}

export function StatsBar({ assets, availableCrews, totalCrews }: StatsBarProps) {
  const criticalCount = assets.filter(a => a.anomalyStatus === 'Anomaly' || a.riskIndex >= 80).length;
  
  // Calculate fake capacity based on high risk assets
  const highRiskCount = assets.filter(a => a.riskIndex >= 60).length;
  const atRiskCapacity = assets.length > 0 ? Math.round((highRiskCount / assets.length) * 100) : 0;
  
  const deployedCrews = totalCrews - availableCrews;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard 
        title="Total Substation Assets" 
        value={assets.length.toLocaleString()} 
        icon={<Zap className="w-5 h-5" />} 
        trend="Live Monitored"
        trendUp={false}
      />
      <StatCard 
        title="Active Critical Alerts" 
        value={criticalCount} 
        icon={<AlertTriangle className="w-5 h-5" />} 
        alert={criticalCount > 0} 
        trend={criticalCount > 0 ? "Requires Attention" : "All Clear"}
        trendUp={criticalCount > 0}
      />
      <StatCard 
        title="At-Risk Grid Capacity" 
        value={`${atRiskCapacity}%`} 
        icon={<BatteryWarning className="w-5 h-5" />} 
        trend={atRiskCapacity > 20 ? "High Stress Level" : "Normal Load"}
        trendUp={atRiskCapacity > 20}
      />
      <StatCard 
        title="Pre-positioned Crews" 
        value={`${deployedCrews} / ${totalCrews}`} 
        icon={<Users className="w-5 h-5" />} 
        trend={`${availableCrews} available`}
        trendUp={availableCrews === 0}
      />
    </div>
  );
}
