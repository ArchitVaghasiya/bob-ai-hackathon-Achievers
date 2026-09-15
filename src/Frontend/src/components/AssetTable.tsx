import { useState, useMemo } from 'react';
import { Search, MapPin, Send, CheckCircle2, Users } from 'lucide-react';
import { type Asset } from '../data/mockData';
import { cn } from '../utils';

interface AssetTableProps {
  assets: Asset[];
  onSelectAsset: (asset: Asset) => void;
  selectedAssetId?: string;
  onDispatchAsset: (assetId: string, assetName: string) => void;
}

export function AssetTable({ assets, onSelectAsset, selectedAssetId, onDispatchAsset }: AssetTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState<'All' | 'Critical' | 'Elevated' | 'Stable'>('All');
  const [filterArea, setFilterArea] = useState<string>('All');

  // Extract unique areas from substation names (e.g., "Northside Alpha" -> "Northside")
  const uniqueAreas = useMemo(() => {
    const areas = new Set<string>();
    assets.forEach(a => {
      const parts = a.substation.split(' ');
      if (parts.length > 1) {
        // Assume the last word is the suffix (Alpha, Hub, etc), and the rest is the Area
        areas.add(parts.slice(0, -1).join(' '));
      } else {
        areas.add(a.substation);
      }
    });
    return Array.from(areas).sort();
  }, [assets]);

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.substation.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTier =
      filterTier === 'All' ? true :
        filterTier === 'Critical' ? asset.riskIndex >= 80 :
          filterTier === 'Elevated' ? asset.riskIndex >= 40 && asset.riskIndex < 80 :
            filterTier === 'Stable' ? asset.riskIndex < 40 : true;

    let matchesArea = true;
    if (filterArea !== 'All') {
      const parts = asset.substation.split(' ');
      const area = parts.length > 1 ? parts.slice(0, -1).join(' ') : asset.substation;
      matchesArea = area === filterArea;
    }

    return matchesSearch && matchesTier && matchesArea;
  }).sort((a, b) => b.riskIndex - a.riskIndex);

  const getRiskColor = (index: number) => {
    if (index >= 80) return 'bg-danger';
    if (index >= 40) return 'bg-warning';
    return 'bg-success';
  };

  const getRiskTrackColor = (index: number) => {
    if (index >= 80) return 'bg-danger/20';
    if (index >= 40) return 'bg-warning/20';
    return 'bg-success/20';
  };

  const handleDispatch = (e: React.MouseEvent<HTMLButtonElement>, asset: Asset) => {
    e.stopPropagation(); // Prevent row selection
    onDispatchAsset(asset.id, asset.substation);
  };

  return (
    <div className="card flex flex-col h-full overflow-hidden">
      <div className="p-5 border-b border-border bg-slate-50">
        <h2 className="text-lg font-semibold mb-4">Prioritised Maintenance & Crew Pre-positioning Plan</h2>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
            <input
              type="text"
              placeholder="Search by Substation Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-md py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-text"
            />
          </div>
          
          <select
            value={filterArea}
            onChange={(e) => setFilterArea(e.target.value)}
            className="bg-white border border-slate-200 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text appearance-none pr-8 cursor-pointer min-w-[140px]"
          >
            <option value="All">All Areas</option>
            {uniqueAreas.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
          
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value as any)}
            className="bg-white border border-slate-200 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text appearance-none pr-8 cursor-pointer"
          >
            <option value="All">All Risk Tiers</option>
            <option value="Critical">Critical</option>
            <option value="Elevated">Elevated</option>
            <option value="Stable">Stable</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-slate-100 text-textMuted sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 font-medium">Asset Details</th>
              <th className="px-6 py-4 font-medium">Grid Risk Priority Index</th>
              <th className="px-6 py-4 font-medium">Status & Threat</th>
              <th className="px-6 py-4 font-medium">Customers Impacted</th>
              <th className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredAssets.map((asset) => (
              <tr
                key={asset.id}
                onClick={() => onSelectAsset(asset)}
                className={cn(
                  "hover:bg-slate-50 cursor-pointer transition-colors group",
                  selectedAssetId === asset.id ? "bg-slate-50 border-l-2 border-l-primary" : "border-l-2 border-l-transparent"
                )}
              >
                <td className="px-6 py-4">
                  <div className="font-semibold text-text mb-1">{asset.id}</div>
                  <div className="text-textMuted flex items-center gap-1.5 text-xs mb-1">
                    <MapPin className="w-3 h-3" />
                    {asset.substation}
                  </div>
                </td>
                <td className="px-6 py-4 w-48">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium">Score: {asset.riskIndex} / 100</span>
                  </div>
                  <div className={cn("w-full h-2 rounded-full overflow-hidden", getRiskTrackColor(asset.riskIndex))}>
                    <div
                      className={cn("h-full rounded-full", getRiskColor(asset.riskIndex))}
                      style={{ width: `${asset.riskIndex}%` }}
                    ></div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-2 items-start">
                    <span className={cn("badge", asset.anomalyStatus === 'Anomaly' ? "badge-danger" : "badge-success")}>
                      {asset.anomalyStatus}
                    </span>
                    <span className={cn("badge",
                      asset.weatherThreat === 'Extreme Heat' ? "badge-danger" :
                        asset.weatherThreat === 'High Wind' ? "badge-warning" : "badge-neutral"
                    )}>
                      {asset.weatherThreat}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-textMuted">
                    <Users className="w-4 h-4" />
                    <span className="font-medium text-text">{asset.customersImpacted.toLocaleString()}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={(e) => handleDispatch(e, asset)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-opacity-90 text-white rounded-md transition-colors text-xs font-medium shadow-sm active:scale-95 whitespace-nowrap"
                  >
                    <Send className="w-3 h-3" />
                    Pre-position Crew
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredAssets.length === 0 && (
          <div className="p-8 text-center text-textMuted">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No assets found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
