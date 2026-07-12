import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  Wrench, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  UserCheck, 
  Play, 
  Check, 
  X,
  FileText,
  Camera
} from 'lucide-react';
import { MaintenanceRequest } from '../types';

interface MaintenanceProps {
  directAssetId?: string;
  onClose?: () => void;
}

export const Maintenance: React.FC<MaintenanceProps> = ({ directAssetId, onClose }) => {
  const { 
    assets, 
    maintenanceRequests, 
    employees, 
    raiseMaintenanceRequest, 
    updateMaintenanceStatus, 
    currentUser 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'list' | 'raise'>('list');

  // Request form state
  const [selectedAssetId, setSelectedAssetId] = useState(directAssetId || '');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<MaintenanceRequest['priority']>('medium');
  const [successMsg, setSuccessMsg] = useState('');

  // Management popup helper states
  const [assigningRequestId, setAssigningRequestId] = useState<string | null>(null);
  const [techName, setTechName] = useState('');

  const [resolvingRequestId, setResolvingRequestId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  if (!currentUser) return null;

  const isAssetManager = currentUser.role === 'admin' || currentUser.role === 'asset_manager';

  const handleRaiseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId || !description) return;

    raiseMaintenanceRequest(selectedAssetId, description, priority);
    setSuccessMsg('Repair ticket successfully filed! A manager will review and authorize repairs shortly.');
    setDescription('');
    setSelectedAssetId('');
    setPriority('medium');
    setActiveTab('list');
    if (onClose) onClose();
  };

  const handleApprove = (id: string) => {
    updateMaintenanceStatus(id, 'approved');
  };

  const handleReject = (id: string) => {
    updateMaintenanceStatus(id, 'rejected');
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningRequestId || !techName) return;
    updateMaintenanceStatus(assigningRequestId, 'technician_assigned', undefined, techName);
    setAssigningRequestId(null);
    setTechName('');
  };

  const handleStartRepair = (id: string) => {
    updateMaintenanceStatus(id, 'in_progress');
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingRequestId || !resolutionNotes) return;
    updateMaintenanceStatus(resolvingRequestId, 'resolved', resolutionNotes);
    setResolvingRequestId(null);
    setResolutionNotes('');
  };

  const getAsset = (id: string) => assets.find(a => a.id === id);
  const getEmployee = (id: string) => employees.find(e => e.id === id);

  const getPriorityBadgeClass = (p: string) => {
    switch (p) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'approved': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'technician_assigned': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'in_progress': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 font-sans">
            Maintenance & Repairs Hub
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Route physical asset diagnostics and track technicians resolving active issues.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-3 py-1.5 font-bold text-xs rounded-lg transition-colors cursor-pointer ${
              activeTab === 'list' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Diagnostics List
          </button>
          <button
            onClick={() => { setActiveTab('raise'); setSuccessMsg(''); }}
            className={`inline-flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer`}
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Raise Repair Request</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 text-sm text-emerald-800 rounded-r-lg flex items-center space-x-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* --- TAB 1: Requests List --- */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          
          <div className="bg-white p-4 border border-slate-100 rounded-xl flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Active diagnostics</span>
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">
              {maintenanceRequests.filter(r => r.status !== 'resolved' && r.status !== 'rejected').length} outstanding
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {maintenanceRequests.map((req) => {
              const asset = getAsset(req.assetId);
              const reporter = getEmployee(req.reportedBy);
              
              return (
                <div key={req.id} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex flex-col justify-between space-y-4 hover:shadow-sm transition-shadow">
                  
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="inline-flex items-center px-1.5 py-0.2 rounded font-mono font-bold text-[9px] bg-slate-50 text-slate-500 border border-slate-150">
                          {asset?.assetTag}
                        </span>
                        <h3 className="font-extrabold text-slate-800 text-sm mt-1.5">{asset?.name}</h3>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${getStatusBadgeClass(req.status)}`}>
                          {req.status.replace('_', ' ')}
                        </span>
                        <span className={`inline-flex px-1.5 py-0.2 rounded text-[8px] font-bold uppercase tracking-wider border ${getPriorityBadgeClass(req.priority)}`}>
                          {req.priority}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 mt-3 leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                      {req.description}
                    </p>

                    <div className="text-[10px] text-slate-400 mt-3 space-y-1">
                      <p>Reported By: <strong className="text-slate-600">{reporter?.name || 'Assigned Holder'}</strong></p>
                      <p>Filing Date: <strong className="text-slate-600">{req.reportedDate}</strong></p>
                      {req.assignedTechnician && <p>Assigned Technician: <strong className="text-slate-700">{req.assignedTechnician}</strong></p>}
                      {req.notes && <p className="italic text-slate-500 mt-1">Resolution notes: "{req.notes}"</p>}
                    </div>
                  </div>

                  {/* Actions based on role */}
                  <div className="pt-3 border-t border-slate-50">
                    {isAssetManager ? (
                      <div className="flex gap-1.5">
                        {req.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(req.id)}
                              className="flex-1 inline-flex items-center justify-center space-x-1.5 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>Authorize repair</span>
                            </button>
                            <button
                              onClick={() => handleReject(req.id)}
                              className="inline-flex items-center justify-center space-x-1.5 py-1.5 px-3 border border-red-200 text-red-700 font-bold text-xs rounded-lg hover:bg-red-50/50 transition-colors cursor-pointer"
                            >
                              <X className="h-3.5 w-3.5" />
                              <span>Decline</span>
                            </button>
                          </>
                        )}

                        {req.status === 'approved' && (
                          <button
                            onClick={() => setAssigningRequestId(req.id)}
                            className="w-full inline-flex items-center justify-center space-x-1.5 py-1.5 px-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                            <span>Assign technician</span>
                          </button>
                        )}

                        {req.status === 'technician_assigned' && (
                          <button
                            onClick={() => handleStartRepair(req.id)}
                            className="w-full inline-flex items-center justify-center space-x-1.5 py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                          >
                            <Play className="h-3.5 w-3.5 fill-white shrink-0" />
                            <span>Mark Repair Started (In Progress)</span>
                          </button>
                        )}

                        {req.status === 'in_progress' && (
                          <button
                            onClick={() => setResolvingRequestId(req.id)}
                            className="w-full inline-flex items-center justify-center space-x-1.5 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Resolve & Close Ticket</span>
                          </button>
                        )}

                        {(req.status === 'resolved' || req.status === 'rejected') && (
                          <span className="text-[10px] text-slate-400 italic text-center w-full block">Diagnostic cycle closed.</span>
                        )}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic text-center">Diagnostics active. Only Asset Managers can authorize repairs.</p>
                    )}
                  </div>

                </div>
              );
            })}
            {maintenanceRequests.length === 0 && (
              <p className="col-span-2 text-sm text-slate-400 text-center py-12 bg-white border border-slate-100 rounded-2xl">
                No repair tickets are filed in the diagnostic queues.
              </p>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 2: Raise Request Form --- */}
      {activeTab === 'raise' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-2xl shadow-xs">
            <h2 className="text-base font-extrabold text-slate-800 font-sans mb-4">Request Repair Diagnostics</h2>
            
            <form onSubmit={handleRaiseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Select Asset Requiring Repair</label>
                <select
                  required
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                >
                  <option value="">Select Physical Asset</option>
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>[{a.assetTag}] {a.name} (Condition: {a.condition})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Urgency Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                >
                  <option value="low">Low (Standard wear, non-blocking)</option>
                  <option value="medium">Medium (Degraded performance)</option>
                  <option value="high">High (Blocked workflow / damaged)</option>
                  <option value="critical">Critical (Immediate danger / total failure)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Issue Description & Diagnostics</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue in detail. e.g. Left screen hinge has cracked. Display occasionally flickers or disconnects when tilted."
                  rows={4}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                />
              </div>

              {/* Simulated diagnostic attachment */}
              <div className="bg-slate-50 p-4 border border-dashed border-slate-200 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Simulate Diagnostics Attachment</span>
                <div className="flex items-center space-x-2 text-xs text-slate-500 cursor-pointer hover:text-indigo-600 transition-colors">
                  <Camera className="h-5 w-5 text-slate-400 shrink-0" />
                  <span>Attach Diagnostic Photo or Crash Dump (Simulation active)</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  Submit Repair Ticket
                </button>
              </div>
            </form>
          </div>

          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md">
            <h3 className="font-extrabold text-indigo-400 font-sans text-sm uppercase tracking-wider mb-3">Enterprise Repair Routing</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              To guarantee fiscal and operational integrity, all organizational resources are protected by a two-step routing lock. 
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Filing a ticket alerts the Asset Manager. Once authorized, the physical asset is locked and flagged as <strong>Under Maintenance</strong>, automatically halting all standard allocations and bookings. Re-allocation only unlocks upon resolving the diagnostics loop.
            </p>
          </div>
        </div>
      )}

      {/* Pop-up modal: Assign Technician */}
      {assigningRequestId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100">
            <h3 className="text-lg font-extrabold text-slate-900 font-sans mb-1">Assign Technician</h3>
            <p className="text-xs text-slate-500 mb-4">Input the vendor or staff member tasked with diagnosing and repairing this asset.</p>
            
            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Technician / Vendor Name</label>
                <input
                  type="text"
                  required
                  value={techName}
                  onChange={(e) => setTechName(e.target.value)}
                  placeholder="e.g. Steve Solutions Inc."
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Assign Ticket
                </button>
                <button
                  type="button"
                  onClick={() => setAssigningRequestId(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold text-xs rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pop-up modal: Resolve Repair Ticket */}
      {resolvingRequestId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100">
            <h3 className="text-lg font-extrabold text-slate-900 font-sans mb-1">Close Repair Ticket</h3>
            <p className="text-xs text-slate-500 mb-4">Verify technician tasks and input resolution logs before returning to standard operations.</p>
            
            <form onSubmit={handleResolveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Resolution & Repair Log</label>
                <textarea
                  required
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Replaced display panel and calibrated screen hinges. Re-verified diagnostics."
                  rows={3}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Resolve & Unlock Asset
                </button>
                <button
                  type="button"
                  onClick={() => setResolvingRequestId(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold text-xs rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
