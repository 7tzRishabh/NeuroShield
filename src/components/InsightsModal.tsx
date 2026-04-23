import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Activity, FileText } from 'lucide-react';

interface InsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileType: 'image' | 'pdf' | 'html' | 'code' | null;
  originalUrl: string | null;
  processedUrl: string | null;
  originalText: string | null;
  processedText: string | null;
}

export default function InsightsModal({ isOpen, onClose, fileType, originalUrl, processedUrl, originalText, processedText }: InsightsModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGeneratingHeatmap, setIsGeneratingHeatmap] = useState(false);

  useEffect(() => {
    if (isOpen && fileType === 'image' && originalUrl && processedUrl && canvasRef.current) {
      setIsGeneratingHeatmap(true);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img1 = new Image();
      const img2 = new Image();
      
      img1.src = originalUrl;
      img2.src = processedUrl;

      Promise.all([
        new Promise(r => img1.onload = r),
        new Promise(r => img2.onload = r)
      ]).then(() => {
        canvas.width = img1.width;
        canvas.height = img1.height;
        
        // Draw original
        ctx.drawImage(img1, 0, 0);
        const data1 = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        
        // Draw processed
        ctx.drawImage(img2, 0, 0);
        const data2 = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        
        const diffImageData = ctx.createImageData(canvas.width, canvas.height);
        const diffData = diffImageData.data;

        for (let i = 0; i < data1.length; i += 4) {
          const diffR = Math.abs(data1[i] - data2[i]);
          const diffG = Math.abs(data1[i+1] - data2[i+1]);
          const diffB = Math.abs(data1[i+2] - data2[i+2]);
          
          const intensity = diffR + diffG + diffB;
          if (intensity > 0) {
            diffData[i] = 255; // R
            diffData[i+1] = 0; // G
            diffData[i+2] = 0; // B
            diffData[i+3] = 255; // A
          } else {
            // Make original image grayscale and faint in the background
            const gray = (data1[i] + data1[i+1] + data1[i+2]) / 3;
            diffData[i] = gray;
            diffData[i+1] = gray;
            diffData[i+2] = gray;
            diffData[i+3] = 50; // faint alpha
          }
        }
        
        ctx.putImageData(diffImageData, 0, 0);
        setIsGeneratingHeatmap(false);
      });
    }
  }, [isOpen, fileType, originalUrl, processedUrl]);

  const renderTextDiff = () => {
    if (!originalText || !processedText) return null;
    const origLines = originalText.split('\n');
    const procLines = processedText.split('\n');
    
    const result = [];
    let o = 0;
    for (let p = 0; p < procLines.length; p++) {
      if (o < origLines.length && procLines[p] === origLines[o]) {
        result.push({ type: 'unchanged', text: procLines[p] });
        o++;
      } else {
        if (procLines[p].includes('NeuroGlaze') || procLines[p].includes('neuroglaze_noise')) {
          if (o < origLines.length && procLines[p].startsWith(origLines[o])) {
             result.push({ type: 'modified', text: procLines[p] });
             o++;
          } else {
             result.push({ type: 'added', text: procLines[p] });
          }
        } else {
          result.push({ type: 'unchanged', text: procLines[p] });
          o++;
        }
      }
    }
    
    return (
      <div className="font-mono text-xs whitespace-pre overflow-x-auto p-4 bg-black rounded-lg border border-border max-h-[60vh]">
        {result.map((line, idx) => (
          <div key={idx} className={`px-2 py-0.5 flex ${line.type === 'added' ? 'bg-green-500/20 text-green-400' : line.type === 'modified' ? 'bg-red-500/20 text-red-400' : 'text-text-muted'}`}>
            <span className="inline-block w-8 opacity-50 select-none shrink-0">{idx + 1}</span>
            <span className="break-all">{line.text}</span>
          </div>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-surface border border-border-glow rounded-[20px] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-[0_0_30px_rgba(0,242,255,0.15)]"
        >
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
              <Activity className="w-6 h-6 text-accent" />
              Protection Insights
            </h2>
            <button onClick={onClose} className="text-text-muted hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1">
            {fileType === 'image' && (
              <div className="space-y-4">
                <p className="text-sm text-text-muted">Heatmap showing injected adversarial noise pixels (Red).</p>
                <div className="bg-black rounded-xl border border-border overflow-hidden relative flex items-center justify-center min-h-[300px]">
                  {isGeneratingHeatmap && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  <canvas ref={canvasRef} className="max-w-full max-h-[60vh] object-contain" />
                </div>
              </div>
            )}

            {(fileType === 'code' || fileType === 'html') && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm font-mono mb-2">
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500/50 border border-green-500" /> Added</div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500/50 border border-red-500" /> Modified</div>
                </div>
                {renderTextDiff()}
              </div>
            )}

            {fileType === 'pdf' && (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <FileText className="w-16 h-16 text-accent opacity-50" />
                <h3 className="text-lg font-bold text-white">PDF Protection Summary</h3>
                <ul className="text-sm text-text-muted space-y-2 text-left bg-black p-6 rounded-lg border border-border">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Invisible watermark signature added to document stream
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Metadata modified to include NeuroGlaze tracking ID
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent" />
                    Document structure preserved
                  </li>
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
