const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://danceuser:dancepass123@localhost:5432/dance_class_db',
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      name: 'Admin User',
      passwordHash: adminPassword,
      role: 'ADMIN',
      phone: '+1234567890',
      verified: true,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create sample classes
  const classes = [
    {
      name: 'Hip Hop Basics',
      style: 'Hip Hop',
      level: 'BEGINNER',
      instructor: 'Mike Johnson',
      description: 'Learn fundamental hip hop moves and grooves. Perfect for beginners!',
      dayOfWeek: 1, // Monday
      startTime: '18:00',
      endTime: '19:30',
      duration: 90,
      capacity: 20,
      price: 15000,
      startDate: new Date('2025-01-06'),
      isActive: true,
    },
    {
      name: 'Contemporary Dance',
      style: 'Contemporary',
      level: 'INTERMEDIATE',
      instructor: 'Sarah Williams',
      description: 'Explore fluid movements and emotional expression through contemporary dance.',
      dayOfWeek: 3, // Wednesday
      startTime: '19:00',
      endTime: '20:30',
      duration: 90,
      capacity: 15,
      price: 18000,
      startDate: new Date('2025-01-08'),
      isActive: true,
    },
    {
      name: 'Ballet Fundamentals',
      style: 'Ballet',
      level: 'BEGINNER',
      instructor: 'Emma Martinez',
      description: 'Classical ballet technique for beginners. Build strength, flexibility, and grace.',
      dayOfWeek: 2, // Tuesday
      startTime: '17:00',
      endTime: '18:30',
      duration: 90,
      capacity: 18,
      price: 20000,
      startDate: new Date('2025-01-07'),
      isActive: true,
    },
    {
      name: 'Afrobeat Dance',
      style: 'Afrobeat',
      level: 'BEGINNER',
      instructor: 'David Okafor',
      description: 'High-energy Afrobeat dance class with authentic African moves and rhythms.',
      dayOfWeek: 5, // Friday
      startTime: '18:30',
      endTime: '20:00',
      duration: 90,
      capacity: 25,
      price: 12000,
      startDate: new Date('2025-01-10'),
      isActive: true,
    },
    {
      name: 'Jazz Dance Advanced',
      style: 'Jazz',
      level: 'ADVANCED',
      instructor: 'Lisa Chen',
      description: 'Advanced jazz technique with complex choreography and dynamic movements.',
      dayOfWeek: 4, // Thursday
      startTime: '19:30',
      endTime: '21:00',
      duration: 90,
      capacity: 12,
      price: 22000,
      startDate: new Date('2025-01-09'),
      isActive: true,
    },
  ];

  for (const classData of classes) {
    const created = await prisma.class.create({ data: classData });
    console.log('✅ Class created:', created.name);
  }

  // Create sample events
  const events = [
    {
      title: 'Annual Dance Showcase 2025',
      description: 'Join us for our spectacular annual dance showcase featuring performances by all our students and instructors. Witness amazing talent across multiple dance styles!',
      date: new Date('2025-02-15'),
      time: '19:00',
      venue: 'Grand Theater, Lagos',
      capacity: 500,
      price: 5000,
      imageUrl: null,
      isActive: true,
    },
    {
      title: 'Hip Hop Battle Championship',
      description: 'Compete in our exciting hip hop battle! Open to all levels. Cash prizes for winners!',
      date: new Date('2025-03-01'),
      time: '17:00',
      venue: 'Urban Dance Studio',
      capacity: 200,
      price: 3000,
      imageUrl: null,
      isActive: true,
    },
    {
      title: 'Afrobeat Workshop with Guest Instructor',
      description: 'Special workshop with international Afrobeat dancer and choreographer. Learn authentic moves and techniques!',
      date: new Date('2025-02-22'),
      time: '14:00',
      venue: 'Main Studio Hall',
      capacity: 50,
      price: 8000,
      imageUrl: null,
      isActive: true,
    },
    {
      title: 'Ballet Recital - Spring Edition',
      description: 'Classical ballet recital showcasing our ballet students. A beautiful evening of grace and artistry.',
      date: new Date('2025-03-20'),
      time: '18:30',
      venue: 'City Arts Center',
      capacity: 300,
      price: 4000,
      imageUrl: null,
      isActive: true,
    },
  ];

  for (const eventData of events) {
    const created = await prisma.event.create({ data: eventData });
    console.log('✅ Event created:', created.title);
  }

  console.log('🎉 Database seeded successfully!');
  console.log('\n📝 Test Accounts:');
  console.log('   Student: student@test.com / student123');
  console.log('   Admin: admin@test.com / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
