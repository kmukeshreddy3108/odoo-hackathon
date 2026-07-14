import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  Filter, 
  QrCode, 
  Plus, 
  History, 
  Info, 
  FileText, 
  MapPin, 
  DollarSign, 
  Calendar,
  Layers,
  Wrench,
  Check,
  ChevronRight,
  ShieldCheck,
  Clock,
  Sparkles,
  UploadCloud,
  Trash2,
  Loader2
} from 'lucide-react';
import { Asset, UserRole } from '../types';
import { parseInvoiceWithGemini } from '../utils/gemini';
import { QRScanner } from './QRScanner';
import { QRTag } from './QRTag';

interface AssetDirectoryProps {
  showRegFormDirectly?: boolean;
  onCloseRegForm?: () => void;
  openMaintModalForAsset?: (assetId: string) => void;
  openAllocModalForAsset?: (assetId: string) => void;
}

export const AssetDirectory: React.FC<AssetDirectoryProps> = ({ 
  showRegFormDirectly = false, 
  onCloseRegForm,
  openMaintModalForAsset,
  openAllocModalForAsset
}) => {
  const { 
    assets, 
    categories, 
    allocations, 
    maintenanceRequests, 
    employees, 
    registerAsset, 
    currentUser,
    returnAsset,
    updateAsset
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  // Dynamic Drawer / Detail State
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  
  // Registration Form state
  const [showRegForm, setShowRegForm] = useState(showRegFormDirectly);
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState('');
  const [newSerial, setNewSerial] = useState('');
  const [newAcqDate, setNewAcqDate] = useState(new Date().toISOString().split('T')[0]);
  const [newAcqCost, setNewAcqCost] = useState('1200');
  const [newCondition, setNewCondition] = useState<Asset['condition']>('new');
  const [newLocation, setNewLocation] = useState('HQ - Floor 1');
  const [newShared, setNewShared] = useState(false);
  const [dynamicFields, setDynamicFields] = useState<Record<string, string>>({});

  // AI Invoice Scanner states
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const [customApiKey, setCustomApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [aiSuggestedFields, setAiSuggestedFields] = useState<Set<string>>(new Set());

  const handleInvoiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setInvoiceFile(e.target.files[0]);
      setScanError('');
      setAiSuggestedFields(new Set());
    }
  };

  const handleRemoveInvoice = () => {
    setInvoiceFile(null);
    setScanError('');
    setAiSuggestedFields(new Set());
  };

  const triggerInvoiceScan = async () => {
    if (!invoiceFile) return;
    setIsScanning(true);
    setScanError('');
    setAiSuggestedFields(new Set());

    try {
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = (err) => reject(err);
      });
      reader.readAsDataURL(invoiceFile);
      const base64Data = await base64Promise;

      const extracted = await parseInvoiceWithGemini(base64Data, invoiceFile.type, customApiKey);

      const newSuggestions = new Set<string>();

      // Autofill fields
      if (extracted.name) {
        setNewName(extracted.name);
        newSuggestions.add('name');
      }
      if (extracted.category) {
        const matchedCat = categories.find(c => c.name.toLowerCase() === extracted.category.toLowerCase());
        if (matchedCat) {
          handleCategoryChange(matchedCat.name);
          newSuggestions.add('category');
        }
      }
      if (extracted.acquisitionCost !== undefined) {
        setNewAcqCost(extracted.acquisitionCost.toString());
        newSuggestions.add('acquisitionCost');
      }
      if (extracted.acquisitionDate) {
        setNewAcqDate(extracted.acquisitionDate);
        newSuggestions.add('acquisitionDate');
      }
      if (extracted.serialNumber) {
        setNewSerial(extracted.serialNumber);
        newSuggestions.add('serialNumber');
      }
      if (extracted.location) {
        setNewLocation(extracted.location);
        newSuggestions.add('location');
      }

      setAiSuggestedFields(newSuggestions);

    } catch (err: any) {
      console.error(err);
      setScanError(err.message || 'An error occurred during invoice scanning.');
      if (err.message?.includes('key') || err.message?.includes('API key') || err.message?.includes('API_KEY') || err.message?.includes('403') || err.message?.includes('400')) {
        setShowApiKeyInput(true);
      }
    } finally {
      setIsScanning(false);
    }
  };

  // Simulated check-in return states
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [returnNotes, setReturnNotes] = useState('');
  const [returnCondition, setReturnCondition] = useState<Asset['condition']>('good');

  // QR code scanner and print tags states
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showQRTagModal, setShowQRTagModal] = useState(false);

  const isManagerOrAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'asset_manager');

  // Category specific fields loading
  const handleCategoryChange = (catName: string) => {
    setNewCat(catName);
    const category = categories.find(c => c.name === catName);
    if (category) {
      const initialFields: Record<string, string> = {};
      category.fields.forEach(f => {
        initialFields[f.name] = f.defaultValue || '';
      });
      setDynamicFields(initialFields);
    } else {
      setDynamicFields({});
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newCat) return;

    registerAsset({
      name: newName,
      category: newCat,
      serialNumber: newSerial || `SN-${Date.now().toString().slice(-6)}`,
      acquisitionDate: newAcqDate,
      acquisitionCost: parseFloat(newAcqCost) || 0,
      condition: newCondition,
      location: newLocation,
      shared: newShared,
      categoryFields: dynamicFields
    });

    // Reset Form
    setNewName('');
    setNewCat('');
    setNewSerial('');
    setNewCondition('new');
    setNewLocation('HQ - Floor 1');
    setNewShared(false);
    setDynamicFields({});
    setInvoiceFile(null);
    setAiSuggestedFields(new Set());
    setShowRegForm(false);
    if (onCloseRegForm) onCloseRegForm();
  };

  const handleReturnAssetSubmit = () => {
    if (!selectedAsset) return;
    returnAsset(selectedAsset.id, returnNotes, returnCondition);
    setShowReturnDialog(false);
    setReturnNotes('');
    
    // Refresh detailed drawer status
    const freshAsset = assets.find(a => a.id === selectedAsset.id);
    if (freshAsset) {
      setSelectedAsset(freshAsset);
    } else {
      setSelectedAsset(null);
    }
  };

  // QR scanner action
  const handleQRScan = (tag: string) => {
    const foundAsset = assets.find(a => a.assetTag === tag || a.id === tag || a.serialNumber === tag);
    if (foundAsset) {
      setSelectedAsset(foundAsset);
      setSearchQuery('');
    } else {
      setSearchQuery(tag);
    }
    setShowQRScanner(false);
  };

  // Filter Assets
  const filteredAssets = assets.filter(a => {
    const matchesSearch = 
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.assetTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === '' || a.category === selectedCategory;
    const matchesStatus = selectedStatus === '' || a.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate histories for selected asset
  const getAssetAllocations = (assetId: string) => {
    return allocations
      .filter(alloc => alloc.assetId === assetId)
      .sort((a, b) => b.allocatedDate.localeCompare(a.allocatedDate));
  };

  const getAssetMaintenance = (assetId: string) => {
    return maintenanceRequests
      .filter(m => m.assetId === assetId)
      .sort((a, b) => b.reportedDate.localeCompare(a.reportedDate));
  };

  const getStatusBadgeClass = (status: Asset['status']) => {
    switch (status) {
      case 'available': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'allocated': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'reserved': return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'under_maintenance': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'lost': return 'bg-red-50 text-red-700 border-red-200';
      case 'retired': return 'bg-slate-100 text-slate-600 border-slate-300';
      case 'disposed': return 'bg-slate-200 text-slate-500 border-slate-400';
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 font-sans">
            Central Asset Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Search, filter, and track lifecycle events of physical resources.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowQRScanner(true)}
            className="inline-flex items-center space-x-2 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
          >
            <QrCode className="h-4 w-4 text-indigo-600" />
            <span>Scan Asset QR</span>
          </button>

          {isManagerOrAdmin && !showRegForm && (
            <button
              onClick={() => setShowRegForm(true)}
              className="inline-flex items-center space-x-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Register New Asset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Panel layout with Sidebar details drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Assets Main list & filters column */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 border border-slate-100 rounded-xl">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Search Tag, Serial, Name, Location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
              />
            </div>

            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
              >
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
              >
                <option value="">All Statuses</option>
                <option value="available">Available</option>
                <option value="allocated">Allocated</option>
                <option value="reserved">Reserved</option>
                <option value="under_maintenance">Under Maintenance</option>
                <option value="lost">Lost</option>
                <option value="retired">Retired</option>
                <option value="disposed">Disposed</option>
              </select>
            </div>
          </div>

          {/* Asset List Grid */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
            {filteredAssets.length === 0 ? (
              <p className="text-sm text-slate-400 py-12 text-center">No assets found matching the filter criteria.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredAssets.map((asset) => {
                  const isSelected = selectedAsset?.id === asset.id;
                  
                  return (
                    <div 
                      key={asset.id} 
                      onClick={() => setSelectedAsset(asset)}
                      className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-colors ${
                        isSelected ? 'bg-indigo-50/50 hover:bg-indigo-50 border-l-4 border-l-indigo-600' : 'hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-start space-x-3.5">
                        <div className="p-3 bg-slate-100 text-slate-600 rounded-xl flex flex-col items-center justify-center border border-slate-200 w-16 h-16 shrink-0">
                          <QrCode className="h-6 w-6 text-slate-400" />
                          <span className="text-[9px] font-bold text-slate-500 mt-1 uppercase font-mono">{asset.assetTag}</span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-slate-800 text-sm">{asset.name}</h3>
                            {asset.shared && (
                              <span className="inline-flex px-1.5 py-0.2 bg-sky-50 text-sky-700 text-[9px] font-bold rounded uppercase border border-sky-100">
                                shared
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">Category: {asset.category} | S/N: {asset.serialNumber}</p>
                          <div className="flex items-center text-xs text-slate-400 mt-1.5">
                            <MapPin className="h-3.5 w-3.5 mr-1 text-slate-400 shrink-0" />
                            <span>{asset.location}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusBadgeClass(asset.status)}`}>
                          {asset.status.replace('_', ' ')}
                        </span>
                        <ChevronRight className="h-5 w-5 text-slate-300" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Registration Form OR Detail spec drawer */}
        <div className="space-y-4">
          
          {/* Register Asset Mode */}
          {showRegForm && isManagerOrAdmin ? (
            <div className="bg-white border border-indigo-100 rounded-2xl shadow-sm p-6 relative">
              <h2 className="text-base font-extrabold text-slate-800 font-sans mb-4">Register Central Asset</h2>
              
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {/* AI Invoice Scanner Uploader */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                      AI Invoice & Receipt Auto-Fill
                    </span>
                    {invoiceFile && (
                      <button
                        type="button"
                        onClick={handleRemoveInvoice}
                        className="text-[10px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" /> Clear
                      </button>
                    )}
                  </div>

                  {!invoiceFile ? (
                    <label className="border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-white rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                      <UploadCloud className="h-6 w-6 text-slate-400 group-hover:text-indigo-500 mb-1" />
                      <span className="text-[11px] font-semibold text-slate-600 group-hover:text-indigo-600">Upload invoice or receipt</span>
                      <span className="text-[9px] text-slate-400 mt-0.5">PNG, JPG, or PDF up to 4MB</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={handleInvoiceChange}
                      />
                    </label>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-2.5">
                        <div className="flex items-center space-x-2 truncate">
                          <FileText className="h-5 w-5 text-indigo-500 shrink-0" />
                          <div className="truncate text-left">
                            <p className="text-[11px] font-semibold text-slate-700 truncate">{invoiceFile.name}</p>
                            <p className="text-[9px] text-slate-400">{(invoiceFile.size / 1024).toFixed(0)} KB</p>
                          </div>
                        </div>
                        
                        {!isScanning && aiSuggestedFields.size === 0 && (
                          <button
                            type="button"
                            onClick={triggerInvoiceScan}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-bold flex items-center gap-1 shadow-sm shrink-0 cursor-pointer"
                          >
                            <Sparkles className="h-3 w-3" /> Scan AI
                          </button>
                        )}
                      </div>

                      {isScanning && (
                        <div className="space-y-1.5 py-1 text-center">
                          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-indigo-600 animate-pulse">
                            <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                            <span>Gemini AI is parsing invoice...</span>
                          </div>
                          <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 rounded-full animate-pulse w-2/3"></div>
                          </div>
                        </div>
                      )}

                      {aiSuggestedFields.size > 0 && !isScanning && (
                        <div className="bg-emerald-50 border border-emerald-200/60 rounded-lg p-2 flex items-center space-x-2 text-emerald-800 text-[10px] font-semibold">
                          <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span>Extracted {aiSuggestedFields.size} fields successfully! Verify details below.</span>
                        </div>
                      )}

                      {scanError && (
                        <div className="bg-rose-50 border border-rose-200/60 rounded-lg p-2.5 space-y-2 text-rose-800 text-[10px]">
                          <p className="font-semibold">{scanError}</p>
                          {showApiKeyInput && (
                            <div className="space-y-1.5 pt-1 border-t border-rose-200/40">
                              <label className="block font-bold uppercase tracking-wider text-[8px] text-slate-500">Provide Gemini API Key</label>
                              <div className="flex gap-1.5">
                                <input
                                  type="password"
                                  placeholder="AIzaSy..."
                                  value={customApiKey}
                                  onChange={(e) => setCustomApiKey(e.target.value)}
                                  className="flex-1 px-2 py-1 bg-white border border-rose-300 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-rose-500"
                                />
                                <button
                                  type="button"
                                  onClick={triggerInvoiceScan}
                                  className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded text-[9px]"
                                >
                                  Retry
                                </button>
                              </div>
                              <p className="text-[8px] text-slate-500">
                                Grab a free key from the{' '}
                                <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="underline hover:text-indigo-600">
                                  Google AI Studio Console
                                </a>.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Asset Name / Title</label>
                    {aiSuggestedFields.has('name') && (
                      <span className="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 font-bold uppercase rounded flex items-center gap-0.5 tracking-wider">
                        <Sparkles className="h-2 w-2 text-emerald-600" /> AI Suggested
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => {
                      setNewName(e.target.value);
                      if (aiSuggestedFields.has('name')) {
                        const updated = new Set(aiSuggestedFields);
                        updated.delete('name');
                        setAiSuggestedFields(updated);
                      }
                    }}
                    placeholder="MacBook Pro M3, Conference Chair, etc."
                    className={`block w-full px-3 py-2 border rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs transition-colors ${
                      aiSuggestedFields.has('name') ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</label>
                      {aiSuggestedFields.has('category') && (
                        <span className="text-[8px] px-1 bg-emerald-100 text-emerald-800 font-bold uppercase rounded flex items-center gap-0.5 tracking-wider">
                          AI
                        </span>
                      )}
                    </div>
                    <select
                      required
                      value={newCat}
                      onChange={(e) => {
                        handleCategoryChange(e.target.value);
                        if (aiSuggestedFields.has('category')) {
                          const updated = new Set(aiSuggestedFields);
                          updated.delete('category');
                          setAiSuggestedFields(updated);
                        }
                      }}
                      className={`block w-full px-3 py-2 border rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs transition-colors ${
                        aiSuggestedFields.has('category') ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200'
                      }`}
                    >
                      <option value="">Select Category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Serial Number</label>
                      {aiSuggestedFields.has('serialNumber') && (
                        <span className="text-[8px] px-1 bg-emerald-100 text-emerald-800 font-bold uppercase rounded flex items-center gap-0.5 tracking-wider">
                          AI
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={newSerial}
                      onChange={(e) => {
                        setNewSerial(e.target.value);
                        if (aiSuggestedFields.has('serialNumber')) {
                          const updated = new Set(aiSuggestedFields);
                          updated.delete('serialNumber');
                          setAiSuggestedFields(updated);
                        }
                      }}
                      placeholder="e.g. SN-88392"
                      className={`block w-full px-3 py-2 border rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs transition-colors ${
                        aiSuggestedFields.has('serialNumber') ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200'
                      }`}
                    />
                  </div>
                </div>

                {/* Render Dynamic Fields based on Category */}
                {newCat && categories.find(c => c.name === newCat)?.fields.map((f) => (
                  <div key={f.name}>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      {f.name} {f.required && <span className="text-red-500">*</span>}
                    </label>
                    {f.type === 'boolean' ? (
                      <div className="flex gap-4 mt-1">
                        <label className="flex items-center space-x-2 text-xs text-slate-700">
                          <input
                            type="radio"
                            checked={dynamicFields[f.name] === 'true'}
                            onChange={() => setDynamicFields(prev => ({ ...prev, [f.name]: 'true' }))}
                          />
                          <span>Yes</span>
                        </label>
                        <label className="flex items-center space-x-2 text-xs text-slate-700">
                          <input
                            type="radio"
                            checked={dynamicFields[f.name] === 'false'}
                            onChange={() => setDynamicFields(prev => ({ ...prev, [f.name]: 'false' }))}
                          />
                          <span>No</span>
                        </label>
                      </div>
                    ) : (
                      <input
                        type={f.type === 'number' ? 'number' : 'text'}
                        required={f.required}
                        value={dynamicFields[f.name] || ''}
                        onChange={(e) => setDynamicFields(prev => ({ ...prev, [f.name]: e.target.value }))}
                        className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                      />
                    )}
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Acquisition Cost ($)</label>
                      {aiSuggestedFields.has('acquisitionCost') && (
                        <span className="text-[8px] px-1 bg-emerald-100 text-emerald-800 font-bold uppercase rounded flex items-center gap-0.5 tracking-wider">
                          AI
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      value={newAcqCost}
                      onChange={(e) => {
                        setNewAcqCost(e.target.value);
                        if (aiSuggestedFields.has('acquisitionCost')) {
                          const updated = new Set(aiSuggestedFields);
                          updated.delete('acquisitionCost');
                          setAiSuggestedFields(updated);
                        }
                      }}
                      className={`block w-full px-3 py-2 border rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs transition-colors ${
                        aiSuggestedFields.has('acquisitionCost') ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200'
                      }`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Acquisition Date</label>
                      {aiSuggestedFields.has('acquisitionDate') && (
                        <span className="text-[8px] px-1 bg-emerald-100 text-emerald-800 font-bold uppercase rounded flex items-center gap-0.5 tracking-wider">
                          AI
                        </span>
                      )}
                    </div>
                    <input
                      type="date"
                      value={newAcqDate}
                      onChange={(e) => {
                        setNewAcqDate(e.target.value);
                        if (aiSuggestedFields.has('acquisitionDate')) {
                          const updated = new Set(aiSuggestedFields);
                          updated.delete('acquisitionDate');
                          setAiSuggestedFields(updated);
                        }
                      }}
                      className={`block w-full px-3 py-2 border rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs transition-colors ${
                        aiSuggestedFields.has('acquisitionDate') ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Physical Condition</label>
                    <select
                      value={newCondition}
                      onChange={(e) => setNewCondition(e.target.value as Asset['condition'])}
                      className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                    >
                      <option value="new">New</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Initial Location</label>
                      {aiSuggestedFields.has('location') && (
                        <span className="text-[8px] px-1 bg-emerald-100 text-emerald-800 font-bold uppercase rounded flex items-center gap-0.5 tracking-wider">
                          AI
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={newLocation}
                      onChange={(e) => {
                        setNewLocation(e.target.value);
                        if (aiSuggestedFields.has('location')) {
                          const updated = new Set(aiSuggestedFields);
                          updated.delete('location');
                          setAiSuggestedFields(updated);
                        }
                      }}
                      placeholder="e.g. Server Room 2"
                      className={`block w-full px-3 py-2 border rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs transition-colors ${
                        aiSuggestedFields.has('location') ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200'
                      }`}
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <input
                    type="checkbox"
                    checked={newShared}
                    onChange={(e) => setNewShared(e.target.checked)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Mark as Bookable/Shared Resource</span>
                </label>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    Complete Registry
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRegForm(false);
                      if (onCloseRegForm) onCloseRegForm();
                    }}
                    className="px-4 py-2 border border-slate-200 text-slate-600 font-bold text-xs rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : selectedAsset ? (
            /* Asset Detail View / Spec Drawer */
            <div className="bg-white border border-slate-100 rounded-2xl shadow-xs p-6 space-y-6">
              
              {/* Profile Card Header */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
                    {selectedAsset.assetTag}
                  </span>
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getStatusBadgeClass(selectedAsset.status)}`}>
                    {selectedAsset.status.replace('_', ' ')}
                  </span>
                </div>
                <h2 className="text-base font-extrabold text-slate-900 font-sans mt-3">{selectedAsset.name}</h2>
                <p className="text-xs text-slate-400 mt-0.5">Category: <strong className="text-slate-600">{selectedAsset.category}</strong></p>
              </div>

              {/* Action shortcuts */}
              <div className="grid grid-cols-2 gap-2 border-t border-b border-slate-100 py-4">
                {selectedAsset.status === 'available' && openAllocModalForAsset && (
                  <button
                    onClick={() => openAllocModalForAsset(selectedAsset.id)}
                    className="flex items-center justify-center space-x-1.5 p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Allocate</span>
                  </button>
                )}

                {selectedAsset.status === 'allocated' && isManagerOrAdmin && (
                  <button
                    onClick={() => setShowReturnDialog(true)}
                    className="flex items-center justify-center space-x-1.5 p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Approve Return</span>
                  </button>
                )}

                <button
                  onClick={() => openMaintModalForAsset && openMaintModalForAsset(selectedAsset.id)}
                  className="flex items-center justify-center space-x-1.5 p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer col-span-2 mt-1"
                >
                  <Wrench className="h-3.5 w-3.5 text-slate-500" />
                  <span>Request Maintenance / Repair</span>
                </button>

                <button
                  onClick={() => setShowQRTagModal(true)}
                  className="flex items-center justify-center space-x-1.5 p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold cursor-pointer col-span-2 mt-1 border border-indigo-100"
                >
                  <QrCode className="h-3.5 w-3.5 text-indigo-600 animate-pulse" />
                  <span>Print QR Label Tag</span>
                </button>
              </div>

              {/* Specs & Info */}
              <div className="space-y-3 text-xs text-slate-600">
                <h3 className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Specifications</h3>
                <div className="grid grid-cols-2 gap-3.5 bg-slate-50/50 p-3.5 rounded-xl border border-slate-100/50">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Serial Code</span>
                    <strong className="text-slate-700">{selectedAsset.serialNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Initial Cost</span>
                    <strong className="text-slate-700">${selectedAsset.acquisitionCost}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Condition</span>
                    <strong className="text-slate-700 capitalize">{selectedAsset.condition}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Date Registered</span>
                    <strong className="text-slate-700">{selectedAsset.acquisitionDate}</strong>
                  </div>
                  {selectedAsset.categoryFields && Object.entries(selectedAsset.categoryFields).map(([k, v]) => (
                    <div key={k} className="col-span-2 mt-1">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">{k}</span>
                      <strong className="text-slate-700">{v}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sequential Histories */}
              <div className="space-y-4">
                <h3 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <History className="h-4 w-4 text-slate-400" />
                  <span>Audit & Lifecycle Logs</span>
                </h3>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {/* Allocations History */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block mb-2 uppercase">Allocation Milestones</span>
                    {getAssetAllocations(selectedAsset.id).map((alloc, i) => {
                      const emp = alloc.employeeId ? employees.find(e => e.id === alloc.employeeId) : null;
                      return (
                        <div key={alloc.id} className="text-[11px] p-2.5 border-l-2 border-indigo-200 pl-3 mb-2 bg-slate-50/30 rounded-r-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-800">{emp ? emp.name : 'Corporate/Dept Pool'}</span>
                            <span className="text-[9px] font-mono text-slate-400">{alloc.allocatedDate}</span>
                          </div>
                          <p className="text-slate-500 mt-1">Status: <span className="capitalize font-semibold text-indigo-600">{alloc.status}</span></p>
                          {alloc.returnedDate && <p className="text-slate-400 mt-0.5">Checked In: {alloc.returnedDate}</p>}
                          {alloc.conditionCheckIn && <p className="text-slate-400 italic mt-0.5">Condition notes: {alloc.conditionCheckIn}</p>}
                        </div>
                      );
                    })}
                    {getAssetAllocations(selectedAsset.id).length === 0 && (
                      <p className="text-[11px] text-slate-400 italic">No allocation history logged.</p>
                    )}
                  </div>

                  {/* Maintenance History */}
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block mb-2 uppercase">Maintenance Records</span>
                    {getAssetMaintenance(selectedAsset.id).map((req, i) => (
                      <div key={req.id} className="text-[11px] p-2.5 border-l-2 border-amber-200 pl-3 mb-2 bg-slate-50/30 rounded-r-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-800 capitalize">{req.status.replace('_', ' ')}</span>
                          <span className="text-[9px] font-mono text-slate-400">{req.reportedDate}</span>
                        </div>
                        <p className="text-slate-500 mt-1">{req.description}</p>
                        {req.assignedTechnician && <p className="text-slate-400 mt-0.5 font-medium">Tech: {req.assignedTechnician}</p>}
                      </div>
                    ))}
                    {getAssetMaintenance(selectedAsset.id).length === 0 && (
                      <p className="text-[11px] text-slate-400 italic">No maintenance history logged.</p>
                    )}
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 text-center shadow-xs">
              <Info className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-700 text-sm">Select an Asset</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Choose any resource in the directory to inspect technical specifications, check custom parameters, and view historic deployment cycles.
              </p>
            </div>
          )}

        </div>

      </div>

      {/* Camera-based QR Scanner */}
      {showQRScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setShowQRScanner(false)}
        />
      )}

      {/* Printable Branded QR Tag Modal */}
      {showQRTagModal && selectedAsset && (
        <QRTag
          asset={selectedAsset}
          onClose={() => setShowQRTagModal(false)}
        />
      )}

      {/* Approve Return Modal popup */}
      {showReturnDialog && selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-150">
            <h3 className="text-lg font-extrabold text-slate-900 font-sans mb-2">Check In Asset ({selectedAsset.assetTag})</h3>
            <p className="text-xs text-slate-500 mb-4">Validate the condition of the physical resource before checking it back into storage.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Verify Return Condition</label>
                <select
                  value={returnCondition}
                  onChange={(e) => setReturnCondition(e.target.value as Asset['condition'])}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                >
                  <option value="new">New / Mint</option>
                  <option value="good">Good / Functional</option>
                  <option value="fair">Fair / Wear and Tear</option>
                  <option value="poor">Poor / Needs Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Condition check-in notes</label>
                <textarea
                  required
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="e.g. Scuffed on corners but works flawlessly. Battery cycles check out."
                  rows={3}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleReturnAssetSubmit}
                  className="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Confirm Asset Return
                </button>
                <button
                  onClick={() => setShowReturnDialog(false)}
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
