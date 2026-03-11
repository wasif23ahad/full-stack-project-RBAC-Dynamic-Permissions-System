import { X } from 'lucide-react';
import PermissionEditor from '../PermissionEditor';

interface PermissionEditorModalProps {
  userId: string;
  userName: string;
  onClose: () => void;
}

export default function PermissionEditorModal({ userId, userName, onClose }: PermissionEditorModalProps) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-neutral-900 bg-opacity-75 transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        ></div>

        <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

        <div className="inline-block transform overflow-hidden rounded-xl bg-neutral-50 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:align-middle">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold leading-6 text-neutral-900" id="modal-title">
                  Manage Permissions
                </h3>
                <p className="mt-1 text-sm text-neutral-500">
                  Editing access control for <span className="font-medium text-neutral-700">{userName}</span>
                </p>
              </div>
              <button
                type="button"
                className="rounded-md bg-white text-neutral-400 hover:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
          
          <div className="px-4 py-5 sm:p-6 max-h-[70vh] overflow-y-auto">
            <PermissionEditor userId={userId} />
          </div>
          
          <div className="bg-neutral-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-neutral-200">
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-lg border border-neutral-300 bg-white px-4 py-2 text-base font-medium text-neutral-700 shadow-sm hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
