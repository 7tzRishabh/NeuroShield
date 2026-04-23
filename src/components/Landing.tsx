import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Lock, Fingerprint, Cpu, ArrowRight, Github, Mail, ShieldAlert, FileText, CheckCircle, Search, Eye, EyeOff } from 'lucide-react';
import Particles from './Particles';
import { 
  loginWithGoogle, 
  loginWithGithub, 
  auth 
} from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';

export default function Landing() {
  const [product, setProduct] = useState<'neuroglaze' | 'codeshield'>('neuroglaze');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      localStorage.setItem('activeProduct', product);
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      // Intentionally suppressing console.error here as expected user-errors 
      // (like invalid password) are fully handled via UI state below.
      let message = err.message.replace('Firebase: ', '').replace(/\(auth.*\)\.?/, '').trim();
      
      if (err.code === 'auth/network-request-failed') {
        message = 'Connectivity issue. If using an Ad Blocker (like Brave Shields), try disabling it. If in an iframe preview, try clicking "Open App in New Tab".';
      } else if (err.code === 'auth/operation-not-allowed') {
        message = 'Email/Password login is not enabled in the Firebase Console yet. Please use Google/GitHub or enable it manually.';
      } else if (err.code === 'auth/invalid-credential') {
        message = 'Invalid email or password. Please check your credentials and try again.';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'This email is already registered. Please switch to login instead.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password is too weak. Please use at least 6 characters.';
      }
      
      setError(message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderLogin = async (provider: 'google' | 'github') => {
    setError('');
    setLoading(true);
    try {
      localStorage.setItem('activeProduct', product);
      if (provider === 'google') {
        await loginWithGoogle();
      } else {
        await loginWithGithub();
      }
    } catch (err: any) {
      console.error(`${provider} login error:`, err);
      let message = err.message.replace('Firebase: ', '').replace(/\(auth.*\)\.?/, '').trim();
      
      if (err.code === 'auth/network-request-failed') {
        message = 'Connectivity issue. If using an Ad Blocker (like Brave Shields), try disabling it. If in an iframe preview, try clicking "Open App in New Tab".';
      } else if (err.code === 'auth/popup-closed-by-user') {
        message = 'Popup was closed before completing authentication.';
      } else if (err.code === 'auth/popup-blocked') {
        message = 'Popup blocked by browser. Please allow popups for this site or try opening the app in a new tab.';
      }
      
      setError(message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-bg text-white overflow-y-auto overflow-x-hidden relative items-start pt-16 md:pt-6 lg:pt-16 md:max-w-6xl lg:max-w-none md:mx-auto md:justify-between w-full">
      {/* Global Error Alert */}
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md px-4 py-2 rounded-md bg-red-500/10 border border-red-500/50 text-red-400 text-sm font-mono text-center">
          {error}
        </div>
      )}

      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 md:opacity-20 lg:opacity-30 pointer-events-none" />
      <div className="absolute inset-0 bg-radial-glow opacity-50 lg:opacity-100 pointer-events-none" />
      <Particles />

      {/* LEFT SIDE (Info Panel) */}
      <div className="w-full md:w-1/2 p-6 md:p-8 lg:p-10 flex flex-col justify-start relative z-10 md:items-start text-center md:text-left min-h-screen md:min-h-0">
        
        <div className="w-full max-w-md mx-auto md:mx-0 lg:max-w-xl lg:pl-16 xl:pl-28 flex flex-col gap-6 lg:gap-8 px-4 md:px-0">
          {/* Product Selector */}
          <div className="flex justify-center items-center gap-3 mx-auto md:mx-0 w-full md:justify-start">
            <button 
              onClick={() => { setProduct('neuroglaze'); setError(''); setIsSignUp(false); }} 
              className={`px-4 py-3 min-w-[140px] text-center justify-center rounded-xl font-bold transition-all text-sm md:text-base flex items-center gap-2 ${
                product === 'neuroglaze' 
                  ? 'bg-accent/20 border-accent/50 text-accent border shadow-[0_0_15px_rgba(0,242,255,0.2)]' 
                  : 'bg-surface border-border text-text-muted border hover:text-white hover:border-text-muted/50'
              }`}
            >
              <Shield className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" /> NeuroGlaze
            </button>
            <button 
              onClick={() => { setProduct('codeshield'); setError(''); setIsSignUp(false); }} 
              className={`px-4 py-3 min-w-[140px] text-center justify-center rounded-xl font-bold transition-all text-sm md:text-base flex items-center gap-2 ${
                product === 'codeshield' 
                  ? 'bg-accent-purple/20 border-accent-purple/50 text-accent-purple border shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                  : 'bg-surface border-border text-text-muted border hover:text-white hover:border-text-muted/50'
              }`}
            >
              <ShieldAlert className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" /> CodeShield
            </button>
          </div>

          <div className="w-full relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {product === 'neuroglaze' ? (
              <motion.div
                key="neuroglaze"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-start"
              >
                <div className="w-full flex justify-center items-center md:justify-start gap-3 mb-6 lg:mb-8">
                  <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center border border-accent/50 flex-shrink-0">
                    <Shield className="text-accent w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-wider uppercase text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] p-0 m-0">NeuroGlaze</h2>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 tracking-tight text-center md:text-left w-full">
                  Protect Your Data from <br className="hidden lg:block" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">AI Exploitation</span>
                </h1>
                
                <p className="text-base md:text-lg text-text-muted mb-8 lg:mb-10 max-w-xl leading-relaxed text-center md:text-left w-full">
                  Add invisible adversarial noise to your images and code to prevent unauthorized AI training. Secure your digital assets before they become training data.
                </p>

                <div className="flex flex-col gap-4 lg:gap-6 items-start w-full">
                  {[
                    { icon: Shield, text: "AI Poisoning Protection" },
                    { icon: Fingerprint, text: "Invisible Noise Injection" },
                    { icon: Lock, text: "Code & Image Support" },
                    { icon: Cpu, text: "Real-time Processing" }
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full flex-shrink-0 bg-surface border border-border flex items-center justify-center">
                        <feature.icon className="w-4 h-4 text-accent" />
                      </div>
                      <span className="text-text font-medium text-sm md:text-base text-left">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="codeshield"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-start"
              >
                <div className="w-full flex justify-center items-center md:justify-start gap-3 mb-6 lg:mb-8">
                  <div className="w-10 h-10 rounded-lg bg-accent-purple/20 flex items-center justify-center border border-accent-purple/50 flex-shrink-0">
                    <ShieldAlert className="text-accent-purple w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-wider uppercase text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.5)] p-0 m-0">CodeShield</h2>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 tracking-tight text-center md:text-left w-full">
                  Data Loss Prevention <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 drop-shadow-[0_0_10px_rgba(192,132,252,0.3)]">Engine</span>
                </h1>
                
                <p className="text-base md:text-lg text-text-muted mb-8 lg:mb-10 max-w-xl leading-relaxed text-center md:text-left w-full">
                  Detect and redact sensitive secrets, API keys, and credentials from your codebase before pushing to production.
                </p>

                <div className="flex flex-col gap-4 lg:gap-6 items-start w-full">
                  {[
                    { icon: Search, text: "Scan code for sensitive data and secrets" },
                    { icon: Lock, text: "Detect API keys and credentials" },
                    { icon: ShieldAlert, text: "Show threat summary after scan" },
                    { icon: CheckCircle, text: "Automatically sanitize output with [REDACTED]" }
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full flex-shrink-0 bg-surface border border-border flex items-center justify-center">
                        <feature.icon className="w-4 h-4 text-accent-purple" />
                      </div>
                      <span className="text-text font-medium text-sm md:text-base text-left">
                        {feature.text.includes("[REDACTED]") ? (
                          <>Automatically sanitize output with <span className="font-mono text-red-400 bg-red-400/10 px-1 py-0.5 rounded text-xs ml-1">[REDACTED]</span></>
                        ) : (
                           feature.text
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE (Login Panel with Flip) */}
      <div className="w-full md:w-1/2 p-6 md:p-8 lg:p-16 flex items-start justify-center md:justify-end lg:justify-center relative z-10 pb-16 md:mt-0" style={{ perspective: '1200px' }}>
        <motion.div 
          animate={{ rotateY: product === 'codeshield' ? 180 : 0 }}
          transition={{ duration: 0.7, type: 'tween', ease: [0.4, 0.0, 0.2, 1] }}
          className="w-full max-w-[400px] md:max-w-[450px] grid relative items-start min-h-[500px]"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* ======================================================== */}
          {/*                    FRONT: NEUROGLAZE                    */}
          {/* ======================================================== */}
          <div className="[grid-area:1/1] relative w-full bg-surface border border-border rounded-[20px] p-8 shadow-2xl flex flex-col justify-start" style={{ backfaceVisibility: 'hidden' }}>
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-accent/50 rounded-tl-2xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-accent-purple/50 rounded-br-2xl pointer-events-none" />

            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center border border-accent/50 mx-auto mb-4">
                <Shield className="text-accent w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-2">{isSignUp ? 'Create Identity' : 'Access Terminal'}</h3>
              <p className="text-sm text-text-muted font-mono">
                {isSignUp ? 'Register to secure your assets' : 'Authenticate to secure your assets'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-mono text-accent uppercase tracking-wider pl-1">Email</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface/50 border border-border rounded-xl px-4 py-4 text-white placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-mono text-sm md:text-base"
                  placeholder="you@example.com"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-mono text-accent uppercase tracking-wider pl-1">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-surface/50 border border-border rounded-xl px-4 py-4 pr-10 text-white placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-mono text-sm md:text-base"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 shadow-[0_0_20px_rgba(6,182,212,0.3)] py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group mt-6 md:mt-8 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isSignUp ? 'INITIALIZE REGISTRATION' : 'INITIALIZE LOGIN'}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 flex justify-center text-sm">
              <button 
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                className={`text-accent hover:text-white transition-colors font-medium w-full text-center flex justify-center`}
              >
                {isSignUp ? 'Already have an account? Login' : 'Create Account'}
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-border space-y-4">
              <button 
                type="button"
                onClick={() => handleProviderLogin('google')}
                disabled={loading}
                className="w-full bg-surface border border-border py-4 rounded-xl hover:bg-surface-glass transition-all flex items-center justify-center gap-3 text-sm md:text-base font-medium disabled:opacity-50"
              >
                <Mail className="w-5 h-5" />
                Authenticate via Google
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/*                   BACK: CODESHIELD                      */}
          {/* ======================================================== */}
          <div 
            className="[grid-area:1/1] relative w-full bg-surface border border-accent-purple/30 rounded-[20px] p-8 shadow-[0_0_40px_rgba(168,85,247,0.15)] flex flex-col justify-start" 
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-accent-purple/50 rounded-tr-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-accent/50 rounded-bl-2xl pointer-events-none" />

            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-accent-purple/20 flex items-center justify-center border border-accent-purple/50 mx-auto mb-4">
                <ShieldAlert className="text-accent-purple w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-2">{isSignUp ? 'Create Shield Account' : 'CodeShield Security'}</h3>
              <p className="text-sm text-text-muted font-mono">
                {isSignUp ? 'Register for DLP access' : 'Authenticate to access DLP tools'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-mono text-accent-purple uppercase tracking-wider pl-1">Email</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface/50 border border-border rounded-xl px-4 py-4 text-white placeholder-text-muted focus:outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple transition-all font-mono text-sm md:text-base"
                  placeholder="you@example.com"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-mono text-accent-purple uppercase tracking-wider pl-1">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-surface/50 border border-border rounded-xl px-4 py-4 pr-10 text-white placeholder-text-muted focus:outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple transition-all font-mono text-sm md:text-base"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 shadow-[0_0_20px_rgba(168,85,247,0.3)] py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group mt-6 md:mt-8 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base text-white"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isSignUp ? 'INITIALIZE REGISTRATION' : 'Login to CodeShield'}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-6 flex justify-center text-sm">
              <button 
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                className={`text-accent-purple hover:text-white transition-colors font-medium w-full text-center flex justify-center`}
              >
                {isSignUp ? 'Already have an account? Login' : 'Create Account'}
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-border space-y-4">
              <button 
                type="button"
                onClick={() => handleProviderLogin('google')}
                disabled={loading}
                className="w-full bg-surface border border-accent-purple/30 py-4 rounded-xl hover:bg-accent-purple/10 transition-all flex items-center justify-center gap-3 text-sm md:text-base font-medium disabled:opacity-50 text-purple-200"
              >
                <Mail className="w-5 h-5" />
                Authenticate via Google
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
