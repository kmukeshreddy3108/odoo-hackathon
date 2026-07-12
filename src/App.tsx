/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { OrgSetup } from './components/OrgSetup';
import { AssetDirectory } from './components/AssetDirectory';
import { AssetAllocation } from './components/AssetAllocation';
import { ResourceBooking } from './components/ResourceBooking';
import { Maintenance } from './components/Maintenance';
import { AssetAudit } from './components/AssetAudit';
import { Reports } from './components/Reports';
import { ActivityLogs } from './components/ActivityLogs';

import { 
  ShieldAlert, 
  ShieldCheck, 
  Users, 
  User, 
  X, 
  AlertCircle,
  Wrench,
  Check,
  Plus
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser, setCurrentUser, employees } = useApp();
  const [currentScreen, setScreen] = useState('dashboard');
  
  // Global modal triggers
  const [showMaintModal, setShowMaintModal] = useState(false);
  const [showAssetRegModal, setShowAssetRegModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Quick select assets
  const [directAssetId, setDirectAssetId] = useState<string | undefined>(undefined);

  if (!currentUser) {
    return <Login />;
  }

  // Quick sandbox switch helpers
  const sandboxRoles = [
    { label: 'Admin', email: 'admin@assetflow.com', color: 'bg-rose-600 text-white hover:bg-rose-700' },
    { label: 'Asset Manager', email: 'manager@assetflow.com', color: 'bg-emerald-600 text-white hover:bg-emerald-700' },
    { label: 'Dept Head', email: 'head@assetflow.com', color: 'bg-amber-500 text-white hover:bg-amber-600' },
    { label: 'Employee', email: 'employee@assetflow.com', color: 'bg-indigo-600 text-white hover:bg-indigo-700' },
  ];

  const handleSandboxSwitch = (email: string) => {
    const target = employees.find(e => e.email === email);
    if (target) {
      setCurrentUser(target);
      // Reset screen if new role cannot access it
      if (target.role !== 'admin' && currentScreen === 'org_setup') {
        setScreen('dashboard');
      }
      if (target.role === 'employee' && currentScreen === 'reports') {
        setScreen('dashboard');
      }
    }
  };

  const renderActiveScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return (
          <Dashboard 
            setScreen={setScreen}
            openMaintModal={() => { setDirectAssetId(undefined); setShowMaintModal(true); }}
            openAssetRegModal={() => setShowAssetRegModal(true)}
            openBookingModal={() => { setDirectAssetId(undefined); setShowBookingModal(true); }}
          />
        );
      case 'org_setup':
        return <OrgSetup />;
      case 'assets':
        return (
          <AssetDirectory 
            openMaintModalForAsset={(assetId) => { setDirectAssetId(assetId); setShowMaintModal(true); }}
            openAllocModalForAsset={(assetId) => { setDirectAssetId(assetId); setScreen('allocations'); }}
          />
        );
      case 'allocations':
        return <AssetAllocation directAssetId={directAssetId} onClose={() => setDirectAssetId(undefined)} />;
      case 'bookings':
        return <ResourceBooking directResourceId={directAssetId} onClose={() => setDirectAssetId(undefined)} />;
      case 'maintenance':
        return <Maintenance directAssetId={directAssetId} onClose={() => setDirectAssetId(undefined)} />;
      case 'audits':
        return <AssetAudit />;
      case 'reports':
        return <Reports />;
      case 'logs':
        return <ActivityLogs />;
      default:
        return <Dashboard 
          setScreen={setScreen}
          openMaintModal={() => setShowMaintModal(true)}
          openAssetRegModal={() => setShowAssetRegModal(true)}
          openBookingModal={() => setShowBookingModal(true)}
        />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Sidebar Navigation */}
      <Sidebar currentScreen={currentScreen} setScreen={setScreen} />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Sandbox Role Switcher Toolbar */}
        <div className="bg-[#141414] border-b border-[#141414] px-6 py-2 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2 z-10 text-[#E4E3E0]">
          <div className="flex items-center space-x-2 text-[#E4E3E0]">
            <ShieldCheck className="h-4 w-4 shrink-0 text-[#E4E3E0]" />
            <span className="text-[10px] font-bold uppercase tracking-widest font-mono">
              [ASSETFLOW ERP SANDBOX INTERACTIVE TERMINAL]
            </span>
          </div>

          <div className="flex items-center space-x-1.5 flex-wrap">
            <span className="text-[9px] text-[#E4E3E0]/70 font-bold uppercase tracking-wider font-mono mr-1">Switch perspective:</span>
            {sandboxRoles.map((role) => (
              <button
                key={role.email}
                onClick={() => handleSandboxSwitch(role.email)}
                className={`px-2 py-0.5 text-[9px] font-bold font-mono uppercase tracking-wider cursor-pointer border transition-all ${
                  currentUser.email === role.email 
                    ? 'bg-[#E4E3E0] text-[#141414] border-[#E4E3E0]' 
                    : 'bg-[#141414] text-[#E4E3E0]/60 hover:text-[#E4E3E0] border-[#E4E3E0]/20 hover:border-[#E4E3E0]'
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Render Surface */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
          {renderActiveScreen()}
        </div>

      </div>

      {/* --- GLOBAL DIALOG: Quick Maintenance Request --- */}
      {showMaintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl relative border border-slate-100">
            <button 
              onClick={() => { setShowMaintModal(false); setDirectAssetId(undefined); }}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="overflow-y-auto max-h-[85vh]">
              <Maintenance directAssetId={directAssetId} onClose={() => { setShowMaintModal(false); setDirectAssetId(undefined); }} />
            </div>
          </div>
        </div>
      )}

      {/* --- GLOBAL DIALOG: Register Asset (Asset Managers only) --- */}
      {showAssetRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl relative border border-slate-100">
            <button 
              onClick={() => setShowAssetRegModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="overflow-y-auto max-h-[85vh]">
              <AssetDirectory showRegFormDirectly={true} onCloseRegForm={() => setShowAssetRegModal(false)} />
            </div>
          </div>
        </div>
      )}

      {/* --- GLOBAL DIALOG: Book Shared Resource --- */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl relative border border-slate-100">
            <button 
              onClick={() => { setShowBookingModal(false); setDirectAssetId(undefined); }}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="overflow-y-auto max-h-[85vh]">
              <ResourceBooking directResourceId={directAssetId} onClose={() => { setShowBookingModal(false); setDirectAssetId(undefined); }} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
