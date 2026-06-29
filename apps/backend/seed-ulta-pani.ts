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

  // Find or create Surguja District
  let district = await prisma.district.findUnique({
    where: { name: 'Surguja' }
  });

  if (!district) {
    district = await prisma.district.create({
      data: {
        name: 'Surguja',
        slug: 'surguja',
        description: 'Surguja region featuring beautiful hills and valleys.',
        image: '/uploads/ulta_pani_mainpat.jpeg'
      }
    });
  }

  // Create/Update Place
  const place = await prisma.place.upsert({
    where: { slug: 'ulta-pani-mainpat' },
    update: {
      heroImage: '/uploads/ulta_pani_mainpat.jpeg',
      featuredImage: '/uploads/ulta_pani_mainpat.jpeg',
    },
    create: {
      name: 'Ulta Pani',
      slug: 'ulta-pani-mainpat',
      shortDescription: 'A magical magnetic hill where water appears to flow upwards.',
      fullDescription: 'Ulta Pani near Mainpat, Surguja is a unique natural phenomenon where water flows uphill against gravity due to local optical/geological layouts.',
      districtId: district.id,
      categoryId: category.id,
      latitude: 22.8251,
      longitude: 83.2842,
      heroImage: '/uploads/ulta_pani_mainpat.jpeg',
      featuredImage: '/uploads/ulta_pani_mainpat.jpeg',
      verified: true
    }
  });

  // Create Image if it doesn't exist
  const imageCount = await prisma.image.count({
    where: { placeId: place.id, imageUrl: '/uploads/ulta_pani_mainpat.jpeg' }
  });

  if (imageCount === 0) {
    await prisma.image.create({
      data: {
        imageUrl: '/uploads/ulta_pani_mainpat.jpeg',
        caption: 'Ulta Pani magnetic stream',
        placeId: place.id
      }
    });
  }

  console.log('Successfully updated Ulta Pani Place and Image to use the new JPEG image.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
