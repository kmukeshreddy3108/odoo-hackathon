import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  RefreshCcw, 
  Check, 
  X, 
  User, 
  Building2, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRightLeft, 
  Clock, 
  HelpCircle,
  FileText
} from 'lucide-react';

interface AssetAllocationProps {
  directAssetId?: string;
  onClose?: () => void;
}

export const AssetAllocation: React.FC<AssetAllocationProps> = ({ directAssetId, onClose }) => {
  const { 
    assets, 
    employees, 
    departments, 
    allocations, 
    transferRequests, 
    currentUser, 
    allocateAsset, 
    initiateTransfer, 
    approveTransfer, 
    rejectTransfer,
    returnAsset 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'current' | 'new' | 'transfers'>('current');
  
  // New Allocation state
  const [selectedAssetId, setSelectedAssetId] = useState(directAssetId || '');
  const [targetType, setTargetType] = useState<'employee' | 'department'>('employee');
  const [targetId, setTargetId] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [notes, setNotes] = useState('');

  // Conflict state
  const [conflictError, setConflictError] = useState<{ message: string; holder: string; assetId: string } | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Return asset state
  const [returningAssetId, setReturningAssetId] = useState<string | null>(null);
  const [checkInNotes, setCheckInNotes] = useState('');
  const [checkInCondition, setCheckInCondition] = useState<'new' | 'good' | 'fair' | 'poor'>('good');

  if (!currentUser) return null;

  const isManagerOrHead = currentUser.role === 'admin' || currentUser.role === 'asset_manager' || currentUser.role === 'department_head';

  const handleAllocateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);
    setSuccessMsg('');

    if (!selectedAssetId || !targetId) {
      alert('Please fill out all required fields.');
      return;
    }

    const result = allocateAsset(selectedAssetId, targetId, targetType, expectedReturnDate || undefined, notes);
    
    if (result.success) {
      const assetName = assets.find(a => a.id === selectedAssetId)?.name || 'Asset';
      setSuccessMsg(`Successfully allocated "${assetName}"!`);
      // Reset
      setSelectedAssetId('');
      setTargetId('');
      setExpectedReturnDate('');
      setNotes('');
      if (onClose) onClose();
    } else if (result.error === 'Asset is currently held' && result.holder) {
      setConflictError({
        message: `Allocation blocked. This asset is already allocated.`,
        holder: result.holder,
        assetId: selectedAssetId
      });
    } else {
      alert(result.error || 'Failed to allocate asset.');
    }
  };

  const handleInitiateTransfer = () => {
    if (!conflictError || targetType !== 'employee') return;
    initiateTransfer(conflictError.assetId, targetId);
    setSuccessMsg(`Transfer Request has been successfully submitted for approval!`);
    setConflictError(null);
    setSelectedAssetId('');
    setTargetId('');
  };

  const handleReturnClick = (assetId: string) => {
    setReturningAssetId(assetId);
    setCheckInNotes('');
  };

  const handleConfirmReturn = () => {
    if (!returningAssetId) return;
    returnAsset(returningAssetId, checkInNotes, checkInCondition);
    setReturningAssetId(null);
  };

  // Helper getters
  const getAsset = (id: string) => assets.find(a => a.id === id);
  const getEmployee = (id: string) => employees.find(e => e.id === id);
  const getDepartment = (id: string) => departments.find(d => d.id === id);

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-100 pb-5">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 font-sans">
          Asset Allocation & Transfer Workflows
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Deploy physical assets to staff or department pools, and manage inter-departmental transfers.
        </p>
      </div>

      {/* Tab Selectors */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => { setActiveTab('current'); setConflictError(null); setSuccessMsg(''); }}
          className={`px-6 py-3 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
            activeTab === 'current' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Active Allocations
        </button>
        <button
          onClick={() => { setActiveTab('new'); setConflictError(null); setSuccessMsg(''); }}
          className={`px-6 py-3 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
            activeTab === 'new' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          New Allocation Deployments
        </button>
        <button
          onClick={() => { setActiveTab('transfers'); setConflictError(null); setSuccessMsg(''); }}
          className={`px-6 py-3 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
            activeTab === 'transfers' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Transfer Request Board
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 text-sm text-emerald-800 rounded-r-lg flex items-center space-x-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* --- TAB 1: Current Allocations --- */}
      {activeTab === 'current' && (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
          <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Asset Specs</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Holder</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Deployment Date</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Expected Return Date</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {allocations
                .filter(alloc => alloc.status === 'active' || alloc.status === 'overdue')
                .map((alloc) => {
                  const asset = getAsset(alloc.assetId);
                  const employee = alloc.employeeId ? getEmployee(alloc.employeeId) : null;
                  const department = alloc.departmentId ? getDepartment(alloc.departmentId) : null;
                  
                  return (
                    <tr key={alloc.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{asset?.name}</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">Tag: {asset?.assetTag} | S/N: {asset?.serialNumber}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {employee ? (
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-slate-400 shrink-0" />
                            <span>{employee.name} (Employee)</span>
                          </div>
                        ) : department ? (
                          <div className="flex items-center space-x-2">
                            <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                            <span>{department.name} Pool</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unlinked holder</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-500">
                        {alloc.allocatedDate}
                      </td>
                      <td className="px-6 py-4 font-mono">
                        {alloc.expectedReturnDate ? (
                          <span className={alloc.status === 'overdue' ? 'text-red-600 font-bold' : 'text-slate-500'}>
                            {alloc.expectedReturnDate}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Continuous deployment</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          alloc.status === 'overdue' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {alloc.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isManagerOrHead ? (
                          <button
                            onClick={() => handleReturnClick(alloc.assetId)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                          >
                            <span>Check-In</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No permission</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              {allocations.filter(alloc => alloc.status === 'active' || alloc.status === 'overdue').length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 italic">No active or overdue deployments in system registers.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* --- TAB 2: New Allocation Deployment --- */}
      {activeTab === 'new' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-2xl shadow-xs">
            <h2 className="text-base font-extrabold text-slate-800 font-sans mb-4">Request / Create Asset Allocation</h2>

            {conflictError && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-2.5 text-red-800 text-sm">
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Conflicting Allocation!</strong>
                    <span>{conflictError.message} Currently held by <strong className="text-red-900 font-extrabold">{conflictError.holder}</strong>.</span>
                  </div>
                </div>
                
                {targetType === 'employee' && (
                  <div className="bg-white p-3 rounded-lg border border-red-100 text-xs text-slate-600">
                    <p className="leading-relaxed mb-3">
                      To optimize workflow and bypass return lag, you can request a <strong>Direct Transfer</strong>. Priya Sharma will be requested to directly hand over the asset, and upon approval by the department manager, the record automatically transfers to you.
                    </p>
                    <button
                      type="button"
                      onClick={handleInitiateTransfer}
                      className="inline-flex items-center space-x-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      <ArrowRightLeft className="h-4 w-4" />
                      <span>Request Direct Transfer to Recipient</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleAllocateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Select Asset to Deploy</label>
                <select
                  required
                  value={selectedAssetId}
                  onChange={(e) => { setSelectedAssetId(e.target.value); setConflictError(null); }}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                >
                  <option value="">Select Physical Asset</option>
                  {assets
                    .filter(a => !a.shared) // Direct allocations only, shared is booked
                    .map(a => (
                      <option key={a.id} value={a.id}>
                        [{a.assetTag}] {a.name} ({a.status.replace('_', ' ')})
                      </option>
                    ))
                  }
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Allocation Target Type</label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center space-x-2 text-xs font-medium text-slate-700">
                      <input
                        type="radio"
                        checked={targetType === 'employee'}
                        onChange={() => { setTargetType('employee'); setTargetId(''); }}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Individual Employee</span>
                    </label>
                    <label className="flex items-center space-x-2 text-xs font-medium text-slate-700">
                      <input
                        type="radio"
                        checked={targetType === 'department'}
                        onChange={() => { setTargetType('department'); setTargetId(''); }}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Department Shared Pool</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Select {targetType === 'employee' ? 'Employee Assignee' : 'Department'}
                  </label>
                  <select
                    required
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                  >
                    <option value="">Choose Recipient</option>
                    {targetType === 'employee' ? (
                      employees.filter(e => e.status === 'active').map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.email})</option>
                      ))
                    ) : (
                      departments.filter(d => d.status === 'active').map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name} ({dept.code})</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Expected Return Date (Optional)</label>
                  <input
                    type="date"
                    value={expectedReturnDate}
                    onChange={(e) => setExpectedReturnDate(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Deployment Memo / Purpose</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Workstation assignment, remote support, testing..."
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  Confirm Deployment
                </button>
              </div>
            </form>
          </div>

          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md">
            <h3 className="font-extrabold text-indigo-400 font-sans text-sm uppercase tracking-wider mb-3">ERP Allocation Conflict Safeguard</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Our ERP system enforces architectural locking. If Laptop AF-0114 is currently held by Priya, attempting to allocate it to Raj Patel will trigger our system locks. 
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instead of forcing a multi-day return and check-in lag, clicking the <strong>Request Direct Transfer</strong> option will bypass the warehouse entirely and send an instant signature request to Priya and the Asset Manager.
            </p>
          </div>
        </div>
      )}

      {/* --- TAB 3: Transfer Request Board --- */}
      {activeTab === 'transfers' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-100 p-4 rounded-xl flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Active Transfer Approvals</h2>
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">
              {transferRequests.filter(t => t.status === 'pending').length} outstanding
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {transferRequests.map((req) => {
              const asset = getAsset(req.assetId);
              const sender = getEmployee(req.fromEmployeeId);
              const recipient = getEmployee(req.toEmployeeId);
              
              return (
                <div key={req.id} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-150">
                        {asset?.assetTag}
                      </span>
                      <h3 className="font-bold text-slate-800 text-sm mt-2">{asset?.name}</h3>
                    </div>
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      req.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      req.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  {/* Transfer Visual */}
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                    <div className="text-center flex-1">
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Holder (From)</span>
                      <strong className="text-slate-800 block mt-0.5">{sender?.name || 'Unknown'}</strong>
                    </div>
                    <div className="flex flex-col items-center shrink-0 px-2 text-indigo-500">
                      <ArrowRightLeft className="h-4 w-4" />
                      <span className="text-[9px] text-slate-400 mt-1">{req.requestedDate}</span>
                    </div>
                    <div className="text-center flex-1">
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Recipient (To)</span>
                      <strong className="text-slate-800 block mt-0.5">{recipient?.name || 'Unknown'}</strong>
                    </div>
                  </div>

                  {req.status === 'pending' && (
                    <div className="flex gap-2 pt-2 border-t border-slate-50">
                      {isManagerOrHead ? (
                        <>
                          <button
                            onClick={() => approveTransfer(req.id)}
                            className="flex-1 inline-flex items-center justify-center space-x-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Approve & Reallocate</span>
                          </button>
                          <button
                            onClick={() => rejectTransfer(req.id)}
                            className="inline-flex items-center justify-center space-x-1.5 py-2 px-3 border border-red-200 hover:bg-red-50 text-red-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Decline</span>
                          </button>
                        </>
                      ) : (
                        <p className="text-[10px] text-slate-400 italic text-center w-full">Waiting for Manager / Department Head signature.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {transferRequests.length === 0 && (
              <p className="col-span-2 text-sm text-slate-400 text-center py-12 bg-white border border-slate-100 rounded-2xl">
                No active transfer requests exist on the board.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Check In Action Dialog Popup */}
      {returningAssetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <h3 className="text-lg font-extrabold text-slate-900 font-sans mb-1">Check In Return Asset</h3>
            <p className="text-xs text-slate-500 mb-4">Acknowledge returning asset condition parameters to close active deployment log.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Physical Condition On Return</label>
                <select
                  value={checkInCondition}
                  onChange={(e) => setCheckInCondition(e.target.value as any)}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                >
                  <option value="new">New / Mint</option>
                  <option value="good">Good / Functional</option>
                  <option value="fair">Fair / Scratches</option>
                  <option value="poor">Poor / Damaged</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Verification Check-In notes</label>
                <textarea
                  required
                  value={checkInNotes}
                  onChange={(e) => setCheckInNotes(e.target.value)}
                  placeholder="e.g. Scratched bottom chassis. Fully functional. Reset to original factory values."
                  rows={3}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleConfirmReturn}
                  className="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Check In Deployed Asset
                </button>
                <button
                  onClick={() => setReturningAssetId(null)}
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
