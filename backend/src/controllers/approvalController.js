import { PrismaClient } from '@prisma/client';
import { logAuditAction } from '../utils/auditLogger.js';

const prisma = new PrismaClient();

// Get all pending users
export const getPendingUsers = async (req, res) => {
    try {
        const { role } = req.query; // Optional filter by role (FARMER or BUYER)

        const where = {
            status: 'PENDING'
        };

        if (role && ['FARMER', 'BUYER'].includes(role)) {
            where.role = role;
        }

        const pendingUsers = await prisma.user.findMany({
            where,
            select: {
                id: true,
                full_name: true,
                phone_number: true,
                email: true,
                role: true,
                status: true,
                // Farmer-specific
                latitude: true,
                longitude: true,
                // Buyer-specific
                business_name: true,
                address: true,
                created_at: true
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        res.status(200).json({
            success: true,
            data: {
                users: pendingUsers,
                total: pendingUsers.length
            }
        });
    } catch (error) {
        console.error('Get pending users error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Approve a user
export const approveUser = async (req, res) => {
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

        if (user.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: 'User is not pending approval'
            });
        }

        // Update user status to APPROVED
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { status: 'APPROVED' },
            select: {
                id: true,
                full_name: true,
                phone_number: true,
                role: true,
                status: true
            }
        });

        // Log audit action
        await logAuditAction(
            adminId,
            'APPROVE_USER',
            parseInt(id),
            `Approved ${user.role}: ${user.full_name}`,
            req.ip
        );

        res.status(200).json({
            success: true,
            message: 'User approved successfully',
            data: { user: updatedUser }
        });
    } catch (error) {
        console.error('Approve user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Reject a user
export const rejectUser = async (req, res) => {
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

        if (user.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: 'User is not pending approval'
            });
        }

        // Update user status to REJECTED
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { status: 'REJECTED' },
            select: {
                id: true,
                full_name: true,
                phone_number: true,
                role: true,
                status: true
            }
        });

        // Log audit action
        await logAuditAction(
            adminId,
            'REJECT_USER',
            parseInt(id),
            `Rejected ${user.role}: ${user.full_name}`,
            req.ip
        );

        res.status(200).json({
            success: true,
            message: 'User rejected successfully',
            data: { user: updatedUser }
        });
    } catch (error) {
        console.error('Reject user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
