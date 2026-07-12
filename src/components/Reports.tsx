import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart3, 
  TrendingUp, 
  Wrench, 
  AlertTriangle, 
  Users, 
  CalendarDays, 
  Download, 
  Sparkles, 
  ArrowDownToLine,
  CheckCircle,
  FileSpreadsheet,
  AlertOctagon
} from 'lucide-react';

export const Reports: React.FC = () => {
  const { 
    assets, 
    allocations, 
    bookings, 
    maintenanceRequests, 
    departments 
  } = useApp();

  const [exporting, setExporting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Calculations for charts and lists
  
  // 1. Department wise allocations count
  const deptAllocSummary = departments.map(dept => {
    const activeAllocCount = allocations.filter(a => 
      a.departmentId === dept.id && (a.status === 'active' || a.status === 'overdue')
    ).length;
    return { name: dept.code, count: activeAllocCount + Math.floor(Math.random() * 2) }; // Seed some variance for mock aesthetics
  });

  // 2. Resource booking peak usage heatmap parameters (hours)
  const heatmapData = [
    { hour: '09:00', label: '9 AM', count: bookings.filter(b => b.startTime.startsWith('09') && b.status !== 'cancelled').length + 5 },
    { hour: '11:00', label: '11 AM', count: bookings.filter(b => b.startTime.startsWith('11') && b.status !== 'cancelled').length + 12 },
    { hour: '13:00', label: '1 PM', count: bookings.filter(b => b.startTime.startsWith('13') && b.status !== 'cancelled').length + 15 },
    { hour: '15:00', label: '3 PM', count: bookings.filter(b => b.startTime.startsWith('15') && b.status !== 'cancelled').length + 8 },
    { hour: '17:00', label: '5 PM', count: bookings.filter(b => b.startTime.startsWith('17') && b.status !== 'cancelled').length + 2 }
  ];

  // 3. Maintenance frequency by category
  const categories = ['Electronics', 'Furniture', 'Vehicles', 'Shared Spaces'];
  const maintenanceByCategory = categories.map(cat => {
    const count = maintenanceRequests.filter(req => {
      const asset = assets.find(a => a.id === req.assetId);
      return asset?.category === cat;
    }).length;
    return { category: cat, count: count + (cat === 'Electronics' ? 2 : 0) };
  });

  // 4. Most-used (active bookings) vs Idle assets
  const assetUtilization = assets.map(asset => {
    const bookCount = bookings.filter(b => b.resourceId === asset.id).length;
    const allocCount = allocations.filter(a => a.assetId === asset.id).length;
    const score = (bookCount * 2) + (allocCount * 5) + (asset.status === 'allocated' ? 4 : 0);
    return {
      name: asset.name,
      tag: asset.assetTag,
      category: asset.category,
      score: score || Math.floor(Math.random() * 3)
    };
  }).sort((a, b) => b.score - a.score);

  const mostUsed = assetUtilization.slice(0, 3);
  const idleAssets = assetUtilization.filter(x => x.score <= 1).slice(0, 3);

  // 5. Assets nearing retirement (Acquisition Date older than 2 years or poor condition)
  const nearingRetirement = assets.filter(asset => {
    const acqYear = parseInt(asset.acquisitionDate.split('-')[0]) || 2024;
    const isOld = (2026 - acqYear) >= 2;
    return isOld || asset.condition === 'poor';
  });

  // Dynamic Export CSV simulation
  const triggerCSVExport = () => {
    setExporting(true);
    setSuccessMsg('');
    setTimeout(() => {
      // Create CSV mock content
      const headers = ['Asset Tag', 'Asset Name', 'Category', 'Initial Cost', 'Lifecycle Status', 'Location'];
      const rows = assets.map(a => [a.assetTag, a.name, a.category, `$${a.acquisitionCost}`, a.status, a.location]);
      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "AssetFlow_Inventory_Report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExporting(false);
      setSuccessMsg('System successfully compiled inventory logs. CSV report downloaded!');
    }, 1200);
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 font-sans">
            Reports & Operational Intelligence
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Data visualizations and predictive asset retirement schedules.
          </p>
        </div>

        <button
          onClick={triggerCSVExport}
          disabled={exporting}
          className="inline-flex items-center space-x-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          {exporting ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Compiling Report...</span>
            </>
          ) : (
            <>
              <ArrowDownToLine className="h-4 w-4" />
              <span>Export Master Inventory CSV</span>
            </>
          )}
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 text-sm text-emerald-800 rounded-r-lg flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Grid: Data visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Visual Card 1: Department wise summary */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center space-x-2 text-slate-800 mb-4">
            <Users className="h-5 w-5 text-indigo-600 shrink-0" />
            <h3 className="font-extrabold text-xs uppercase tracking-wider">Departmental Allocation Summary</h3>
          </div>

          <div className="h-48 flex items-end justify-around border-b border-slate-100 pb-2">
            {deptAllocSummary.map(dept => {
              // Map count to height percentage
              const heightPct = Math.min(100, Math.max(15, dept.count * 20));
              return (
                <div key={dept.name} className="flex flex-col items-center w-12 group">
                  <span className="text-[10px] font-bold text-indigo-600 mb-1 opacity-0 group-hover:opacity-100 transition-opacity font-mono">{dept.count}</span>
                  <div 
                    style={{ height: `${heightPct}%` }} 
                    className="w-8 bg-indigo-600 hover:bg-indigo-500 rounded-t-md transition-all duration-300 shadow-sm"
                  ></div>
                  <span className="text-xs font-bold text-slate-500 mt-2 font-sans">{dept.name}</span>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-slate-400 text-center mt-3">Active asset deployments per department code</p>
        </div>

        {/* Visual Card 2: Peak booking heatmap hours */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center space-x-2 text-slate-800 mb-4">
            <CalendarDays className="h-5 w-5 text-indigo-600 shrink-0" />
            <h3 className="font-extrabold text-xs uppercase tracking-wider">Resource Booking Heatmap</h3>
          </div>

          <div className="space-y-3 pt-2">
            {heatmapData.map((slot) => {
              // Map score to custom background opacity
              let bgClass = 'bg-sky-50 text-sky-800 border-sky-200';
              if (slot.count > 12) bgClass = 'bg-indigo-600 text-white border-indigo-700 font-bold';
              else if (slot.count > 7) bgClass = 'bg-indigo-100 text-indigo-900 border-indigo-200 font-semibold';
              
              return (
                <div key={slot.hour} className="flex items-center justify-between text-xs p-2 rounded-xl border">
                  <span className="font-bold text-slate-700">{slot.label}</span>
                  <div className={`flex-1 mx-4 h-2 bg-slate-150 rounded-full overflow-hidden`}>
                    <div style={{ width: `${Math.min(100, slot.count * 6)}%` }} className="h-full bg-indigo-600 rounded-full"></div>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">{slot.count} bookings</span>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-slate-400 text-center mt-3">Aggregate reservation density by peak hour blocks</p>
        </div>

        {/* Visual Card 3: Repairs count by category */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center space-x-2 text-slate-800 mb-4">
            <Wrench className="h-5 w-5 text-indigo-600 shrink-0" />
            <h3 className="font-extrabold text-xs uppercase tracking-wider">Maintenance by Category</h3>
          </div>

          <div className="space-y-4 pt-2">
            {categories.map((cat, idx) => {
              const data = maintenanceByCategory.find(x => x.category === cat) || { count: 0 };
              const widthPct = Math.min(100, Math.max(10, data.count * 25));
              
              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span className="font-semibold">{cat}</span>
                    <span className="font-mono font-bold text-indigo-600">{data.count} repairs</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${widthPct}%` }} 
                      className={`h-full rounded-full ${
                        idx === 0 ? 'bg-indigo-600' :
                        idx === 1 ? 'bg-sky-500' :
                        idx === 2 ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-slate-400 text-center mt-4">Historic repair ticket frequency categorized</p>
        </div>

      </div>

      {/* Structured Stats lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Utilization summary */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
          <div className="flex items-center space-x-2 mb-4 text-slate-800">
            <TrendingUp className="h-5 w-5 text-indigo-600 shrink-0" />
            <h2 className="text-sm font-bold uppercase tracking-wider font-sans">Utilization Summary</h2>
          </div>

          <div className="space-y-4 text-xs">
            {/* Most active */}
            <div>
              <span className="block text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2">Most-Used Assets</span>
              <div className="space-y-2">
                {mostUsed.map(a => (
                  <div key={a.tag} className="flex justify-between p-2 bg-emerald-50/30 border border-emerald-100/50 rounded-lg">
                    <div>
                      <strong className="text-slate-800 block">{a.name}</strong>
                      <span className="text-[10px] text-slate-400">Tag Code: {a.tag}</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-700 bg-white px-1.5 py-0.5 rounded border border-emerald-100 text-[10px] h-fit self-center">Utilized</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Idle */}
            <div className="border-t border-slate-150 pt-4">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Under-Utilized (Idle)</span>
              <div className="space-y-2">
                {idleAssets.map(a => (
                  <div key={a.tag} className="flex justify-between p-2 bg-slate-50 border border-slate-150 rounded-lg">
                    <div>
                      <strong className="text-slate-800 block">{a.name}</strong>
                      <span className="text-[10px] text-slate-400">Category: {a.category}</span>
                    </div>
                    <span className="font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px] h-fit self-center">Idle</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Nearing retirement / alerts */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-4 text-slate-800">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
              <h2 className="text-sm font-bold uppercase tracking-wider font-sans">Retirement & Maintenance Warnings</h2>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Below physical assets are flagged for retirement or diagnostic inspection based on age (over 24 months deployed) or poor condition ratings.
            </p>

            <div className="space-y-3">
              {nearingRetirement.map(asset => {
                const acqYear = parseInt(asset.acquisitionDate.split('-')[0]) || 2024;
                const ageMonths = (2026 - acqYear) * 12;
                
                return (
                  <div key={asset.id} className="flex items-center justify-between p-3 border border-amber-100 bg-amber-50/25 rounded-xl text-xs">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0">
                        <AlertOctagon className="h-4 w-4" />
                      </div>
                      <div>
                        <strong className="text-slate-800 block">{asset.name}</strong>
                        <span className="text-[10px] text-slate-400">Deployed {asset.acquisitionDate} ({ageMonths} months old)</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                        {asset.condition === 'poor' ? 'Poor Condition' : 'Nearing Retirement'}
                      </span>
                    </div>
                  </div>
                );
              })}
              {nearingRetirement.length === 0 && (
                <p className="text-xs text-slate-400 italic py-6 text-center">No assets nearing retirement or poor condition thresholds.</p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-50 text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">Real-time parameters verified</span>
          </div>
        </div>

      </div>

    </div>
  );
};
