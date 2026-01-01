import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Seed initial users for the system:
 * - 1 Admin account
 * - 4 Zone Buyers (North, South, East, West)
 */
async function seedInitialUsers() {
    console.log('🌱 Seeding initial users for Tamil Nadu Procurement System...\n');

    // ========== ADMIN ACCOUNT ==========
    console.log('👤 Creating Admin Account...');
    try {
        const existingAdmin = await prisma.user.findUnique({
            where: { phone_number: '9999999999' }
        });

        if (existingAdmin) {
            console.log('⚠️  Admin already exists\n');
        } else {
            const adminPassword = await bcrypt.hash('admin123', 10);

            await prisma.user.create({
                data: {
                    full_name: 'Super Admin',
                    phone_number: '9999999999',
                    email: 'admin@procurement.com',
                    password_hash: adminPassword,
                    role: 'ADMIN',
                    status: 'APPROVED',
                    is_active: true
                }
            });

            console.log('✅ Admin account created');
            console.log('   Phone: 9999999999');
            console.log('   Password: admin123\n');
        }
    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
    }

    // ========== ZONE BUYERS ==========
    console.log('🏢 Creating Zone Buyers...\n');

    const buyers = [
        {
            full_name: 'North Zone Buyer',
            phone_number: '9000000001',
            email: 'buyer.north@procurement.com',
            password: 'Buyer@2026',
            business_name: 'North Zone Procurement Hub',
            address: 'Chennai, Tamil Nadu',
            zone: 'NORTH'
        },
        {
            full_name: 'South Zone Buyer',
            phone_number: '9000000002',
            email: 'buyer.south@procurement.com',
            password: 'Buyer@2026',
            business_name: 'South Zone Procurement Hub',
            address: 'Madurai, Tamil Nadu',
            zone: 'SOUTH'
        },
        {
            full_name: 'East Zone Buyer',
            phone_number: '9000000003',
            email: 'buyer.east@procurement.com',
            password: 'Buyer@2026',
            business_name: 'East Zone Procurement Hub',
            address: 'Tiruchirappalli, Tamil Nadu',
            zone: 'EAST'
        },
        {
            full_name: 'West Zone Buyer',
            phone_number: '9000000004',
            email: 'buyer.west@procurement.com',
            password: 'Buyer@2026',
            business_name: 'West Zone Procurement Hub',
            address: 'Coimbatore, Tamil Nadu',
            zone: 'WEST'
        }
    ];

    for (const buyerData of buyers) {
        try {
            const existingBuyer = await prisma.user.findUnique({
                where: { phone_number: buyerData.phone_number }
            });

            if (existingBuyer) {
                console.log(`⚠️  ${buyerData.zone} Zone Buyer already exists (${buyerData.phone_number})`);
                continue;
            }

            const password_hash = await bcrypt.hash(buyerData.password, 10);

            await prisma.user.create({
                data: {
                    full_name: buyerData.full_name,
                    phone_number: buyerData.phone_number,
                    email: buyerData.email,
                    password_hash,
                    business_name: buyerData.business_name,
                    address: buyerData.address,
                    zone: buyerData.zone,
                    role: 'BUYER',
                    status: 'APPROVED',
                    is_active: true
                }
            });

            console.log(`✅ Created ${buyerData.zone} Zone Buyer`);
            console.log(`   Phone: ${buyerData.phone_number}`);
            console.log(`   Email: ${buyerData.email}`);
            console.log(`   Business: ${buyerData.business_name}\n`);
        } catch (error) {
            console.error(`❌ Error creating ${buyerData.zone} zone buyer:`, error.message);
        }
    }

    console.log('✨ User seeding completed!\n');
    console.log('═══════════════════════════════════════════════════');
    console.log('📋 LOGIN CREDENTIALS');
    console.log('═══════════════════════════════════════════════════\n');

    console.log('👤 ADMIN:');
    console.log('   Phone: 9999999999');
    console.log('   Password: admin123\n');

    console.log('🏢 ZONE BUYERS:');
    console.log('   North: 9000000001 / Buyer@2026');
    console.log('   South: 9000000002 / Buyer@2026');
    console.log('   East:  9000000003 / Buyer@2026');
    console.log('   West:  9000000004 / Buyer@2026\n');

    console.log('═══════════════════════════════════════════════════\n');
}

// Run the seed function
seedInitialUsers()
    .catch((error) => {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
