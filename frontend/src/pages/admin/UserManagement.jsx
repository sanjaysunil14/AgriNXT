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
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const [total, setTotal] = useState(0);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const LIMIT = 10;

    // Modals
    const [editModal, setEditModal] = useState({ isOpen: false, user: null });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });
    const [deleteLoading, setDeleteLoading] = useState(false);

    const { addToast } = useToast();

    useEffect(() => {
        // Reset and fetch initial users when filters change
        fetchUsers(true);
    }, [search, roleFilter]);

    const handleSearch = () => {
        setSearch(searchInput);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const fetchUsers = async (reset = false) => {
        if (reset) {
            setLoading(true);
            setOffset(0);
        } else {
            setLoadingMore(true);
        }

        try {
            const params = {
                limit: LIMIT,
                offset: reset ? 0 : offset,
                search,
                role: roleFilter
            };

            const response = await api.get('/admin/users', { params });
            const { users: newUsers, hasMore: more, total: totalCount } = response.data.data;

            if (reset) {
                setUsers(newUsers);
                setOffset(LIMIT);
            } else {
                setUsers(prev => [...prev, ...newUsers]);
                setOffset(prev => prev + LIMIT);
            }

            setHasMore(more);
            setTotal(totalCount);
        } catch (error) {
            addToast('Failed to fetch users', 'error');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const loadMore = () => {
        if (!loadingMore && hasMore) {
            fetchUsers(false);
        }
    };

    const handleBanToggle = async (user) => {
        try {
            await api.patch(`/admin/users/${user.id}/ban`);
            addToast(`User ${user.is_active ? 'banned' : 'unbanned'} successfully`, 'success');
            fetchUsers(true);
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
            fetchUsers(true);
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
                <div className="flex-1 w-full flex gap-2">
                    <Input
                        icon={Search}
                        placeholder="Search by name or phone..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="bg-gray-50 border-transparent focus:bg-white"
                        containerClassName="m-0 flex-1"
                    />
                    <button
                        onClick={handleSearch}
                        className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-600 shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
                    >
                        <Search className="w-4 h-4" />
                        Search
                    </button>
                </div>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full sm:w-48 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none cursor-pointer hover:bg-white transition-colors"
                >
                    <option value="">All Roles</option>
                    <option value="ADMIN">Admin</option>
                    <option value="BUYER">Buyer</option>
                    <option value="FARMER">Farmer</option>
                </select>
            </div>

            {/* Results Summary */}
            {!loading && (
                <div className="text-sm text-gray-600">
                    Showing <span className="font-bold text-gray-900">{users.length}</span> of <span className="font-bold text-gray-900">{total}</span> users
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
                <Table
                    columns={columns}
                    data={users}
                    loading={loading}
                    emptyMessage="No users matching your criteria found"
                />

                {/* Show More Button */}
                {!loading && hasMore && (
                    <div className="p-6 border-t border-gray-100 flex justify-center">
                        <button
                            onClick={loadMore}
                            disabled={loadingMore}
                            className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loadingMore ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Loading...
                                </>
                            ) : (
                                'Show More'
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Modals */}
            <EditUserModal
                isOpen={editModal.isOpen}
                onClose={() => setEditModal({ isOpen: false, user: null })}
                user={editModal.user}
                onSuccess={() => fetchUsers(true)}
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