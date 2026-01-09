import React, { useState, useEffect } from 'react';
import { Terminal, Activity, Cpu } from 'lucide-react';

interface SystemBootProps {
  onComplete: () => void;
}

export const SystemBoot: React.FC<SystemBootProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'KERNEL' | 'MESH' | 'IDENTITY' | 'EXIT'>('KERNEL');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  // PROGRESS MASTER CLOCK - Slowed down for "instrumentation" feel
  useEffect(() => {
    const pInterval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) return 100;
        const inc = p < 40 ? 0.8 : p < 85 ? 0.4 : 1.2;
        return Math.min(100, p + inc);
      });
    }, 40);

    return () => clearInterval(pInterval);
  }, []);

  // SYNC PHASES WITH PROGRESS BAR
  useEffect(() => {
    if (progress === 0) {
      setLogs(["BOOT_SEQUENCE_INITIATED", "ENCRYPTED_HANDSHAKE_ESTABLISHED"]);
    } else if (progress >= 40 && progress < 100 && phase === 'KERNEL') {
      setPhase('MESH');
      setLogs(prev => ["CALIBRATING_SACCADIC_MESH", "SYNCING_SENTINEL_NODES", ...prev]);
    } else if (progress === 100 && phase === 'MESH') {
      setPhase('IDENTITY');
      setLogs(prev => ["VIGIL_WORDMARK_DECRYPTION", "CORE_SYNC_SUCCESSFUL", ...prev]);
    }
  }, [progress, phase]);

  // DEDICATED EXIT SEQUENCE
  useEffect(() => {
    if (phase === 'IDENTITY') {
      const exitSequence = setTimeout(() => {
        setPhase('EXIT');
        setTimeout(onComplete, 1200); 
      }, 1500);
      return () => clearTimeout(exitSequence);
    }
  }, [phase, onComplete]);

  const skipBoot = () => {
    setProgress(100);
    setPhase('IDENTITY');
  };

  return (
    <div className={`fixed inset-0 z-[300] bg-[#020202] flex flex-col items-center justify-center overflow-hidden transition-all duration-1000 ${phase === 'EXIT' ? 'scale-110 opacity-0 blur-3xl' : 'opacity-100'}`}>
      
      {/* Background Digital Circuit Mesh */}
      <div className="absolute inset-0 opacity-[0.12] pointer-events-none overflow-hidden">
        <svg width="100%" height="100%" className="text-blue-500/30">
          <defs>
            <pattern id="circuit-traces" width="200" height="200" patternUnits="userSpaceOnUse">
              <path d="M 20 0 V 200 M 24 0 V 200 M 60 0 V 40 L 80 60 H 120 L 140 80 V 200" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <path d="M 0 140 H 40 L 60 160 V 200 M 0 144 H 38 L 58 164 V 200" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <path d="M 180 0 L 140 40 H 100 L 80 60 V 100 L 60 120 H 0" fill="none" stroke="currentColor" strokeWidth="0.8" />
              <path d="M 200 120 L 160 160 H 120 L 100 180 V 200" fill="none" stroke="currentColor" strokeWidth="0.8" />
              <circle cx="20" cy="20" r="2" fill="currentColor" />
              <circle cx="20" cy="60" r="1.5" fill="currentColor" />
              <circle cx="80" cy="60" r="2" fill="currentColor" />
              <circle cx="140" cy="80" r="1.5" fill="currentColor" />
              <circle cx="100" cy="180" r="2" fill="currentColor" />
              <circle cx="60" cy="120" r="1.5" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit-traces)" />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020202]/60 to-[#020202]" />
      </div>

      {/* Central Identity Monolith */}
      <div className="relative z-20 flex flex-col items-center gap-8 md:gap-20 w-full px-6">
        
        {/* The Forensic Reticle */}
        <div className="relative w-[280px] h-[280px] md:w-[480px] md:h-[480px] flex items-center justify-center shrink-0">
           
           {/* SYNCED THICK PROGRESS RING */}
           <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-[0_0_20px_rgba(6,182,212,0.15)]">
             <circle 
                cx="200" 
                cy="200" 
                r="180" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="12" 
                className="text-zinc-900/50"
             />
             <circle 
                cx="200" 
                cy="200" 
                r="180" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="12" 
                strokeDasharray="1131" 
                style={{ 
                  strokeDashoffset: 1131 * (1 - progress / 100),
                  transition: 'stroke-dashoffset 0.04s linear'
                }}
                className="text-cyan-500"
             />
             <g style={{ 
                  transformOrigin: '200px 200px',
                  transform: `rotate(${(progress / 100) * 360}deg)`,
                  transition: 'transform 0.04s linear'
                }}>
               <circle 
                  cx="380" 
                  cy="200" 
                  r="7" 
                  fill="white" 
                  className="shadow-[0_0_20px_white]"
                  style={{ display: progress > 0 ? 'block' : 'none' }}
               />
               <circle 
                  cx="380" 
                  cy="200" 
                  r="12" 
                  fill="white" 
                  className="opacity-20 animate-pulse"
                  style={{ display: progress > 0 ? 'block' : 'none' }}
               />
             </g>
           </svg>
           
           {/* KINETIC VL LOGO */}
           <div className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ${phase === 'IDENTITY' ? 'opacity-0 scale-150 blur-3xl' : 'opacity-100 scale-100'}`}>
              <div className="relative">
                <svg viewBox="0 0 400 400" className="w-[180px] h-[180px] md:w-[320px] md:h-[320px] overflow-visible text-cyan-500">
                   <path d="M50 200 H120 L180 350 L240 120 V350 H350" fill="none" stroke="currentColor" strokeWidth="28" strokeLinecap="round" strokeLinejoin="round" opacity="0.05"/>
                   <path 
                      d="M50 200 H120 L180 350 L240 120 V350 H350" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="28" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeDasharray="1000"
                      style={{ 
                        strokeDashoffset: 1000 - (progress * 10),
                        transition: 'stroke-dashoffset 0.04s linear'
                      }}
                      className="opacity-100 drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]"
                   />
                   <path 
                      d="M50 200 H120 L180 350 L240 120 V350 H350" 
                      fill="none" 
                      stroke="white" 
                      strokeWidth="32" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeDasharray="4 1000"
                      style={{ 
                        strokeDashoffset: 1000 - (progress * 10),
                        transition: 'stroke-dashoffset 0.04s linear'
                      }}
                      className="drop-shadow-[0_0_20px_white]"
                   />
                </svg>
              </div>
           </div>

           {/* WORDMARK */}
           <div className={`transition-all duration-1000 ${phase === 'IDENTITY' ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-90 blur-xl'}`}>
              <div className="text-center relative">
                <div className="absolute inset-0 text-cyan-500/30 blur-sm translate-x-1 -translate-y-1 animate-pulse italic font-black text-5xl md:text-9xl tracking-[0.1em] select-none whitespace-nowrap">
                  VIGIL
                </div>
                <div className="relative text-white italic font-black text-5xl md:text-9xl tracking-[0.15em] drop-shadow-[0_0_50px_rgba(255,255,255,0.4)] animate-pulse-flicker whitespace-nowrap">
                  VIGIL
                </div>
              </div>
           </div>
        </div>

        {/* Tactical Readouts */}
        <div className="flex flex-col items-center gap-6 md:gap-8 w-full max-w-[320px] md:max-w-none md:w-96 relative z-30">
           <div className="flex flex-col items-center gap-1 md:gap-2">
              <div className="text-[9px] md:text-[11px] font-black text-white uppercase tracking-[0.4em] md:tracking-[0.6em] italic animate-pulse">
                SYS_INTEGRITY_INDEX
              </div>
              <div className="text-4xl md:text-5xl font-black text-cyan-500 italic tabular-nums tracking-tighter drop-shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                {Math.floor(progress)}%
              </div>
           </div>
           
           <div className="h-8 md:h-10 overflow-hidden text-center flex flex-col justify-center px-4 md:px-8 py-1 md:py-2 bg-zinc-900/40 border border-zinc-800 rounded-xl w-full">
              <p className="text-[10px] md:text-[12px] font-black text-zinc-300 uppercase tracking-[0.3em] md:tracking-[0.5em] animate-in slide-in-from-bottom duration-500 italic">
                {phase === 'KERNEL' ? 'KERNEL_INITIALIZING' : phase === 'MESH' ? 'MAPPING_HUMAN_PROTOCOL' : 'NODE_IDENTITY_STABLE'}
              </p>
           </div>

           <div className="flex items-center gap-4 opacity-40">
              <div className="h-[1px] w-8 md:w-12 bg-zinc-800" />
              <Cpu size={12} className="text-zinc-600 md:w-[14px] md:h-[14px]" />
              <div className="h-[1px] w-8 md:w-12 bg-zinc-800" />
           </div>
        </div>
      </div>

      {/* Skip Button */}
      {(phase === 'KERNEL' || phase === 'MESH') && (
        <button 
          onClick={skipBoot}
          className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 px-5 py-2 border border-zinc-900 hover:border-zinc-800 bg-black/20 text-[7px] md:text-[8px] font-mono text-zinc-700 hover:text-zinc-500 uppercase tracking-[0.4em] rounded transition-all z-[310]"
        >
          [SKIP_BOOT_SEQUENCE]
        </button>
      )}

      {/* Registry Logs: Hidden on smallest mobile screens for clarity */}
      <div className="absolute bottom-12 left-10 hidden sm:flex flex-col gap-3 max-w-[200px] md:max-w-xs opacity-60">
         <div className="flex items-center gap-3 mb-1 md:mb-2">
            <Terminal size={12} className="text-cyan-500 md:w-[14px] md:h-[14px]" />
            <span className="text-[9px] md:text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Registry Init Log</span>
         </div>
         <div className="space-y-1.5 border-l border-zinc-900 pl-4">
           {logs.map((log, i) => (
             <div key={i} className="text-[9px] md:text-[10px] font-mono text-zinc-500 animate-in slide-in-from-left-4 duration-500">
               <span className="text-zinc-800 mr-1.5 md:mr-2">{">>"}</span> {log}
             </div>
           ))}
         </div>
      </div>

      {/* Neural Status */}
      <div className="absolute bottom-12 right-10 hidden sm:flex flex-col items-end gap-4 md:gap-6 opacity-60">
         <div className="flex items-center gap-4 md:gap-6">
            <div className="text-right space-y-0.5 md:space-y-1">
               <div className="text-[9px] md:text-[10px] font-black text-zinc-600 uppercase tracking-widest">Resilience Threshold</div>
               <div className="text-base md:text-lg font-black text-emerald-500 italic tracking-tighter uppercase drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">Optimal_Sync</div>
            </div>
            <div className="w-10 h-10 md:w-14 md:h-14 bg-emerald-500/5 border border-emerald-500/20 rounded-xl md:rounded-2xl flex items-center justify-center">
              <Activity size={24} className="text-emerald-500 md:w-[32px] md:h-[32px] animate-pulse" />
            </div>
         </div>
         <div className="h-[1px] w-32 md:w-48 bg-gradient-to-l from-zinc-800 to-transparent" />
         <div className="text-[9px] md:text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] md:tracking-[0.6em] italic">VIG-OS-MASTER-SYNC</div>
      </div>

      <style>{`
        @keyframes pulse-flicker {
          0%, 100% { opacity: 1; filter: blur(0px); }
          92% { opacity: 1; filter: blur(0px); }
          94% { opacity: 0.8; filter: blur(1px); }
          96% { opacity: 0.3; filter: blur(2px); }
          98% { opacity: 0.9; filter: blur(0.5px); }
        }
        .animate-pulse-flicker { animation: pulse-flicker 4s infinite linear; }
      `}</style>
    </div>
  );
};
