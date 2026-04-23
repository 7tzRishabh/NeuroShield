import React, { useState, useRef } from 'react';
import { LogOut, ShieldAlert, FileCode, Search, CheckCircle, AlertTriangle, UploadCloud, X } from 'lucide-react';
import { User } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';

interface CodeShieldDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function CodeShieldDashboard({ user, onLogout }: CodeShieldDashboardProps) {
  const [code, setCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<{ summary: string; threats: number; sanitized: string } | null>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [fileMeta, setFileMeta] = useState<{ name: string; size: number; isPdf: boolean } | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    const validExtensions = ['.txt', '.pdf', '.py', '.js', '.env', '.json', '.yaml', '.yml'];
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!hasValidExt) {
      alert(`Invalid file type. Allowed: ${validExtensions.join(', ')}`);
      return;
    }

    const isPdf = file.name.toLowerCase().endsWith('.pdf');
    setFileMeta({ name: file.name, size: file.size, isPdf });
    setResult(null);

    const reader = new FileReader();

    reader.onload = (e) => {
      const resultStr = e.target?.result as string;
      if (isPdf) {
        setPdfBase64(resultStr);
        setCode(`[PDF File Loaded: ${file.name}]\n\nClick "RUN DLP SCAN" to safely extract text and scan for sensitive vulnerabilities.`);
      } else {
        setPdfBase64(null);
        setCode(resultStr);
      }
    };

