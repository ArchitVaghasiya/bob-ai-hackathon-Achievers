import { useState, useEffect } from 'react';
import { TopNav } from './components/TopNav';
import { StatsBar } from './components/StatsBar';
import { AssetTable } from './components/AssetTable';
import { AssetInsights } from './components/AssetInsights';
import { CrewManagement, type DispatchedCrew } from './components/CrewManagement';
import { CompletedWork, type CompletedJob } from './components/CompletedWork';
import { AddAssetModal } from './components/AddAssetModal';
import { type Asset } from './data/mockData';
import { fetchLivePredictions } from './api';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { LoadingScreen } from './components/LoadingScreen';

const TOTAL_CREWS = 12;

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<'dashboard' | 'crews' | 'history'>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [alertInfo, setAlertInfo] = useState<{ message: string, type: 'success' | 'warning' } | null>(null);
  
  const [availableCrews, setAvailableCrews] = useState(TOTAL_CREWS);
  const [dispatchedCrews, setDispatchedCrews] = useState<DispatchedCrew[]>([]);
  const [completedWork, setCompletedWork] = useState<CompletedJob[]>([]);

  const loadData = () => {
    setIsLoading(true);
    fetchLivePredictions().then(data => {
      setAssets(data);
      if (data.length > 0) {
        setSelectedAsset(data[0]);
      }
      setIsLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDispatchAsset = (assetId: string, assetName: string) => {
    if (availableCrews <= 0) {
      setAlertInfo({ 
        message: "No crews available! Please wait for crews to return from field deployment.", 
        type: 'warning' 
      });
      setTimeout(() => setAlertInfo(null), 4000);
      return;
    }

    // Success logic
    const crewId = `Crew-${Math.floor(Math.random() * 900) + 100}`;
    setDispatchedCrews(prev => [
      { id: crewId, assetId, assetName, dispatchedAt: new Date(), status: 'In Progress' },
      ...prev
    ]);
    
    setAvailableCrews(prev => prev - 1);
    setAssets(prev => prev.filter(a => a.id !== assetId));
    
    // Select a new asset if the selected one was dispatched
    if (selectedAsset?.id === assetId) {
      const remaining = assets.filter(a => a.id !== assetId);
      setSelectedAsset(remaining.length > 0 ? remaining[0] : null);
    }
    
    setAlertInfo({ 
      message: `${crewId} Dispatched to ${assetName}. See 'Active Crews' tab.`, 
      type: 'success' 
    });
    setTimeout(() => setAlertInfo(null), 4000);
  };

  const handleFreeCrew = (crewId: string) => {
    const crewToFree = dispatchedCrews.find(c => c.id === crewId);
    
    if (crewToFree) {
      // Add to completed work history
      setCompletedWork(prev => [...prev, {
        crewId: crewToFree.id,
        assetId: crewToFree.assetId,
        assetName: crewToFree.assetName,
        dispatchedAt: crewToFree.dispatchedAt,
        completedAt: new Date()
      }]);
    }

    setDispatchedCrews(prev => prev.filter(c => c.id !== crewId));
    setAvailableCrews(prev => Math.min(TOTAL_CREWS, prev + 1));
    setAlertInfo({ message: `${crewId} has completed work and returned to base!`, type: 'success' });
    setTimeout(() => setAlertInfo(null), 4000);
  };

  return (
    <>
      {isLoading && <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />}
      
      <div className={`min-h-screen bg-background flex flex-col transition-opacity duration-1000 ${isLoading ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
        <TopNav 
          onRefresh={loadData} 
          activeView={activeView} 
          onViewChange={setActiveView} 
          onAddAsset={() => setIsAddModalOpen(true)}
        />
      
      <main className="flex-1 p-6 overflow-hidden flex flex-col">
        <StatsBar 
          assets={assets}
          availableCrews={availableCrews}
          totalCrews={TOTAL_CREWS}
        />
        
        {activeView === 'dashboard' ? (
          <div className="flex-1 flex gap-6 min-h-0">
            <div className="w-[60%] flex flex-col min-h-0">
              <AssetTable 
                assets={assets}
                onSelectAsset={setSelectedAsset} 
                selectedAssetId={selectedAsset?.id}
                onDispatchAsset={handleDispatchAsset}
              />
            </div>
            <div className="w-[40%] flex flex-col min-h-0">
              <AssetInsights asset={selectedAsset} />
            </div>
          </div>
        ) : activeView === 'crews' ? (
          <CrewManagement crews={dispatchedCrews} onFreeCrew={handleFreeCrew} />
        ) : (
          <CompletedWork jobs={completedWork} />
        )}
      </main>

      <AddAssetModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setAlertInfo({ message: 'Live ML Inference complete! Asset added to dashboard.', type: 'success' });
          setTimeout(() => setAlertInfo(null), 4000);
          loadData();
        }}
      />

      {/* Alert Toast */}
      {alertInfo && (
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-5 border z-50 ${
          alertInfo.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          {alertInfo.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          )}
          <span className="font-medium text-sm">{alertInfo.message}</span>
          <button 
            onClick={() => setAlertInfo(null)}
            className={`ml-4 p-1 rounded transition-colors ${
              alertInfo.type === 'success' ? 'hover:bg-emerald-100 text-emerald-600' : 'hover:bg-amber-100 text-amber-600'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      </div>
    </>
  );
}

export default App;
