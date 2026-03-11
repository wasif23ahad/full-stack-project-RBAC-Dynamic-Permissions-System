'use client';

import { useState } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { Search, Plus, Filter, MoreVertical, Edit2 } from 'lucide-react';

// Mock data to demonstrate the UI since no real backend exists for this in Phase 1-2.
const MOCK_LEADS = [
  { id: '1', name: 'Acme Corp', contact: 'john@acmecorp.com', status: 'NEW', assignedAgent: 'Sarah Jenkins', createdAt: '2026-03-01' },
  { id: '2', name: 'Global Tech', contact: 'sarah.w@globaltech.io', status: 'CONTACTED', assignedAgent: 'Mike Ross', createdAt: '2026-03-05' },
  { id: '3', name: 'Widget Inc', contact: 'info@widgetinc.com', status: 'QUALIFIED', assignedAgent: 'Sarah Jenkins', createdAt: '2026-03-08' },
  { id: '4', name: 'Stark Industries', contact: 'tony@stark.com', status: 'LOST', assignedAgent: 'N/A', createdAt: '2026-02-15' },
  { id: '5', name: 'Wayne Enterprises', contact: 'bwayne@wayne.com', status: 'WON', assignedAgent: 'Mike Ross', createdAt: '2026-01-20' },
];

export default function LeadsClient() {
  const [search, setSearch] = useState('');
  
  // Enforce create/edit permissions
  const canManageLeads = usePermission('leads.manage');

  const filteredLeads = MOCK_LEADS.filter(lead => 
    lead.name.toLowerCase().includes(search.toLowerCase()) || 
    lead.contact.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">New</span>;
      case 'CONTACTED': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Contacted</span>;
      case 'QUALIFIED': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Qualified</span>;
      case 'WON': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Won</span>;
      case 'LOST': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">Lost</span>;
      default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">{status}</span>;
    }
  };

  const handleCreate = () => {
    alert('Create Lead modal placeholder. Requires leads.manage permission.');
  };

  const handleEdit = (id: string) => {
    alert(`Edit Lead ${id} placeholder. Requires leads.manage permission.`);
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Leads</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage prospective customers and track the sales pipeline.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-neutral-400" />
            </div>
            <input
              type="text"
              className="block w-full sm:w-64 pl-10 pr-3 py-2 border border-neutral-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <button className="inline-flex items-center justify-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-lg shadow-sm text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shrink-0">
            <Filter className="w-4 h-4 mr-2 text-neutral-400" />
            Filter
          </button>
          
          {canManageLeads && (
            <button
              onClick={handleCreate}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shrink-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Lead
            </button>
          )}
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        {filteredLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-neutral-500">
            <p className="text-lg font-medium text-neutral-900 mb-1">No leads found</p>
            <p>Try adjusting your search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Contact</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Assigned Agent</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Added</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-neutral-900">{lead.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {lead.contact}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {getStatusBadge(lead.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {lead.assignedAgent}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-neutral-500">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                       {/* Actions */}
                       {canManageLeads ? (
                         <button onClick={() => handleEdit(lead.id)} className="text-blue-600 hover:text-blue-900 inline-flex items-center">
                           <Edit2 className="w-4 h-4 mr-1" />
                           Edit
                         </button>
                       ) : (
                         <button disabled className="text-neutral-300 cursor-not-allowed inline-flex items-center">
                           <MoreVertical className="w-5 h-5" />
                         </button>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
