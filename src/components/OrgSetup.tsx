import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  FolderTree, 
  Users, 
  Plus, 
  Edit3, 
  Check, 
  Trash2, 
  Shield, 
  UserMinus, 
  ArrowRight,
  PlusCircle,
  HelpCircle,
  TrendingUp,
  Search
} from 'lucide-react';
import { UserRole } from '../types';

export const OrgSetup: React.FC = () => {
  const { 
    departments, 
    categories, 
    employees, 
    addDepartment, 
    updateDepartment,
    addCategory,
    updateCategory,
    updateEmployee,
    promoteEmployee,
    currentUser
  } = useApp();

  const [activeTab, setActiveTab] = useState<'departments' | 'categories' | 'directory'>('departments');

  // Department state
  const [showDeptForm, setShowDeptForm] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptHead, setDeptHead] = useState('');
  const [parentDept, setParentDept] = useState('');
  const [deptStatus, setDeptStatus] = useState<'active' | 'inactive'>('active');

  // Category state
  const [showCatForm, setShowCatForm] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');
  const [catFields, setCatFields] = useState<{ name: string; type: 'string' | 'number' | 'boolean'; required: boolean }[]>([]);
  
  // Search Directory state
  const [directorySearch, setDirectorySearch] = useState('');

  // Protect screen
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="p-12 text-center">
        <div className="max-w-md mx-auto bg-rose-50 border border-rose-100 p-8 rounded-2xl flex flex-col items-center">
          <Shield className="h-12 w-12 text-rose-500 mb-4" />
          <h2 className="text-lg font-bold text-slate-800">Setup Restricted</h2>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Only System Administrators have access to register and modify core departments, categories, and manage roles inside the ERP database.
          </p>
        </div>
      </div>
    );
  }

  // Handle Department Submit
  const handleDeptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName || !deptCode) return;

    if (editingDeptId) {
      updateDepartment(editingDeptId, {
        name: deptName,
        code: deptCode,
        headId: deptHead,
        parentDepartmentId: parentDept || undefined,
        status: deptStatus
      });
      setEditingDeptId(null);
    } else {
      addDepartment({
        name: deptName,
        code: deptCode,
        headId: deptHead,
        parentDepartmentId: parentDept || undefined,
        status: deptStatus
      });
    }

    // Reset Form
    setDeptName('');
    setDeptCode('');
    setDeptHead('');
    setParentDept('');
    setDeptStatus('active');
    setShowDeptForm(false);
  };

  const handleEditDeptClick = (deptId: string) => {
    const dept = departments.find(d => d.id === deptId);
    if (!dept) return;
    setEditingDeptId(deptId);
    setDeptName(dept.name);
    setDeptCode(dept.code);
    setDeptHead(dept.headId);
    setParentDept(dept.parentDepartmentId || '');
    setDeptStatus(dept.status);
    setShowDeptForm(true);
  };

  // Handle Category Submit
  const handleCatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) return;

    if (editingCatId) {
      updateCategory(editingCatId, {
        name: catName,
        fields: catFields
      });
      setEditingCatId(null);
    } else {
      addCategory({
        name: catName,
        fields: catFields
      });
    }

    // Reset Form
    setCatName('');
    setCatFields([]);
    setShowCatForm(false);
  };

  const addFieldToCategory = () => {
    setCatFields(prev => [...prev, { name: '', type: 'string', required: true }]);
  };

  const removeFieldFromCategory = (index: number) => {
    setCatFields(prev => prev.filter((_, i) => i !== index));
  };

  const updateFieldInCategory = (index: number, key: 'name' | 'type' | 'required', value: any) => {
    setCatFields(prev => prev.map((f, i) => i === index ? { ...f, [key]: value } : f));
  };

  const handleEditCatClick = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    if (!cat) return;
    setEditingCatId(catId);
    setCatName(cat.name);
    setCatFields([...cat.fields]);
    setShowCatForm(true);
  };

  // Filter employees for directory
  const filteredEmployees = employees.filter(emp => {
    const query = directorySearch.toLowerCase();
    const dept = departments.find(d => d.id === emp.departmentId);
    return (
      emp.name.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query) ||
      (dept && dept.name.toLowerCase().includes(query)) ||
      emp.role.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="border-b border-slate-100 pb-5">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 font-sans">
          Organization Setup Panel
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Maintain core organizational hierarchies, metadata fields, and employee permissions.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('departments')}
          className={`flex items-center space-x-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
            activeTab === 'departments' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Departments</span>
        </button>
        
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center space-x-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
            activeTab === 'categories' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <FolderTree className="h-4 w-4" />
          <span>Asset Categories</span>
        </button>

        <button
          onClick={() => setActiveTab('directory')}
          className={`flex items-center space-x-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
            activeTab === 'directory' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Employee Directory & Role Manager</span>
        </button>
      </div>

      {/* --- Tab A: Departments --- */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center bg-white p-4 border border-slate-100 rounded-xl">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Active Departments</h2>
              {!showDeptForm && (
                <button
                  onClick={() => {
                    setEditingDeptId(null);
                    setDeptName('');
                    setDeptCode('');
                    setDeptHead(employees[0]?.id || '');
                    setParentDept('');
                    setDeptStatus('active');
                    setShowDeptForm(true);
                  }}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create Department</span>
                </button>
              )}
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
              <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Dept Name / Code</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Department Head</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Hierarchy Level</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {departments.map((dept) => {
                    const head = employees.find(e => e.id === dept.headId);
                    const parent = departments.find(p => p.id === dept.parentDepartmentId);
                    
                    return (
                      <tr key={dept.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800">{dept.name}</div>
                          <div className="text-xs text-slate-400 mt-0.5">Code: {dept.code}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-medium">
                          {head ? head.name : 'Unassigned'}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {parent ? (
                            <span className="inline-flex items-center gap-1">
                              Sub-dept of <strong className="text-indigo-600">{parent.code}</strong>
                            </span>
                          ) : (
                            <span className="text-slate-400 font-semibold italic">Top-Level</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            dept.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {dept.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleEditDeptClick(dept.id)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Department Editor Sidebar Form */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xs p-6">
            <h2 className="text-base font-extrabold text-slate-800 font-sans mb-4">
              {editingDeptId ? 'Modify Department' : 'Create New Department'}
            </h2>

            {showDeptForm || editingDeptId ? (
              <form onSubmit={handleDeptSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Department Name</label>
                  <input
                    type="text"
                    required
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    placeholder="Engineering"
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Department Code</label>
                  <input
                    type="text"
                    required
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value)}
                    placeholder="ENG"
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Department Head (Employee)</label>
                  <select
                    value={deptHead}
                    onChange={(e) => setDeptHead(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="">Select Department Head</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Parent Department (Optional Hierarchy)</label>
                  <select
                    value={parentDept}
                    onChange={(e) => setParentDept(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="">No Parent (Root Department)</option>
                    {departments
                      .filter(d => d.id !== editingDeptId) // Prevent circular reference
                      .map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))
                    }
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Department Status</label>
                  <div className="flex gap-4 mt-1">
                    <label className="flex items-center space-x-2 text-sm text-slate-700">
                      <input
                        type="radio"
                        checked={deptStatus === 'active'}
                        onChange={() => setDeptStatus('active')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Active</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm text-slate-700">
                      <input
                        type="radio"
                        checked={deptStatus === 'inactive'}
                        onChange={() => setDeptStatus('inactive')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Inactive</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeptForm(false);
                      setEditingDeptId(null);
                    }}
                    className="px-4 py-2 border border-slate-200 text-slate-600 font-bold text-xs rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-xs text-slate-400 text-center leading-relaxed py-12 border-2 border-dashed border-slate-100 rounded-xl">
                Select an existing department to modify its hierarchy or assign an executive head, or tap "Create Department" to design a new operational tier.
              </p>
            )}
          </div>
        </div>
      )}

      {/* --- Tab B: Asset Categories --- */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center bg-white p-4 border border-slate-100 rounded-xl">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Asset Categories</h2>
              {!showCatForm && (
                <button
                  onClick={() => {
                    setEditingCatId(null);
                    setCatName('');
                    setCatFields([]);
                    setShowCatForm(true);
                  }}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>New Category</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat) => (
                <div key={cat.id} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-extrabold text-slate-800 font-sans">{cat.name}</h3>
                    <button
                      onClick={() => handleEditCatClick(cat.id)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Dynamic Attributes</span>
                    <ul className="mt-2 space-y-1.5">
                      {cat.fields.map((field, idx) => (
                        <li key={idx} className="flex justify-between text-xs text-slate-500 bg-slate-50/50 p-1.5 rounded-lg border border-slate-100/50">
                          <span className="font-medium text-slate-700">{field.name}</span>
                          <span className="font-mono text-slate-400 bg-white px-1.5 py-0.2 rounded border border-slate-100 text-[10px] uppercase">{field.type}</span>
                        </li>
                      ))}
                      {cat.fields.length === 0 && (
                        <li className="text-xs text-slate-400 italic">No custom fields defined.</li>
                      )}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Editor Form Sidebar */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xs p-6">
            <h2 className="text-base font-extrabold text-slate-800 font-sans mb-4">
              {editingCatId ? 'Modify Asset Category' : 'Create Asset Category'}
            </h2>

            {showCatForm || editingCatId ? (
              <form onSubmit={handleCatSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Category Name</label>
                  <input
                    type="text"
                    required
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder="Electronics, Vehicles..."
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Custom Specifications</span>
                    <button
                      type="button"
                      onClick={addFieldToCategory}
                      className="inline-flex items-center gap-1 text-[10px] text-indigo-600 hover:text-indigo-700 font-bold uppercase cursor-pointer"
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>Add Spec Field</span>
                    </button>
                  </div>

                  {catFields.length === 0 ? (
                    <p className="text-[11px] text-slate-400 py-4 text-center bg-slate-50 rounded-xl">
                      Custom fields allow specifying properties (e.g. warranty for electronics, licenses for software).
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {catFields.map((field, idx) => (
                        <div key={idx} className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              required
                              value={field.name}
                              onChange={(e) => updateFieldInCategory(idx, 'name', e.target.value)}
                              placeholder="e.g. Warranty Months"
                              className="flex-1 px-2 py-1 border border-slate-200 rounded text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => removeFieldFromCategory(idx)}
                              className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-1 text-slate-600">
                                <input
                                  type="radio"
                                  name={`type-${idx}`}
                                  checked={field.type === 'string'}
                                  onChange={() => updateFieldInCategory(idx, 'type', 'string')}
                                />
                                <span>Text</span>
                              </label>
                              <label className="flex items-center gap-1 text-slate-600">
                                <input
                                  type="radio"
                                  name={`type-${idx}`}
                                  checked={field.type === 'number'}
                                  onChange={() => updateFieldInCategory(idx, 'type', 'number')}
                                />
                                <span>Number</span>
                              </label>
                              <label className="flex items-center gap-1 text-slate-600">
                                <input
                                  type="radio"
                                  name={`type-${idx}`}
                                  checked={field.type === 'boolean'}
                                  onChange={() => updateFieldInCategory(idx, 'type', 'boolean')}
                                />
                                <span>Toggle</span>
                              </label>
                            </div>

                            <label className="flex items-center gap-1 text-slate-600 font-semibold">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) => updateFieldInCategory(idx, 'required', e.target.checked)}
                              />
                              <span>Required</span>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    Save Category
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCatForm(false);
                      setEditingCatId(null);
                    }}
                    className="px-4 py-2 border border-slate-200 text-slate-600 font-bold text-xs rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-xs text-slate-400 text-center leading-relaxed py-12 border-2 border-dashed border-slate-100 rounded-xl">
                Define dynamic schemas for physical assets. Click "New Category" to append custom specifications to inventory registries.
              </p>
            )}
          </div>
        </div>
      )}

      {/* --- Tab C: Employee Directory & Role Promotion --- */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 border border-slate-100 rounded-xl">
            <div className="relative flex-1 max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Search staff, email, role, or department..."
                value={directorySearch}
                onChange={(e) => setDirectorySearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Directory Size:</span>
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">
                {filteredEmployees.length} registered
              </span>
            </div>
          </div>

          {/* Directory Grid */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
            <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee Name & Email</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Operational Role</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Account Status</th>
                  <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Role Promotion Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredEmployees.map((emp) => {
                  const dept = departments.find(d => d.id === emp.departmentId);
                  
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-9 w-9 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-xs border border-slate-200">
                            {emp.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{emp.name}</div>
                            <div className="text-xs text-slate-400">{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-700">{dept ? dept.name : 'Corporate Pool'}</div>
                        {dept && <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Code: {dept.code}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          emp.role === 'admin' ? 'bg-rose-50 text-rose-700' :
                          emp.role === 'asset_manager' ? 'bg-emerald-50 text-emerald-700' :
                          emp.role === 'department_head' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {emp.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            // Toggle employee status
                            updateEmployee(emp.id, { status: emp.status === 'active' ? 'inactive' : 'active' });
                          }}
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
                            emp.status === 'active' ? 'bg-emerald-100 text-emerald-800 hover:bg-red-50 hover:text-red-700' : 'bg-red-100 text-red-800 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                          title="Click to toggle status"
                        >
                          {emp.status}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {emp.id === currentUser.id ? (
                          <span className="text-xs text-slate-400 italic font-medium">Your current profile</span>
                        ) : (
                          <div className="inline-flex items-center space-x-1.5">
                            <span className="text-xs text-slate-400 mr-2">Assign Role:</span>
                            <select
                              value={emp.role}
                              onChange={(e) => promoteEmployee(emp.id, e.target.value as UserRole)}
                              className="px-2 py-1 border border-slate-200 rounded text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                              <option value="employee">Employee</option>
                              <option value="department_head">Dept Head</option>
                              <option value="asset_manager">Asset Mgr</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
