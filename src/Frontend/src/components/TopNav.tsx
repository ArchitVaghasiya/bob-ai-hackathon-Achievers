import { Activity, RefreshCw, LayoutDashboard, Users, History, Plus } from 'lucide-react';
import { cn } from '../utils';

interface TopNavProps {
  onRefresh?: () => void;
  activeView: 'dashboard' | 'crews' | 'history';
  onViewChange: (view: 'dashboard' | 'crews' | 'history') => void;
  onAddAsset?: () => void;
}

export function TopNav({ onRefresh, activeView, onViewChange, onAddAsset }: TopNavProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-surface border-b border-border shadow-sm">
      <div className="flex items-center gap-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Activity className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-text">GridPulse <span className="text-primary">AI</span></h1>
        </div>
        
        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => onViewChange('dashboard')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
              activeView === 'dashboard' ? "bg-white text-primary shadow-sm" : "text-textMuted hover:text-text hover:bg-white/50"
            )}
          >
            <LayoutDashboard className="w-4 h-4" />
            Grid Dashboard
          </button>
          <button
            onClick={() => onViewChange('crews')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
              activeView === 'crews' ? "bg-white text-primary shadow-sm" : "text-textMuted hover:text-text hover:bg-white/50"
            )}
          >
            <Users className="w-4 h-4" />
            Active Crews
          </button>
          <button
            onClick={() => onViewChange('history')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
              activeView === 'history' ? "bg-white text-primary shadow-sm" : "text-textMuted hover:text-text hover:bg-white/50"
            )}
          >
            <History className="w-4 h-4" />
            Work History
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-6">
        {onAddAsset && (
          <button 
            onClick={onAddAsset}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Transformer
          </button>
        )}
        
        {onRefresh && (
          <button 
            onClick={onRefresh}
            title="Refresh Live Data"
            className="p-2 text-textMuted hover:text-primary hover:bg-primary/5 rounded-full transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        )}
        
        {/* Dummy Profile */}
        <div className="flex items-center gap-3 border-l border-border pl-6">
          <div className="text-right">
            <div className="text-sm font-bold text-text">Diksh T.</div>
            <div className="text-xs text-textMuted">Lead Dispatcher</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-sm">
            DT
          </div>
        </div>
      </div>
    </header>
  );
}
