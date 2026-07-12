import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  Share2, 
  CalendarDays, 
  Plus, 
  AlertCircle, 
  Calendar,
  AlertOctagon,
  ArrowRight
} from 'lucide-react';

interface DashboardProps {
  setScreen: (screen: string) => void;
  openMaintModal: () => void;
  openAssetRegModal: () => void;
  openBookingModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  setScreen, 
  openMaintModal, 
  openAssetRegModal, 
  openBookingModal 
}) => {
  const { 
    assets, 
    allocations, 
    bookings, 
    maintenanceRequests, 
    transferRequests, 
    employees, 
    currentUser 
  } = useApp();

  if (!currentUser) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  // Calculations for KPIs
  const assetsAvailable = assets.filter(a => a.status === 'available').length;
  const assetsAllocated = assets.filter(a => a.status === 'allocated').length;
  const maintenanceActive = maintenanceRequests.filter(r => r.status !== 'resolved' && r.status !== 'rejected').length;
  const activeBookings = bookings.filter(b => b.date === todayStr && b.status === 'upcoming' || b.status === 'ongoing').length;
  const pendingTransfers = transferRequests.filter(t => t.status === 'pending').length;

  // Split return states
  const activeAllocs = allocations.filter(alloc => alloc.status === 'active' || alloc.status === 'overdue');
  const overdueAllocations = activeAllocs.filter(alloc => {
    if (!alloc.expectedReturnDate) return false;
    return alloc.expectedReturnDate < todayStr;
  });
  const upcomingAllocations = activeAllocs.filter(alloc => {
    if (!alloc.expectedReturnDate) return false;
    return alloc.expectedReturnDate >= todayStr;
  });

  const upcomingReturnsCount = upcomingAllocations.length;

  // Get employee and asset info helpers
  const getAssetInfo = (id: string) => assets.find(a => a.id === id);
  const getEmployeeInfo = (id: string) => employees.find(e => e.id === id);

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 font-sans">
            Operations Control Panel
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time visual summary for role: <span className="font-semibold text-indigo-600 capitalize">{currentUser.role.replace('_', ' ')}</span>
          </p>
        </div>
        
        {/* Quick Actions Panel */}
        <div className="flex flex-wrap gap-2 shrink-0">
          {(currentUser.role === 'admin' || currentUser.role === 'asset_manager') && (
            <button
              onClick={openAssetRegModal}
              className="inline-flex items-center space-x-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Register Asset</span>
            </button>
          )}
          <button
            onClick={openBookingModal}
            className="inline-flex items-center space-x-2 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium text-xs rounded-lg transition-colors cursor-pointer"
          >
            <Calendar className="h-4 w-4 text-slate-500" />
            <span>Book Resource</span>
          </button>
          <button
            onClick={openMaintModal}
            className="inline-flex items-center space-x-2 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium text-xs rounded-lg transition-colors cursor-pointer"
          >
            <Wrench className="h-4 w-4 text-slate-500" />
            <span>Request Repair</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        
        {/* KPI: Available */}
        <div className="bg-white p-4 border border-slate-100 shadow-sm rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Available</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-4 w-4" /></span>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-800">{assetsAvailable}</span>
            <p className="text-[10px] text-slate-400 mt-0.5">Assets ready to allocate</p>
          </div>
        </div>

        {/* KPI: Allocated */}
        <div className="bg-white p-4 border border-slate-100 shadow-sm rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Allocated</span>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600"><Share2 className="h-4 w-4" /></span>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-800">{assetsAllocated}</span>
            <p className="text-[10px] text-slate-400 mt-0.5">Assets currently deployed</p>
          </div>
        </div>

        {/* KPI: Maintenance */}
        <div className="bg-white p-4 border border-slate-100 shadow-sm rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Repairs</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600"><Wrench className="h-4 w-4" /></span>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-800">{maintenanceActive}</span>
            <p className="text-[10px] text-slate-400 mt-0.5">Active maintenance logs</p>
          </div>
        </div>

        {/* KPI: Active Bookings */}
        <div className="bg-white p-4 border border-slate-100 shadow-sm rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bookings</span>
            <span className="p-1.5 rounded-lg bg-sky-50 text-sky-600"><CalendarDays className="h-4 w-4" /></span>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-800">{activeBookings}</span>
            <p className="text-[10px] text-slate-400 mt-0.5">Resource bookings today</p>
          </div>
        </div>

        {/* KPI: Transfers */}
        <div className="bg-white p-4 border border-slate-100 shadow-sm rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Transfers</span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600"><Clock className="h-4 w-4" /></span>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-800">{pendingTransfers}</span>
            <p className="text-[10px] text-slate-400 mt-0.5">Pending approval requests</p>
          </div>
        </div>

        {/* KPI: Upcoming Returns */}
        <div className="bg-white p-4 border border-slate-100 shadow-sm rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Returns</span>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600"><Clock className="h-4 w-4" /></span>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-800">{upcomingReturnsCount}</span>
            <p className="text-[10px] text-slate-400 mt-0.5">Nearing due dates</p>
          </div>
        </div>

      </div>

      {/* Critical Highlight Panel: Overdue Returns */}
      <div className="bg-rose-50/50 rounded-2xl border border-rose-100 p-6 shadow-xs">
        <div className="flex items-center space-x-2.5 mb-4 text-rose-800">
          <AlertOctagon className="h-5 w-5 text-rose-600" />
          <h2 className="text-base font-extrabold font-sans">Overdue Return Alerts (Immediate Action Required)</h2>
        </div>
        
        {overdueAllocations.length === 0 ? (
          <p className="text-sm text-slate-500 bg-white border border-slate-100 p-4 rounded-xl text-center">
            No overdue allocations currently. Excellent track-record.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {overdueAllocations.map(alloc => {
              const asset = getAssetInfo(alloc.assetId);
              const employee = alloc.employeeId ? getEmployeeInfo(alloc.employeeId) : null;
              
              return (
                <div key={alloc.id} className="bg-white border border-rose-200 hover:border-rose-300 rounded-xl p-4 shadow-sm flex flex-col justify-between transition-colors">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 uppercase tracking-wider">
                        OVERDUE
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400">{asset?.assetTag}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 mt-2">{asset?.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">Category: {asset?.category}</p>
                    <p className="text-xs text-slate-500 mt-1">Assigned to: <span className="font-semibold text-slate-700">{employee?.name || 'Department'}</span></p>
                  </div>
                  <div className="border-t border-slate-100 mt-4 pt-3 flex justify-between items-center text-xs">
                    <span className="text-slate-400">Due Date:</span>
                    <span className="font-mono font-bold text-rose-600">{alloc.expectedReturnDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Operational Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Upcoming Returns Schedule */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-extrabold font-sans text-slate-900">Upcoming Returns Schedule</h2>
              <button 
                onClick={() => setScreen('allocations')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
              >
                <span>View All allocations</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            
            <div className="space-y-3">
              {upcomingAllocations.length === 0 ? (
                <p className="text-sm text-slate-400 py-6 text-center">
                  No upcoming return schedules listed.
                </p>
              ) : (
                upcomingAllocations.map(alloc => {
                  const asset = getAssetInfo(alloc.assetId);
                  const employee = alloc.employeeId ? getEmployeeInfo(alloc.employeeId) : null;
                  
                  return (
                    <div key={alloc.id} className="flex items-center justify-between p-3 border border-slate-50 rounded-xl hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 rounded-lg bg-indigo-50/50 text-indigo-600 shrink-0">
                          <Share2 className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-slate-800">{asset?.name}</h4>
                          <p className="text-xs text-slate-500">Held by {employee?.name || 'Department'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-slate-700">{alloc.expectedReturnDate}</span>
                        <p className="text-[10px] text-indigo-600 mt-0.5">Allocated</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right column: System Quick Info */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 mb-4">
              <AlertCircle className="h-5 w-5" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-300">Operational Integrity</h2>
            </div>
            
            <p className="text-xs leading-relaxed text-slate-400">
              Welcome to the AssetFlow centralized environment. Avoid spreadsheets by logging structural allocations, booking shared spaces, raising approvals for repairs before taking actions, and checking asset conditions.
            </p>

            <div className="border-t border-slate-800 mt-6 pt-6 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Environment Node</span>
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">Cloud Host Active</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Total System Assets</span>
                <span className="font-bold text-white">{assets.length}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Active Departments</span>
                <span className="font-bold text-white">4</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Employee Directory Count</span>
                <span className="font-bold text-white">{employees.length}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-800 pt-4">
            <button
              onClick={() => setScreen('assets')}
              className="w-full flex items-center justify-between text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 p-2.5 rounded-lg transition-all"
            >
              <span>Asset Directory</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
