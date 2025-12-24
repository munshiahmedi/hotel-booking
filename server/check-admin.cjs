const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@example.com' },
      include: { role: true }
    });
    
    console.log('Admin user found:', admin ? 'Yes' : 'No');
    if (admin) {
      console.log('User details:', {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        is_active: admin.is_active,
        role: admin.role?.name || 'No role'
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
