import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Check if category exists
  let category = await prisma.category.findUnique({
    where: { slug: 'viewpoints' }
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        name: 'Viewpoints',
        slug: 'viewpoints'
      }
    });
  }

  // Create Place
  const place = await prisma.place.upsert({
    where: { slug: 'ulta-pani-mainpat' },
    update: {
      heroImage: '/uploads/ulta_pani_mainpat.jpeg',
    },
    create: {
      name: 'Ulta Pani',
      slug: 'ulta-pani-mainpat',
      description: 'A magical magnetic hill where water appears to flow upwards.',
      district: 'Surguja',
      categoryId: category.id,
      latitude: 22.8251,
      longitude: 83.2842,
      heroImage: '/uploads/ulta_pani_mainpat.jpeg',
      verified: true
    }
  });

  // Create Media if it doesn't exist
  const mediaCount = await prisma.media.count({
    where: { placeId: place.id, url: '/uploads/ulta_pani_mainpat.jpeg' }
  });

  if (mediaCount === 0) {
    await prisma.media.create({
      data: {
        url: '/uploads/ulta_pani_mainpat.jpeg',
        type: 'IMAGE',
        placeId: place.id
      }
    });
  }

  console.log('Successfully updated Ulta Pani Place and Media to use the new JPEG image.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
