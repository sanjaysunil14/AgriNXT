import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Fix existing farmers who don't have farmer_profile records
 * This script creates farmer_profile for all farmers who are missing it
 */
async function fixExistingFarmers() {
    try {
        console.log('🔍 Finding farmers without profiles...');

        // Get all farmers
        const farmers = await prisma.user.findMany({
            where: {
                role: 'FARMER'
            },
            include: {
                farmer_profile: true
            }
        });

        console.log(`📊 Found ${farmers.length} total farmers`);

        // Filter farmers without profiles
        const farmersWithoutProfile = farmers.filter(f => !f.farmer_profile);

        console.log(`⚠️  ${farmersWithoutProfile.length} farmers missing profiles`);

        if (farmersWithoutProfile.length === 0) {
            console.log('✅ All farmers already have profiles!');
            return;
        }

        // Create profiles for farmers without them
        let created = 0;
        for (const farmer of farmersWithoutProfile) {
            try {
                await prisma.farmerProfile.create({
                    data: {
                        user_id: farmer.id,
                        village_name: farmer.district || 'Unknown',
                        latitude: farmer.latitude || 0,
                        longitude: farmer.longitude || 0,
                        payment_method: 'CASH',
                        approval_status: farmer.status || 'APPROVED'
                    }
                });
                created++;
                console.log(`✅ Created profile for: ${farmer.full_name} (ID: ${farmer.id})`);
            } catch (error) {
                console.error(`❌ Failed to create profile for ${farmer.full_name}:`, error.message);
            }
        }

        console.log(`\n🎉 Successfully created ${created} farmer profiles!`);
    } catch (error) {
        console.error('❌ Error fixing farmers:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the fix
fixExistingFarmers();
