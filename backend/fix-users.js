import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixUsers() {
    try {
        console.log('🔧 Fixing user roles and approval status...\n');

        // Fix User ID 1: Change from BUYER to FARMER and approve
        const user1 = await prisma.user.update({
            where: { id: 1 },
            data: {
                role: 'FARMER',
                status: 'APPROVED'
            }
        });
        console.log(`✅ User ID 1 (${user1.phone_number}): Role changed to FARMER, Status: APPROVED`);

        // Fix User ID 2: Change from FARMER to BUYER and approve
        const user2 = await prisma.user.update({
            where: { id: 2 },
            data: {
                role: 'BUYER',
                status: 'APPROVED'
            }
        });
        console.log(`✅ User ID 2 (${user2.phone_number}): Role changed to BUYER, Status: APPROVED`);

        console.log('\n🎉 All users fixed successfully!');

        // Display final user list
        console.log('\n📊 Final user list:');
        const allUsers = await prisma.user.findMany({
            select: {
                id: true,
                full_name: true,
                phone_number: true,
                role: true,
                status: true,
                is_active: true
            },
            orderBy: { id: 'asc' }
        });

        allUsers.forEach(user => {
            console.log(`\nID: ${user.id}`);
            console.log(`Name: ${user.full_name}`);
            console.log(`Phone: ${user.phone_number}`);
            console.log(`Role: ${user.role}`);
            console.log(`Status: ${user.status}`);
            console.log(`Active: ${user.is_active}`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixUsers();
