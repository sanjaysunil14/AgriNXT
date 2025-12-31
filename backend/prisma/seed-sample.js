import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting comprehensive seed...\n');

    // Clear existing data (optional - be careful!)
    console.log('🗑️  Clearing existing data...');
    await prisma.payment.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.dailyPrice.deleteMany();
    await prisma.collectionItem.deleteMany();
    await prisma.collectionChit.deleteMany();
    await prisma.routeStop.deleteMany();
    await prisma.route.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.farmerProfile.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.user.deleteMany();

    // Hash password
    const password_hash = await bcrypt.hash('password123', 10);

    // 1. Create Admin
    console.log('👤 Creating Admin...');
    const admin = await prisma.user.create({
        data: {
            full_name: 'Super Admin',
            phone_number: '9999999999',
            password_hash,
            role: 'ADMIN',
            status: 'APPROVED',
            is_active: true
        }
    });
    console.log(`✅ Admin created: ${admin.full_name} (${admin.phone_number})`);

    // 2. Create Buyers
    console.log('\n🏢 Creating Buyers...');
    const buyer1 = await prisma.user.create({
        data: {
            full_name: 'Ravi Kumar',
            phone_number: '9876543210',
            email: 'ravi@example.com',
            password_hash,
            role: 'BUYER',
            status: 'APPROVED',
            is_active: true,
            business_name: 'Fresh Veggies Co.',
            address: '123 Market Street, Chennai'
        }
    });

    const buyer2 = await prisma.user.create({
        data: {
            full_name: 'Priya Sharma',
            phone_number: '9876543211',
            email: 'priya@example.com',
            password_hash,
            role: 'BUYER',
            status: 'APPROVED',
            is_active: true,
            business_name: 'Green Harvest Traders',
            address: '456 Bazaar Road, Bangalore'
        }
    });
    console.log(`✅ Buyers created: ${buyer1.full_name}, ${buyer2.full_name}`);

    // 3. Create Farmers with GPS locations (around Chennai area)
    console.log('\n🌾 Creating Farmers...');
    const farmers = [];
    const farmerData = [
        { name: 'Murugan', phone: '9123456780', lat: 13.0827, lng: 80.2707, village: 'Kanchipuram' },
        { name: 'Lakshmi', phone: '9123456781', lat: 12.9716, lng: 79.1590, village: 'Vellore' },
        { name: 'Selvam', phone: '9123456782', lat: 13.0878, lng: 80.2785, village: 'Thiruvallur' },
        { name: 'Kamala', phone: '9123456783', lat: 12.8342, lng: 80.0444, village: 'Chengalpattu' },
        { name: 'Rajesh', phone: '9123456784', lat: 13.1189, lng: 80.2981, village: 'Poonamallee' },
        { name: 'Meena', phone: '9123456785', lat: 12.9141, lng: 79.1325, village: 'Ranipet' },
        { name: 'Kumar', phone: '9123456786', lat: 13.0475, lng: 80.2824, village: 'Tambaram' },
        { name: 'Saroja', phone: '9123456787', lat: 13.1475, lng: 80.2597, village: 'Avadi' }
    ];

    for (const fd of farmerData) {
        const farmer = await prisma.user.create({
            data: {
                full_name: fd.name,
                phone_number: fd.phone,
                password_hash,
                role: 'FARMER',
                status: 'APPROVED',
                is_active: true,
                latitude: fd.lat,
                longitude: fd.lng,
                payment_method: Math.random() > 0.5 ? 'UPI' : 'BANK',
                payment_value: Math.random() > 0.5 ? `${fd.name.toLowerCase()}@upi` : `BANK${Math.floor(Math.random() * 10000)}`
            }
        });

        const farmerProfile = await prisma.farmerProfile.create({
            data: {
                user_id: farmer.id,
                village_name: fd.village,
                latitude: fd.lat,
                longitude: fd.lng,
                payment_method: 'CASH',
                approval_status: 'APPROVED'
            }
        });

        farmers.push({ user: farmer, profile: farmerProfile });
    }
    console.log(`✅ Created ${farmers.length} farmers`);

    // 4. Create Bookings (some for today, some completed)
    console.log('\n📅 Creating Bookings...');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const vegetables = ['Tomato', 'Onion', 'Potato', 'Carrot', 'Cabbage', 'Beans', 'Brinjal'];

    // Today's bookings (PENDING/OPEN)
    const todayBookings = [];
    for (let i = 0; i < 5; i++) {
        const farmer = farmers[i];
        const booking = await prisma.booking.create({
            data: {
                farmer_id: farmer.profile.id,
                date: today,
                vegetable_type: vegetables[Math.floor(Math.random() * vegetables.length)],
                quantity_kg: 50 + Math.random() * 150,
                status: 'OPEN'
            }
        });
        todayBookings.push(booking);
    }
    console.log(`✅ Created ${todayBookings.length} bookings for today`);

    // Yesterday's bookings (COMPLETED with collections)
    console.log('\n📦 Creating Collection Chits...');
    const yesterdayBookings = [];
    for (let i = 0; i < 4; i++) {
        const farmer = farmers[i];
        const booking = await prisma.booking.create({
            data: {
                farmer_id: farmer.profile.id,
                date: yesterday,
                vegetable_type: vegetables[i % vegetables.length],
                quantity_kg: 80 + Math.random() * 120,
                status: 'COMPLETED'
            }
        });
        yesterdayBookings.push(booking);

        // Create route and route stop
        const route = await prisma.route.create({
            data: {
                buyer_id: buyer1.id,
                date: yesterday,
                status: 'COMPLETED',
                total_distance: 15 + Math.random() * 20
            }
        });

        const routeStop = await prisma.routeStop.create({
            data: {
                route_id: route.id,
                booking_id: booking.id,
                sequence_order: i + 1
            }
        });

        // Create collection chit
        const chitCode = `CH-${yesterday.toISOString().slice(0, 10).replace(/-/g, '')}-${String(i + 1).padStart(3, '0')}`;
        const chit = await prisma.collectionChit.create({
            data: {
                chit_code: chitCode,
                route_stop_id: routeStop.id,
                buyer_id: buyer1.id,
                farmer_id: farmer.user.id,
                total_weight: 0, // Will be calculated
                collection_date: yesterday,
                location_lat: farmer.user.latitude,
                location_lng: farmer.user.longitude,
                is_priced: true
            }
        });

        // Create collection items
        const numItems = 1 + Math.floor(Math.random() * 3);
        let totalWeight = 0;
        for (let j = 0; j < numItems; j++) {
            const weight = 30 + Math.random() * 70;
            totalWeight += weight;
            await prisma.collectionItem.create({
                data: {
                    chit_id: chit.id,
                    vegetable_name: vegetables[j % vegetables.length],
                    weight: weight
                }
            });
        }

        // Update chit with total weight
        await prisma.collectionChit.update({
            where: { id: chit.id },
            data: { total_weight: totalWeight }
        });
    }
    console.log(`✅ Created ${yesterdayBookings.length} completed collections`);

    // 5. Create Daily Prices
    console.log('\n💰 Creating Daily Prices...');
    const prices = {
        'Tomato': 25,
        'Onion': 30,
        'Potato': 20,
        'Carrot': 35,
        'Cabbage': 15,
        'Beans': 40,
        'Brinjal': 22
    };

    for (const [veg, price] of Object.entries(prices)) {
        await prisma.dailyPrice.create({
            data: {
                date: yesterday,
                vegetable_name: veg,
                price_per_kg: price
            }
        });
    }
    console.log(`✅ Created prices for ${Object.keys(prices).length} vegetables`);

    // 6. Create Invoices
    console.log('\n🧾 Creating Invoices...');
    for (let i = 0; i < 4; i++) {
        const farmer = farmers[i];
        const chits = await prisma.collectionChit.findMany({
            where: {
                farmer_id: farmer.user.id,
                collection_date: yesterday
            },
            include: {
                collection_items: true
            }
        });

        if (chits.length > 0) {
            const lineItems = [];
            let grandTotal = 0;

            for (const chit of chits) {
                for (const item of chit.collection_items) {
                    const pricePerKg = prices[item.vegetable_name] || 0;
                    const itemTotal = item.weight * pricePerKg;
                    grandTotal += itemTotal;

                    lineItems.push({
                        vegetable: item.vegetable_name,
                        weight: item.weight,
                        price_per_kg: pricePerKg,
                        total: itemTotal,
                        chit_code: chit.chit_code
                    });
                }
            }

            const invoice = await prisma.invoice.create({
                data: {
                    invoice_number: `INV-${yesterday.getFullYear()}-${String(i + 1).padStart(5, '0')}`,
                    buyer_id: buyer1.id,
                    farmer_id: farmer.user.id,
                    date: yesterday,
                    line_items: lineItems,
                    grand_total: grandTotal,
                    status: i < 2 ? 'PAID' : 'PENDING'
                }
            });

            // Create payments for paid invoices
            if (i < 2) {
                await prisma.payment.create({
                    data: {
                        invoice_id: invoice.id,
                        buyer_id: buyer1.id,
                        farmer_id: farmer.user.id,
                        amount: grandTotal,
                        mode: i === 0 ? 'UPI' : 'CASH',
                        transaction_ref: i === 0 ? `TXN${Date.now()}` : null,
                        payment_date: yesterday
                    }
                });
            }
        }
    }
    console.log('✅ Created invoices and payments');

    // 7. Create Audit Logs
    console.log('\n📝 Creating Audit Logs...');
    await prisma.auditLog.create({
        data: {
            admin_id: admin.id,
            action: 'APPROVE_USER',
            target_user_id: farmers[0].user.id,
            details: 'Approved farmer registration',
            ip_address: '127.0.0.1'
        }
    });
    console.log('✅ Created audit logs');

    // Summary
    console.log('\n📊 SEED SUMMARY:');
    console.log('================');
    console.log(`👤 Admin: 1 (Phone: 9999999999, Password: password123)`);
    console.log(`🏢 Buyers: 2 (Phone: 9876543210, 9876543211, Password: password123)`);
    console.log(`🌾 Farmers: ${farmers.length} (Phone: 9123456780-787, Password: password123)`);
    console.log(`📅 Today's Bookings: ${todayBookings.length} (OPEN)`);
    console.log(`📦 Completed Collections: ${yesterdayBookings.length}`);
    console.log(`🧾 Invoices: 4 (2 PAID, 2 PENDING)`);
    console.log(`💰 Daily Prices: ${Object.keys(prices).length} vegetables`);
    console.log('\n✅ Seed completed successfully!');
    console.log('\n🔑 LOGIN CREDENTIALS:');
    console.log('Admin: 9999999999 / password123');
    console.log('Buyer: 9876543210 / password123');
    console.log('Farmer: 9123456780 / password123');
}

main()
    .catch((e) => {
        console.error('❌ Error during seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
