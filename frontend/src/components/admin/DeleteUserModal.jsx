import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { AlertTriangle } from 'lucide-react';

export default function DeleteUserModal({ isOpen, onClose, user, onConfirm, loading }) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Delete User"
            size="sm"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={onConfirm} loading={loading}>
                        Delete User
                    </Button>
                </>
            }
        >
            <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-red-900">This action cannot be undone</p>
                        <p className="text-sm text-red-700 mt-1">
                            All user data will be permanently deleted.
                        </p>
                    </div>
                </div>

                <p className="text-gray-700">
                    Are you sure you want to delete <span className="font-semibold">{user?.full_name}</span>?
                </p>
            </div>
        </Modal>
    );
}
