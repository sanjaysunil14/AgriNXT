import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createFarmerProfiles() {
    try {
        // Find all approved farmers
        const farmers = await prisma.user.findMany({
            where: {
                role: 'FARMER',
                status: 'APPROVED'
            },
            include: {
                farmer_profile: true
            }
        });

        console.log(`Found ${farmers.length} approved farmers`);

        // Create profiles for farmers who don't have one
        for (const farmer of farmers) {
            if (!farmer.farmer_profile) {
                console.log(`Creating profile for farmer: ${farmer.full_name} (ID: ${farmer.id})`);

                // Use farmer's GPS coordinates from User model
                const latitude = farmer.latitude || 0.0;
                const longitude = farmer.longitude || 0.0;

                await prisma.farmerProfile.create({
                    data: {
                        user_id: farmer.id,
                        village_name: 'Unknown', // Can be updated later
                        latitude: latitude,
                        longitude: longitude,
                        payment_method: 'CASH',
                        approval_status: 'APPROVED'
                    }
                });

                console.log(`✓ Profile created for ${farmer.full_name}`);
            } else {
                console.log(`✓ Profile already exists for ${farmer.full_name}`);
            }
        }

        console.log('\n✅ All farmer profiles created successfully!');
    } catch (error) {
        console.error('Error creating farmer profiles:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createFarmerProfiles();
