import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listAdmins() {
    console.log('🔍 Finding all admin accounts...\n');

    try {
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' },
            select: {
                id: true,
                full_name: true,
                phone_number: true,
                email: true,
                status: true,
                is_active: true
            }
        });

        if (admins.length === 0) {
            console.log('❌ No admin accounts found in database!');
            console.log('\n💡 You need to create an admin account first.');
            return;
        }

        console.log(`✅ Found ${admins.length} admin account(s):\n`);
        admins.forEach((admin, index) => {
            console.log(`${index + 1}. ${admin.full_name}`);
            console.log(`   Phone: ${admin.phone_number}`);
            console.log(`   Email: ${admin.email || 'N/A'}`);
            console.log(`   Status: ${admin.status}`);
            console.log(`   Active: ${admin.is_active}\n`);
        });
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

listAdmins()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
