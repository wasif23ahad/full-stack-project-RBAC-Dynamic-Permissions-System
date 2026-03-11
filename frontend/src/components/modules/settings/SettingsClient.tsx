'use client';

import { useState } from 'react';
import { Save, Shield, Mail, Globe, Bell } from 'lucide-react';

export default function SettingsClient() {
  const [formData, setFormData] = useState({
    siteName: 'Acme CRM Platform',
    supportEmail: 'support@acmecorp.com',
    defaultLanguage: 'en',
    timezone: 'UTC',
    enableNotifications: true,
    mfaRequired: false,
    sessionTimeout: '60',
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">System Settings</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Manage application-wide preferences and security configurations.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="p-6 border-b border-neutral-200 flex items-center">
            <Globe className="w-5 h-5 text-neutral-400 mr-2" />
            <h2 className="text-lg font-medium text-neutral-900">General Information</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Application Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.siteName}
                  onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Support Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-neutral-400" />
                  </div>
                  <input
                    type="email"
                    required
                    className="w-full pl-10 px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.supportEmail}
                    onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Default Language</label>
                <select
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.defaultLanguage}
                  onChange={(e) => setFormData({ ...formData, defaultLanguage: e.target.value })}
                >
                  <option value="en">English</option>
                  <option value="fr">French</option>
                  <option value="es">Spanish</option>
                  <option value="de">German</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Timezone</label>
                <select
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                >
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="EST">Eastern Standard Time</option>
                  <option value="PST">Pacific Standard Time</option>
                  <option value="BST">British Summer Time</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="p-6 border-b border-neutral-200 flex items-center">
            <Shield className="w-5 h-5 text-neutral-400 mr-2" />
            <h2 className="text-lg font-medium text-neutral-900">Security & Privacy</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-neutral-900">Require Multi-Factor Authentication</h3>
                <p className="text-sm text-neutral-500">Force all users to set up MFA on their next login.</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, mfaRequired: !formData.mfaRequired })}
                className={`${
                  formData.mfaRequired ? 'bg-blue-600' : 'bg-neutral-200'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2`}
              >
                <span
                  className={`${
                    formData.mfaRequired ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>

            <div className="border-t border-neutral-200 pt-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-neutral-900 flex items-center"><Bell className="w-4 h-4 mr-1"/> System Notifications</h3>
                <p className="text-sm text-neutral-500">Send administrators email alerts for critical events.</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, enableNotifications: !formData.enableNotifications })}
                className={`${
                  formData.enableNotifications ? 'bg-blue-600' : 'bg-neutral-200'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2`}
              >
                <span
                  className={`${
                    formData.enableNotifications ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>

            <div className="border-t border-neutral-200 pt-4">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Session Timeout (Minutes)</label>
              <select
                className="w-full sm:w-64 px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.sessionTimeout}
                onChange={(e) => setFormData({ ...formData, sessionTimeout: e.target.value })}
              >
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="60">1 Hour</option>
                <option value="120">2 Hours</option>
                <option value="1440">24 Hours</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          {success && <p className="text-sm text-green-600 font-medium tracking-tight">Settings Saved Successfully!</p>}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 min-w-32 transition-colors"
          >
            {saving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
          </button>
        </div>
      </form>
    </div>
  );
}
