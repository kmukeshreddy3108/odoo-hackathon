/**
 * QRScanner.tsx
 * Live camera-based QR code scanner using getUserMedia + jsQR.
 * Decodes QR values that match AssetFlow asset tags (e.g. "AF-0114").
 * Calls onScan(tag) when a valid code is found.
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import { X, Camera, CameraOff, ZapOff, Zap } from 'lucide-react';

interface QRScannerProps {
  /** Called with the decoded asset tag string when a QR is successfully read */
  onScan: (assetTag: string) => void;
  onClose: () => void;
  /** Optional label to show in the modal header */
  purpose?: string;
}

export const QRScanner: React.FC<QRScannerProps> = ({
  onScan,
  onClose,
  purpose = 'Scan Asset QR Tag',
}) => {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const rafRef      = useRef<number>(0);
  const streamRef   = useRef<MediaStream | null>(null);

  const [status, setStatus]         = useState<'requesting' | 'active' | 'error'>('requesting');
  const [errorMsg, setErrorMsg]     = useState('');
  const [lastScanned, setLastScanned] = useState('');
  const [torchOn, setTorchOn]       = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);

  /** Decode one video frame */
  const tick = useCallback(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) { rafRef.current = requestAnimationFrame(tick); return; }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });

    if (code && code.data) {
      setLastScanned(code.data);
      // Accept any value — consumer decides what to do with it
      onScan(code.data);
      return; // stop scanning after first hit
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [onScan]);

  /** Start camera */
  useEffect(() => {
    let cancelled = false;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // Check torch support
        const track = stream.getVideoTracks()[0];
        const caps  = track.getCapabilities() as any;
        if (caps?.torch) setTorchSupported(true);

        setStatus('active');
        rafRef.current = requestAnimationFrame(tick);
      } catch (err: any) {
        if (!cancelled) {
          setStatus('error');
          setErrorMsg(
            err.name === 'NotAllowedError'
              ? 'Camera permission denied. Please allow camera access and try again.'
              : err.name === 'NotFoundError'
              ? 'No camera found on this device.'
              : `Camera error: ${err.message}`
          );
        }
      }
    };

    startCamera();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [tick]);

  /** Toggle torch/flashlight */
  const toggleTorch = async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    try {
      await (track as any).applyConstraints({ advanced: [{ torch: !torchOn }] });
      setTorchOn(prev => !prev);
    } catch { /* ignore */ }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
      <div className="bg-[#141414] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-white/10">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4 text-indigo-400" />
            <span className="text-sm font-bold text-white">{purpose}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Camera viewport */}
        <div className="relative bg-black aspect-square overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            muted
            playsInline
          />

          {/* Hidden canvas for image processing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Scan frame overlay */}
          {status === 'active' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Dark vignette */}
              <div className="absolute inset-0 bg-black/40" />
              {/* Scan window cutout effect */}
              <div className="relative w-56 h-56">
                {/* Corner marks */}
                {['top-0 left-0 border-t-4 border-l-4',
                  'top-0 right-0 border-t-4 border-r-4',
                  'bottom-0 left-0 border-b-4 border-l-4',
                  'bottom-0 right-0 border-b-4 border-r-4'].map((cls, i) => (
                  <div key={i} className={`absolute w-10 h-10 border-indigo-400 ${cls}`} />
                ))}
                {/* Scan line animation */}
                <div className="absolute left-2 right-2 h-0.5 bg-indigo-400/80 animate-[scan_2s_ease-in-out_infinite]"
                  style={{ animation: 'scanLine 2s ease-in-out infinite' }}
                />
              </div>
            </div>
          )}

          {/* Requesting camera */}
          {status === 'requesting' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70">
              <Camera className="h-10 w-10 text-indigo-400 animate-pulse" />
              <p className="text-white text-sm font-semibold">Requesting camera…</p>
            </div>
          )}

          {/* Error state */}
          {status === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 p-6">
              <CameraOff className="h-10 w-10 text-rose-400" />
              <p className="text-white text-sm font-semibold text-center">{errorMsg}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-4 space-y-3">
          {/* Instruction */}
          <p className="text-[11px] text-white/50 text-center">
            Hold an asset QR tag steady in the frame. The app will scan automatically.
          </p>

          {/* Last scanned value */}
          {lastScanned && (
            <div className="bg-emerald-900/40 border border-emerald-500/30 rounded-lg px-3 py-2 text-center">
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Detected</p>
              <p className="text-emerald-300 font-mono font-bold text-sm">{lastScanned}</p>
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-2">
            {torchSupported && (
              <button
                onClick={toggleTorch}
                className={`flex-none px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  torchOn
                    ? 'bg-amber-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {torchOn ? <Zap className="h-3.5 w-3.5" /> : <ZapOff className="h-3.5 w-3.5" />}
                {torchOn ? 'Torch On' : 'Torch Off'}
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold cursor-pointer"
            >
              Close Scanner
            </button>
          </div>
        </div>
      </div>

      {/* Keyframe for scan line */}
      <style>{`
        @keyframes scanLine {
          0%   { top: 8px; opacity: 1; }
          50%  { top: calc(100% - 8px); opacity: 1; }
          100% { top: 8px; opacity: 1; }
        }
      `}</style>
    </div>
  );
};
