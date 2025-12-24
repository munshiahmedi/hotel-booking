const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    const adminPassword = await bcrypt.hash("Admin123!", 10);
    
    const admin = await prisma.user.update({
      where: { email: 'admin@example.com' },
      data: { 
        password_hash: adminPassword,
        is_active: true
      },
      include: { role: true }
    });
    
    console.log('Admin password reset successfully:', {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      is_active: admin.is_active,
      role: admin.role?.name || 'No role'
    });
    
    console.log('You can now login with:');
    console.log('Email: admin@example.com');
    console.log('Password: Admin123!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();