    if (isPdf) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setFileMeta(null);
    setPdfBase64(null);
    setCode('');
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleScan = async () => {
    if (!code.trim() && !pdfBase64) return;
    
    setIsScanning(true);
    await new Promise(resolve => setTimeout(resolve, 800)); // slight UI delay
    
    try {
      const payload = fileMeta?.isPdf && pdfBase64 
        ? { code: pdfBase64, isPdf: true }
        : { code: code, isPdf: false };

      const response = await fetch('/api/codeshield-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) throw new Error('Scan failed');
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Scanning error:', error);
      setResult({
        summary: 'Error connecting to DLP engine.',
        threats: 0,
        sanitized: code
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-white flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent-purple/10 blur-[120px] rounded-full pointer-events-none" />
      
      <header className="glass-panel border-b border-border sticky top-0 z-50 h-16 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-accent-purple/20 flex items-center justify-center border border-accent-purple/50 flex-shrink-0">
            <ShieldAlert className="text-accent-purple w-5 h-5" />
          </div>
          <span className="font-bold tracking-wider uppercase text-purple-400 text-xl truncate drop-shadow-[0_0_8px_rgba(192,132,252,0.5)]">CodeShield</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="text-right max-w-[200px] hidden sm:block">
              <div className="text-sm font-medium truncate">{user.displayName || 'Developer'}</div>
              <div className="text-xs text-text-muted font-mono truncate">{user.email}</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-surface border border-border overflow-hidden flex items-center justify-center flex-shrink-0">
              {user.photoURL ? (
                <img src={user.photoURL} alt="User" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-accent-purple">{user.email?.charAt(0).toUpperCase() || 'D'}</span>
              )}
            </div>
          </div>
          <button onClick={onLogout} className="text-text-muted hover:text-white transition-colors flex-shrink-0" title="Logout">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0 items-start">
        {/* Left Column: Input */}
        <div className="flex flex-col gap-4 h-full">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2 font-mono">
              <FileCode className="w-5 h-5 text-accent-purple" />
              Source Code Input
            </h2>
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="bg-accent-purple/10 border border-accent-purple/40 text-accent-purple hover:bg-accent-purple/20 hover:border-accent-purple text-sm px-4 py-2 rounded-lg flex items-center gap-2 transition-all font-mono font-medium shadow-[0_0_10px_rgba(168,85,247,0.1)] hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]"
            >
              <UploadCloud className="w-4 h-4"/> 
              <span className="hidden sm:inline">Upload File</span>
              <span className="sm:hidden">Upload</span>
            </button>
            {/* Hidden File Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileInput} 
              accept=".txt,.pdf,.py,.js,.env,.json,.yaml,.yml" 
              className="hidden" 
            />
          </div>
          
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex-1 min-h-[400px] lg:min-h-0 bg-surface/50 border rounded-2xl p-4 flex flex-col transition-all shadow-[0_0_30px_rgba(168,85,247,0.05)] relative ${isDragging ? 'border-accent-purple bg-accent-purple/10 scale-[1.02]' : 'border-accent-purple/30'}`}
          >
            {isDragging && (
               <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-surface/80 rounded-2xl z-20 border-2 border-dashed border-accent-purple shadow-[inset_0_0_50px_rgba(168,85,247,0.2)]">
                 <div className="flex flex-col items-center gap-4">
                   <div className="w-16 h-16 rounded-full bg-accent-purple/20 flex items-center justify-center animate-bounce">
                     <UploadCloud className="w-8 h-8 text-accent-purple" />
                   </div>
                   <p className="text-accent-purple font-mono font-bold tracking-widest text-lg">DROP TO SCAN</p>
                 </div>
               </div>
            )}

            {fileMeta && (
              <div className="mb-3 bg-accent-purple/20 border border-accent-purple/30 rounded-lg p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileCode className="w-4 h-4 text-accent-purple flex-shrink-0" />
                  <span className="text-sm font-mono text-white truncate">{fileMeta.name}</span>
                  <span className="text-xs font-mono text-gray-400 flex-shrink-0">({(fileMeta.size / 1024).toFixed(1)} KB)</span>
                </div>
                <button onClick={clearFile} className="text-gray-400 hover:text-white p-1 ml-2 transition-colors">
                   <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <textarea 
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (fileMeta?.isPdf) {
                   setPdfBase64(null);
                   setFileMeta(null);
                }
              }}
              placeholder="// Drag & Drop files here, paste directly, or upload (.txt, .pdf, .py, .js, .env, .json, .yaml)&#10;// Our engine will natively scan for API keys, AWS credentials, JWTs, and private keys."
              className="flex-1 w-full bg-transparent resize-none outline-none font-mono text-sm text-gray-300 placeholder-gray-600 custom-scrollbar"
              spellCheck={false}
              readOnly={fileMeta?.isPdf}
            />
            
            <div className="border-t border-accent-purple/20 pt-4 mt-4 flex items-center justify-between">
              <span className="text-xs text-text-muted font-mono">{fileMeta?.isPdf ? '1 PDF Document' : `${code.length} characters`}</span>
              <button 
                onClick={handleScan}
                disabled={isScanning || (!code.trim() && !pdfBase64)}
                className="bg-accent-purple hover:bg-purple-500 text-white font-bold py-2 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] disabled:opacity-50 disabled:shadow-none flex items-center gap-2 text-sm"
              >
                {isScanning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    SCANNING...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    RUN DLP SCAN
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Output */}
        <div className="flex flex-col gap-4 h-full">
          <h2 className="text-xl font-bold flex items-center gap-2 font-mono">
            <ShieldAlert className="w-5 h-5 text-accent-purple" />
            Sanitized Output
          </h2>
          
          <div className="flex-1 min-h-[400px] lg:min-h-0 bg-surface/50 border border-accent-purple/30 rounded-2xl p-4 flex flex-col shadow-[0_0_30px_rgba(168,85,247,0.05)] relative overflow-hidden">
            <AnimatePresence mode="wait">
              {!result && !isScanning ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center text-text-muted p-8 text-center"
                >
                  <Search className="w-12 h-12 mb-4 opacity-20" />
                  <p className="font-mono text-sm">Awaiting source code to detect credentials, API keys, and sensitive secrets.</p>
                </motion.div>
              ) : isScanning ? (
                <motion.div 
                  key="scanning"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-surface/80 backdrop-blur-sm z-10"
                >
                  <div className="relative mb-6">
                    <div className="absolute inset-0 border-4 border-accent-purple/20 rounded-full" />
                    <div className="w-16 h-16 border-4 border-transparent border-t-accent-purple rounded-full animate-spin" />
                    <ShieldAlert className="w-6 h-6 text-accent-purple absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <p className="font-mono text-accent-purple font-bold tracking-widest text-sm animate-pulse">ANALYZING AST...</p>
                </motion.div>
              ) : (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col h-full gap-4"
                >
                  <div className={`p-3 rounded-xl border flex items-start gap-3 flex-shrink-0 ${result?.threats && result.threats > 0 ? 'bg-orange-500/10 border-orange-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
                    {result?.threats && result.threats > 0 ? (
                      <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <h4 className={`text-sm font-bold ${result?.threats && result.threats > 0 ? 'text-orange-400' : 'text-green-400'}`}>Threat Summary</h4>
                      <p className="text-sm font-mono text-gray-300 mt-1">{result?.summary}</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-auto custom-scrollbar relative bg-black/40 rounded-xl p-4 border border-border">
                    <pre className="text-sm font-mono whitespace-pre-wrap break-all text-gray-300">
                      {result?.sanitized.split(/(\[REDACTED\])/g).map((part, i) => 
                        part === '[REDACTED]' ? (
                          <span key={i} className="text-red-400 bg-red-400/10 border border-red-400/20 px-1 py-0.5 rounded font-bold">{part}</span>
                        ) : (
                          part
                        )
                      )}
                    </pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
