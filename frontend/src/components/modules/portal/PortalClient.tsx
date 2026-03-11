'use client';

import { Ticket, Package, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const MOCK_TICKETS = [
  { id: 'TIC-1092', subject: 'Cannot access my billing history', status: 'OPEN', date: '2026-03-09' },
  { id: 'TIC-1085', subject: 'Question about premium features', status: 'RESOLVED', date: '2026-03-02' },
];

const MOCK_ORDERS = [
  { id: 'ORD-9921', item: 'Annual Enterprise Plan', amount: '$499.00', status: 'ACTIVE', date: '2026-01-15' },
];

export default function PortalClient() {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      <div className="bg-blue-600 rounded-xl shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.firstName || 'Customer'}!</h1>
        <p className="mt-2 text-blue-100 max-w-2xl text-lg">
          This is your private portal. View your active subscriptions, track recent support requests, and manage your profile here.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Support Tickets Section */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-neutral-200 flex items-center justify-between">
            <h2 className="text-lg font-medium text-neutral-900 flex items-center">
              <Ticket className="w-5 h-5 text-neutral-400 mr-2" />
              My Support Tickets
            </h2>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
              New Ticket
            </button>
          </div>
          <div className="p-6 flex-1">
            {MOCK_TICKETS.length > 0 ? (
              <div className="space-y-4">
                {MOCK_TICKETS.map(ticket => (
                  <div key={ticket.id} className="flex justify-between items-center p-4 border border-neutral-100 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer">
                    <div>
                      <p className="font-medium text-neutral-900">{ticket.subject}</p>
                      <p className="text-xs text-neutral-500 mt-1">{ticket.id} • Opened {new Date(ticket.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        ticket.status === 'OPEN' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <AlertCircle className="mx-auto h-12 w-12 text-neutral-300" />
                <h3 className="mt-2 text-sm font-medium text-neutral-900">No active tickets</h3>
                <p className="mt-1 text-sm text-neutral-500">You do not have any recent support requests.</p>
              </div>
            )}
          </div>
        </div>

        {/* Orders & Subscriptions Section */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-neutral-200">
            <h2 className="text-lg font-medium text-neutral-900 flex items-center">
              <Package className="w-5 h-5 text-neutral-400 mr-2" />
              My Subscriptions
            </h2>
          </div>
          <div className="p-6 flex-1">
            {MOCK_ORDERS.length > 0 ? (
               <div className="space-y-4">
                 {MOCK_ORDERS.map(order => (
                   <div key={order.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border border-neutral-100 rounded-lg">
                     <div className="mb-2 sm:mb-0">
                       <p className="font-medium text-neutral-900">{order.item}</p>
                       <p className="text-xs text-neutral-500 mt-1">Purchased {new Date(order.date).toLocaleDateString()}</p>
                     </div>
                     <div className="flex items-center justify-between sm:justify-end gap-4 sm:flex-col sm:items-end">
                       <span className="font-semibold text-neutral-900">{order.amount}</span>
                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                         {order.status}
                       </span>
                     </div>
                   </div>
                 ))}
               </div>
            ) : (
              <div className="text-center py-10">
                <Package className="mx-auto h-12 w-12 text-neutral-300" />
                <h3 className="mt-2 text-sm font-medium text-neutral-900">No subscriptions</h3>
                <p className="mt-1 text-sm text-neutral-500">You do not have any active paid plans.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
