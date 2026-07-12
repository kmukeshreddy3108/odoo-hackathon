import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  PlusCircle, 
  AlertCircle, 
  XCircle, 
  CheckCircle2, 
  CalendarDays,
  Trash2,
  Users
} from 'lucide-react';

interface ResourceBookingProps {
  directResourceId?: string;
  onClose?: () => void;
}

export const ResourceBooking: React.FC<ResourceBookingProps> = ({ directResourceId, onClose }) => {
  const { 
    assets, 
    bookings, 
    employees, 
    departments, 
    bookResource, 
    cancelBooking, 
    currentUser 
  } = useApp();

  const [selectedResourceId, setSelectedResourceId] = useState(directResourceId || '');
  
  // Form fields
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [bookingDeptId, setBookingDeptId] = useState('');

  // Feedbacks
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!currentUser) return null;

  // Filter bookable assets
  const sharedResources = assets.filter(a => a.shared && a.status === 'available');

  const selectedResource = assets.find(a => a.id === selectedResourceId);

  // Filter bookings for the selected resource on the specified date
  const resourceBookings = bookings.filter(b => 
    b.resourceId === selectedResourceId && 
    b.date === bookingDate && 
    b.status !== 'cancelled'
  ).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedResourceId || !bookingDate || !startTime || !endTime) {
      setErrorMsg('Please select a resource and specify the date and times.');
      return;
    }

    if (startTime >= endTime) {
      setErrorMsg('Invalid slot. Start time must precede end time.');
      return;
    }

    const result = bookResource(
      selectedResourceId, 
      bookingDate, 
      startTime, 
      endTime, 
      bookingDeptId || undefined
    );

    if (result.success) {
      setSuccessMsg(`Booking confirmed for ${selectedResource?.name}!`);
      setStartTime('11:00');
      setEndTime('12:00');
      setBookingDeptId('');
      if (onClose) onClose();
    } else {
      setErrorMsg(result.error || 'Failed to complete booking.');
    }
  };

  const getAssigneeName = (empId: string) => {
    return employees.find(e => e.id === empId)?.name || 'Team member';
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-sky-50 text-sky-700 border-sky-100';
      case 'ongoing': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'cancelled': return 'bg-slate-100 text-slate-500 border-slate-200';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-100 pb-5">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 font-sans">
          Central Resource Booking Engine
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Schedule time-slots for corporate spaces and shared equipment with absolute overlap prevention.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Choose shared resource and date */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs space-y-5">
          <h2 className="text-base font-extrabold text-slate-800 font-sans">Resource Selector</h2>
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Select Shared Resource</label>
            <select
              value={selectedResourceId}
              onChange={(e) => { setSelectedResourceId(e.target.value); setErrorMsg(''); setSuccessMsg(''); }}
              className="block w-full px-3 py-2.5 border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
            >
              <option value="">Select Resource...</option>
              {sharedResources.map(res => (
                <option key={res.id} value={res.id}>
                  {res.name} ({res.location})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Schedule Date</label>
            <input
              type="date"
              value={bookingDate}
              onChange={(e) => { setBookingDate(e.target.value); setErrorMsg(''); setSuccessMsg(''); }}
              className="block w-full px-3 py-2.5 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
            />
          </div>

          {selectedResource && (
            <div className="bg-indigo-50/50 p-4 border border-indigo-100 rounded-xl space-y-3">
              <div className="flex items-center space-x-2 text-indigo-900">
                <CalendarDays className="h-5 w-5 text-indigo-600 shrink-0" />
                <h3 className="font-extrabold text-xs uppercase tracking-wider">Specifications</h3>
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <p>Location: <strong className="text-slate-800">{selectedResource.location}</strong></p>
                <p>Condition: <strong className="text-slate-800 capitalize">{selectedResource.condition}</strong></p>
                {selectedResource.categoryFields && Object.entries(selectedResource.categoryFields).map(([k, v]) => (
                  <p key={k}>{k}: <strong className="text-slate-800">{v}</strong></p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Center column: Agenda (Bookings List for Date) */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-extrabold text-slate-800 font-sans">Agenda timeline</h2>
              <span className="text-xs font-bold text-indigo-600 font-mono">{bookingDate}</span>
            </div>

            {!selectedResourceId ? (
              <p className="text-xs text-slate-400 py-12 text-center italic border-2 border-dashed border-slate-100 rounded-xl">
                Please select a shared resource from the selector panel to view active agendas.
              </p>
            ) : (
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Scheduled Slots</span>
                {resourceBookings.map((book) => (
                  <div key={book.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{book.startTime} — {book.endTime}</h4>
                        <p className="text-xs text-slate-500">Scheduled by {getAssigneeName(book.employeeId)}</p>
                      </div>
                    </div>
                    
                    <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${getStatusBadgeClass(book.status)}`}>
                      {book.status}
                    </span>
                  </div>
                ))}
                {resourceBookings.length === 0 && (
                  <div className="text-center py-10 bg-emerald-50/30 border border-emerald-100 rounded-xl text-emerald-800 p-4">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                    <p className="text-xs font-bold font-sans">No conflicts. Open timeline!</p>
                    <p className="text-[10px] text-slate-400 mt-1">This whole date is completely empty and ready to register bookings.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Create Booking form */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs">
            <h2 className="text-base font-extrabold text-slate-800 font-sans mb-4">Book Time Slot</h2>

            {errorMsg && (
              <div className="mb-4 bg-red-50 border border-red-100 text-red-800 p-3.5 rounded-xl text-xs flex items-start gap-2">
                <AlertCircle className="h-4.5 w-4.5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Booking Conflict Detected!</strong>
                  <p className="mt-1 leading-relaxed text-[11px]">{errorMsg}</p>
                </div>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 bg-emerald-50 border border-emerald-100 text-emerald-800 p-3.5 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Book on Behalf of Dept (Optional)</label>
                <select
                  value={bookingDeptId}
                  onChange={(e) => setBookingDeptId(e.target.value)}
                  className="block w-full px-3 py-2.5 border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                >
                  <option value="">No, book on individual behalf</option>
                  {departments.filter(d => d.status === 'active').map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={!selectedResourceId}
                className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs transition-all flex justify-center items-center space-x-2 ${
                  selectedResourceId 
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-sm' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <PlusCircle className="h-4 w-4" />
                <span>Confirm Reservation Block</span>
              </button>
            </form>
          </div>

          {/* User's Own Bookings summary */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md">
            <h3 className="font-extrabold text-indigo-400 font-sans text-sm uppercase tracking-wider mb-3">Your Bookings List</h3>
            
            <div className="space-y-3">
              {bookings
                .filter(b => b.employeeId === currentUser.id && b.status !== 'cancelled')
                .map((book) => {
                  const res = assets.find(a => a.id === book.resourceId);
                  
                  return (
                    <div key={book.id} className="p-3 border border-slate-800 rounded-xl bg-slate-950/40 text-xs space-y-2">
                      <div className="flex justify-between items-start">
                        <strong className="text-white block">{res?.name}</strong>
                        <button
                          onClick={() => cancelBooking(book.id)}
                          className="text-slate-500 hover:text-red-400 cursor-pointer p-0.5"
                          title="Cancel Reservation"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex justify-between items-center text-slate-400">
                        <span>{book.date}</span>
                        <span className="font-mono">{book.startTime} - {book.endTime}</span>
                      </div>
                    </div>
                  );
                })}
              {bookings.filter(b => b.employeeId === currentUser.id && b.status !== 'cancelled').length === 0 && (
                <p className="text-xs text-slate-500 italic py-2 text-center">You have no active bookings registered.</p>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
