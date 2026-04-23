import React from 'react';
import { Download, History as HistoryIcon, ShieldAlert, Loader2, FileCode, FileText, Globe, Image as ImageIcon } from 'lucide-react';
import { useHistory } from '../lib/store';

export default function History() {
  const { history, loading } = useHistory();

  const handleDownload = (dataUrl: string, fileType: string) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    const ext = fileType === 'image' ? 'png' : fileType === 'pdf' ? 'pdf' : fileType === 'html' ? 'html' : 'txt';
    a.download = `protected-asset.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-text-muted">
        <Loader2 className="w-12 h-12 mb-4 animate-spin text-accent" />
        <p>Loading history...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-text-muted">
        <HistoryIcon className="w-16 h-16 mb-4 opacity-20" />
        <h2 className="text-xl font-bold text-white mb-2">No History Found</h2>
        <p>You haven't protected any assets yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
        <HistoryIcon className="w-5 h-5 md:w-6 md:h-6 text-accent" />
        Protection History
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {history.map((item) => (
          <div key={item.id} className="bg-surface border border-border rounded-[20px] overflow-hidden flex flex-col">
            <div className="grid grid-cols-2 h-40 divide-x divide-border bg-black">
              <div className="relative p-2 flex items-center justify-center">
                <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-[10px] font-mono uppercase z-10">Original</div>
                {item.fileType === 'image' ? (
                  <img src={item.originalFile} alt="Original" className="w-full h-full object-contain" />
                ) : (
                  <div className="flex flex-col items-center justify-center opacity-50">
                    {item.fileType === 'pdf' ? <FileText className="w-10 h-10 mb-2" /> :
                     item.fileType === 'html' ? <Globe className="w-10 h-10 mb-2" /> :
                     <FileCode className="w-10 h-10 mb-2" />}
                    <span className="text-xs font-mono uppercase">{item.fileType}</span>
                  </div>
                )}
              </div>
              <div className="relative p-2 flex items-center justify-center">
                <div className="absolute top-2 left-2 bg-accent/20 border border-accent/50 text-accent px-2 py-1 rounded text-[10px] font-mono uppercase z-10">Protected</div>
                {item.fileType === 'image' ? (
                  <img src={item.protectedFile} alt="Protected" className="w-full h-full object-contain" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-accent opacity-80">
                    {item.fileType === 'pdf' ? <FileText className="w-10 h-10 mb-2" /> :
                     item.fileType === 'html' ? <Globe className="w-10 h-10 mb-2" /> :
                     <FileCode className="w-10 h-10 mb-2" />}
                    <span className="text-xs font-mono uppercase">PROTECTED</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-accent" />
                  <span className="font-mono text-sm font-bold text-glow">{item.protectionStrength?.toFixed(1)}%</span>
                </div>
                <span className="text-xs text-text-muted font-mono">
                  {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString()}
                </span>
              </div>
              
              <div className="mb-4">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Signature</p>
                <p className="text-xs font-mono text-accent-purple truncate">{item.noiseSignature}</p>
              </div>

              <div className="mt-auto">
                <button 
                  onClick={() => handleDownload(item.protectedFile, item.fileType)}
                  className="w-full bg-surface-glass border border-border hover:border-accent/50 py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Again
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
