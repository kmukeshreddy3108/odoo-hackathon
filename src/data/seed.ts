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
  TransferRequest 
} from '../types';

export const INITIAL_DEPARTMENTS: Department[] = [
  { id: 'dept-1', name: 'Information Technology', code: 'IT', headId: 'emp-3', status: 'active' },
  { id: 'dept-2', name: 'Human Resources', code: 'HR', headId: 'emp-4', status: 'active' },
  { id: 'dept-3', name: 'Operations', code: 'OPS', headId: 'emp-5', status: 'active' },
  { id: 'dept-4', name: 'Product Design', code: 'DESIGN', headId: 'emp-6', status: 'active', parentDepartmentId: 'dept-1' },
];

export const INITIAL_CATEGORIES: AssetCategory[] = [
  { 
    id: 'cat-1', 
    name: 'Electronics', 
    fields: [
      { name: 'Warranty Period (months)', type: 'number', required: true, defaultValue: '24' },
      { name: 'Processor', type: 'string', required: false, defaultValue: 'Intel i7' }
    ] 
  },
  { 
    id: 'cat-2', 
    name: 'Furniture', 
    fields: [
      { name: 'Material', type: 'string', required: true, defaultValue: 'Wood' }
    ] 
  },
  { 
    id: 'cat-3', 
    name: 'Vehicles', 
    fields: [
      { name: 'License Plate', type: 'string', required: true },
      { name: 'Insurance Expiry', type: 'string', required: true }
    ] 
  },
  { 
    id: 'cat-4', 
    name: 'Shared Spaces', 
    fields: [
      { name: 'Capacity', type: 'number', required: true, defaultValue: '10' }
    ] 
  },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'emp-admin', name: 'Alex Rivera', email: 'admin@assetflow.com', departmentId: 'dept-1', role: 'admin', status: 'active' },
  { id: 'emp-mgr', name: 'Sarah Connor', email: 'manager@assetflow.com', departmentId: 'dept-1', role: 'asset_manager', status: 'active' },
  { id: 'emp-head', name: 'David Vance', email: 'head@assetflow.com', departmentId: 'dept-1', role: 'department_head', status: 'active' },
  { id: 'emp-employee', name: 'Sam Carter', email: 'employee@assetflow.com', departmentId: 'dept-3', role: 'employee', status: 'active' },
  { id: 'emp-priya', name: 'Priya Sharma', email: 'priya@assetflow.com', departmentId: 'dept-1', role: 'employee', status: 'active' },
  { id: 'emp-raj', name: 'Raj Patel', email: 'raj@assetflow.com', departmentId: 'dept-1', role: 'employee', status: 'active' },
  { id: 'emp-3', name: 'Elena Rostova', email: 'elena@assetflow.com', departmentId: 'dept-1', role: 'department_head', status: 'active' },
  { id: 'emp-4', name: 'Marcus Brody', email: 'marcus@assetflow.com', departmentId: 'dept-2', role: 'department_head', status: 'active' },
  { id: 'emp-5', name: 'Jane Doe', email: 'jane@assetflow.com', departmentId: 'dept-3', role: 'employee', status: 'active' },
  { id: 'emp-6', name: 'Zack Morris', email: 'zack@assetflow.com', departmentId: 'dept-4', role: 'employee', status: 'active' },
];

export const INITIAL_ASSETS: Asset[] = [
  {
    id: 'asset-1',
    name: 'MacBook Pro 16"',
    category: 'Electronics',
    assetTag: 'AF-0114', // Priya's Laptop for conflict scenario
    serialNumber: 'C02DF123L9Q1',
    acquisitionDate: '2025-01-15',
    acquisitionCost: 2499,
    condition: 'good',
    location: 'IT Lab - Floor 3',
    shared: false,
    status: 'allocated',
    categoryFields: { 'Warranty Period (months)': 24, 'Processor': 'Apple M3 Pro' }
  },
  {
    id: 'asset-2',
    name: 'Conference Room B2',
    category: 'Shared Spaces',
    assetTag: 'AF-2002',
    serialNumber: 'ROOM-B2',
    acquisitionDate: '2024-06-01',
    acquisitionCost: 15000,
    condition: 'good',
    location: 'HQ - Floor 2',
    shared: true,
    status: 'available',
    categoryFields: { 'Capacity': 12 }
  },
  {
    id: 'asset-3',
    name: 'Tesla Model 3',
    category: 'Vehicles',
    assetTag: 'AF-3001',
    serialNumber: '5YJ3E1EBXLF12345',
    acquisitionDate: '2024-03-10',
    acquisitionCost: 42000,
    condition: 'new',
    location: 'Garage Bay 4',
    shared: true,
    status: 'available',
    categoryFields: { 'License Plate': 'CA-9F382', 'Insurance Expiry': '2027-03-10' }
  },
  {
    id: 'asset-4',
    name: 'Ergonomic Desk Chair',
    category: 'Furniture',
    assetTag: 'AF-4001',
    serialNumber: 'CH-99381',
    acquisitionDate: '2025-02-20',
    acquisitionCost: 350,
    condition: 'good',
    location: 'HR Suite',
    shared: false,
    status: 'allocated',
    categoryFields: { 'Material': 'Mesh & Steel' }
  },
  {
    id: 'asset-5',
    name: 'Dell XPS 15',
    category: 'Electronics',
    assetTag: 'AF-0115',
    serialNumber: 'DELL-99238',
    acquisitionDate: '2025-05-12',
    acquisitionCost: 1800,
    condition: 'good',
    location: 'Storage Locker A',
    shared: false,
    status: 'available',
    categoryFields: { 'Warranty Period (months)': 12, 'Processor': 'Intel i9' }
  },
  {
    id: 'asset-6',
    name: 'Development Server Rack',
    category: 'Electronics',
    assetTag: 'AF-0116',
    serialNumber: 'SRV-8842',
    acquisitionDate: '2023-11-01',
    acquisitionCost: 8500,
    condition: 'fair',
    location: 'Server Room 1',
    shared: false,
    status: 'under_maintenance',
    categoryFields: { 'Warranty Period (months)': 36, 'Processor': 'Dual Xeon Gold' }
  }
];

