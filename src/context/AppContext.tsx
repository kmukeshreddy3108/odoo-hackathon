import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Department, 
  AssetCategory, 
  Employee, 
  Asset, 
  Allocation, 
  ResourceBooking, 
  MaintenanceRequest, 
  AuditCycle, 
  AuditItem, 
  Notification, 
  ActivityLog, 
  TransferRequest,
  UserRole
} from '../types';
import { 
  INITIAL_DEPARTMENTS, 
  INITIAL_CATEGORIES, 
  INITIAL_EMPLOYEES, 
  INITIAL_ASSETS, 
  INITIAL_ALLOCATIONS, 
  INITIAL_BOOKINGS, 
  INITIAL_MAINTENANCE, 
  INITIAL_AUDITS, 
  INITIAL_AUDIT_ITEMS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_ACTIVITY_LOGS,
  INITIAL_TRANSFERS
} from '../data/seed';

interface AppContextType {
  departments: Department[];
  categories: AssetCategory[];
  employees: Employee[];
  assets: Asset[];
  allocations: Allocation[];
  bookings: ResourceBooking[];
  maintenanceRequests: MaintenanceRequest[];
  auditCycles: AuditCycle[];
  auditItems: AuditItem[];
  transferRequests: TransferRequest[];
  notifications: Notification[];
  activityLogs: ActivityLog[];
  
  // Auth
  currentUser: Employee | null;
  setCurrentUser: (user: Employee | null) => void;
  login: (email: string) => boolean;
  signup: (name: string, email: string, departmentId: string) => boolean;
  logout: () => void;
  
  // Mutations
  addDepartment: (dept: Omit<Department, 'id'>) => void;
  updateDepartment: (id: string, updated: Partial<Department>) => void;
  
  addCategory: (cat: Omit<AssetCategory, 'id'>) => void;
  updateCategory: (id: string, updated: Partial<AssetCategory>) => void;
  
  updateEmployee: (id: string, updated: Partial<Employee>) => void;
  promoteEmployee: (id: string, role: UserRole) => void;
  
  registerAsset: (asset: Omit<Asset, 'id' | 'assetTag' | 'status'>) => void;
  updateAsset: (id: string, updated: Partial<Asset>) => void;
  
  allocateAsset: (assetId: string, targetId: string, targetType: 'employee' | 'department', expectedReturnDate?: string, notes?: string) => { success: boolean; error?: string; holder?: string };
  initiateTransfer: (assetId: string, targetEmployeeId: string) => void;
  approveTransfer: (transferId: string) => void;
  rejectTransfer: (transferId: string) => void;
  returnAsset: (assetId: string, checkInNotes: string, condition: Asset['condition']) => void;
  
  bookResource: (resourceId: string, date: string, startTime: string, endTime: string, departmentId?: string) => { success: boolean; error?: string };
  cancelBooking: (id: string) => void;
  
  raiseMaintenanceRequest: (assetId: string, description: string, priority: MaintenanceRequest['priority']) => void;
  updateMaintenanceStatus: (requestId: string, status: MaintenanceRequest['status'], notes?: string, technician?: string) => void;
  
