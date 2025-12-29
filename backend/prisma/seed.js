import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // Check if Super Admin already exists
    const existingAdmin = await prisma.user.findUnique({
        where: { phone_number: '9999999999' }
    });

    if (existingAdmin) {
        console.log('⚠️  Super Admin already exists. Skipping seed.');
        return;
    }

    // Hash the password
    const password_hash = await bcrypt.hash('admin', 10);

    // Create Super Admin
    const superAdmin = await prisma.user.create({
        data: {
            full_name: 'Super Admin',
            phone_number: '9999999999',
            password_hash,
            role: 'ADMIN',
            status: 'APPROVED',  // Admin is pre-approved
            is_active: true
        }
    });

    console.log('✅ Super Admin created successfully!');
    console.log('📱 Phone: 9999999999');
    console.log('🔑 Password: admin');
    console.log(`👤 User ID: ${superAdmin.id}`);
}

main()
    .catch((e) => {
        console.error('❌ Error during seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
