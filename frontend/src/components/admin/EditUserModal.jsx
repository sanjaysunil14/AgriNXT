import { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useToast } from '../ui/Toast';
import api from '../../utils/api';

export default function EditUserModal({ isOpen, onClose, user, onSuccess }) {
    const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        role: user?.role || 'FARMER'
    });
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.put(`/admin/users/${user.id}`, formData);
            addToast('User updated successfully', 'success');
            onSuccess();
            onClose();
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to update user', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit User"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} loading={loading}>
                        Save Changes
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Full Name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                />

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role
                    </label>
                    <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="ADMIN">Admin</option>
                        <option value="BUYER">Buyer</option>
                        <option value="FARMER">Farmer</option>
                    </select>
                </div>
            </form>
        </Modal>
    );
}
