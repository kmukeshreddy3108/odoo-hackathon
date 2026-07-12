export type UserRole = 'admin' | 'asset_manager' | 'department_head' | 'employee';

export interface Department {
  id: string;
  name: string;
  code: string;
  headId: string; // Employee ID
  parentDepartmentId?: string; // For hierarchy
  status: 'active' | 'inactive';
}

export interface AssetCategory {
  id: string;
  name: string;
  fields: {
    name: string;
    type: 'string' | 'number' | 'boolean';
    required: boolean;
    defaultValue?: string;
  }[];
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  departmentId: string;
  role: UserRole;
  status: 'active' | 'inactive';
}

export interface Asset {
  id: string;
  name: string;
  category: string; // Category ID or Name
  assetTag: string; // e.g. AF-0001
  serialNumber: string;
  acquisitionDate: string;
  acquisitionCost: number;
  condition: 'new' | 'good' | 'fair' | 'poor';
  location: string;
  shared: boolean; // Is bookable
  status: 'available' | 'allocated' | 'reserved' | 'under_maintenance' | 'lost' | 'retired' | 'disposed';
  categoryFields?: Record<string, any>;
}

export interface Allocation {
  id: string;
  assetId: string;
  employeeId?: string;
  departmentId?: string;
  allocatedDate: string;
  expectedReturnDate?: string;
  returnedDate?: string;
  notes?: string;
  conditionCheckIn?: string;
  status: 'active' | 'returned' | 'overdue';
}

export interface TransferRequest {
  id: string;
  assetId: string;
  fromEmployeeId: string;
  toEmployeeId: string;
  requestedDate: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvalDate?: string;
}

export interface ResourceBooking {
  id: string;
  resourceId: string; // Asset ID
  employeeId: string;
  departmentId?: string;
  date: string;
  startTime: string; // e.g. "09:00"
  endTime: string; // e.g. "10:30"
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

export interface MaintenanceRequest {
  id: string;
  assetId: string;
  reportedBy: string; // Employee ID
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'approved' | 'rejected' | 'technician_assigned' | 'in_progress' | 'resolved';
  assignedTechnician?: string;
  reportedDate: string;
  resolvedDate?: string;
  notes?: string;
  photoUrl?: string;
}

export interface AuditCycle {
  id: string;
  name: string;
  departmentId?: string;
  location?: string;
  startDate: string;
  endDate: string;
  assignedAuditors: string[]; // Employee IDs
  status: 'active' | 'closed';
  createdDate: string;
}

export interface AuditItem {
  id: string;
  auditCycleId: string;
  assetId: string;
  status: 'pending' | 'verified' | 'missing' | 'damaged';
  notes?: string;
  updatedAt?: string;
}

export interface Notification {
  id: string;
  userId: string; // Employee ID (or "all")
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  read: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  createdAt: string;
}