export const INITIAL_ALLOCATIONS: Allocation[] = [
  {
    id: 'alloc-1',
    assetId: 'asset-1', // Priya's MacBook AF-0114
    employeeId: 'emp-priya', // Priya Sharma
    allocatedDate: '2025-01-16',
    expectedReturnDate: '2026-01-16', // Overdue! Since today is 2026-07-11
    status: 'overdue',
    notes: 'Primary workstation'
  },
  {
    id: 'alloc-2',
    assetId: 'asset-4', // Ergonomic Chair
    employeeId: 'emp-employee', // Sam Carter
    allocatedDate: '2025-02-21',
    expectedReturnDate: '2026-08-21', // Active, not overdue
    status: 'active',
    notes: 'Requested for back pain relief'
  }
];

export const INITIAL_BOOKINGS: ResourceBooking[] = [
  {
    id: 'book-1',
    resourceId: 'asset-2', // Conference Room B2
    employeeId: 'emp-employee',
    date: '2026-07-11', // Today
    startTime: '09:00',
    endTime: '10:00',
    status: 'completed'
  },
  {
    id: 'book-2',
    resourceId: 'asset-2', // Conference Room B2
    employeeId: 'emp-head',
    date: '2026-07-11', // Today
    startTime: '13:00',
    endTime: '14:30',
    status: 'ongoing'
  },
  {
    id: 'book-3',
    resourceId: 'asset-2', // Conference Room B2
    employeeId: 'emp-priya',
    date: '2026-07-11', // Today
    startTime: '15:00',
    endTime: '16:00',
    status: 'upcoming'
  }
];

export const INITIAL_MAINTENANCE: MaintenanceRequest[] = [
  {
    id: 'maint-1',
    assetId: 'asset-6', // Server Rack
    reportedBy: 'emp-head',
    description: 'Power supply Unit B fan making loud grinding noise.',
    priority: 'high',
    status: 'technician_assigned',
    assignedTechnician: 'Steve Tech-Solutions',
    reportedDate: '2026-07-10',
    notes: 'Parts ordered'
  },
  {
    id: 'maint-2',
    assetId: 'asset-1', // MacBook
    reportedBy: 'emp-priya',
    description: 'Battery health degraded. Holds charge for less than 1 hour.',
    priority: 'medium',
    status: 'pending',
    reportedDate: '2026-07-11'
  }
];

export const INITIAL_AUDITS: AuditCycle[] = [
  {
    id: 'audit-1',
    name: 'Q3 IT Equipment Audit',
    departmentId: 'dept-1',
    startDate: '2026-07-01',
    endDate: '2026-07-15',
    assignedAuditors: ['emp-mgr'],
    status: 'active',
    createdDate: '2026-07-01'
  }
];

export const INITIAL_AUDIT_ITEMS: AuditItem[] = [
  { id: 'auditem-1', auditCycleId: 'audit-1', assetId: 'asset-1', status: 'verified', notes: 'Visually checked, working fine', updatedAt: '2026-07-05T10:00:00Z' },
  { id: 'auditem-2', auditCycleId: 'audit-1', assetId: 'asset-5', status: 'pending' },
  { id: 'auditem-3', auditCycleId: 'audit-1', assetId: 'asset-6', status: 'damaged', notes: 'Needs PSU replacement (matches maintenance request)', updatedAt: '2026-07-06T14:30:00Z' }
];

export const INITIAL_TRANSFERS: TransferRequest[] = [];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    userId: 'emp-priya',
    title: 'Asset Return Overdue',
    message: 'Your MacBook Pro 16" (AF-0114) was expected back on 2026-01-16. Please contact the Asset Manager.',
    type: 'alert',
    read: false,
    createdAt: '2026-07-11T08:00:00-07:00'
  },
  {
    id: 'notif-2',
    userId: 'emp-mgr',
    title: 'New Maintenance Request',
    message: 'Priya Sharma raised a repair request for MacBook Pro 16" (AF-0114).',
    type: 'warning',
    read: false,
    createdAt: '2026-07-11T09:30:00-07:00'
  }
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    userId: 'emp-admin',
    userName: 'Alex Rivera',
    userRole: 'admin',
    action: 'User Promotion',
    details: 'Promoted Sarah Connor to Asset Manager and David Vance to Department Head',
    createdAt: '2026-07-10T10:00:00-07:00'
  },
  {
    id: 'log-2',
    userId: 'emp-mgr',
    userName: 'Sarah Connor',
    userRole: 'asset_manager',
    action: 'Asset Registered',
    details: 'Registered MacBook Pro 16" with Asset Tag AF-0114',
    createdAt: '2025-01-15T14:00:00-07:00'
  }
];
