'use client';

import { useState } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { Search, Plus, Filter, MoreVertical, Edit2 } from 'lucide-react';

const MOCK_TASKS = [
  { id: '1', title: 'Prepare Q3 Report', assignee: 'Sarah Jenkins', status: 'IN_PROGRESS', dueDate: '2026-03-15' },
  { id: '2', title: 'Follow up with Widget Inc', assignee: 'Mike Ross', status: 'TODO', dueDate: '2026-03-16' },
  { id: '3', title: 'Update internal wiki', assignee: 'Admin User', status: 'DONE', dueDate: '2026-03-10' },
  { id: '4', title: 'Client onboarding call', assignee: 'Sarah Jenkins', status: 'TODO', dueDate: '2026-03-20' },
];

export default function TasksClient() {
  const [search, setSearch] = useState('');
  
  // Enforce create/edit permissions
  const canManageTasks = usePermission('tasks.manage');

  const filteredTasks = MOCK_TASKS.filter(task => 
    task.title.toLowerCase().includes(search.toLowerCase()) || 
    task.assignee.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'TODO': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">To Do</span>;
      case 'IN_PROGRESS': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700">In Progress</span>;
      case 'DONE': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Done</span>;
      default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">{status}</span>;
    }
  };

  const handleCreate = () => {
    alert('Create Task modal placeholder. Requires tasks.manage permission.');
  };

  const handleEdit = (id: string) => {
    alert(`Edit Task ${id} placeholder. Requires tasks.manage permission.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Tasks</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage your daily to-dos and team assignments.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-neutral-400" />
            </div>
            <input
              type="text"
              className="block w-full sm:w-64 pl-10 pr-3 py-2 border border-neutral-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand sm:text-sm transition-shadow"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <button className="inline-flex items-center justify-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-[10px] shadow-sm text-neutral-700 bg-white hover:bg-neutral-50 transition-colors shrink-0">
            <Filter className="w-4 h-4 mr-2 text-neutral-400" />
            Filter
          </button>
          
          {canManageTasks && (
            <button
              onClick={handleCreate}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-[10px] text-white transition-colors shrink-0 shadow-brand-btn"
              style={{ background: 'var(--brand)', border: '1.5px solid #FD5E2B' }}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-neutral-500">
            <p className="text-lg font-medium text-neutral-900 mb-1">No tasks found</p>
            <p>Try adjusting your search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Title</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Assignee</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Due Date</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-neutral-900">{task.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {task.assignee}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {getStatusBadge(task.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-neutral-500">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                       {canManageTasks ? (
                         <button onClick={() => handleEdit(task.id)} className="inline-flex items-center font-inter text-[13px] font-medium transition-colors" style={{ color: 'var(--brand)' }}>
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