  createAuditCycle: (name: string, departmentId?: string, location?: string, startDate?: string, endDate?: string, auditors?: string[]) => void;
  updateAuditItem: (itemId: string, status: AuditItem['status'], notes?: string) => void;
  closeAuditCycle: (cycleId: string) => void;
  
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial states or use seeds
  const [departments, setDepartments] = useState<Department[]>(() => 
    JSON.parse(localStorage.getItem('af_departments') || JSON.stringify(INITIAL_DEPARTMENTS))
  );
  const [categories, setCategories] = useState<AssetCategory[]>(() => 
    JSON.parse(localStorage.getItem('af_categories') || JSON.stringify(INITIAL_CATEGORIES))
  );
  const [employees, setEmployees] = useState<Employee[]>(() => 
    JSON.parse(localStorage.getItem('af_employees') || JSON.stringify(INITIAL_EMPLOYEES))
  );
  const [assets, setAssets] = useState<Asset[]>(() => 
    JSON.parse(localStorage.getItem('af_assets') || JSON.stringify(INITIAL_ASSETS))
  );
  const [allocations, setAllocations] = useState<Allocation[]>(() => 
    JSON.parse(localStorage.getItem('af_allocations') || JSON.stringify(INITIAL_ALLOCATIONS))
  );
  const [bookings, setBookings] = useState<ResourceBooking[]>(() => 
    JSON.parse(localStorage.getItem('af_bookings') || JSON.stringify(INITIAL_BOOKINGS))
  );
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>(() => 
    JSON.parse(localStorage.getItem('af_maintenance') || JSON.stringify(INITIAL_MAINTENANCE))
  );
  const [auditCycles, setAuditCycles] = useState<AuditCycle[]>(() => 
    JSON.parse(localStorage.getItem('af_audit_cycles') || JSON.stringify(INITIAL_AUDITS))
  );
  const [auditItems, setAuditItems] = useState<AuditItem[]>(() => 
    JSON.parse(localStorage.getItem('af_audit_items') || JSON.stringify(INITIAL_AUDIT_ITEMS))
  );
  const [transferRequests, setTransferRequests] = useState<TransferRequest[]>(() => 
    JSON.parse(localStorage.getItem('af_transfers') || JSON.stringify(INITIAL_TRANSFERS))
  );
  const [notifications, setNotifications] = useState<Notification[]>(() => 
    JSON.parse(localStorage.getItem('af_notifications') || JSON.stringify(INITIAL_NOTIFICATIONS))
  );
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => 
    JSON.parse(localStorage.getItem('af_activity_logs') || JSON.stringify(INITIAL_ACTIVITY_LOGS))
  );
  
  // Auth Session
  const [currentUser, setCurrentUser] = useState<Employee | null>(() => {
    const saved = localStorage.getItem('af_current_user');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES[0]; // Defaults to Alex Rivera (Admin) for instant preview
  });

  // Save changes to localStorage
  useEffect(() => { localStorage.setItem('af_departments', JSON.stringify(departments)); }, [departments]);
  useEffect(() => { localStorage.setItem('af_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('af_employees', JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem('af_assets', JSON.stringify(assets)); }, [assets]);
  useEffect(() => { localStorage.setItem('af_allocations', JSON.stringify(allocations)); }, [allocations]);
  useEffect(() => { localStorage.setItem('af_bookings', JSON.stringify(bookings)); }, [bookings]);
  useEffect(() => { localStorage.setItem('af_maintenance', JSON.stringify(maintenanceRequests)); }, [maintenanceRequests]);
  useEffect(() => { localStorage.setItem('af_audit_cycles', JSON.stringify(auditCycles)); }, [auditCycles]);
  useEffect(() => { localStorage.setItem('af_audit_items', JSON.stringify(auditItems)); }, [auditItems]);
  useEffect(() => { localStorage.setItem('af_transfers', JSON.stringify(transferRequests)); }, [transferRequests]);
  useEffect(() => { localStorage.setItem('af_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('af_activity_logs', JSON.stringify(activityLogs)); }, [activityLogs]);
  useEffect(() => { 
    if (currentUser) {
      localStorage.setItem('af_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('af_current_user');
    }
  }, [currentUser]);

  // Helper: Log Activity
  const logActivity = (action: string, details: string, userOverride?: Employee) => {
    const user = userOverride || currentUser;
    if (!user) return;
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action,
      details,
      createdAt: new Date().toISOString(),
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  // Helper: Add Notification
  const addNotification = (userId: string, title: string, message: string, type: Notification['type']) => {
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Check Overdue return intervals
  useEffect(() => {
    const checkOverdueAllocations = () => {
      const todayStr = new Date().toISOString().split('T')[0];
      let updatedAllocations = false;
      const nextAllocations = allocations.map(alloc => {
        if (alloc.status === 'active' && alloc.expectedReturnDate && alloc.expectedReturnDate < todayStr) {
          updatedAllocations = true;
          // Notify assignee
          if (alloc.employeeId) {
            addNotification(
              alloc.employeeId,
              'Asset Return Overdue!',
              `Your allocated asset is past its return date (${alloc.expectedReturnDate}). Please check in.`,
              'alert'
            );
          }
          return { ...alloc, status: 'overdue' as const };
        }
        return alloc;
      });

      if (updatedAllocations) {
        setAllocations(nextAllocations);
      }
    };
    checkOverdueAllocations();
  }, []);

  // --- Auth Actions ---
  const login = (email: string): boolean => {
    const found = employees.find(emp => emp.email.toLowerCase() === email.toLowerCase() && emp.status === 'active');
    if (found) {
      setCurrentUser(found);
      logActivity('User Login', `Successfully logged in.`, found);
      return true;
    }
    return false;
  };

  const signup = (name: string, email: string, departmentId: string): boolean => {
    const exists = employees.some(emp => emp.email.toLowerCase() === email.toLowerCase());
    if (exists) return false;

    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      name,
      email,
      departmentId,
      role: 'employee', // Default is employee
      status: 'active'
    };

    setEmployees(prev => [...prev, newEmp]);
    setCurrentUser(newEmp);
    logActivity('User Registration', `Registered a new employee account.`, newEmp);
    addNotification('all', 'New Team Member', `${name} joined the organization.`, 'info');
    return true;
  };

  const logout = () => {
    if (currentUser) {
      logActivity('User Logout', `Logged out.`);
    }
    setCurrentUser(null);
  };

  // --- Department Actions ---
  const addDepartment = (dept: Omit<Department, 'id'>) => {
    const newDept: Department = {
      ...dept,
      id: `dept-${Date.now()}`
    };
    setDepartments(prev => [...prev, newDept]);
    logActivity('Create Department', `Created department: ${dept.name} (${dept.code})`);
  };

  const updateDepartment = (id: string, updated: Partial<Department>) => {
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, ...updated } as Department : d));
    logActivity('Update Department', `Updated department details for ID: ${id}`);
  };

  // --- Category Actions ---
  const addCategory = (cat: Omit<AssetCategory, 'id'>) => {
    const newCat: AssetCategory = {
      ...cat,
      id: `cat-${Date.now()}`
    };
    setCategories(prev => [...prev, newCat]);
    logActivity('Create Asset Category', `Created category: ${cat.name}`);
  };

  const updateCategory = (id: string, updated: Partial<AssetCategory>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updated } as AssetCategory : c));
    logActivity('Update Asset Category', `Updated asset category ID: ${id}`);
  };

  // --- Employee Promotion ---
  const updateEmployee = (id: string, updated: Partial<Employee>) => {
    setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, ...updated } as Employee : emp));
    logActivity('Update Employee', `Modified employee ID: ${id}`);
  };

  const promoteEmployee = (id: string, role: UserRole) => {
    const target = employees.find(e => e.id === id);
    if (!target) return;
    setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, role } : emp));
    
    logActivity('Promote Employee', `Promoted ${target.name} to ${role.replace('_', ' ').toUpperCase()}`);
    addNotification(id, 'Role Promoted', `You have been promoted to ${role.replace('_', ' ').toUpperCase()} by the Administrator.`, 'success');
  };

  // --- Asset Actions ---
  const registerAsset = (assetData: Omit<Asset, 'id' | 'assetTag' | 'status'>) => {
    // Generate simple sequential or unique tag
    const index = assets.length + 1;
    const pad = (num: number, size: number) => {
      let s = num + "";
      while (s.length < size) s = "0" + s;
      return s;
    };
    const tag = `AF-${pad(index, 4)}`;

    const newAsset: Asset = {
      ...assetData,
      id: `asset-${Date.now()}`,
      assetTag: tag,
      status: 'available'
    };

    setAssets(prev => [...prev, newAsset]);
    logActivity('Register Asset', `Registered asset ${newAsset.name} with Tag: ${tag}`);
    addNotification('all', 'New Asset Registered', `New ${assetData.category} asset "${assetData.name}" has been registered.`, 'info');
  };

  const updateAsset = (id: string, updated: Partial<Asset>) => {
    setAssets(prev => prev.map(ast => ast.id === id ? { ...ast, ...updated } as Asset : ast));
  };

  // --- Allocation, Returns & Transfers ---
  const allocateAsset = (
    assetId: string, 
    targetId: string, 
    targetType: 'employee' | 'department', 
    expectedReturnDate?: string, 
    notes?: string
  ): { success: boolean; error?: string; holder?: string } => {
    
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return { success: false, error: 'Asset not found' };

    // Check conflict: Cannot allocate an asset that is already allocated
    if (asset.status === 'allocated' || asset.status === 'reserved' || asset.status === 'under_maintenance') {
      const activeAlloc = allocations.find(a => a.assetId === assetId && (a.status === 'active' || a.status === 'overdue'));
      let holderName = 'Another user';
      if (activeAlloc) {
        if (activeAlloc.employeeId) {
          const emp = employees.find(e => e.id === activeAlloc.employeeId);
          if (emp) holderName = emp.name;
        } else if (activeAlloc.departmentId) {
          const d = departments.find(dep => dep.id === activeAlloc.departmentId);
          if (d) holderName = d.name;
        }
      }
      return { success: false, error: 'Asset is currently held', holder: holderName };
    }

    // Allocate
    const newAlloc: Allocation = {
      id: `alloc-${Date.now()}`,
      assetId,
      employeeId: targetType === 'employee' ? targetId : undefined,
      departmentId: targetType === 'department' ? targetId : undefined,
      allocatedDate: new Date().toISOString().split('T')[0],
      expectedReturnDate,
      notes,
      status: 'active'
    };

    setAllocations(prev => [...prev, newAlloc]);
    setAssets(prev => prev.map(a => a.id === assetId ? { ...a, status: 'allocated' } : a));

    const assigneeName = targetType === 'employee' 
      ? (employees.find(e => e.id === targetId)?.name || 'Employee')
      : (departments.find(d => d.id === targetId)?.name || 'Department');

    logActivity('Allocate Asset', `Allocated "${asset.name}" (${asset.assetTag}) to ${assigneeName}`);
    if (targetType === 'employee') {
      addNotification(targetId, 'Asset Allocated', `You have been allocated "${asset.name}" (${asset.assetTag}).`, 'success');
    }
    return { success: true };
  };

  const initiateTransfer = (assetId: string, targetEmployeeId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;

    const activeAlloc = allocations.find(a => a.assetId === assetId && (a.status === 'active' || a.status === 'overdue'));
    const fromEmployeeId = activeAlloc?.employeeId || '';

    const newTransfer: TransferRequest = {
      id: `transfer-${Date.now()}`,
      assetId,
      fromEmployeeId,
      toEmployeeId: targetEmployeeId,
      requestedDate: new Date().toISOString().split('T')[0],
      status: 'pending'
    };

    setTransferRequests(prev => [...prev, newTransfer]);
    
    const sender = employees.find(e => e.id === fromEmployeeId)?.name || 'Unknown';
    const receiverName = employees.find(e => e.id === targetEmployeeId)?.name || 'Unknown';
    logActivity('Transfer Request', `Requested transfer of "${asset.name}" from ${sender} to ${receiverName}`);
    
    // Notify managers & department heads
    addNotification('all', 'Transfer Requested', `${sender} requested to transfer "${asset.name}" to ${receiverName}.`, 'warning');
  };

  const approveTransfer = (transferId: string) => {
    const req = transferRequests.find(t => t.id === transferId);
    if (!req) return;

    // 1. Mark transfer approved
    setTransferRequests(prev => prev.map(t => t.id === transferId ? { 
      ...t, 
      status: 'approved', 
      approvedBy: currentUser?.id, 
      approvalDate: new Date().toISOString().split('T')[0] 
    } : t));

    // 2. Terminate past allocation
    setAllocations(prev => prev.map(alloc => {
      if (alloc.assetId === req.assetId && (alloc.status === 'active' || alloc.status === 'overdue')) {
        return { ...alloc, status: 'returned', returnedDate: new Date().toISOString().split('T')[0] };
      }
      return alloc;
    }));

    // 3. Create new allocation
    const newAlloc: Allocation = {
      id: `alloc-${Date.now()}`,
      assetId: req.assetId,
      employeeId: req.toEmployeeId,
      allocatedDate: new Date().toISOString().split('T')[0],
      status: 'active',
      notes: 'Transferred from previous holder'
    };
    setAllocations(prev => [...prev, newAlloc]);

    const asset = assets.find(a => a.id === req.assetId);
    const receiverName = employees.find(e => e.id === req.toEmployeeId)?.name || 'Employee';
    const senderName = employees.find(e => e.id === req.fromEmployeeId)?.name || 'Employee';

    logActivity('Transfer Approved', `Approved transfer of "${asset?.name}" to ${receiverName}`);
    
    addNotification(req.toEmployeeId, 'Transfer Approved', `The transfer of "${asset?.name}" was approved. It is now allocated to you.`, 'success');
    addNotification(req.fromEmployeeId, 'Transfer Completed', `The asset "${asset?.name}" has been transferred to ${receiverName}.`, 'info');
  };

  const rejectTransfer = (transferId: string) => {
    setTransferRequests(prev => prev.map(t => t.id === transferId ? { ...t, status: 'rejected' } : t));
    const req = transferRequests.find(t => t.id === transferId);
    if (req) {
      const asset = assets.find(a => a.id === req.assetId);
      logActivity('Transfer Rejected', `Rejected transfer of "${asset?.name}"`);
      addNotification(req.fromEmployeeId, 'Transfer Rejected', `The transfer request for "${asset?.name}" was declined.`, 'warning');
    }
  };

  const returnAsset = (assetId: string, checkInNotes: string, condition: Asset['condition']) => {
    // End active allocation
    setAllocations(prev => prev.map(alloc => {
      if (alloc.assetId === assetId && (alloc.status === 'active' || alloc.status === 'overdue')) {
        return { 
          ...alloc, 
          status: 'returned', 
          returnedDate: new Date().toISOString().split('T')[0],
          conditionCheckIn: checkInNotes
        };
      }
      return alloc;
    }));

    // Revert asset state to available
    setAssets(prev => prev.map(a => a.id === assetId ? { ...a, status: 'available', condition } : a));

    const asset = assets.find(a => a.id === assetId);
    logActivity('Return Asset', `Returned "${asset?.name}" with condition "${condition}". Notes: ${checkInNotes}`);
    
    // Notify return
    addNotification('all', 'Asset Returned', `Asset "${asset?.name}" (${asset?.assetTag}) has been checked back in.`, 'success');
  };

  // --- Resource Bookings (Shared assets) ---
  const bookResource = (
    resourceId: string, 
    date: string, 
    startTime: string, 
    endTime: string, 
    departmentId?: string
  ): { success: boolean; error?: string } => {
    if (!currentUser) return { success: false, error: 'Not authenticated' };

    // Overlap validation: Two people cannot book the same room/asset at overlapping times on same date
    const overlaps = bookings.some(b => {
      if (b.resourceId !== resourceId || b.date !== date || b.status === 'cancelled') return false;
      // b.startTime vs startTime, b.endTime vs endTime
      // Overlap occurs if max(start1, start2) < min(end1, end2)
      return startTime < b.endTime && b.startTime < endTime;
    });

    if (overlaps) {
      return { success: false, error: 'Time slot overlaps with an existing booking.' };
    }

    const newBooking: ResourceBooking = {
      id: `book-${Date.now()}`,
      resourceId,
      employeeId: currentUser.id,
      departmentId,
      date,
      startTime,
      endTime,
      status: 'upcoming'
    };

    setBookings(prev => [...prev, newBooking]);
    const resource = assets.find(a => a.id === resourceId);
    logActivity('Book Resource', `Booked "${resource?.name}" on ${date} from ${startTime} to ${endTime}`);
    
    addNotification(currentUser.id, 'Booking Confirmed', `Booking confirmed for "${resource?.name}" on ${date} @ ${startTime}-${endTime}.`, 'success');
    return { success: true };
  };

  const cancelBooking = (id: string) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    const b = bookings.find(x => x.id === id);
    if (b) {
      const resource = assets.find(a => a.id === b.resourceId);
      logActivity('Cancel Booking', `Cancelled booking for "${resource?.name}" on ${b.date}`);
      addNotification(b.employeeId, 'Booking Cancelled', `Your booking for "${resource?.name}" was cancelled.`, 'info');
    }
  };

  // --- Maintenance Requests ---
  const raiseMaintenanceRequest = (assetId: string, description: string, priority: MaintenanceRequest['priority']) => {
    if (!currentUser) return;
    const newMaint: MaintenanceRequest = {
      id: `maint-${Date.now()}`,
      assetId,
      reportedBy: currentUser.id,
      description,
      priority,
      status: 'pending',
      reportedDate: new Date().toISOString().split('T')[0]
    };

    setMaintenanceRequests(prev => [...prev, newMaint]);
    const asset = assets.find(a => a.id === assetId);
    logActivity('Raise Maintenance', `Raised maintenance request for "${asset?.name}" (${asset?.assetTag})`);
    
    // Notify managers
    addNotification('all', 'Maintenance Requested', `Repair requested for "${asset?.name}" - Priority: ${priority.toUpperCase()}`, 'warning');
  };

  const updateMaintenanceStatus = (
    requestId: string, 
    status: MaintenanceRequest['status'], 
    notes?: string, 
    technician?: string
  ) => {
    setMaintenanceRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        const updated = { ...req, status, notes: notes || req.notes, assignedTechnician: technician || req.assignedTechnician };
        if (status === 'resolved') {
          updated.resolvedDate = new Date().toISOString().split('T')[0];
        }
        return updated;
      }
      return req;
    }));

    const req = maintenanceRequests.find(r => r.id === requestId);
    if (!req) return;
    const asset = assets.find(a => a.id === req.assetId);

    // If approved, asset status auto-updates to under_maintenance
    if (status === 'approved') {
      setAssets(prev => prev.map(a => a.id === req.assetId ? { ...a, status: 'under_maintenance' } : a));
      logActivity('Maintenance Approved', `Maintenance request approved for "${asset?.name}". Asset status updated to Under Maintenance.`);
      addNotification(req.reportedBy, 'Maintenance Approved', `Your repair request for "${asset?.name}" was approved.`, 'success');
    } 
    // If resolved, asset status reverts to available
    else if (status === 'resolved') {
      setAssets(prev => prev.map(a => a.id === req.assetId ? { ...a, status: 'available' } : a));
      logActivity('Maintenance Resolved', `Maintenance request resolved for "${asset?.name}". Asset is now Available.`);
      addNotification(req.reportedBy, 'Maintenance Resolved', `Your repair request for "${asset?.name}" has been resolved.`, 'success');
    } else {
      logActivity('Maintenance Updated', `Repair status updated to ${status.replace('_', ' ').toUpperCase()} for "${asset?.name}"`);
    }
  };

  // --- Audit Operations ---
  const createAuditCycle = (
    name: string, 
    departmentId?: string, 
    location?: string, 
    startDate?: string, 
    endDate?: string, 
    auditors?: string[]
  ) => {
    const cycleId = `audit-${Date.now()}`;
    const newCycle: AuditCycle = {
      id: cycleId,
      name,
      departmentId,
      location,
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assignedAuditors: auditors || [],
      status: 'active',
      createdDate: new Date().toISOString().split('T')[0]
    };

    // Filter assets in scope to add to AuditItems
    const inScopeAssets = assets.filter(a => {
      if (departmentId) {
        // Find if allocated to department or allocated to employee who is in this department
        const alloc = allocations.find(x => x.assetId === a.id && (x.status === 'active' || x.status === 'overdue'));
        if (!alloc) return false;
        if (alloc.departmentId && alloc.departmentId === departmentId) return true;
        if (alloc.employeeId) {
          const emp = employees.find(e => e.id === alloc.employeeId);
          if (emp && emp.departmentId === departmentId) return true;
        }
        return false;
      }
      if (location && a.location.toLowerCase().includes(location.toLowerCase())) {
        return true;
      }
      return true; // All assets in scope by default if no filter
    });

    const newItems: AuditItem[] = inScopeAssets.map(a => ({
      id: `auditem-${Date.now()}-${a.id}`,
      auditCycleId: cycleId,
      assetId: a.id,
      status: 'pending'
    }));

    setAuditCycles(prev => [...prev, newCycle]);
    setAuditItems(prev => [...prev, ...newItems]);

    logActivity('Create Audit Cycle', `Initiated audit cycle: ${name} with ${inScopeAssets.length} assets.`);
    
    // Notify auditors
    if (auditors) {
      auditors.forEach(audId => {
        addNotification(audId, 'Assigned to Audit', `You have been assigned as an auditor for "${name}".`, 'info');
      });
    }
  };

  const updateAuditItem = (itemId: string, status: AuditItem['status'], notes?: string) => {
    setAuditItems(prev => prev.map(item => item.id === itemId ? { 
      ...item, 
      status, 
      notes: notes || item.notes,
      updatedAt: new Date().toISOString()
    } : item));
    
    const item = auditItems.find(i => i.id === itemId);
    if (item) {
      const asset = assets.find(a => a.id === item.assetId);
      logActivity('Audit Asset Verified', `Audit verified "${asset?.name}" as ${status.toUpperCase()}. Notes: ${notes || 'none'}`);
      
      if (status === 'missing' || status === 'damaged') {
        addNotification('all', 'Audit Discrepancy Flagged', `Asset "${asset?.name}" was marked as ${status.toUpperCase()} during audit.`, 'alert');
      }
    }
  };

  const closeAuditCycle = (cycleId: string) => {
    setAuditCycles(prev => prev.map(c => c.id === cycleId ? { ...c, status: 'closed' } : c));
    
    // Auto-update asset statuses based on missing items to "Lost"
    const items = auditItems.filter(item => item.auditCycleId === cycleId);
    let lostCount = 0;
    
    items.forEach(item => {
      if (item.status === 'missing') {
        setAssets(prev => prev.map(a => a.id === item.assetId ? { ...a, status: 'lost' } : a));
        lostCount++;
      }
    });

    const cycle = auditCycles.find(c => c.id === cycleId);
    logActivity('Close Audit Cycle', `Closed audit cycle "${cycle?.name}". Updated ${lostCount} missing assets to Lost.`);
    addNotification('all', 'Audit Cycle Closed', `Audit cycle "${cycle?.name}" has been completed and locked.`, 'success');
  };

  // --- Notification Actions ---
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <AppContext.Provider value={{
      departments,
      categories,
      employees,
      assets,
      allocations,
      bookings,
      maintenanceRequests,
      auditCycles,
      auditItems,
      transferRequests,
      notifications,
      activityLogs,
      currentUser,
      setCurrentUser,
      login,
      signup,
      logout,
      addDepartment,
      updateDepartment,
      addCategory,
      updateCategory,
      updateEmployee,
      promoteEmployee,
      registerAsset,
      updateAsset,
      allocateAsset,
      initiateTransfer,
      approveTransfer,
      rejectTransfer,
      returnAsset,
      bookResource,
      cancelBooking,
      raiseMaintenanceRequest,
      updateMaintenanceStatus,
      createAuditCycle,
      updateAuditItem,
      closeAuditCycle,
      markNotificationRead,
      clearNotifications
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
