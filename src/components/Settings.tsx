import React, { useState, useEffect } from 'react';
import { Sliders, AlertTriangle, Save, CheckCircle2, User, Mail, Lock, LogOut, Trash2, X, Loader2 } from 'lucide-react';
import { getSettings, saveSettings, SettingsConfig } from '../lib/store';
import Slider from './Slider';
import ToggleSwitch from './ToggleSwitch';
import { auth, logout } from '../lib/firebase';
import { 
  updateProfile, 
  verifyBeforeUpdateEmail, 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider 
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export default function Settings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<SettingsConfig>({
    defaultNoiseIntensity: 50,
    enableAiTrapMode: true,
  });
  const [saved, setSaved] = useState(false);

  const [user, setUser] = useState(auth.currentUser);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [showReauth, setShowReauth] = useState(false);
  const [reauthPassword, setReauthPassword] = useState('');
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null);

  useEffect(() => {
    setSettings(getSettings());
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      if (u) {
        setDisplayName(u.displayName || '');
        setEmail(u.email || '');
      }
    });
    return () => unsubscribe();
  }, []);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSaveSettings = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReauth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;
    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, reauthPassword);
      await reauthenticateWithCredential(user, credential);
      setShowReauth(false);
      setReauthPassword('');
      if (pendingAction) {
        await pendingAction();
        setPendingAction(null);
      }
    } catch (error: any) {
      showMessage(error.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const executeWithReauth = async (action: () => Promise<void>) => {
    setLoading(true);
    try {
      await action();
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        setPendingAction(() => action);
        setShowReauth(true);
      } else {
        showMessage(error.message || 'An error occurred', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    await executeWithReauth(async () => {
      await updateProfile(user, { displayName });
      showMessage('Profile updated successfully', 'success');
    });
  };

  const handleUpdateEmail = async () => {
    if (!user || email === user.email || !email) return;
    
    // basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showMessage('Please enter a valid email address', 'error');
      return;
    }

    setEmailLoading(true);
    try {
      await verifyBeforeUpdateEmail(user, email);
      showMessage('Verification email sent. Please verify before update.', 'success');
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        showMessage('Please re-login to update email', 'error');
      } else if (error.code === 'auth/invalid-email') {
        showMessage('Invalid email format', 'error');
      } else if (error.code === 'auth/email-already-in-use') {
        showMessage('Email already in use', 'error');
      } else {
        showMessage(error.message || 'An error occurred', 'error');
      }
    } finally {
      setEmailLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user || !newPassword) return;
    await executeWithReauth(async () => {
      await updatePassword(user, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      showMessage('Password changed successfully', 'success');
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error: any) {
      showMessage(error.message || 'Failed to logout', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    // Unused, effectively deleted
  };

  return (
    <>
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-[9999] w-auto max-w-sm px-4 py-2 text-center rounded-lg shadow-lg border ${
              message.type === 'success' 
                ? 'bg-green-500/10 border-green-500/50 text-green-400' 
                : 'bg-red-500/10 border-red-500/50 text-red-400'
            }`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="max-w-3xl mx-auto space-y-8 pb-12 relative">
        {/* Account Management */}
      <div className="bg-surface border border-border rounded-[20px] p-6 md:p-8 space-y-8 mt-6">
        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <User className="w-5 h-5 md:w-6 md:h-6 text-accent" />
          Account Management
        </h2>

        <div className="flex items-center gap-4 pb-6 border-b border-border">
          <div className="w-16 h-16 rounded-full bg-accent/20 border border-accent/50 flex items-center justify-center text-accent text-2xl font-bold uppercase">
            {user?.displayName ? user.displayName[0] : user?.email ? user.email[0] : '?'}
          </div>
          <div>
            <h3 className="text-lg font-bold">{user?.displayName || 'Operator'}</h3>
            <p className="text-sm text-text-muted">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Profile Update */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end w-full">
            <div className="w-full">
              <label className="block text-sm font-medium text-text-muted mb-1">Display Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-black border border-border rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:border-accent transition-colors"
                  placeholder="Enter your name"
                />
              </div>
            </div>
            <button 
              onClick={handleUpdateProfile}
              disabled={loading || displayName === user?.displayName}
              className="bg-surface-glass border border-border hover:border-accent/50 disabled:opacity-50 disabled:cursor-not-allowed py-2 px-6 rounded-lg font-bold transition-all w-full md:w-auto whitespace-nowrap flex-shrink-0"
            >
              Update Name
            </button>
          </div>

          {/* Email Update */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end w-full">
            <div className="w-full">
              <label className="block text-sm font-medium text-text-muted mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black border border-border rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:border-accent transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            <button 
              onClick={handleUpdateEmail}
              disabled={emailLoading || email === user?.email || !email}
              className="bg-surface-glass border border-border hover:border-accent/50 disabled:opacity-50 disabled:cursor-not-allowed py-2 px-6 rounded-lg font-bold transition-all w-full md:w-auto whitespace-nowrap flex-shrink-0"
            >
              {emailLoading ? 'Updating... ' : 'Update Email'}
            </button>
          </div>

          {/* Password Update */}
          <div className="space-y-4 pt-6 border-t border-border">
            <h3 className="font-medium text-text">Change Password</h3>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="relative w-full">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-black border border-border rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:border-accent transition-colors"
                  placeholder="New Password"
                />
              </div>
              <button 
                onClick={handleChangePassword}
                disabled={loading || !newPassword}
                className="bg-surface-glass border border-border hover:border-accent/50 disabled:opacity-50 disabled:cursor-not-allowed py-2 px-6 rounded-lg font-bold transition-all w-full sm:w-auto whitespace-nowrap flex-shrink-0"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row gap-4 sm:justify-start sm:items-center">
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 text-text-muted hover:text-white transition-colors bg-surface-glass border border-border sm:border-none sm:bg-transparent py-3 rounded-lg sm:p-0"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      {/* System Settings */}
      <div className="bg-surface border border-border rounded-[20px] p-6 md:p-8 space-y-8">
        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <Sliders className="w-5 h-5 md:w-6 md:h-6 text-accent-purple" />
          System Settings
        </h2>
        
        {/* Slider */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-text">Default Noise Intensity</label>
            <span className="text-sm font-mono text-accent">{settings.defaultNoiseIntensity}%</span>
          </div>
          <Slider 
            value={settings.defaultNoiseIntensity} 
            onChange={(val) => setSettings({ ...settings, defaultNoiseIntensity: val })} 
          />
          <p className="text-xs text-text-muted mt-2">This will be the default intensity when you open the Protect Asset tool.</p>
        </div>

        {/* Toggles */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-accent mt-0.5" />
              <div>
                <p className="font-medium text-sm">Default AI Trap Mode</p>
                <p className="text-xs text-text-muted">Enable aggressive adversarial patterns by default</p>
              </div>
            </div>
            <ToggleSwitch 
              checked={settings.enableAiTrapMode} 
              onChange={(val) => setSettings({ ...settings, enableAiTrapMode: val })} 
            />
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center sm:justify-end gap-4 w-full">
          {saved && (
            <span className="text-green-500 text-sm flex items-center justify-center gap-1 font-medium w-full sm:w-auto">
              <CheckCircle2 className="w-4 h-4" /> Saved
            </span>
          )}
          <button 
            onClick={handleSaveSettings}
            className="btn-gradient py-3 px-8 rounded-xl font-bold transition-all flex items-center justify-center gap-2 hover:opacity-90 w-full sm:w-auto"
          >
            <Save className="w-4 h-4" />
            SAVE CONFIGURATION
          </button>
        </div>
      </div>

      {/* Re-authentication Modal */}
      <AnimatePresence>
        {showReauth && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md relative shadow-2xl"
            >
              <button 
                onClick={() => { setShowReauth(false); setPendingAction(null); }}
                className="absolute top-4 right-4 text-text-muted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-xl font-bold mb-2">Authentication Required</h3>
              <p className="text-sm text-text-muted mb-6">
                For your security, please re-enter your password to continue with this sensitive action.
              </p>
              
              <form onSubmit={handleReauth} className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input
                    type="password"
                    value={reauthPassword}
                    onChange={(e) => setReauthPassword(e.target.value)}
                    className="w-full bg-black border border-border rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-accent transition-colors"
                    placeholder="Current Password"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  disabled={loading || !reauthPassword}
                  className="w-full btn-gradient py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Continue'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
}
