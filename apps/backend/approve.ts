import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.place.updateMany({
    where: {
      verified: false
    },
    data: {
      verified: true
    }
  });

  console.log(`Successfully approved ${result.count} submitted coordinates (places).`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
