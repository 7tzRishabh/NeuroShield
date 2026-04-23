import React from 'react';
import { Shield, Activity, FileImage, Zap, Loader2, FileCode, FileText, Globe, Image as ImageIcon } from 'lucide-react';
import { useHistory } from '../lib/store';
import { Link } from 'react-router-dom';

import { auth } from '../lib/firebase';

export default function DashboardHome() {
  const { history, loading } = useHistory();
  
  const user = auth.currentUser;
  const name = user ? (user.displayName || (user.email ? user.email.split("@")[0] : '')) : '';

  const totalProcessed = history.length;
  const avgScore = totalProcessed > 0 
    ? history.reduce((acc, curr) => acc + (curr.protectionStrength || 0), 0) / totalProcessed 
    : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-text-muted">
        <Loader2 className="w-12 h-12 mb-4 animate-spin text-accent" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome back{name ? `, ${name}` : ''}</h1>
        <p className="text-text-muted">Here is your asset protection overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-surface border border-border rounded-[20px] p-5 lg:p-6 flex items-center gap-4">
          <div className="w-12 h-12 flex-shrink-0 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
            <FileImage className="w-6 h-6 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs lg:text-sm text-text-muted uppercase tracking-wider truncate">Assets Protected</p>
            <p className="text-2xl md:text-3xl font-bold font-mono truncate">{totalProcessed}</p>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-[20px] p-5 lg:p-6 flex items-center gap-4">
          <div className="w-12 h-12 flex-shrink-0 rounded-full bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-accent-purple" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs lg:text-sm text-text-muted uppercase tracking-wider truncate">Avg Strength</p>
            <p className="text-2xl md:text-3xl font-bold font-mono text-glow truncate">{avgScore.toFixed(1)}%</p>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-[20px] p-5 lg:p-6 flex items-center gap-4 md:col-span-2 lg:col-span-1">
          <div className="w-12 h-12 flex-shrink-0 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
            <Activity className="w-6 h-6 text-green-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs lg:text-sm text-text-muted uppercase tracking-wider truncate">System Status</p>
            <p className="text-xl md:text-2xl font-bold text-green-500 truncate">ONLINE</p>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface border border-border rounded-[20px] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Recent Activity</h2>
            <Link to="/history" className="text-sm text-accent hover:underline">View All</Link>
          </div>
          
          {history.length === 0 ? (
            <div className="text-center py-8 text-text-muted border border-dashed border-border rounded-xl">
              No recent activity.
            </div>
          ) : (
            <div className="space-y-4">
              {history.slice(0, 3).map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-surface-glass border border-border rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-black border border-border overflow-hidden flex items-center justify-center">
                      {item.fileType === 'image' ? (
                        <img src={item.protectedFile} alt="Thumb" className="w-full h-full object-cover opacity-80" />
                      ) : item.fileType === 'pdf' ? (
                        <FileText className="w-5 h-5 text-text-muted" />
                      ) : item.fileType === 'html' ? (
                        <Globe className="w-5 h-5 text-text-muted" />
                      ) : (
                        <FileCode className="w-5 h-5 text-text-muted" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium uppercase text-sm tracking-wider">{item.fileType} Protected</p>
                      <p className="text-xs text-text-muted font-mono">
                        {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleString() : new Date().toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-accent">{item.protectionStrength?.toFixed(1)}%</p>
                    <p className="text-xs text-text-muted font-mono">{item.noiseSignature}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-surface border border-border rounded-[20px] p-6 flex flex-col">
          <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
          <div className="flex-1 flex flex-col justify-center gap-4">
            <Link to="/protect" className="btn-gradient py-4 rounded-xl font-bold tracking-wider flex items-center justify-center gap-2 transition-all hover:opacity-90">
              <Zap className="w-5 h-5" />
              NEW PROTECTION
            </Link>
            <Link to="/settings" className="bg-surface-glass border border-border hover:border-accent/50 py-4 rounded-xl font-bold tracking-wider flex items-center justify-center gap-2 transition-all">
              CONFIGURE GLAZE
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
