'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Settings, User, Lock, Camera, Save, Loader2, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { SecretsSettings } from '@/components/dashboard/SecretsSettings';

export default function SettingsPage() {
  const { user: contextUser, refreshUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'secrets' | 'security'>('profile');
  
  // Form States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  
  // Password States
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const supabase = createClient();

  useEffect(() => {
    if (contextUser) {
      setFirstName(contextUser.firstName || '');
      setLastName(contextUser.lastName || '');
      setUsername(contextUser.username || '');
      setAvatarUrl(contextUser.avatarUrl || null);
      setLoading(false);
    } else if (contextUser === null) {
        // User not logged in or failed to load
        setLoading(false);
    }
  }, [contextUser]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      // Create a preview URL
      const objectUrl = URL.createObjectURL(file);
      setAvatarUrl(objectUrl);
    }
  };

  const uploadAvatar = async (userId: string) => {
    if (!avatarFile) return null;
    
    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatarFile);

    if (uploadError) {
      // Check for missing bucket error
      if (uploadError.message.includes('Bucket not found')) {
        throw new Error('Storage not configured: The "avatars" bucket is missing. Please run the setup SQL.');
      }
      throw uploadError;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      let publicAvatarUrl = avatarUrl;

      if (avatarFile) {
        publicAvatarUrl = await uploadAvatar(user.id);
      }

      const { error } = await supabase.auth.updateUser({
        data: { 
          first_name: firstName,
          last_name: lastName,
          username: username,
          full_name: `${firstName} ${lastName}`.trim(),
          avatar_url: publicAvatarUrl
        }
      });

      if (error) throw error;
      
      // Sync global state
      await refreshUser();
      
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      setSaving(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Password updated successfully' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update password' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-electric-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-onyx-900 rounded-2xl flex items-center justify-center border border-onyx-800 shadow-lg">
            <Settings className="w-8 h-8 text-electric-400" />
        </div>
        <div>
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-slate-400 font-mono text-sm">Manage your account and tool configurations.</p>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-onyx-900/50 border border-onyx-800 rounded-xl w-fit mb-8" role="tablist">
        <button 
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-500/50 ${activeTab === 'profile' ? 'bg-electric-600 text-white' : 'text-slate-400 hover:text-white hover:bg-onyx-800'}`}
          role="tab"
          aria-selected={activeTab === 'profile'}
          aria-controls="profile-panel"
        >
          <User className="w-4 h-4" />
          Profile
        </button>
        <button 
          onClick={() => setActiveTab('secrets')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-500/50 ${activeTab === 'secrets' ? 'bg-electric-600 text-white' : 'text-slate-400 hover:text-white hover:bg-onyx-800'}`}
          role="tab"
          aria-selected={activeTab === 'secrets'}
          aria-controls="secrets-panel"
        >
          <ShieldCheck className="w-4 h-4" />
          Tool Secrets
        </button>
        <button 
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-500/50 ${activeTab === 'security' ? 'bg-electric-600 text-white' : 'text-slate-400 hover:text-white hover:bg-onyx-800'}`}
          role="tab"
          aria-selected={activeTab === 'security'}
          aria-controls="security-panel"
        >
          <Lock className="w-4 h-4" />
          Security
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
            : 'bg-red-500/10 border-red-500/50 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {activeTab === 'profile' && (
        <div id="profile-panel" role="tabpanel" aria-labelledby="profile-tab" className="glass-panel p-8 rounded-2xl border border-onyx-800 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-electric-600"></div>
          <div className="flex items-center gap-3 border-b border-onyx-800 pb-4">
              <User className="w-5 h-5 text-electric-400" />
              <h2 className="text-lg font-bold text-white">Profile Information</h2>
          </div>
          
          <form onSubmit={handleUpdateProfile} className="space-y-8">
              <div className="flex items-start gap-8">
                  <div className="relative group">
                      <div className="w-24 h-24 rounded-2xl bg-onyx-900 border-2 border-onyx-700 flex items-center justify-center overflow-hidden">
                          {avatarUrl ? (
                              <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                              <User className="w-10 h-10 text-slate-600" />
                          )}
                      </div>
                      <button 
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute -bottom-2 -right-2 w-8 h-8 bg-electric-600 rounded-lg flex items-center justify-center text-white shadow-lg hover:bg-electric-500 transition border border-onyx-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-500/50"
                          aria-label="Change profile photo"
                      >
                          <Camera className="w-4 h-4" />
                      </button>
                      <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleAvatarChange} 
                          className="hidden" 
                          accept="image/*"
                          id="avatar-upload"
                      />
                  </div>
                  <div className="flex-1 space-y-1">
                      <h3 className="text-white font-medium">Profile Photo</h3>
                      <p className="text-sm text-slate-500">Upload a new avatar. Recommended size: 400x400px.</p>
                  </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                      <label htmlFor="first-name" className="block text-xs font-mono text-slate-500 uppercase tracking-widest cursor-pointer">First Name</label>
                      <input 
                          id="first-name"
                          type="text" 
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full bg-onyx-900/50 border border-onyx-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-electric-400 transition"
                          placeholder="John"
                      />
                  </div>
                  <div className="space-y-2">
                      <label htmlFor="last-name" className="block text-xs font-mono text-slate-500 uppercase tracking-widest cursor-pointer">Last Name</label>
                      <input 
                          id="last-name"
                          type="text" 
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full bg-onyx-900/50 border border-onyx-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-electric-400 transition"
                          placeholder="Doe"
                      />
                  </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                      <label htmlFor="username" className="block text-xs font-mono text-slate-500 uppercase tracking-widest cursor-pointer">Username</label>
                      <input 
                          id="username"
                          type="text" 
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full bg-onyx-900/50 border border-onyx-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-electric-400 transition"
                          placeholder="jdoe"
                      />
                  </div>
                  <div className="space-y-2">
                      <label htmlFor="email" className="block text-xs font-mono text-slate-500 uppercase tracking-widest">Email Address</label>
                      <input 
                          id="email"
                          type="email" 
                          value={contextUser?.email || ''} 
                          disabled 
                          className="w-full bg-onyx-900/30 border border-onyx-800 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed" 
                      />
                      <p className="text-[10px] text-slate-600">Email cannot be changed directly.</p>
                  </div>
              </div>

              <div className="flex justify-end">
                  <button 
                      type="submit" 
                      disabled={saving}
                      className="bg-electric-600 hover:bg-electric-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition shadow-lg shadow-electric-600/20 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-500/50"
                  >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Save className="w-4 h-4" aria-hidden="true" />}
                      <span>{saving ? 'SAVING...' : 'SAVE CHANGES'}</span>
                  </button>
              </div>
          </form>
        </div>
      )}

      {activeTab === 'secrets' && (
        <div id="secrets-panel" role="tabpanel" aria-labelledby="secrets-tab">
          <SecretsSettings />
        </div>
      )}

      {activeTab === 'security' && (
        <div id="security-panel" role="tabpanel" aria-labelledby="security-tab" className="glass-panel p-8 rounded-2xl border border-onyx-800 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-electric-600"></div>
          <div className="flex items-center gap-3 border-b border-onyx-800 pb-4">
              <Lock className="w-5 h-5 text-electric-400" />
              <h2 className="text-lg font-bold text-white">Security</h2>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                      <label htmlFor="new-password" className="block text-xs font-mono text-slate-500 uppercase tracking-widest cursor-pointer">New Password</label>
                      <input 
                          id="new-password"
                          type="password" 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-onyx-900/50 border border-onyx-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-electric-400 transition"
                          placeholder="••••••••"
                          minLength={6}
                      />
                  </div>
                  <div className="space-y-2">
                      <label htmlFor="confirm-password" className="block text-xs font-mono text-slate-500 uppercase tracking-widest cursor-pointer">Confirm Password</label>
                      <input 
                          id="confirm-password"
                          type="password" 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-onyx-900/50 border border-onyx-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-electric-400 transition"
                          placeholder="••••••••"
                          minLength={6}
                      />
                  </div>
              </div>

              <div className="flex justify-end">
                  <button 
                      type="submit" 
                      disabled={saving || !newPassword}
                      className="bg-electric-600 hover:bg-electric-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition shadow-lg shadow-electric-600/20 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-500/50"
                  >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Save className="w-4 h-4" aria-hidden="true" />}
                      <span>{saving ? 'UPDATING...' : 'UPDATE PASSWORD'}</span>
                  </button>
              </div>
          </form>
        </div>
      )}
    </div>
  );
}
