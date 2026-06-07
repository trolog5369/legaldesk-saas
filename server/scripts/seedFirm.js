require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User.model');

(async () => {
  try {
    // Step 1 — Connect to MongoDB
    console.log('[SEED] Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[SEED] MongoDB connected:', mongoose.connection.host);

    // Step 2 — Hash shared password once
    const hash = await bcrypt.hash('Insignia@2026', 10);
    console.log('[SEED] Password hash computed (bcryptjs, 10 salt rounds)');

    // Step 3 — Build user roster
    const users = [
      {
        name: 'Adv. Swapnil Kishor Malve',
        email: 'swapnil.malve@insignialaw.in',
        password: hash,
        role: 'admin',
        phone: '+91-00000-00001',
        language: 'en',
        isActive: true,
      },
      {
        name: 'Adv. Lata Sukhdev Gaikwad',
        email: 'lata.gaikwad@insignialaw.in',
        password: hash,
        role: 'lawyer',
        phone: '+91-00000-00002',
        language: 'en',
        isActive: true,
        barCouncilNumber: 'MAH/1001/2026',
        specialization: 'Civil',
        hourlyRate: 500,
      },
      {
        name: 'Adv. Vaishali Digambar Chabukswar',
        email: 'vaishali.chabukswar@insignialaw.in',
        password: hash,
        role: 'lawyer',
        phone: '+91-00000-00003',
        language: 'en',
        isActive: true,
        barCouncilNumber: 'MAH/1002/2026',
        specialization: 'Criminal',
        hourlyRate: 500,
      },
      {
        name: 'Adv. Swapnil Sunil Satav',
        email: 'swapnil.satav@insignialaw.in',
        password: hash,
        role: 'lawyer',
        phone: '+91-00000-00004',
        language: 'en',
        isActive: true,
        barCouncilNumber: 'MAH/1003/2026',
        specialization: 'Criminal',
        hourlyRate: 500,
      },
      {
        name: 'Adv. Khushi Jagdish Bora',
        email: 'khushi.bora@insignialaw.in',
        password: hash,
        role: 'lawyer',
        phone: '+91-00000-00005',
        language: 'en',
        isActive: true,
        barCouncilNumber: 'MAH/1004/2026',
        specialization: 'Corporate',
        hourlyRate: 500,
      },
      {
        name: 'Adv. Omkar Nanasaheb Kawale',
        email: 'omkar.kawale@insignialaw.in',
        password: hash,
        role: 'lawyer',
        phone: '+91-00000-00006',
        language: 'en',
        isActive: true,
        barCouncilNumber: 'MAH/1005/2026',
        specialization: 'Corporate',
        hourlyRate: 500,
      },
      {
        name: 'Adv. Sanket Sampat Jadhav',
        email: 'sanket.jadhav@insignialaw.in',
        password: hash,
        role: 'lawyer',
        phone: '+91-00000-00007',
        language: 'en',
        isActive: true,
        barCouncilNumber: 'MAH/1006/2026',
        specialization: 'Corporate',
        hourlyRate: 500,
      },
    ];

    // Step 4 — Cleanup prior admin/lawyer accounts
    const deleteResult = await User.deleteMany({ role: { $in: ['admin', 'lawyer'] } });
    console.log('[SEED] Cleared existing admin/lawyer accounts:', deleteResult.deletedCount, 'removed');

    // Step 5 — Insert and verify
    const created = await User.insertMany(users, { ordered: true });

    console.log('[SEED]');
    for (const user of created) {
      const spec = user.specialization ? ` (${user.specialization})` : '';
      console.log(`[SEED] ✅ Created: ${user.name} | ${user.email} | ${user.role}${spec}`);
    }

    console.log('[SEED]');
    console.log('[SEED] ─────────────────────────────────────────');
    console.log('[SEED] Insignia Law Firm roster seeding complete.');
    console.log('[SEED] Total accounts created:', created.length);
    console.log('[SEED] Default password: Insignia@2026');
    console.log('[SEED] Remind the firm to update passwords on first login.');
    console.log('[SEED] ─────────────────────────────────────────');
  } catch (err) {
    console.error('[SEED] ❌ Fatal error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('[SEED] MongoDB connection closed.');
    process.exit(0);
  }
})();
