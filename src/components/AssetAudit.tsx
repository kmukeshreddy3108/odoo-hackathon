import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  ClipboardCheck, 
  ShieldAlert, 
  Check, 
  X, 
  AlertTriangle, 
  HelpCircle, 
  User, 
  MapPin, 
  Lock, 
  FileSpreadsheet,
  Layers,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { AuditCycle, AuditItem } from '../types';

export const AssetAudit: React.FC = () => {
  const { 
    assets, 
    employees, 
    departments, 
    auditCycles, 
    auditItems, 
    createAuditCycle, 
    updateAuditItem, 
    closeAuditCycle, 
    currentUser 
  } = useApp();

  const [activeCycleId, setActiveCycleId] = useState<string>(auditCycles[0]?.id || '');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form states
  const [newName, setNewName] = useState('');
  const [targetDeptId, setTargetDeptId] = useState('');
  const [targetLocation, setTargetLocation] = useState('');
  const [selectedAuditors, setSelectedAuditors] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState('');

  // Audit item notes dialog states
  const [auditingItemId, setAuditingItemId] = useState<string | null>(null);
  const [auditingStatus, setAuditingStatus] = useState<'verified' | 'missing' | 'damaged'>('verified');
  const [verificationNotes, setVerificationNotes] = useState('');

  if (!currentUser) return null;

  const isAdminOrManager = currentUser.role === 'admin' || currentUser.role === 'asset_manager';

  // Active Selected Cycle
  const currentCycle = auditCycles.find(c => c.id === activeCycleId);

  // Filter items in active cycle
  const currentItems = auditItems.filter(item => item.auditCycleId === activeCycleId);

  // Filter discrepancies (Missing or Damaged)
  const discrepancyItems = currentItems.filter(item => item.status === 'missing' || item.status === 'damaged');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    createAuditCycle(
      newName,
      targetDeptId || undefined,
      targetLocation || undefined,
      undefined,
      undefined,
      selectedAuditors
    );

    setSuccessMsg('Successfully created and deployed new Audit Cycle!');
    setNewName('');
    setTargetDeptId('');
    setTargetLocation('');
    setSelectedAuditors([]);
    setShowCreateForm(false);
  };

  const handleAuditorCheckboxChange = (empId: string) => {
    setSelectedAuditors(prev => 
      prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]
    );
  };

  const handleOpenVerifyDialog = (itemId: string, status: 'verified' | 'missing' | 'damaged') => {
    const item = auditItems.find(i => i.id === itemId);
    setAuditingItemId(itemId);
    setAuditingStatus(status);
    setVerificationNotes(item?.notes || '');
  };

  const handleConfirmVerification = () => {
    if (!auditingItemId) return;
    updateAuditItem(auditingItemId, auditingStatus, verificationNotes);
    setAuditingItemId(null);
    setVerificationNotes('');
  };

  const handleCloseCycle = () => {
    if (!currentCycle) return;
    closeAuditCycle(currentCycle.id);
  };

  // Helper getters
  const getAsset = (id: string) => assets.find(a => a.id === id);
  const getEmployee = (id: string) => employees.find(e => e.id === id);

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 font-sans">
            Structured Inventory Audits
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure periodic audit cycles, record field verifications, and resolve item discrepancies.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isAdminOrManager && !showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center space-x-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Initiate Audit Cycle</span>
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 text-sm text-emerald-800 rounded-r-lg flex items-center space-x-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Audit Cycle Creator Form */}
      {showCreateForm && (
        <div className="bg-white border border-indigo-100 rounded-2xl shadow-md p-6 max-w-3xl">
          <h2 className="text-base font-extrabold text-slate-800 font-sans mb-4">Launch Structured Audit Cycle</h2>
          
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Cycle Name / Identifier</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Q3 HQ Furniture Audit"
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Department Scope (Optional)</label>
                <select
                  value={targetDeptId}
                  onChange={(e) => setTargetDeptId(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                >
                  <option value="">Whole organization (All departments)</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Location Scope / Keywords</label>
                <input
                  type="text"
                  value={targetLocation}
                  onChange={(e) => setTargetLocation(e.target.value)}
                  placeholder="e.g. Floor 3, Server Room (Optional)"
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Assigned Auditors</label>
                <div className="border border-slate-200 rounded-lg p-2 max-h-24 overflow-y-auto space-y-1 bg-slate-50/50">
                  {employees.filter(e => e.status === 'active').map(emp => (
                    <label key={emp.id} className="flex items-center space-x-2 text-xs text-slate-700">
                      <input
                        type="checkbox"
                        checked={selectedAuditors.includes(emp.id)}
                        onChange={() => handleAuditorCheckboxChange(emp.id)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{emp.name} ({emp.role.replace('_', ' ')})</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="submit"
                className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Launch Audit Checklist
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 font-bold text-xs rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cycle Active Selector Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 border border-slate-100 rounded-xl">
        <div className="flex items-center space-x-3 flex-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Cycle:</span>
          <select
            value={activeCycleId}
            onChange={(e) => { setActiveCycleId(e.target.value); setSuccessMsg(''); }}
            className="flex-1 max-w-sm px-3 py-2 border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-semibold"
          >
            {auditCycles.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.status === 'active' ? 'Active' : 'Closed & Locked'})
              </option>
            ))}
            {auditCycles.length === 0 && <option value="">No cycles created</option>}
          </select>
        </div>

        {currentCycle?.status === 'active' && isAdminOrManager && (
          <button
            onClick={handleCloseCycle}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Lock className="h-4 w-4" />
            <span>Lock & Close Audit Cycle</span>
          </button>
        )}
      </div>

      {currentCycle ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Scope Inventory Verification Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-100 p-4 rounded-xl flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Target inventory checklist</span>
              <span className="text-xs font-mono font-bold text-indigo-600">Total items: {currentItems.length}</span>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
              <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Asset details</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Expected Location</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Verification status</th>
                    <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Verify actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {currentItems.map((item) => {
                    const asset = getAsset(item.assetId);
                    
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800">{asset?.name}</div>
                          <div className="text-xs text-slate-400 font-mono">Tag: {asset?.assetTag}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-xs">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>{asset?.location}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            item.status === 'verified' ? 'bg-emerald-50 text-emerald-700' :
                            item.status === 'missing' ? 'bg-red-50 text-red-700' :
                            item.status === 'damaged' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {item.status}
                          </span>
                          {item.notes && <p className="text-[10px] text-slate-400 italic mt-1 font-sans">"{item.notes}"</p>}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {currentCycle.status === 'active' ? (
                            <div className="inline-flex gap-1.5">
                              <button
                                onClick={() => handleOpenVerifyDialog(item.id, 'verified')}
                                className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg cursor-pointer"
                                title="Mark Verified"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenVerifyDialog(item.id, 'damaged')}
                                className="p-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-lg cursor-pointer"
                                title="Mark Damaged"
                              >
                                <AlertTriangle className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenVerifyDialog(item.id, 'missing')}
                                className="p-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg cursor-pointer"
                                title="Mark Missing"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Locked</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Live Discrepancy Sheet sidebar */}
          <div className="space-y-4">
            
            <div className="bg-white border border-red-100 p-6 rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center space-x-2 text-red-800">
                <ShieldAlert className="h-5 w-5 text-red-600 shrink-0" />
                <h3 className="font-extrabold text-sm uppercase tracking-wider">Discrepancy Report</h3>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Items marked as <strong>Missing</strong> or <strong>Damaged</strong> automatically propagate to this discrepancy report in real-time. Closing the cycle compiles this into a permanent log and locks items.
              </p>

              <div className="space-y-3 pt-2">
                {discrepancyItems.map(item => {
                  const asset = getAsset(item.assetId);
                  
                  return (
                    <div key={item.id} className="p-3 border border-red-100 bg-red-50/25 rounded-xl text-xs space-y-2">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-slate-800">{asset?.name}</span>
                        <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded uppercase ${item.status === 'missing' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        <p>Tag Code: <strong className="font-mono text-slate-700">{asset?.assetTag}</strong></p>
                        {item.notes && <p className="mt-1 italic">Notes: "{item.notes}"</p>}
                      </div>
                    </div>
                  );
                })}
                {discrepancyItems.length === 0 && (
                  <p className="text-xs text-slate-400 italic py-6 text-center bg-slate-50 border border-slate-100 rounded-xl">
                    No discrepancies flagged currently. 100% match.
                  </p>
                )}
              </div>
            </div>

            {/* Audit details summary card */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md">
              <div className="flex items-center space-x-2 text-indigo-400 mb-3">
                <Sparkles className="h-5 w-5" />
                <h3 className="font-bold text-indigo-300 text-xs uppercase tracking-widest">Verification Meta</h3>
              </div>
              <div className="text-xs text-slate-400 space-y-3">
                <p>Created: <strong className="text-white">{currentCycle.createdDate}</strong></p>
                <p>Scope department: <strong className="text-white">
                  {currentCycle.departmentId ? (departments.find(d => d.id === currentCycle.departmentId)?.name || 'Custom') : 'Global'}
                </strong></p>
                <p>Deadline: <strong className="text-white">{currentCycle.endDate}</strong></p>
                
                <div>
                  <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Authorized Auditors</span>
                  <div className="flex flex-wrap gap-1">
                    {currentCycle.assignedAuditors.map(audId => {
                      const emp = getEmployee(audId);
                      return emp ? (
                        <span key={audId} className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] text-slate-300">
                          <User className="h-3 w-3 text-slate-500" />
                          <span>{emp.name}</span>
                        </span>
                      ) : null;
                    })}
                    {currentCycle.assignedAuditors.length === 0 && (
                      <span className="text-[10px] italic text-slate-500">Global audit, all managers active.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      ) : (
        <p className="text-sm text-slate-400 py-12 text-center bg-white rounded-2xl border border-slate-100">
          No audit cycles exist in the organization yet.
        </p>
      )}

      {/* Verify Asset item Dialog Popup */}
      {auditingItemId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100">
            <h3 className="text-lg font-extrabold text-slate-900 font-sans mb-1">Log Verification Details</h3>
            <p className="text-xs text-slate-500 mb-4">Input field notes for asset audit ledger verification.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Verify Notes / Condition Remarks</label>
                <textarea
                  required
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder="e.g. Verified physically, fully functional. Minor desk wear."
                  rows={3}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleConfirmVerification}
                  className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Save Verification
                </button>
                <button
                  onClick={() => setAuditingItemId(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold text-xs rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
