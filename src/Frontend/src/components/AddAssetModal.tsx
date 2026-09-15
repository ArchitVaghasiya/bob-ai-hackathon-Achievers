import { useState } from 'react';
import { X, Activity, Save, Loader2 } from 'lucide-react';
import { cn } from '../utils';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddAssetModal({ isOpen, onClose, onSuccess }: AddAssetModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    substation: '',
    H2: '0.0005',
    CO: '0.0050',
    C2H4: '0.0010',
    C2H2: '0.0001'
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/assets/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          substation: formData.substation,
          H2: parseFloat(formData.H2),
          CO: parseFloat(formData.CO),
          C2H4: parseFloat(formData.C2H4),
          C2H2: parseFloat(formData.C2H2)
        }),
      });
      
      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        console.error("Failed to add asset");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200">
      <div className="bg-surface w-full max-w-lg rounded-xl shadow-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-primary/10 rounded-md">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-text">Add Transformer & Run Inference</h2>
          </div>
          <button onClick={onClose} className="text-textMuted hover:text-text transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-text mb-1">Substation Name</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Northside Alpha"
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={formData.substation}
              onChange={e => setFormData({...formData, substation: e.target.value})}
            />
          </div>
          
          <h3 className="text-sm font-bold text-textMuted uppercase tracking-wider mb-3">Raw DGA Telemetry</h3>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
              <label className="block text-xs font-semibold text-text mb-1">Hydrogen (H2)</label>
              <input 
                required
                type="number" step="0.0001" min="0"
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={formData.H2}
                onChange={e => setFormData({...formData, H2: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text mb-1">Carbon Monoxide (CO)</label>
              <input 
                required
                type="number" step="0.0001" min="0"
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={formData.CO}
                onChange={e => setFormData({...formData, CO: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text mb-1">Ethylene (C2H4)</label>
              <input 
                required
                type="number" step="0.0001" min="0"
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={formData.C2H4}
                onChange={e => setFormData({...formData, C2H4: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text mb-1">Acetylene (C2H2)</label>
              <input 
                required
                type="number" step="0.0001" min="0"
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={formData.C2H2}
                onChange={e => setFormData({...formData, C2H2: e.target.value})}
              />
            </div>
          </div>
          
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-md shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
              ) : (
                <><Save className="w-4 h-4" /> Run Inference</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
