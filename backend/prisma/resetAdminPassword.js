import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function resetAdminPassword() {
    console.log('🔑 Resetting admin password...\n');

    // Set a new password
    const newPassword = 'admin123'; // Change this to whatever you want
    const password_hash = await bcrypt.hash(newPassword, 10);

    try {
        // Find admin by phone
        const admin = await prisma.user.findUnique({
            where: { phone_number: '9999999999' }
        });

        if (!admin) {
            console.log('❌ Admin not found with phone 9999999999');
            return;
        }

        // Update password
        await prisma.user.update({
            where: { phone_number: '9999999999' },
            data: { password_hash }
        });

        console.log('✅ Admin password updated successfully!');
        console.log('\n📋 Login Credentials:');
        console.log('   Phone: 9999999999');
        console.log(`   Password: ${newPassword}\n`);
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

resetAdminPassword()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
