import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Bell, 
  History, 
  Check, 
  Trash2, 
  User, 
  Clock, 
  ShieldAlert, 
  Mail, 
  Sparkles,
  Info,
  CheckCircle,
  AlertTriangle,
  Search
} from 'lucide-react';

export const ActivityLogs: React.FC = () => {
  const { 
    notifications, 
    activityLogs, 
    markNotificationRead, 
    clearNotifications, 
    currentUser 
  } = useApp();

  const [logSearch, setLogSearch] = useState('');

  if (!currentUser) return null;

  // Filter notifications for the current user or "all"
  const userNotifications = notifications.filter(n => n.userId === currentUser.id || n.userId === 'all');

  const filteredLogs = activityLogs.filter(log => {
    const query = logSearch.toLowerCase();
    return (
      log.action.toLowerCase().includes(query) ||
      log.details.toLowerCase().includes(query) ||
      log.userName.toLowerCase().includes(query) ||
      log.userRole.toLowerCase().includes(query)
    );
  });

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'alert': return <ShieldAlert className="h-4 w-4 text-rose-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      default: return <Info className="h-4 w-4 text-indigo-500" />;
    }
  };

  const getNotifBg = (notif: any) => {
    if (notif.read) return 'bg-white border-slate-100';
    switch (notif.type) {
      case 'alert': return 'bg-rose-50/50 border-rose-100 hover:bg-rose-50';
      case 'warning': return 'bg-amber-50/50 border-amber-100 hover:bg-amber-50';
      case 'success': return 'bg-emerald-50/50 border-emerald-100 hover:bg-emerald-50';
      default: return 'bg-indigo-50/50 border-indigo-100 hover:bg-indigo-50';
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-100 pb-5">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 font-sans">
          Operational Logs & Notification Center
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review personalized alert feeds and inspect the organizational audit ledger.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Notification Center */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-indigo-600 shrink-0" />
                <h2 className="text-base font-extrabold text-slate-800 font-sans">Alert Inbox</h2>
              </div>
              
              {userNotifications.length > 0 && (
                <button
                  onClick={clearNotifications}
                  className="inline-flex items-center space-x-1 text-[10px] text-slate-400 hover:text-red-500 font-bold uppercase cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {userNotifications.map((notif) => (
                <div 
                  key={notif.id} 
                  onClick={() => markNotificationRead(notif.id)}
                  className={`p-3.5 border rounded-xl flex items-start gap-3 transition-all cursor-pointer ${getNotifBg(notif)}`}
                >
                  <div className="mt-0.5 shrink-0">{getNotifIcon(notif.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-1">
                      <strong className="text-xs font-bold text-slate-800 leading-snug block">{notif.title}</strong>
                      {!notif.read && (
                        <span className="h-2 w-2 rounded-full bg-indigo-600 shrink-0 mt-1"></span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{notif.message}</p>
                    <span className="text-[9px] text-slate-400 font-mono mt-2 block">
                      {new Date(notif.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
              {userNotifications.length === 0 && (
                <div className="text-center py-12 bg-slate-50 border border-slate-100 rounded-xl">
                  <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">Inbox is empty</p>
                  <p className="text-[10px] text-slate-400 mt-1">No alerts or notifications are pending review.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column (2/3 width): System Audit Ledger */}
        <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-2xl shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <History className="h-5 w-5 text-indigo-600 shrink-0" />
              <h2 className="text-base font-extrabold text-slate-800 font-sans">Full System Audit Ledger</h2>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Search className="h-3.5 w-3.5 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Search action details..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="block w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
              />
            </div>
          </div>

          {/* Audit Ledger Timeline */}
          <div className="border border-slate-100 rounded-2xl max-h-[500px] overflow-y-auto divide-y divide-slate-100">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-50/30 transition-colors flex items-start gap-3">
                <div className="p-2.5 bg-slate-100 text-slate-500 rounded-xl shrink-0 mt-0.5 border border-slate-200/50">
                  <User className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0 text-xs text-slate-600">
                  <div className="flex flex-wrap justify-between items-center mb-1 gap-1">
                    <strong className="text-slate-800 font-bold text-sm">{log.action}</strong>
                    <span className="font-mono text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(log.createdAt).toLocaleString()}</span>
                    </span>
                  </div>
                  <p className="leading-relaxed bg-slate-50/50 p-2 border border-slate-100 rounded-lg font-medium text-slate-700 mt-1">{log.details}</p>
                  
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-[10px] text-slate-400">Authorized by:</span>
                    <span className="font-semibold text-slate-700 text-[11px]">{log.userName}</span>
                    <span className="text-[9px] bg-slate-100 px-1.5 py-0.2 rounded font-bold uppercase text-slate-500 tracking-wider">
                      {log.userRole.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {filteredLogs.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-12 italic">No logs found matching the query.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
