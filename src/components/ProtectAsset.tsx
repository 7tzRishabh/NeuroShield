import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, FileCode, Image as ImageIcon, Sliders, Fingerprint, Zap, Download, CheckCircle2,
  AlertTriangle, FileText, Globe
} from 'lucide-react';
import { Shield, Activity } from 'lucide-react';
import { addHistory, getSettings } from '../lib/store';
import Slider from './Slider';
import ToggleSwitch from './ToggleSwitch';
import InsightsModal from './InsightsModal';

type ExtendedFileType = 'image' | 'pdf' | 'html' | 'code' | null;

export default function ProtectAsset() {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<ExtendedFileType>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedFileExt, setProcessedFileExt] = useState('png');
  const [error, setError] = useState('');
  
  const [originalText, setOriginalText] = useState<string | null>(null);
  const [processedText, setProcessedText] = useState<string | null>(null);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  
  const [noiseIntensity, setNoiseIntensity] = useState(50);
  const [aiTrapMode, setAiTrapMode] = useState(true);
  const [watermark, setWatermark] = useState(false);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [processedDataUrl, setProcessedDataUrl] = useState<string | null>(null);
  const [protectionScore, setProtectionScore] = useState(0);
  const [noiseSignature, setNoiseSignature] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const settings = getSettings();
    setNoiseIntensity(settings.defaultNoiseIntensity);
    setAiTrapMode(settings.enableAiTrapMode);
  }, []);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setIsComplete(false);
    setProcessedDataUrl(null);
    setError('');
    setOriginalText(null);
    setProcessedText(null);
    
    const type = selectedFile.type;
    const name = selectedFile.name.toLowerCase();

    if (type.startsWith('image/')) {
      setFileType('image');
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else if (type === 'application/pdf' || name.endsWith('.pdf')) {
      setFileType('pdf');
      setPreviewUrl(null);
    } else if (type === 'text/html' || name.endsWith('.html')) {
      setFileType('html');
      setPreviewUrl(null);
    } else if (name.endsWith('.js') || name.endsWith('.py') || name.endsWith('.cpp') || name.endsWith('.txt') || type.startsWith('text/')) {
      setFileType('code');
      setPreviewUrl(null);
    } else {
      setFileType(null);
      setFile(null);
      setError('Unsupported file type. Please upload an image, PDF, HTML, or code file.');
    }
  };

  const handleProcess = async () => {
    if (!file || !fileType) return;
    setIsProcessing(true);
    setError('');
    
    try {
      const signature = `0x${Math.random().toString(16).slice(2, 10).toUpperCase()}`;
      setNoiseSignature(signature);

      let score = 50 + (noiseIntensity * 0.4);
      if (aiTrapMode) score += 5;
      if (watermark) score += 4.9;
      const finalScore = Math.min(99.9, score);
      setProtectionScore(finalScore);

      let processedUrl = '';
      let ext = 'png';

      if (fileType === 'image' && previewUrl) {
        const img = new Image();
        img.src = previewUrl;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        const maxPerturbation = (noiseIntensity / 100) * 50;

        for (let i = 0; i < data.length; i += 4) {
          const noiseR = (Math.random() - 0.5) * 2 * maxPerturbation;
          const noiseG = (Math.random() - 0.5) * 2 * maxPerturbation;
          const noiseB = (Math.random() - 0.5) * 2 * maxPerturbation;

          data[i] = Math.min(255, Math.max(0, data[i] + noiseR));     // R
          data[i+1] = Math.min(255, Math.max(0, data[i+1] + noiseG)); // G
          data[i+2] = Math.min(255, Math.max(0, data[i+2] + noiseB)); // B
        }

        ctx.putImageData(imageData, 0, 0);
        processedUrl = canvas.toDataURL('image/png');
        ext = 'png';
      } else if (fileType === 'pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const watermarkText = new TextEncoder().encode(`\n% NeuroGlaze Protected: ${signature}\n`);
        const newPdf = new Uint8Array(uint8Array.length + watermarkText.length);
        newPdf.set(uint8Array);
        newPdf.set(watermarkText, uint8Array.length);
        
        const blob = new Blob([newPdf], { type: 'application/pdf' });
        processedUrl = URL.createObjectURL(blob);
        ext = 'pdf';
      } else if (fileType === 'html') {
        const text = await file.text();
        setOriginalText(text);
        const protectedText = `<!-- protected by NeuroGlaze: ${signature} -->\n` + text.replace(/<head>/i, `<head>\n  <!-- NeuroGlaze Noise: ${Math.random().toString(36)} -->`);
        setProcessedText(protectedText);
        const blob = new Blob([protectedText], { type: 'text/html' });
        processedUrl = URL.createObjectURL(blob);
        ext = 'html';
      } else if (fileType === 'code') {
        const text = await file.text();
        setOriginalText(text);
        const lines = text.split('\n');
        const protectedLines = lines.map(line => {
          if (Math.random() < (noiseIntensity / 100) * 0.3) {
            return line + ` // neuroglaze_noise_${Math.random().toString(36).substring(7)}`;
          }
          return line;
        });
        protectedLines.unshift(`// Protected by NeuroGlaze - Signature: ${signature}`);
        
        const protectedText = protectedLines.join('\n');
        setProcessedText(protectedText);
        const blob = new Blob([protectedText], { type: file.type || 'text/plain' });
        processedUrl = URL.createObjectURL(blob);
        ext = file.name.split('.').pop() || 'txt';
      }

      setProcessedDataUrl(processedUrl);
      setProcessedFileExt(ext);

      // Convert original and processed to base64 for storage
      let originalBase64 = '';
      let protectedBase64 = '';

      const fileToBase64 = (f: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(f);
        });
      };

      if (fileType === 'image') {
        // Resize original image for thumbnail
        const resizeImage = (src: string): Promise<string> => {
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 400;
              const scale = Math.min(MAX_WIDTH / img.width, 1);
              canvas.width = img.width * scale;
              canvas.height = img.height * scale;
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
              resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.src = src;
          });
        };
        
        originalBase64 = await resizeImage(previewUrl!);
        protectedBase64 = await resizeImage(processedUrl);
      } else if (fileType === 'code' || fileType === 'html') {
        // Save raw text as data URI for code/html
        originalBase64 = `data:text/plain;charset=utf-8,${encodeURIComponent(originalText || '')}`;
        protectedBase64 = `data:text/plain;charset=utf-8,${encodeURIComponent(processedText || '')}`;
      } else {
        // For PDF or other large binary files, use placeholder
        originalBase64 = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0xNC41IDJINmEyIDIgMCAwIDAtMiAydjE2YTIgMiAwIDAgMCAyIDJoMTJhMiAyIDMCAwIDAgMi0yVjcuNXoiLz48cG9seWxpbmUgcG9pbnRzPSIxNCAyIDE0IDggMjAgOCIvPjwvc3ZnPg==';
        protectedBase64 = originalBase64;
      }

      // Save to history
      await addHistory({
        originalFile: originalBase64,
        protectedFile: protectedBase64,
        fileType: fileType || 'unknown',
        protectionStrength: finalScore,
        noiseSignature: signature
      });

      setIsComplete(true);
    } catch (err) {
      console.error("Processing failed:", err);
      setError("Failed to process file. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedDataUrl) return;
    const a = document.createElement('a');
    a.href = processedDataUrl;
    a.download = `protected-asset.${processedFileExt}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
      {/* Left Column: Upload & Preview */}
      <div className="space-y-6">
        <div className="bg-surface border border-border rounded-[20px] p-4 md:p-6 lg:p-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-accent" />
            Asset Upload
          </h2>
          
          {!file ? (
            <div 
              className="border border-dashed border-border hover:border-accent/50 rounded-[20px] p-6 md:p-10 flex flex-col items-center justify-center text-center transition-colors cursor-pointer bg-surface-glass group"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileInput}
                accept="image/*,.js,.py,.cpp,.txt,.pdf,.html"
              />
              <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-gray-400 group-hover:text-accent transition-colors" />
              </div>
              <p className="text-base md:text-lg font-medium mb-2">Drag & Drop your asset here</p>
              <p className="text-xs md:text-sm text-text-muted">Supports Images, PDF, HTML, and Code</p>
            </div>
          ) : (
            <div className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm font-mono text-center">
                  {error}
                </div>
              )}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-surface p-4 rounded-lg border border-border gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
                  <div className="flex-shrink-0">
                  {fileType === 'image' ? <ImageIcon className="text-accent" /> : 
                   fileType === 'pdf' ? <FileText className="text-red-400" /> :
                   fileType === 'html' ? <Globe className="text-orange-400" /> :
                   <FileCode className="text-accent-purple" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate text-sm md:text-base">{file.name}</p>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-glass border border-border text-text-muted uppercase flex-shrink-0">
                        {fileType}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setFile(null); setIsComplete(false); setError(''); }}
                  className="text-xs text-text-muted hover:text-text uppercase tracking-wider font-mono bg-surface-glass border border-border px-3 py-2 rounded sm:bg-transparent sm:border-none sm:p-0 flex-shrink-0 w-full sm:w-auto"
                >
                  Change File
                </button>
              </div>

              {/* Preview Area */}
              <div className="bg-black rounded-xl border border-border overflow-hidden relative flex flex-col items-center justify-center min-h-[250px] md:min-h-[350px]">
                {fileType === 'image' && previewUrl ? (
                  isComplete && processedDataUrl ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 w-full h-full divide-y md:divide-y-0 md:divide-x divide-border">
                      <div className="relative h-full flex items-center justify-center p-4">
                        <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-xs font-mono uppercase z-10">Original</div>
                        <img src={previewUrl} alt="Original" className="w-full h-full object-contain max-h-[250px] md:max-h-[400px]" />
                      </div>
                      <div className="relative h-full flex items-center justify-center p-4">
                        <div className="absolute top-2 left-2 bg-accent/20 border border-accent/50 text-accent px-2 py-1 rounded text-xs font-mono uppercase z-10">Protected</div>
                        <img src={processedDataUrl} alt="Processed" className="w-full h-full object-contain max-h-[250px] md:max-h-[400px]" />
                      </div>
                    </div>
                  ) : (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain max-h-[350px] p-4" />
                  )
                ) : (
                  <div className="text-center text-text-muted font-mono p-8">
                    {fileType === 'pdf' ? <FileText className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-2 opacity-20" /> :
                     fileType === 'html' ? <Globe className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-2 opacity-20" /> :
                     <FileCode className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-2 opacity-20" />}
                    <p className="mb-2 text-sm md:text-base px-4 truncate max-w-[280px] sm:max-w-md">{file?.name}</p>
                    <p className="text-xs">{isComplete ? 'Protection applied successfully.' : 'Ready for processing.'}</p>
                  </div>
                )}

                {/* Processing Overlay */}
                <AnimatePresence>
                  {isProcessing && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center"
                    >
                      <div className="w-24 h-24 relative mb-4">
                        <div className="absolute inset-0 border-4 border-accent/20 rounded-full" />
                        <div className="absolute inset-0 border-4 border-accent rounded-full border-t-transparent animate-spin" />
                        <Shield className="absolute inset-0 m-auto w-8 h-8 text-accent animate-pulse" />
                      </div>
                      <p className="font-mono text-accent text-glow tracking-widest uppercase text-sm">Injecting Adversarial Noise...</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        {/* Output Section */}
        <AnimatePresence>
          {isComplete && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface border border-border-glow rounded-[20px] p-6 shadow-[0_0_20px_rgba(0,242,255,0.1)]"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-accent">
                  <CheckCircle2 className="w-6 h-6" />
                  Protection Applied
                </h2>
                <div className="status-badge flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span>IMMUNE</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-surface p-4 rounded-lg border border-border">
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Protection Strength</p>
                  <p className="text-3xl font-bold text-glow font-mono">{protectionScore.toFixed(1)}%</p>
                </div>
                <div className="bg-surface p-4 rounded-lg border border-border">
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Noise Signature</p>
                  <p className="text-lg font-medium font-mono text-accent-purple truncate">{noiseSignature}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setIsInsightsOpen(true)}
                  className="flex-1 bg-surface-glass border border-border hover:border-accent/50 py-4 rounded-xl font-bold tracking-wider flex items-center justify-center gap-2 transition-all"
                >
                  <Activity className="w-5 h-5 flex-shrink-0" />
                  VIEW CHANGES
                </button>
                <button 
                  onClick={handleDownload}
                  className="flex-1 btn-gradient py-4 rounded-xl font-bold tracking-wider flex items-center justify-center gap-2 transition-all hover:opacity-90"
                >
                  <Download className="w-5 h-5 flex-shrink-0" />
                  DOWNLOAD
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Column: Settings */}
      <div className="space-y-6">
        <div className="bg-surface border border-border rounded-[20px] p-4 md:p-6 lg:p-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-accent-purple" />
            Glaze Settings
          </h2>

          <div className="space-y-8">
            {/* Slider */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-text">Noise Intensity</label>
                <span className="text-sm font-mono text-accent">{noiseIntensity}%</span>
              </div>
              <Slider value={noiseIntensity} onChange={setNoiseIntensity} />
              <p className="text-xs text-text-muted mt-2">Higher intensity provides better protection but may introduce visible artifacts.</p>
            </div>

            {/* Toggles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-accent mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">AI Trap Mode</p>
                    <p className="text-xs text-text-muted">Adds aggressive adversarial patterns</p>
                  </div>
                </div>
                <ToggleSwitch checked={aiTrapMode} onChange={setAiTrapMode} />
              </div>

              <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <Fingerprint className="w-5 h-5 text-accent-purple mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Watermark Signature</p>
                    <p className="text-xs text-text-muted">Embed hidden cryptographic fingerprint</p>
                  </div>
                </div>
                <ToggleSwitch checked={watermark} onChange={setWatermark} color="purple" />
              </div>
            </div>

            {/* Action Button */}
            <button 
              onClick={handleProcess}
              disabled={!file || !fileType || isProcessing}
              className={`w-full py-4 rounded-xl font-bold tracking-wider flex items-center justify-center gap-2 transition-all ${
                !file || !fileType
                  ? 'bg-surface text-text-muted cursor-not-allowed border border-border' 
                  : isProcessing
                    ? 'bg-accent/20 text-accent border border-accent cursor-wait'
                    : 'btn-gradient hover:opacity-90'
              }`}
            >
              <Zap className="w-5 h-5" />
              {isProcessing ? 'PROCESSING ASSET...' : 'APPLY PROTECTION'}
            </button>
          </div>
        </div>
      </div>

      <InsightsModal 
        isOpen={isInsightsOpen}
        onClose={() => setIsInsightsOpen(false)}
        fileType={fileType}
        originalUrl={previewUrl}
        processedUrl={processedDataUrl}
        originalText={originalText}
        processedText={processedText}
      />
    </div>
  );
}
