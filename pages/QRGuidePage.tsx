import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ArrowLeft, Flashlight, Image as ImageIcon, MoreVertical, X, MapPin, Headphones, Box, History as HistoryIcon, Share2, ScanLine } from 'lucide-react';
import { qrGuideService, QrArtifact, ScanHistory } from '../services/api';

const QRGuidePage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState<QrArtifact | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<ScanHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  const [isScanningActive, setIsScanningActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasPermission(true);
        }
      } catch (err) {
        console.warn("Camera permission denied or unavailable", err);
        setHasPermission(false);
      }
    };

    startCamera();

    return () => {
      // Cleanup tracks
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Scanning Animation
  useEffect(() => {
    if (!scanning) return;
    const ctx = gsap.context(() => {
      // Laser Scan Line
      gsap.to('.scan-line', {
        top: '100%',
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'linear'
      });

      // Corner Brackets Pulse
      gsap.to('.scan-corner', {
        opacity: 0.5,
        duration: 0.8,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
      });
      
      // Initial Entry
      gsap.from('.overlay-ui', {
          opacity: 0,
          y: 20,
          duration: 0.8,
          delay: 0.5
      });
    }, containerRef);

    return () => ctx.revert();
  }, [scanning]);

  // Load History
  const loadHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const data = await qrGuideService.getUserHistory();
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
     if (showHistory) {
         loadHistory();
     }
  }, [showHistory]);

  // Handle Scan Simulation (With real backend call)
  const handleSimulateScan = async () => {
    if (!scanning || isScanningActive) return;
    setIsScanningActive(true);
    setError(null);
    
    // Animate successful scan
    gsap.to('.scan-frame', { scale: 1.1, borderColor: '#4ade80', duration: 0.2, yoyo: true, repeat: 1 });
    
    try {
        // We simulate scanning the QR code with ID "artifact-1"
        // In a real device, this string comes from the QR decoder library
        const artificialId = "artifact-1"; 
        
        // 1. Fetch artifact details
        const artifactData = await qrGuideService.getArtifact(artificialId);
        
        // 2. Record this scan silently
        await qrGuideService.recordScan(artificialId).catch(e => console.error("History tracking failed", e));
        
        setScanning(false);
        setResult(artifactData);
        
        // Result Sheet Slide Up
        setTimeout(() => {
            gsap.fromTo('.result-sheet', 
                { y: '100%' },
                { y: '0%', duration: 0.5, ease: 'power3.out' }
            );
        }, 100);
        
    } catch (err: any) {
        console.error(err);
        setError("Failed to identify artifact. Make sure an artifact with ID 'artifact-1' is seeded in the database.");
    } finally {
        setIsScanningActive(false);
    }
  };

  const resetScan = () => {
      gsap.to('.result-sheet', {
          y: '100%',
          duration: 0.4,
          ease: 'power3.in',
          onComplete: () => {
              setResult(null);
              setScanning(true);
              setError(null);
          }
      });
  };

  return (
    <div ref={containerRef} className="relative h-screen w-full bg-black overflow-hidden flex flex-col">
      
      {/* 1. Camera Layer */}
      <div className="absolute inset-0 z-0">
        {hasPermission ? (
            <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover"
            />
        ) : (
            <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <ScanLine size={32} className="text-slate-500" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Camera Unavailable</h3>
                <p className="text-slate-400 text-sm mb-6">We need camera access to scan QR codes at heritage sites.</p>
                <button 
                    onClick={handleSimulateScan}
                    disabled={isScanningActive}
                    className="px-6 py-3 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 transition-colors disabled:opacity-50"
                >
                    {isScanningActive ? 'Scanning...' : 'Simulate Scan'}
                </button>
                {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
            </div>
        )}
      </div>

      {/* 2. Scanning Overlay */}
      {scanning && (
          <div className="absolute inset-0 z-10 flex flex-col w-full h-full">
              {/* Header */}
              <div className="p-4 flex items-center justify-between overlay-ui bg-gradient-to-b from-black/60 to-transparent pt-12 md:pt-6">
                  <button onClick={() => onNavigate('dashboard')} className="p-2 rounded-full bg-black/20 text-white backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors">
                      <ArrowLeft size={24} />
                  </button>
                  <div className="bg-black/40 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-white text-xs font-bold uppercase tracking-wider">Live Scanner</span>
                  </div>
                  <button className="p-2 rounded-full bg-black/20 text-white backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors">
                      <MoreVertical size={24} />
                  </button>
              </div>

              {/* Viewfinder */}
              <div className="flex-grow flex items-center justify-center p-8">
                  <div 
                    className="relative w-72 h-72 border-2 border-white/30 rounded-3xl scan-frame cursor-pointer"
                    onClick={handleSimulateScan}
                  >
                      {/* Corners */}
                      <div className="scan-corner absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-sky-400 rounded-tl-xl -mt-1 -ml-1"></div>
                      <div className="scan-corner absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-sky-400 rounded-tr-xl -mt-1 -mr-1"></div>
                      <div className="scan-corner absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-sky-400 rounded-bl-xl -mb-1 -ml-1"></div>
                      <div className="scan-corner absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-sky-400 rounded-br-xl -mb-1 -mr-1"></div>
                      
                      {/* Laser */}
                      <div className="scan-line absolute left-0 right-0 h-0.5 bg-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.8)]"></div>
                      
                      {/* Instructions */}
                      <div className="absolute -bottom-16 left-0 right-0 text-center">
                          <p className="text-white font-medium text-sm drop-shadow-md bg-black/20 backdrop-blur-sm py-1 px-3 rounded-full inline-block">
                              Point at a QR Code to identify landmark
                          </p>
                      </div>
                  </div>
              </div>

              {/* Controls */}
              <div className="p-8 pb-12 flex justify-center gap-8 overlay-ui bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                  <button className="flex flex-col items-center gap-2 group">
                      <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all">
                          <ImageIcon size={20} className="text-white" />
                      </div>
                      <span className="text-white text-xs font-medium">Gallery</span>
                  </button>
                  
                  <button 
                    onClick={() => setTorchOn(!torchOn)}
                    className="flex flex-col items-center gap-2 group"
                  >
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all shadow-lg ${torchOn ? 'bg-white border-white' : 'bg-transparent border-white/50 hover:border-white'}`}>
                          <Flashlight size={28} className={torchOn ? 'text-black' : 'text-white'} />
                      </div>
                  </button>

                  <button className="flex flex-col items-center gap-2 group" onClick={() => setShowHistory(true)}>
                      <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all">
                          <HistoryIcon size={20} className="text-white" />
                      </div>
                      <span className="text-white text-xs font-medium">Recent</span>
                  </button>
              </div>
          </div>
      )}

      {/* 3. Result Sheet (Bottom Sheet) */}
      <div className={`absolute bottom-0 left-0 w-full z-30 transition-transform duration-500 result-sheet ${!result ? 'translate-y-full' : ''}`}>
          {result && (
              <div className="bg-white rounded-t-[2.5rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
                  {/* Drag Handle */}
                  <div className="w-full flex justify-center pt-4 pb-2" onClick={() => {}}>
                      <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
                  </div>

                  {/* Header Image & Close */}
                  <div className="relative h-48 w-full shrink-0">
                      <img src={result.image} alt={result.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <button 
                        onClick={resetScan}
                        className="absolute top-4 right-4 p-2 bg-black/20 text-white rounded-full backdrop-blur-md hover:bg-black/40 transition-colors"
                      >
                          <X size={20} />
                      </button>
                      <div className="absolute bottom-4 left-6 text-white">
                          <h2 className="text-2xl font-bold font-display">{result.title}</h2>
                          <div className="flex items-center gap-1 text-xs font-medium opacity-90 mt-1">
                              <MapPin size={12} /> {result.location}
                          </div>
                      </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 overflow-y-auto">
                      {/* Action Grid */}
                      <div className="grid grid-cols-3 gap-3 mb-6">
                          <button className="flex flex-col items-center justify-center gap-2 p-3 bg-sky-50 rounded-2xl text-sky-700 hover:bg-sky-100 transition-colors">
                              <Headphones size={24} />
                              <span className="text-xs font-bold">{result.audioDuration || 'Audio'}</span>
                          </button>
                          <button className="flex flex-col items-center justify-center gap-2 p-3 bg-purple-50 rounded-2xl text-purple-700 hover:bg-purple-100 transition-colors">
                              <Box size={24} />
                              <span className="text-xs font-bold">AR View</span>
                          </button>
                          <button className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-50 rounded-2xl text-slate-700 hover:bg-slate-100 transition-colors">
                              <Share2 size={24} />
                              <span className="text-xs font-bold">Share</span>
                          </button>
                      </div>

                      {/* Quick Facts */}
                      <div className="flex gap-2 mb-6 flex-wrap">
                          <span className="px-3 py-1 border border-slate-200 rounded-full text-xs font-bold text-slate-600 flex items-center gap-1">
                              <HistoryIcon size={12} /> {result.year}
                          </span>
                          {result.tags?.map((tag: string) => (
                              <span key={tag} className="px-3 py-1 border border-slate-200 rounded-full text-xs font-bold text-slate-600">
                                  {tag}
                              </span>
                          ))}
                      </div>

                      {/* Description */}
                      <div className="mb-8">
                          <h3 className="font-bold text-slate-900 mb-2">History & Significance</h3>
                          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                              {result.description}
                          </p>
                      </div>
                  </div>
              </div>
          )}
      </div>

      {/* History Sheet (Partial Modal) */}
      {showHistory && (
          <div className="absolute inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-end">
              <div className="bg-white w-full rounded-t-[2rem] h-[60vh] p-6 flex flex-col animate-in slide-in-from-bottom duration-300">
                  <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-xl text-slate-900">Scan History</h3>
                      <button onClick={() => setShowHistory(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:text-slate-900">
                          <X size={20} />
                      </button>
                  </div>
                  
                  {isLoadingHistory ? (
                      <div className="flex-grow flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
                      </div>
                  ) : history.length === 0 ? (
                      <div className="text-center text-slate-400 text-sm mt-8 flex-grow">
                          No history found. Start scanning QR codes at heritage sites!
                      </div>
                  ) : (
                      <div className="flex-grow overflow-y-auto space-y-4 pr-2">
                          {history.map((record) => (
                              <div key={record.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-sky-200 transition-colors cursor-pointer" onClick={() => { setShowHistory(false); setResult(record.artifact); setScanning(false); setTimeout(() => { gsap.fromTo('.result-sheet', { y: '100%' }, { y: '0%', duration: 0.5, ease: 'power3.out' }); }, 100); }}>
                                  <div className="w-16 h-16 bg-slate-200 rounded-xl overflow-hidden shrink-0">
                                      <img src={record.artifact.image} alt="Thumb" className="w-full h-full object-cover" />
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-slate-900 text-sm">{record.artifact.title}</h4>
                                      <p className="text-xs text-slate-500">{record.artifact.location}</p>
                                      <p className="text-[10px] text-sky-600 font-bold mt-1">
                                          {new Date(record.scannedAt).toLocaleDateString()} at {new Date(record.scannedAt).toLocaleTimeString()}
                                      </p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          </div>
      )}

    </div>
  );
};

export default QRGuidePage;