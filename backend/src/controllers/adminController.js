import { PrismaClient } from '@prisma/client';
import { logAuditAction } from '../utils/auditLogger.js';

const prisma = new PrismaClient();

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
    try {
        const [totalUsers, activeUsers, newSignupsThisWeek] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { is_active: true } }),
            prisma.user.count({
                where: {
                    created_at: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    }
                }
            })
        ]);

        const usersByRole = await prisma.user.groupBy({
            by: ['role'],
            _count: true
        });

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                activeUsers,
                newSignupsThisWeek,
                usersByRole: usersByRole.reduce((acc, item) => {
                    acc[item.role] = item._count;
                    return acc;
                }, {})
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get all users with pagination, search, and filter
export const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', role = '' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};

        if (search) {
            where.OR = [
                { full_name: { contains: search, mode: 'insensitive' } },
                { phone_number: { contains: search } }
            ];
        }

        if (role) {
            where.role = role;
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    full_name: true,
                    phone_number: true,
                    role: true,
                    is_active: true,
                    created_at: true
                },
                skip,
                take: parseInt(limit),
                orderBy: { created_at: 'desc' }
            }),
            prisma.user.count({ where })
        ]);

        res.status(200).json({
            success: true,
            data: {
                users,
                pagination: {
                    total,
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    from: skip + 1,
                    to: Math.min(skip + parseInt(limit), total)
                }
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Update user
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, role } = req.body;
        const adminId = req.user.userId;

        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                full_name,
                role
            },
            select: {
                id: true,
                full_name: true,
                phone_number: true,
                role: true,
                is_active: true
            }
        });

        // Log audit action
        await logAuditAction(
            adminId,
            'UPDATE_USER',
            parseInt(id),
            `Updated user: ${full_name}, role: ${role}`,
            req.ip
        );

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: { user }
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Toggle ban user
export const toggleBanUser = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.userId;

        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { is_active: !user.is_active },
            select: {
                id: true,
                full_name: true,
                phone_number: true,
                role: true,
                is_active: true
            }
        });

        // Log audit action
        await logAuditAction(
            adminId,
            updatedUser.is_active ? 'UNBAN_USER' : 'BAN_USER',
            parseInt(id),
            `${updatedUser.is_active ? 'Unbanned' : 'Banned'} user: ${user.full_name}`,
            req.ip
        );

        res.status(200).json({
            success: true,
            message: `User ${updatedUser.is_active ? 'unbanned' : 'banned'} successfully`,
            data: { user: updatedUser }
        });
    } catch (error) {
        console.error('Toggle ban user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Delete user
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.userId;

        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await prisma.user.delete({
            where: { id: parseInt(id) }
        });

        // Log audit action
        await logAuditAction(
            adminId,
            'DELETE_USER',
            parseInt(id),
            `Deleted user: ${user.full_name}`,
            req.ip
        );

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get audit logs
export const getAuditLogs = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                include: {
                    admin: {
                        select: {
                            id: true,
                            full_name: true
                        }
                    },
                    target_user: {
                        select: {
                            id: true,
                            full_name: true
                        }
                    }
                },
                skip,
                take: parseInt(limit),
                orderBy: { created_at: 'desc' }
            }),
            prisma.auditLog.count()
        ]);

        res.status(200).json({
            success: true,
            data: {
                logs,
                pagination: {
                    total,
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    from: skip + 1,
                    to: Math.min(skip + parseInt(limit), total)
                }
            }
        });
    } catch (error) {
        console.error('Get audit logs error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
