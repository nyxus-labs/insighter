'use client';

import { useState, useEffect, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Settings, User, Lock, Camera, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

export default function SettingsPage() {
  const { user: contextUser, refreshUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
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
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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
            <p className="text-slate-400 font-mono text-sm">Manage your account and security preferences.</p>
        </div>
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

      {/* Profile Section */}
      <div className="glass-panel p-8 rounded-2xl border border-onyx-800 space-y-8 relative overflow-hidden">
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
                        className="absolute -bottom-2 -right-2 w-8 h-8 bg-electric-600 rounded-lg flex items-center justify-center text-white shadow-lg hover:bg-electric-500 transition border border-onyx-900"
                    >
                        <Camera className="w-4 h-4" />
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleAvatarChange} 
                        className="hidden" 
                        accept="image/*"
                    />
                </div>
                <div className="flex-1 space-y-1">
                    <h3 className="text-white font-medium">Profile Photo</h3>
                    <p className="text-sm text-slate-500">Upload a new avatar. Recommended size: 400x400px.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="block text-xs font-mono text-slate-500 uppercase tracking-widest">First Name</label>
                    <input 
                        type="text" 
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full bg-onyx-900/50 border border-onyx-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-electric-400 focus:shadow-glow-cyan transition"
                        placeholder="John"
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-xs font-mono text-slate-500 uppercase tracking-widest">Last Name</label>
                    <input 
                        type="text" 
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full bg-onyx-900/50 border border-onyx-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-electric-400 focus:shadow-glow-cyan transition"
                        placeholder="Doe"
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="block text-xs font-mono text-slate-500 uppercase tracking-widest">Username</label>
                    <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-onyx-900/50 border border-onyx-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-electric-400 focus:shadow-glow-cyan transition"
                        placeholder="jdoe"
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-xs font-mono text-slate-500 uppercase tracking-widest">Email Address</label>
                    <input 
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
                    className="bg-electric-600 hover:bg-electric-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition shadow-glow-cyan disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    SAVE CHANGES
                </button>
            </div>
        </form>
      </div>
      
      {/* Security Section */}
      <div className="glass-panel p-8 rounded-2xl border border-onyx-800 space-y-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-neon-violet"></div>
        <div className="flex items-center gap-3 border-b border-onyx-800 pb-4">
            <Lock className="w-5 h-5 text-neon-violet" />
            <h2 className="text-lg font-bold text-white">Security</h2>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="block text-xs font-mono text-slate-500 uppercase tracking-widest">New Password</label>
                    <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-onyx-900/50 border border-onyx-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-neon-violet focus:shadow-glow-violet transition"
                        placeholder="••••••••"
                        minLength={6}
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-xs font-mono text-slate-500 uppercase tracking-widest">Confirm Password</label>
                    <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-onyx-900/50 border border-onyx-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-neon-violet focus:shadow-glow-violet transition"
                        placeholder="••••••••"
                        minLength={6}
                    />
                </div>
            </div>

            <div className="flex justify-end">
                <button 
                    type="submit" 
                    disabled={saving || !newPassword}
                    className="bg-neon-violet hover:bg-violet-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition shadow-glow-violet disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    UPDATE PASSWORD
                </button>
            </div>
        </form>
      </div>

      {/* API Keys Placeholder */}
      <div className="glass-panel p-8 rounded-2xl border border-onyx-800 space-y-6 opacity-60 hover:opacity-100 transition duration-300">
        <div className="flex items-center gap-3 border-b border-onyx-800 pb-4">
            <Settings className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-bold text-white">API Configuration</h2>
        </div>
        <p className="text-sm text-slate-500">Manage API keys for accessing the platform programmatically.</p>
        <button disabled className="px-4 py-2 bg-onyx-800 text-slate-500 rounded-lg text-sm font-mono border border-onyx-700 cursor-not-allowed">
            Manage Keys (Coming Soon)
        </button>
      </div>
    </div>
  );
}
