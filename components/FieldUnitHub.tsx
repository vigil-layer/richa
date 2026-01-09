import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, Activity, Smartphone, ChevronRight, Fingerprint, 
  Terminal, Globe, ShieldCheck,
  Power, Scan, Target,
  FileCheck, Link, Activity as Pulse, Folder,
  FileCode, Copy, Check, Download,
  Radar, Lock, CheckCircle2, ShieldX, Eye, AlertTriangle, AlertOctagon, XCircle,
  Filter, Trash2, DownloadCloud, Code2, ExternalLink
} from 'lucide-react';
import { analyzeAddressInterception, InterceptionSynthesisResponse } from '../services/geminiService';
import { calculateCompositeThreat, getAxesFromVerdict } from '../utils/threatIndex';
import { SILO_MANIFEST, ManifestFile } from '../registry/fieldUnitSilo';
import { VigilScanner } from './VigilScanner';

type NodeState = 'UNAUTHORIZED' | 'HANDSHAKE' | 'PRO_ACTIVE';
type HubView = 'INTERCEPT' | 'SYNC';

interface HoverScanState {
  address: string | null;
  x: number;
  y: number;
  result: InterceptionSynthesisResponse | null;
  loading: boolean;
  localVerdict: string | null;
  localConfidence: number | null;
}

const CURRENT_SILO_VERSION = "0.0.0.1";

const NeuralParityHeader = ({ synced }: { synced: boolean }) => (
  <div className="flex items-center gap-6">
    <div className="flex items-center gap-3">
      <div className={`w-2 h-2 rounded-full animate-pulse ${synced ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-red-600 shadow-[0_0_10px_#ef4444]'}`} />
      <div className="flex flex-col">
        <span className={`text-[10px] font-black uppercase tracking-widest ${synced ? 'text-emerald-500' : 'text-red-500'}`}>
          NEURAL PARITY: {synced ? 'ACTIVE' : 'PENDING_UPDATE'}
        </span>
      </div>
    </div>
    <div className="h-6 w-[1px] bg-zinc-800" />
    <div className="hidden md:flex items-center gap-6 overflow-hidden">
      {['VALIDATOR.JS', 'DIFF.JS', `MANIFEST_${CURRENT_SILO_VERSION}`].map((file, i) => (
        <div key={i} className="flex items-center gap-2 shrink-0">
          <FileCheck size={11} className="text-zinc-600" />
          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-tighter">{file}</span>
        </div>
      ))}
    </div>
  </div>
);

const DeploymentManifestCard = () => (
  <div className="bg-[#080808] border border-zinc-900 rounded-[2.5rem] p-10 flex flex-col h-full relative overflow-hidden group shadow-2xl transition-all hover:border-emerald-500/20">
    <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
      <Fingerprint className="w-48 h-48 text-white" strokeWidth={0.5} />
    </div>
    <div className="relative z-10 space-y-10 flex-1">
      <div className="space-y-4">
        <div className="px-3 py-1 bg-zinc-950 border border-zinc-900 rounded-lg inline-block">
          <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">DEPLOYMENT_MANIFEST</span>
        </div>
        <h3 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-[0.8]">VIGIL <br/> FIELD UNIT.</h3>
      </div>
      <div className="space-y-6">
        {['12MS LATENCY', 'SHADOW DOM', 'MESH SYNC', 'REVERSIBILITY_FILTER'].map((item, i) => (
          <div key={i} className="flex items-start gap-4">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 mt-2 group-hover:bg-emerald-500 transition-colors" />
            <div className="space-y-1">
              <h5 className="text-[11px] font-black text-white uppercase tracking-widest">{item}</h5>
              <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">PROTOCOL STANDARD</p>
            </div>
          </div>
        ))}
      </div>
    </div>
    <button className="relative z-10 mt-12 w-full py-6 bg-white text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] transition-all hover:bg-emerald-500 hover:text-white flex items-center justify-between px-8 group/btn active:scale-95 shadow-2xl">
      <div className="flex items-center gap-3"><Smartphone size={16} /><span>INSTALL UNIT</span></div>
      <ChevronRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
    </button>
  </div>
);

