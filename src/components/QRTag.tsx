/**
 * QRTag.tsx
 * Renders a print-ready, branded QR label for a single asset.
 * Uses the `qrcode` npm library to generate a data-URL and draws it
 * inside a styled card that prints cleanly with window.print().
 */
import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { X, Printer, ShieldCheck } from 'lucide-react';
import { Asset } from '../types';

interface QRTagProps {
  asset: Asset;
  onClose: () => void;
}

export const QRTag: React.FC<QRTagProps> = ({ asset, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    const generate = async () => {
      try {
        // Encode the asset tag so the scanner can look it up
        const url = await QRCode.toDataURL(asset.assetTag, {
          width: 256,
          margin: 2,
          color: { dark: '#141414', light: '#FFFFFF' },
          errorCorrectionLevel: 'H',
        });
        setDataUrl(url);
      } catch (err) {
        console.error('QR generation error:', err);
      }
    };
    generate();
  }, [asset.assetTag]);

  const handlePrint = () => {
    const win = window.open('', '_blank', 'width=400,height=500');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Tag — ${asset.assetTag}</title>
        <style>
          body { margin: 0; font-family: 'Courier New', monospace; background: #fff; }
          .tag {
            width: 320px;
            border: 3px solid #141414;
            padding: 16px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
          }
          .header { display: flex; align-items: center; gap: 8px; }
          .logo { font-size: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; font-style: italic; }
          .badge { font-size: 9px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #555; }
          img { width: 180px; height: 180px; }
          .tag-id { font-size: 22px; font-weight: 900; letter-spacing: 4px; border: 2px solid #141414; padding: 4px 16px; }
          .name { font-size: 11px; font-weight: 700; text-align: center; max-width: 280px; }
          .meta { font-size: 9px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="tag">
          <div class="header">
            <span class="logo">AssetFlow</span>
          </div>
          <div class="badge">Enterprise Asset Management</div>
          <img src="${dataUrl}" alt="QR Code" />
          <div class="tag-id">${asset.assetTag}</div>
          <div class="name">${asset.name}</div>
          <div class="meta">${asset.category} · ${asset.location}</div>
          <div class="meta">S/N: ${asset.serialNumber}</div>
        </div>
        <script>window.onload = () => { window.print(); window.close(); }<\/script>
      </body>
      </html>
    `);
    win.document.close();
  };

  const statusColors: Record<string, string> = {
    available:        'bg-emerald-100 text-emerald-700',
    allocated:        'bg-indigo-100 text-indigo-700',
    reserved:         'bg-sky-100 text-sky-700',
    under_maintenance:'bg-amber-100 text-amber-700',
    lost:             'bg-red-100 text-red-700',
    retired:          'bg-slate-100 text-slate-500',
    disposed:         'bg-slate-200 text-slate-400',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-slate-100 overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-extrabold text-slate-800">Print QR Asset Tag</h2>
            <p className="text-[10px] text-slate-400 mt-0.5">Scan this tag to instantly look up the asset</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tag preview */}
        <div className="p-6 flex flex-col items-center gap-4">
          {/* Branded tag card */}
          <div className="border-4 border-[#141414] p-5 flex flex-col items-center gap-3 w-64 bg-white shadow-inner">
            {/* Logo row */}
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#141414]" />
              <span
                className="text-lg font-black uppercase tracking-tighter italic text-[#141414]"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                AssetFlow
              </span>
            </div>
            <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500 font-mono">
              Enterprise Asset Management
            </span>

            {/* QR Code */}
            {dataUrl ? (
              <img src={dataUrl} alt="QR Code" className="w-36 h-36" />
            ) : (
              <div className="w-36 h-36 bg-slate-100 animate-pulse rounded" />
            )}

            {/* Asset Tag badge */}
            <div className="border-2 border-[#141414] px-4 py-1">
              <span className="text-lg font-black tracking-widest font-mono text-[#141414]">
                {asset.assetTag}
              </span>
            </div>

            {/* Asset info */}
            <p className="text-[10px] font-bold text-center text-slate-700 leading-tight">
              {asset.name}
            </p>
            <p className="text-[9px] text-slate-500 text-center">
              {asset.category} · {asset.location}
            </p>
            <p className="text-[9px] text-slate-400 font-mono">S/N: {asset.serialNumber}</p>
          </div>

          {/* Status badge */}
          <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${statusColors[asset.status] ?? 'bg-slate-100 text-slate-500'}`}>
            {asset.status.replace('_', ' ')}
          </span>
        </div>

        {/* Footer actions */}
        <div className="px-5 pb-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handlePrint}
            disabled={!dataUrl}
            className="flex-1 py-2 bg-[#141414] hover:bg-slate-800 text-[#E4E3E0] rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Printer className="h-3.5 w-3.5" />
            Print Tag
          </button>
        </div>
      </div>
    </div>
  );
};
