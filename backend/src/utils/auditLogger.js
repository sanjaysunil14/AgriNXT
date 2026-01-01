import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function logAuditAction(userId, userRole, action, targetUserId = null, details = null, ipAddress = null) {
    try {
        await prisma.auditLog.create({
            data: {
                user_id: userId,
                user_role: userRole,
                action,
                target_user_id: targetUserId,
                details,
                ip_address: ipAddress
            }
        });
    } catch (error) {
        console.error('Audit log error:', error);
        // Don't throw - audit logging shouldn't break the main operation
    }
}