export const FieldUnitHub: React.FC = () => {
  const [nodeState, setNodeState] = useState<NodeState>(() => 
    localStorage.getItem('vigil_node_verified') === 'true' ? 'PRO_ACTIVE' : 'UNAUTHORIZED'
  );
  
  const [handshakeStep, setHandshakeStep] = useState(0);
  const [copied, setCopied] = useState(false);

  const [syncedFiles, setSyncedFiles] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('vigil_synced_files_v12');
    if (saved) return JSON.parse(saved);
    return {}; 
  });

  const allFilesSynced = SILO_MANIFEST.every(file => syncedFiles[file.path] === true);
  const isSynced = nodeState === 'PRO_ACTIVE' && allFilesSynced;

  const [activeFeatures, setActiveFeatures] = useState<Set<string>>(new Set(['POISON', 'DUST', 'SPOOF', 'CLONE', 'JUDGMENT']));
  const [view, setView] = useState<HubView>('INTERCEPT');
  const [activeFile, setActiveFile] = useState<ManifestFile>(SILO_MANIFEST[0]);
  const [intercepts, setIntercepts] = useState<string[]>([]);
  const [hoverScan, setHoverScan] = useState<HoverScanState>({ 
    address: null, x: 0, y: 0, result: null, loading: false, localVerdict: null, localConfidence: null 
  });
  
  const scanTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    const addr = () => Array.from({length: 44}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    setIntercepts(Array.from({length: 12}, addr));
  }, []);

  const initiateHandshake = () => {
    setNodeState('HANDSHAKE');
    setHandshakeStep(1);
    setTimeout(() => setHandshakeStep(2), 800);
    setTimeout(() => setHandshakeStep(3), 1600);
    setTimeout(() => {
      setNodeState('PRO_ACTIVE');
      localStorage.setItem('vigil_node_verified', 'true');
      setHandshakeStep(0);
    }, 2400);
  };

  const handleTerminate = () => {
    localStorage.removeItem('vigil_node_verified');
    localStorage.removeItem('vigil_node_expiry');
    localStorage.removeItem('vigil_plan_tier');
    setNodeState('UNAUTHORIZED');
    setHandshakeStep(0);
    setView('INTERCEPT');
    
    const element = document.getElementById('field-unit');
    if (element) {
      element.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  };

  const toggleFeature = (f: string) => {
    const next = new Set(activeFeatures);
    if (next.has(f)) next.delete(f); else next.add(f);
    setActiveFeatures(next);
  };

  const handleInterceptHover = (e: React.MouseEvent, addr: string) => {
    if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
    setHoverScan({ 
      address: addr, x: e.clientX, y: e.clientY, 
      result: null, loading: true, 
      localVerdict: null, localConfidence: null 
    });
    scanTimerRef.current = window.setTimeout(async () => {
      let verdict: string;
      const r = Math.random();
      if (r > 0.85) verdict = 'VANITY_POISON';
      else if (r > 0.70) verdict = 'DUST_INJECTION';
      else if (r > 0.55) verdict = 'HOMOGRAPH_SPOOF';
      else if (r > 0.40) verdict = 'NEW_ORIGIN';
      else if (r > 0.25) verdict = 'MINT_MISMATCH';
      else verdict = 'TRUSTED_NODE';
      const axes = getAxesFromVerdict(verdict.includes('TRUSTED') ? 'TRUSTED' : verdict.includes('POISON') ? 'POISON' : 'NEW');
      const confidence = calculateCompositeThreat(axes);
      setHoverScan(prev => ({ ...prev, loading: false, localVerdict: verdict, localConfidence: confidence }));
      try {
        const res = await analyzeAddressInterception(addr);
        setHoverScan(prev => ({ ...prev, result: res }));
      } catch (err) {}
    }, 500);
  };

  const handleMouseLeave = () => {
    if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
    setHoverScan(prev => ({ ...prev, address: null }));
  };

  const handleFileDownload = (e: React.MouseEvent | React.FocusEvent, file: ManifestFile) => {
    if (e) e.stopPropagation();
    const blob = new Blob([file.content], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.path.split('/').pop() || 'vigil-core.js';
    a.click();
    URL.revokeObjectURL(url);
    
    const next = { ...syncedFiles, [file.path]: true };
    setSyncedFiles(next);
    localStorage.setItem('vigil_synced_files_v12', JSON.stringify(next));
  };

  const handleCopyCode = async () => {
    if (!activeFile) return;
    try {
      await navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard access failed:", err);
    }
  };

  return (
    <section id="field-unit" className="px-6 md:px-20 py-12 md:py-24 bg-[#020202] relative z-10 overflow-hidden border-t border-zinc-900/50">
      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-emerald-500 animate-pulse" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">Field Unit // Command Center</span>
              <h2 className="text-4xl md:text-7xl font-black text-white italic uppercase tracking-tighter leading-[0.8]">The Sentinel.</h2>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-8 h-[78vh]">
            <div className="bg-[#050505] border-2 border-zinc-900 rounded-[3.5rem] overflow-hidden flex flex-col shadow-2xl h-full relative">
              {nodeState !== 'PRO_ACTIVE' ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-black animate-in fade-in duration-700">
                  <div className="relative mb-12">
                    <VigilScanner 
                      size="xl" 
                      label={nodeState === 'HANDSHAKE' ? 'SYNCHRONIZING_MESH_PROTOCOLS' : 'OPERATOR_HANDSHAKE_REQUIRED'} 
                      status={nodeState === 'HANDSHAKE' ? 'scanning' : 'idle'}
                    />
                  </div>
                  {nodeState === 'UNAUTHORIZED' && (
                    <button 
                      onClick={initiateHandshake}
                      className="px-12 py-5 bg-emerald-600 text-white text-[11px] font-black uppercase tracking-[0.4em] rounded-2xl hover:bg-emerald-500 transition-all shadow-[0_0_50px_rgba(16,185,129,0.2)] active:scale-95 flex items-center gap-3"
                    >
                      <Zap size={14} className="fill-current" /> ACTIVATE SENTINEL NODE
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="h-16 bg-[#0a0a0a] border-b border-zinc-900 flex items-center px-6 md:px-10 justify-between shrink-0">
                    <NeuralParityHeader synced={isSynced} />
                    <div className="hidden sm:flex items-center gap-3 text-[9px] font-black text-zinc-700 uppercase italic">
                      <Link size={11} /> Shadow Sync v1.5
                    </div>
                  </div>

                  <div className="h-14 bg-zinc-950/50 border-b border-zinc-900 flex items-center px-6 md:px-10 justify-between shrink-0">
                    <div className="flex items-center gap-4 md:gap-8">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${nodeState === 'PRO_ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-800'}`} />
                        <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest">VIG-NODE-0.5</span>
                      </div>
                      <div className="p-1 bg-black border border-zinc-900 rounded-lg flex gap-1">
                        <button onClick={() => setView('INTERCEPT')} className={`px-3 md:px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${view === 'INTERCEPT' ? 'bg-zinc-800 text-white' : 'text-zinc-600'}`}>
                          INTERCEPT LOG
                        </button>
                        <button onClick={() => setView('SYNC')} className={`px-3 md:px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${view === 'SYNC' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10' : 'text-zinc-600'}`}>
                          PHYSICAL SYNC
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <button onClick={handleTerminate} className="px-6 py-2 bg-red-950/20 border border-red-900/40 text-red-500 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-red-600 hover:text-white transition-all flex items-center gap-2 group">
                        <Power size={11} className="group-hover:animate-pulse" /> TERMINATE ACCESS
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-hidden flex flex-col">
                    {view === 'INTERCEPT' ? (
                      <div className="flex-1 p-6 md:p-10 flex flex-col gap-8 animate-in fade-in duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                          <div className="space-y-6 flex flex-col h-full min-h-0">
                            <div className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] flex items-center gap-3">
                               <Scan size={14} className="text-emerald-500" /> ACTIVE_INTERCEPT_STREAM
                            </div>
                            <div className="flex-1 bg-black/40 border border-zinc-900 rounded-[2rem] overflow-y-auto no-scrollbar p-6 space-y-3 shadow-inner">
                              {intercepts.map((addr, i) => (
                                <div 
                                  key={i} 
                                  onMouseEnter={(e) => handleInterceptHover(e, addr)}
                                  onMouseLeave={handleMouseLeave}
                                  className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl flex items-center justify-between group/tx hover:border-emerald-500/30 transition-all cursor-crosshair"
                                >
                                  <div className="flex items-center gap-4">
                                    <Fingerprint size={16} className="text-zinc-700 group-hover/tx:text-emerald-500 transition-colors" />
                                    <div className="font-mono text-[10px] text-zinc-500 group-hover/tx:text-white truncate max-w-[120px] md:max-w-none">
                                      {addr.slice(0, 8)}...{addr.slice(-8)}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {/* Fixed template literal syntax error on the following line */}
                                    <div className={`w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover/tx:bg-emerald-500`} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="space-y-6 flex flex-col h-full min-h-0">
                            <div className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] flex items-center gap-3">
                               <Target size={14} className="text-blue-500" /> DEFENSE_MATRIX_CONTROLS
                            </div>
                            <div className="flex-1 bg-zinc-950/30 border border-zinc-900 rounded-[2.5rem] p-8 space-y-6 overflow-y-auto custom-scrollbar pr-2">
                               {[
                                 { id: 'POISON', label: 'Retinal Poison Shield', desc: 'Auto-masking vanity mimic strings in DOM.' },
                                 { id: 'DUST', label: 'Dust Transfer Filter', desc: 'Hiding 0-value tx provenance clusters.' },
                                 { id: 'SPOOF', label: 'Homograph Protection', desc: 'Neutralizing Unicode character swaps.' },
                                 { id: 'CLONE', label: 'Interface Clone Alert', desc: 'Detecting phishing DOM mutations.' },
                                 { id: 'JUDGMENT', label: 'Judgment Co-pilot', desc: 'Flagging urgency psychological triggers.' }
                               ].map((feat) => (
                                 <button 
                                   key={feat.id} 
                                   onClick={() => toggleFeature(feat.id)}
                                   className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all group/feat ${activeFeatures.has(feat.id) ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-500' : 'bg-black border-zinc-900 text-zinc-600'}`}
                                 >
                                    <div className="text-left space-y-0.5">
                                       <div className="text-[10px] font-black uppercase tracking-widest">{feat.label}</div>
                                       <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-tighter italic">{feat.desc}</div>
                                    </div>
                                    <div className={`w-10 h-5 rounded-full relative transition-all ${activeFeatures.has(feat.id) ? 'bg-emerald-500' : 'bg-zinc-800'}`}>
                                       <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${activeFeatures.has(feat.id) ? 'right-1' : 'left-1'}`} />
                                    </div>
                                 </button>
                               ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col animate-in fade-in duration-500 overflow-hidden">
                        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-full">
                           <div className="lg:col-span-5 border-r border-zinc-900 flex flex-col bg-black/20 overflow-hidden">
                              <div className="p-4 md:p-6 border-b border-zinc-900 bg-zinc-950/30 flex items-center justify-between shrink-0">
                                 <div className="flex items-center gap-2 text-zinc-500 font-black uppercase tracking-[0.2em] text-[9px]">
                                    <Folder size={12} /> SILO MANIFEST
                                 </div>
                                 <div className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-[7px] font-black text-zinc-600 uppercase tracking-widest">
                                    REGISTRY
                                 </div>
                              </div>
                              <div className="flex-1 overflow-y-auto custom-scrollbar p-2.5 space-y-1.5">
                                 {SILO_MANIFEST.map((file) => {
                                   const isDownloaded = syncedFiles[file.path];
                                   const isActive = activeFile.path === file.path;
                                   
                                   return (
                                     <button 
                                       key={file.path} 
                                       onClick={() => {
                                         setActiveFile(file);
                                         setCopied(false);
                                       }}
                                       className={`w-full p-2.5 rounded-xl border-2 text-left flex flex-col gap-1.5 transition-all duration-300 relative overflow-hidden group ${
                                         isActive ? 'scale-[1.01] shadow-xl' : 'scale-100'
                                       } ${
                                         isDownloaded 
                                          ? (isActive ? 'bg-emerald-600/10 border-emerald-500/50' : 'bg-zinc-950/50 border-emerald-900/20 hover:border-emerald-500/30') 
                                          : (isActive ? 'bg-red-600/10 border-red-500/50' : 'bg-zinc-950/50 border-red-900/20 hover:border-red-500/30')
                                       }`}
                                     >
                                        <div className="flex items-center justify-between">
                                           <div className={`w-6 h-6 rounded-lg flex items-center justify-center border shadow-inner ${isDownloaded ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-500' : 'bg-red-950/50 border-red-500/30 text-red-500'}`}>
                                              {React.cloneElement(file.icon as React.ReactElement<{ size?: number }>, { size: 10 })}
                                           </div>
                                           <div className="flex items-center gap-2">
                                              <div className={`w-1 h-1 rounded-full ${isDownloaded ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]' : 'bg-red-600 animate-pulse shadow-[0_0_8px_#ef4444]'}`} />
                                              <span className={`text-[7.5px] font-black uppercase tracking-widest ${isDownloaded ? 'text-emerald-500' : 'text-red-600'}`}>
                                                {isDownloaded ? 'SYNCED' : 'PENDING'}
                                              </span>
                                           </div>
                                        </div>
                                        <div className="space-y-0">
                                           <div className="font-mono text-[10px] text-white font-bold tracking-tight truncate uppercase">{file.path}</div>
                                           <div className="text-[6.5px] text-zinc-600 font-black uppercase tracking-widest leading-none">{file.type}</div>
                                        </div>
                                     </button>
                                   );
                                 })}
                              </div>
                           </div>
                           
                           <div className="lg:col-span-7 flex flex-col bg-[#020202] overflow-hidden relative">
                              <div className="p-5 md:p-8 border-b border-zinc-900 space-y-5 relative overflow-hidden">
                                 <div className="absolute top-0 right-0 p-8 opacity-[0.015] pointer-events-none">
                                    <Code2 size={100} />
                                 </div>
                                 <div className="space-y-2">
                                    <div className="flex items-center gap-4">
                                       <span className="text-blue-500 font-black text-[9px] uppercase tracking-[0.3em]">SHADOW_SYNC_PROTOCOL</span>
                                       <div className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-[8px] font-black text-zinc-600 uppercase tracking-widest">
                                          REGISTRY_MIRROR
                                       </div>
                                    </div>
                                    <h2 className="text-2xl md:text-4xl font-black text-white italic uppercase tracking-tighter leading-none">
                                       LIVE SOURCE.
                                    </h2>
                                 </div>

                                 <div className="flex flex-col md:flex-row items-center gap-3">
                                    <div className="flex-1 p-2.5 bg-zinc-950 border border-zinc-900 rounded-xl flex items-center justify-between overflow-hidden">
                                       <div className="flex items-center gap-2.5 overflow-hidden">
                                          <div className="p-1 bg-zinc-900 rounded-lg shrink-0"><FileCode size={11} className="text-zinc-600" /></div>
                                          <div className="font-mono text-[9px] text-zinc-500 truncate uppercase tracking-widest">{activeFile.path}</div>
                                       </div>
                                    </div>
                                    <div className="flex gap-2 shrink-0 w-full md:w-auto">
                                       <button 
                                          onClick={handleCopyCode}
                                          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 group/btn ${copied ? 'bg-emerald-600/10 border-emerald-500/50 text-emerald-500' : 'bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800'}`}
                                       >
                                          {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} className="text-zinc-600 group-hover/btn:text-white" />}
                                          {copied ? 'COPIED' : 'COPY'}
                                       </button>
                                       <button 
                                          onClick={(e) => handleFileDownload(e, activeFile)}
                                          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-500 shadow-xl transition-all active:scale-95 group/btn"
                                       >
                                          <Download size={12} /> DOWNLOAD
                                       </button>
                                    </div>
                                 </div>
                              </div>
                              
                              <div className="flex-1 p-6 md:p-8 overflow-auto custom-scrollbar bg-black/40">
                                 <pre className="text-[11px] md:text-[12px] font-mono text-zinc-500 leading-relaxed group/code selection:bg-blue-500/20 selection:text-blue-200">
                                    <code>{activeFile.content}</code>
                                 </pre>
                              </div>

                              <div className="absolute bottom-6 right-10 opacity-10 flex items-center gap-4 pointer-events-none">
                                 <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">AES-256</div>
                                 <div className="h-3 w-[1px] bg-zinc-800" />
                                 <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">VERIFIED</div>
                              </div>
                           </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {hoverScan.address && (() => {
                const verdict = hoverScan.localVerdict;
                let color = "text-blue-500";
                let badge = "bg-zinc-800 text-zinc-400";
                let msg = "Analysis active...";
                
                if (verdict?.includes('POISON') || verdict?.includes('SPOOF')) {
                  color = "text-red-500";
                  badge = "bg-red-600 text-white";
                  msg = "Mimic detected. Forced entropy match.";
                } else if (verdict?.includes('DUST')) {
                  color = "text-amber-500";
                  badge = "bg-amber-600 text-white";
                  msg = "Dust injection. Historical noise risk.";
                } else if (verdict?.includes('NEW')) {
                  color = "text-cyan-500";
                  badge = "bg-cyan-600 text-white";
                  msg = "New origin. Zero prior interactions.";
                } else if (verdict?.includes('MINT')) {
                  color = "text-rose-500";
                  badge = "bg-rose-600 text-white";
                  msg = "Counterfeit mint. Impersonation logic.";
                } else if (verdict?.includes('TRUSTED')) {
                  color = "text-emerald-500";
                  badge = "bg-emerald-600 text-white";
                  msg = "Safe node. Historical parity confirmed.";
                }

                return (
                <div 
                  className="fixed z-[100] pointer-events-none transition-all duration-300 transform -translate-y-full"
                  style={{ left: hoverScan.x, top: hoverScan.y - 20 }}
                >
                   <div className="bg-[#080808]/95 backdrop-blur-xl border border-zinc-800 p-6 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] min-w-[320px] space-y-6">
                      <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                         <div className="flex items-center gap-3">
                            <Radar size={16} className={`${color} ${verdict?.includes('POISON') ? 'animate-pulse' : ''}`} />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">SCAN_INTERCEPT</span>
                         </div>
                         <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${badge}`}>
                            {verdict || 'PROCESSING...'}
                         </div>
                      </div>
                      
                      <div className="space-y-4">
                         <div className="p-4 bg-black border border-zinc-900 rounded-xl space-y-2">
                            <div className="flex justify-between">
                               <span className="text-[8px] font-black text-zinc-600 uppercase">Fingerprint</span>
                               <span className="text-[8px] font-black text-zinc-600 uppercase">Entropy</span>
                            </div>
                            <div className="font-mono text-[11px] text-white tracking-tighter">
                               {hoverScan.address.slice(0, 8)}<span className="text-zinc-800">...</span>{hoverScan.address.slice(-8)}
                            </div>
                         </div>

                         {hoverScan.loading ? (
                           <div className="flex items-center justify-center py-4">
                              <VigilScanner size="sm" label="SCANNING_IDENTITY" />
                           </div>
                         ) : (
                           <div className="space-y-4 animate-in fade-in duration-500">
                              <div className="flex justify-between items-end">
                                 <div className="space-y-1">
                                    <div className="text-[8px] font-black text-zinc-600 uppercase">Risk Confidence</div>
                                    <div className={`text-3xl font-black italic tracking-tighter ${color}`}>
                                       {hoverScan.localConfidence}%
                                    </div>
                                 </div>
                                 <div className="text-right">
                                    <div className="text-[8px] font-black text-zinc-600 uppercase">L-0.5 Intercept</div>
                                    <div className="text-[10px] font-black text-white uppercase italic">DEFEATED</div>
                                 </div>
                              </div>
                              <p className={`text-[10px] leading-relaxed font-medium italic border-l-2 pl-4 ${color.replace('text-', 'border-')}`}>
                                 "{msg}"
                              </p>
                           </div>
                         )}
                      </div>
                   </div>
                </div>
                );
              })()}
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-8 h-[78vh]">
            <div className="flex-[3] min-h-0">
              <DeploymentManifestCard />
            </div>
            
            <div className="flex-[2] bg-[#080808] border border-zinc-900 rounded-[2.5rem] p-8 space-y-6 flex flex-col min-h-0 overflow-hidden shadow-2xl">
               <div className="flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-4">
                     <Globe className="w-5 h-5 text-zinc-700" />
                     <h4 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em]">Regional Mesh Nodes</h4>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[8px] font-black text-emerald-500 uppercase">LIVE</span>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                  {[
                    { node: 'SIN-88', status: 'ACTIVE', color: 'bg-emerald-500' },
                    { node: 'LHR-01', status: 'ACTIVE', color: 'bg-emerald-500' },
                    { node: 'JFK-X', status: 'SYNCING', color: 'bg-amber-500' },
                    { node: 'FRA-99', status: 'ACTIVE', color: 'bg-emerald-500' },
                    { node: 'AMS-02', status: 'ACTIVE', color: 'bg-emerald-500' },
                    { node: 'NRT-05', status: 'ACTIVE', color: 'bg-emerald-500' }
                  ].map((n, i) => (
                    <div key={i} className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl flex items-center justify-between hover:border-emerald-500/20 transition-all group/node">
                       <span className="text-[10px] font-mono text-zinc-400 group-hover/node:text-white transition-colors">{n.node}</span>
                       <div className={`w-1.5 h-1.5 rounded-full ${n.color} ${n.status === 'SYNCING' ? 'animate-pulse' : ''}`} />
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
