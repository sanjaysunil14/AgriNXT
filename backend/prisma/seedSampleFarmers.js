import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Seed sample farmers across all 4 zones
 * Creates 2 farmers per zone (8 total) with realistic Tamil Nadu data
 */
async function seedSampleFarmers() {
    console.log('🌱 Seeding sample farmers across Tamil Nadu zones...\n');

    const farmers = [
        // NORTH ZONE - Chennai area
        {
            full_name: 'Ravi Kumar',
            phone_number: '9876543210',
            email: 'ravi.kumar@farmer.com',
            password: 'farmer123',
            district: 'CHENNAI',
            latitude: 13.0827,
            longitude: 80.2707,
            village: 'Tambaram'
        },
        {
            full_name: 'Priya Sharma',
            phone_number: '9876543211',
            email: 'priya.sharma@farmer.com',
            password: 'farmer123',
            district: 'KANCHIPURAM',
            latitude: 12.8342,
            longitude: 79.7036,
            village: 'Kanchipuram'
        },

        // SOUTH ZONE - Madurai area
        {
            full_name: 'Murugan',
            phone_number: '9123456780',
            email: 'murugan@farmer.com',
            password: 'farmer123',
            district: 'MADURAI',
            latitude: 9.9252,
            longitude: 78.1198,
            village: 'Melur'
        },
        {
            full_name: 'Lakshmi',
            phone_number: '9123456781',
            email: 'lakshmi@farmer.com',
            password: 'farmer123',
            district: 'VIRUDHUNAGAR',
            latitude: 9.5810,
            longitude: 77.9624,
            village: 'Sivakasi'
        },

        // EAST ZONE - Trichy area
        {
            full_name: 'Selvam',
            phone_number: '9234567890',
            email: 'selvam@farmer.com',
            password: 'farmer123',
            district: 'TIRUCHIRAPPALLI',
            latitude: 10.7905,
            longitude: 78.7047,
            village: 'Srirangam'
        },
        {
            full_name: 'Kavitha',
            phone_number: '9234567891',
            email: 'kavitha@farmer.com',
            password: 'farmer123',
            district: 'THANJAVUR',
            latitude: 10.7870,
            longitude: 79.1378,
            village: 'Kumbakonam'
        },

        // WEST ZONE - Coimbatore area
        {
            full_name: 'Rajesh',
            phone_number: '9345678901',
            email: 'rajesh@farmer.com',
            password: 'farmer123',
            district: 'COIMBATORE',
            latitude: 11.0168,
            longitude: 76.9558,
            village: 'Pollachi'
        },
        {
            full_name: 'Meena',
            phone_number: '9345678902',
            email: 'meena@farmer.com',
            password: 'farmer123',
            district: 'SALEM',
            latitude: 11.6643,
            longitude: 78.1460,
            village: 'Mettur'
        }
    ];

    const password_hash = await bcrypt.hash('farmer123', 10);

    for (const farmerData of farmers) {
        try {
            const existingFarmer = await prisma.user.findUnique({
                where: { phone_number: farmerData.phone_number }
            });

            if (existingFarmer) {
                console.log(`⚠️  Farmer ${farmerData.full_name} already exists (${farmerData.phone_number})`);
                continue;
            }

            // Determine zone based on district
            const zoneMap = {
                'CHENNAI': 'NORTH', 'KANCHIPURAM': 'NORTH',
                'MADURAI': 'SOUTH', 'VIRUDHUNAGAR': 'SOUTH',
                'TIRUCHIRAPPALLI': 'EAST', 'THANJAVUR': 'EAST',
                'COIMBATORE': 'WEST', 'SALEM': 'WEST'
            };

            const zone = zoneMap[farmerData.district];

            // Create farmer user
            const farmer = await prisma.user.create({
                data: {
                    full_name: farmerData.full_name,
                    phone_number: farmerData.phone_number,
                    email: farmerData.email,
                    password_hash,
                    role: 'FARMER',
                    status: 'APPROVED', // Pre-approved for testing
                    is_active: true,
                    latitude: farmerData.latitude,
                    longitude: farmerData.longitude,
                    district: farmerData.district,
                    zone: zone
                }
            });

            // Create farmer profile
            await prisma.farmerProfile.create({
                data: {
                    user_id: farmer.id,
                    village_name: farmerData.village,
                    latitude: farmerData.latitude,
                    longitude: farmerData.longitude,
                    payment_method: 'UPI',
                    approval_status: 'APPROVED'
                }
            });

            console.log(`✅ Created ${farmerData.full_name} (${zone} Zone - ${farmerData.district})`);
            console.log(`   Phone: ${farmerData.phone_number}`);
            console.log(`   Village: ${farmerData.village}\n`);
        } catch (error) {
            console.error(`❌ Error creating farmer ${farmerData.full_name}:`, error.message);
        }
    }

    console.log('✨ Farmer seeding completed!\n');
    console.log('═══════════════════════════════════════════════════');
    console.log('📋 SAMPLE FARMER CREDENTIALS');
    console.log('═══════════════════════════════════════════════════\n');

    console.log('🌾 All farmers use password: farmer123\n');

    console.log('NORTH Zone:');
    console.log('  - Ravi Kumar: 9876543210 (Chennai)');
    console.log('  - Priya Sharma: 9876543211 (Kanchipuram)\n');

    console.log('SOUTH Zone:');
    console.log('  - Murugan: 9123456780 (Madurai)');
    console.log('  - Lakshmi: 9123456781 (Virudhunagar)\n');

    console.log('EAST Zone:');
    console.log('  - Selvam: 9234567890 (Tiruchirappalli)');
    console.log('  - Kavitha: 9234567891 (Thanjavur)\n');

    console.log('WEST Zone:');
    console.log('  - Rajesh: 9345678901 (Coimbatore)');
    console.log('  - Meena: 9345678902 (Salem)\n');

    console.log('═══════════════════════════════════════════════════\n');
}

// Run the seed function
seedSampleFarmers()
    .catch((error) => {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
