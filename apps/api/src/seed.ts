import prisma from './lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin users
  const adminPassword = await bcrypt.hash('admin12345', 10);
  
  const adminUsers = [
    {
      name: 'Super Admin',
      nim: 'ADM001',
      email: 'admin@inventa.com',
      phone: '+62 811-2233-4455',
      faculty: 'Staff Admin',
      program: 'Administrator',
    },
    {
      name: 'Rizka Admin',
      nim: 'ADM002',
      email: 'rizkariz135@gmail.com',
      phone: '+62 812-3456-7891',
      faculty: 'Staff Admin',
      program: 'Administrator',
    },
    {
      name: 'Aurel Admin',
      nim: 'ADM003',
      email: 'aurelnovita2005@gmail.com',
      phone: '+62 812-3456-7892',
      faculty: 'Staff Admin',
      program: 'Administrator',
    },
    {
      name: 'Putri Admin',
      nim: 'ADM004',
      email: 'putrinelsya118@gmail.com',
      phone: '+62 812-3456-7893',
      faculty: 'Staff Admin',
      program: 'Administrator',
    },
    {
      name: 'Rahma Admin',
      nim: 'ADM005',
      email: 'rahmazahfarina@gmail.com',
      phone: '+62 812-3456-7894',
      faculty: 'Staff Admin',
      program: 'Administrator',
    },
  ];

  const createdAdmins = [];
  for (const adminData of adminUsers) {
    const admin = await prisma.user.upsert({
      where: { email: adminData.email },
      update: {},
      create: {
        ...adminData,
        password: adminPassword,
        role: 'ADMIN',
      },
    });
    createdAdmins.push(admin);
    console.log('✅ Admin user created:', admin.email);
  }

  const admin = createdAdmins[0]; // Use first admin as default for relations

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@inventa.com' },
    update: {},
    create: {
      name: 'Ahmad Widiyanto',
      nim: '2021010001',
      email: 'user@inventa.com',
      password: userPassword,
      phone: '+62 812-3456-7890',
      faculty: 'Fakultas Teknik',
      program: 'Teknik Informatika',
      role: 'USER',
    },
  });
  console.log('✅ Regular user created:', user.email);

  // Create categories
  const categories = [
    { name: 'Elektronik', icon: 'laptop-outline' },
    { name: 'Olahraga', icon: 'basketball-outline' },
    { name: 'Laboratorium', icon: 'flask-outline' },
    { name: 'Multimedia', icon: 'videocam-outline' },
    { name: 'Furniture', icon: 'bed-outline' },
    { name: 'Alat Tulis', icon: 'pencil-outline' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  console.log('✅ Categories created');

  // Create items
  const items = [
    {
      name: 'Laptop ASUS ROG',
      category: 'Elektronik',
      description: 'Laptop gaming ASUS ROG dengan spesifikasi tinggi untuk kebutuhan desain grafis dan programming.',
      image: '💻',
      available: 3,
      total: 5,
      condition: 'BAIK',
      location: 'Gedung A - Lt. 2',
      createdById: admin.id,
    },
    {
      name: 'Kamera Canon EOS',
      category: 'Multimedia',
      description: 'Kamera DSLR Canon EOS untuk dokumentasi acara kampus dan keperluan fotografi.',
      image: '📷',
      available: 2,
      total: 3,
      condition: 'BAIK',
      location: 'Gedung B - Lt. 1',
      createdById: admin.id,
    },
    {
      name: 'Proyektor Epson',
      category: 'Elektronik',
      description: 'Proyektor untuk presentasi dengan resolusi Full HD dan brightness tinggi.',
      image: '📽️',
      available: 5,
      total: 8,
      condition: 'BAIK',
      location: 'Gedung A - Lt. 1',
      createdById: admin.id,
    },
    {
      name: 'Bola Basket Molten',
      category: 'Olahraga',
      description: 'Bola basket official size untuk kegiatan olahraga dan turnamen.',
      image: '🏀',
      available: 8,
      total: 10,
      condition: 'BAIK',
      location: 'Ruang Olahraga',
      createdById: admin.id,
    },
    {
      name: 'Mikroskop Digital',
      category: 'Laboratorium',
      description: 'Mikroskop digital untuk praktikum biologi dan penelitian.',
      image: '🔬',
      available: 0,
      total: 4,
      condition: 'BAIK',
      location: 'Gedung C - Lab',
      createdById: admin.id,
    },
    {
      name: 'Tripod Kamera',
      category: 'Multimedia',
      description: 'Tripod professional untuk stabilitas kamera dan video recording.',
      image: '📐',
      available: 6,
      total: 6,
      condition: 'BAIK',
      location: 'Gedung B - Lt. 1',
      createdById: admin.id,
    },
    {
      name: 'Arduino Kit',
      category: 'Elektronik',
      description: 'Arduino starter kit untuk project IoT dan embedded system.',
      image: '🔌',
      available: 10,
      total: 15,
      condition: 'BAIK',
      location: 'Gedung C - Lab',
      createdById: admin.id,
    },
    {
      name: 'Papan Whiteboard',
      category: 'Furniture',
      description: 'Whiteboard portable untuk diskusi kelompok dan presentasi.',
      image: '📋',
      available: 4,
      total: 5,
      condition: 'CUKUP',
      location: 'Gedung A - Lt. 1',
      createdById: admin.id,
    },
  ];

  for (const item of items) {
    await prisma.item.create({
      data: item as any,
    });
  }
  console.log('✅ Items created');

  // Create some sample borrowings
  const laptopItem = await prisma.item.findFirst({
    where: { name: 'Laptop ASUS ROG' },
  });

  if (laptopItem) {
    await prisma.borrowing.create({
      data: {
        userId: user.id,
        itemId: laptopItem.id,
        quantity: 1,
        borrowDate: new Date('2024-10-28'),
        returnDate: new Date('2024-11-01'),
        status: 'ACTIVE',
      },
    });

    // Update user stats
    await prisma.user.update({
      where: { id: user.id },
      data: {
        totalBorrowings: 1,
        activeBorrowings: 1,
      },
    });
    console.log('✅ Sample borrowing created');
  }

  console.log('🎉 Seed completed successfully!');
  console.log('\n📝 Test credentials:');
  console.log('   Admin: admin@inventa.com / admin12345');
  console.log('   Admin: rizkariz135@gmail.com / admin12345');
  console.log('   Admin: aurelnovita2005@gmail.com / admin12345');
  console.log('   Admin: putrinelsya118@gmail.com / admin12345');
  console.log('   Admin: rahmazahfarina@gmail.com / admin12345');
  console.log('   User:  user@inventa.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
