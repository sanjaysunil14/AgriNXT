import { useState, useEffect } from 'react';
import { Search, Edit, Ban, Trash2, Shield, CheckCircle, XCircle, Users } from 'lucide-react';
import Table from '../../components/ui/Table';
import Input from '../../components/ui/Input';
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
            header: 'User Profile',
            render: (user) => (
                <div className="flex items-center gap-4">
                    <Avatar name={user.full_name} size="md" className="ring-2 ring-white shadow-md" />
                    <div>
                        <p className="font-bold text-gray-900">{user.full_name}</p>
                        <p className="text-sm text-gray-500 font-medium">{user.phone_number}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Role',
            render: (user) => (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                    user.role === 'BUYER' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                    <Shield className="w-3 h-3" />
                    {user.role}
                </span>
            )
        },
        {
            header: 'Status',
            render: (user) => (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {user.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {user.is_active ? 'Active' : 'Banned'}
                </span>
            )
        },
        {
            header: 'Join Date',
            render: (user) => (
                <span className="text-gray-600 font-medium text-sm">
                    {new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
            )
        },
        {
            header: 'Actions',
            render: (user) => (
                <Dropdown>
                    <DropdownItem
                        icon={Edit}
                        onClick={() => setEditModal({ isOpen: true, user })}
                    >
                        Edit Details
                    </DropdownItem>
                    <DropdownItem
                        icon={Ban}
                        onClick={() => handleBanToggle(user)}
                        className={user.is_active ? 'text-orange-600' : 'text-green-600'}
                    >
                        {user.is_active ? 'Suspend Access' : 'Restore Access'}
                    </DropdownItem>
                    <div className="h-px bg-gray-100 my-1"></div>
                    <DropdownItem
                        icon={Trash2}
                        variant="danger"
                        onClick={() => setDeleteModal({ isOpen: true, user })}
                    >
                        Permanently Delete
                    </DropdownItem>
                </Dropdown>
            )
        }
    ];

    return (
        <div className="p-8 space-y-8 bg-gray-50/50 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-500 mt-1">Directory of all registered system participants</p>
                </div>
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                    <div className="bg-emerald-100 p-2 rounded-xl">
                        <Users className="w-6 h-6 text-emerald-600" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1 w-full">
                    <Input
                        icon={Search}
                        placeholder="Search by name or phone..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="bg-gray-50 border-transparent focus:bg-white"
                        containerClassName="m-0"
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={(e) => {
                        setRoleFilter(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="w-full sm:w-48 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none cursor-pointer hover:bg-white transition-colors"
                >
                    <option value="">All Roles</option>
                    <option value="ADMIN">Admin</option>
                    <option value="BUYER">Buyer</option>
                    <option value="FARMER">Farmer</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
                <Table
                    columns={columns}
                    data={users}
                    loading={loading}
                    emptyMessage="No users matching your criteria found"
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