import { History, CheckCircle, Clock, MapPin, Wrench } from 'lucide-react';
import { cn } from '../utils';

export interface CompletedJob {
  crewId: string;
  assetId: string;
  assetName: string;
  dispatchedAt: Date;
  completedAt: Date;
}

interface CompletedWorkProps {
  jobs: CompletedJob[];
}

export function CompletedWork({ jobs }: CompletedWorkProps) {
  if (jobs.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-textMuted bg-surface rounded-xl border border-border shadow-sm p-10 h-full">
        <History className="w-16 h-16 mb-4 opacity-20" />
        <h2 className="text-xl font-semibold mb-2">No Completed Work Yet</h2>
        <p className="max-w-md text-center">Historical logs of completed maintenance will appear here once crews finish their field deployments.</p>
      </div>
    );
  }

  // Calculate duration string e.g. "45 mins" or "1h 15m"
  const getDuration = (start: Date, end: Date) => {
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${Math.max(1, diffMins)} mins`;
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="flex-1 flex flex-col bg-surface rounded-xl border border-border shadow-sm overflow-hidden h-full">
      <div className="p-6 border-b border-border bg-slate-50 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Completed Work History
          </h2>
          <p className="text-sm text-textMuted mt-1">Immutable log of resolved grid anomalies and completed maintenance operations.</p>
        </div>
        <div className="bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold text-text">{jobs.length} Jobs Completed</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-slate-100 text-textMuted sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 font-medium">Crew ID</th>
              <th className="px-6 py-4 font-medium">Substation Maintained</th>
              <th className="px-6 py-4 font-medium">Time Dispatched</th>
              <th className="px-6 py-4 font-medium">Time Completed</th>
              <th className="px-6 py-4 font-medium">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {jobs.slice().reverse().map((job, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-primary" />
                    {job.crewId}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-text">{job.assetName}</div>
                  <div className="text-textMuted flex items-center gap-1 mt-0.5 text-xs">
                    <MapPin className="w-3 h-3" />
                    {job.assetId}
                  </div>
                </td>
                <td className="px-6 py-4 text-textMuted">
                  {job.dispatchedAt.toLocaleDateString()} {job.dispatchedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    {job.completedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-text">
                  <div className="flex items-center gap-1.5 text-slate-600 bg-slate-100 w-fit px-2.5 py-1 rounded-md">
                    <Clock className="w-3.5 h-3.5" />
                    {getDuration(job.dispatchedAt, job.completedAt)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
