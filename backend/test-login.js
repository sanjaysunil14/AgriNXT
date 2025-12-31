import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function testLogin() {
    try {
        const phone = '9876543210'; // Buyer
        const password = 'password123';

        // Get user
        const user = await prisma.user.findUnique({
            where: { phone_number: phone }
        });

        if (!user) {
            console.log('❌ User not found');
            return;
        }

        console.log('User found:', {
            id: user.id,
            name: user.full_name,
            phone: user.phone_number,
            role: user.role,
            status: user.status
        });

        // Test password
        const isValid = await bcrypt.compare(password, user.password_hash);
        console.log('\nPassword valid:', isValid);

        if (!isValid) {
            console.log('❌ Password does not match!');
            console.log('Expected password: password123');
        } else {
            console.log('✅ Password matches! Login should work.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testLogin();
