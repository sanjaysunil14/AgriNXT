import { useState, useEffect } from 'react';
import { Search, Edit, Ban, Trash2, Shield, CheckCircle, XCircle } from 'lucide-react';
import Table from '../../components/ui/Table';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Dropdown, { DropdownItem } from '../../components/ui/Dropdown';
import EditUserModal from '../../components/admin/EditUserModal';
import DeleteUserModal from '../../components/admin/DeleteUserModal';
import { useToast } from '../../components/ui/Toast';
import api from '../../utils/api';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Modals
    const [editModal, setEditModal] = useState({ isOpen: false, user: null });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });
    const [deleteLoading, setDeleteLoading] = useState(false);

    const { addToast } = useToast();

    useEffect(() => {
        fetchUsers();
    }, [currentPage, search, roleFilter]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: 10,
                search,
                role: roleFilter
            };
            const response = await api.get('/admin/users', { params });
            setUsers(response.data.data.users);
            setPagination(response.data.data.pagination);
        } catch (error) {
            addToast('Failed to fetch users', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleBanToggle = async (user) => {
        try {
            await api.patch(`/admin/users/${user.id}/ban`);
            addToast(`User ${user.is_active ? 'banned' : 'unbanned'} successfully`, 'success');
            fetchUsers();
        } catch (error) {
            addToast('Failed to update user status', 'error');
        }
    };

    const handleDelete = async () => {
        setDeleteLoading(true);
        try {
            await api.delete(`/admin/users/${deleteModal.user.id}`);
            addToast('User deleted successfully', 'success');
            setDeleteModal({ isOpen: false, user: null });
            fetchUsers();
        } catch (error) {
            addToast('Failed to delete user', 'error');
        } finally {
            setDeleteLoading(false);
        }
    };

    const columns = [
        {
            header: 'User',
            render: (user) => (
                <div className="flex items-center gap-3">
                    <Avatar name={user.full_name} size="md" />
                    <div>
                        <p className="font-medium text-gray-900">{user.full_name}</p>
                        <p className="text-sm text-gray-500">{user.phone_number}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Role',
            render: (user) => (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'BUYER' ? 'bg-blue-100 text-blue-700' :
                            'bg-green-100 text-green-700'
                    }`}>
                    <Shield className="w-3 h-3" />
                    {user.role}
                </span>
            )
        },
        {
            header: 'Status',
            render: (user) => (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {user.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {user.is_active ? 'Active' : 'Banned'}
                </span>
            )
        },
        {
            header: 'Join Date',
            render: (user) => new Date(user.created_at).toLocaleDateString()
        },
        {
            header: 'Actions',
            render: (user) => (
                <Dropdown>
                    <DropdownItem
                        icon={Edit}
                        onClick={() => setEditModal({ isOpen: true, user })}
                    >
                        Edit User
                    </DropdownItem>
                    <DropdownItem
                        icon={Ban}
                        onClick={() => handleBanToggle(user)}
                    >
                        {user.is_active ? 'Ban User' : 'Unban User'}
                    </DropdownItem>
                    <DropdownItem
                        icon={Trash2}
                        variant="danger"
                        onClick={() => setDeleteModal({ isOpen: true, user })}
                    >
                        Delete User
                    </DropdownItem>
                </Dropdown>
            )
        }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600">Manage all users in the system</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <Input
                        icon={Search}
                        placeholder="Search by name or phone..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={(e) => {
                        setRoleFilter(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                    <option value="">All Roles</option>
                    <option value="ADMIN">Admin</option>
                    <option value="BUYER">Buyer</option>
                    <option value="FARMER">Farmer</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <Table
                    columns={columns}
                    data={users}
                    loading={loading}
                    emptyMessage="No users found"
                    pagination={pagination}
                    onPageChange={setCurrentPage}
                />
            </div>

            {/* Modals */}
            <EditUserModal
                isOpen={editModal.isOpen}
                onClose={() => setEditModal({ isOpen: false, user: null })}
                user={editModal.user}
                onSuccess={fetchUsers}
            />

            <DeleteUserModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, user: null })}
                user={deleteModal.user}
                onConfirm={handleDelete}
                loading={deleteLoading}
            />
        </div>
    );
}
