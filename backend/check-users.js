import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                full_name: true,
                phone_number: true,
                role: true,
                status: true,
                is_active: true
            }
        });

        console.log('📊 Users in database:\n');

        if (users.length === 0) {
            console.log('⚠️  No users found in database!');
        } else {
            users.forEach(user => {
                console.log(`ID: ${user.id}`);
                console.log(`Name: ${user.full_name}`);
                console.log(`Phone: ${user.phone_number}`);
                console.log(`Role: ${user.role}`);
                console.log(`Status: ${user.status}`);
                console.log(`Active: ${user.is_active}`);
                console.log('---');
            });
            console.log(`\nTotal users: ${users.length}`);
        }
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsers();
