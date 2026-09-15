import { Clock, MapPin, CheckCircle, HardHat, AlertCircle } from 'lucide-react';
import { cn } from '../utils';

export interface DispatchedCrew {
  id: string;
  assetId: string;
  assetName: string;
  dispatchedAt: Date;
  status: 'In Progress' | 'Arriving' | 'Working';
}

interface CrewManagementProps {
  crews: DispatchedCrew[];
  onFreeCrew: (crewId: string) => void;
}

export function CrewManagement({ crews, onFreeCrew }: CrewManagementProps) {
  if (crews.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-textMuted bg-surface rounded-xl border border-border shadow-sm p-10 h-full">
        <HardHat className="w-16 h-16 mb-4 opacity-20" />
        <h2 className="text-xl font-semibold mb-2">No Active Crews</h2>
        <p className="max-w-md text-center">All crews are currently available at the depot. Dispatch crews from the Grid Dashboard when critical anomalies are detected.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-surface rounded-xl border border-border shadow-sm overflow-hidden h-full">
      <div className="p-6 border-b border-border bg-slate-50">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <HardHat className="w-5 h-5 text-primary" />
          Active Field Deployments
        </h2>
        <p className="text-sm text-textMuted mt-1">Manage deployed crews and mark maintenance operations as complete.</p>
      </div>
      
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {crews.map((crew) => (
            <div key={crew.id} className="card p-5 flex flex-col gap-4 border-l-4 border-l-amber-500 hover:-translate-y-1 transition-transform">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold uppercase text-amber-600 tracking-wider flex items-center gap-1.5 mb-1">
                    <AlertCircle className="w-3 h-3" /> {crew.status}
                  </span>
                  <h3 className="font-semibold text-lg">{crew.id}</h3>
                </div>
                <div className="p-2 bg-slate-100 rounded-full">
                  <HardHat className="w-5 h-5 text-textMuted" />
                </div>
              </div>
              
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-textMuted mt-0.5 shrink-0" />
                  <div>
                    <span className="text-textMuted block text-xs">Assigned Substation</span>
                    <span className="font-medium text-text">{crew.assetName} <span className="text-textMuted font-normal">({crew.assetId})</span></span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-textMuted shrink-0" />
                  <div>
                    <span className="text-textMuted block text-xs">Time Dispatched</span>
                    <span className="font-medium text-text">{crew.dispatchedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-border">
                <button
                  onClick={() => onFreeCrew(crew.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md transition-colors font-medium text-sm border border-emerald-200"
                >
                  <CheckCircle className="w-4 h-4" />
                  Complete Work & Free Crew
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
