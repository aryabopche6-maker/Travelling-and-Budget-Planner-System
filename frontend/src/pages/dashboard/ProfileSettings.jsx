import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Bell, Shield, Key } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

export default function ProfileSettings() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">Profile & Settings</h1>
        <p className="text-secondary mt-1">Manage your account, notifications, and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Settings Navigation (Static for now) */}
        <div className="space-y-2">
          {[
            { id: 'profile', label: 'Edit Profile', icon: <User className="w-4 h-4" /> },
            { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
            { id: 'security', label: 'Security', icon: <Key className="w-4 h-4" /> },
            { id: 'emergency', label: 'Emergency Contacts', icon: <Shield className="w-4 h-4" /> },
          ].map((item, idx) => (
            <button
              key={item.id}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                idx === 0 ? 'bg-bg text-teal border border-muted/30' : 'text-secondary hover:text-charcoal hover:bg-bg'
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl border border-muted/30 p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-6 text-charcoal">Personal Information</h3>
            
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 rounded-full bg-teal/20 text-teal flex items-center justify-center text-3xl font-bold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <Button variant="outline" size="sm">Change Avatar</Button>
              </div>
            </div>

            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Full Name</label>
                  <Input defaultValue={user?.name} className="bg-bg border-muted/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Email Address</label>
                  <Input defaultValue={user?.email} disabled className="opacity-50 bg-bg border-muted/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Phone Number</label>
                  <Input placeholder="+1 234 567 890" className="bg-bg border-muted/30" />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </form>
          </div>
          
          <div className="bg-white rounded-2xl border border-muted/30 p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4 text-charcoal">Danger Zone</h3>
            <div className="flex items-center justify-between p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
              <div>
                <h4 className="font-bold text-red-400">Delete Account</h4>
                <p className="text-sm text-red-200/60 mt-1">Permanently remove your account and all data.</p>
              </div>
              <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/20">
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
