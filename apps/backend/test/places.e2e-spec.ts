import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PlacesModule } from '../src/modules/places/places.module';
import { PrismaService } from '../src/database/prisma.service';
import { JwtAuthGuard } from '../src/modules/auth/jwt-auth.guard';
import { RolesGuard } from '../src/modules/auth/roles.guard';

describe('PlacesController (e2e)', () => {
  let app: INestApplication;
  
  const mockPlace = {
    id: 'test-uuid-1',
    name: 'Tamra Gumar',
    slug: 'tamra-gumar',
    shortDescription: 'Catchy tagline',
    fullDescription: 'Long story',
    latitude: 19.2006,
    longitude: 81.6961,
    status: 'PUBLISHED',
    verified: true,
    district: { name: 'Bastar' },
    category: { name: 'Waterfalls', slug: 'waterfalls' }
  };

  const prismaMock = {
    place: {
      findUnique: jest.fn().mockImplementation((args: any) => {
        if (args.where.slug === 'tamra-gumar') return Promise.resolve(null); // allow creation check
        return Promise.resolve(mockPlace);
      }),
      findMany: jest.fn().mockResolvedValue([mockPlace]),
      create: jest.fn().mockResolvedValue(mockPlace),
      update: jest.fn().mockResolvedValue(mockPlace),
      delete: jest.fn().mockResolvedValue({ id: 'test-uuid-1' }),
    },
    category: {
      findMany: jest.fn().mockResolvedValue([{ id: 'cat-1', name: 'Waterfalls', slug: 'waterfalls' }]),
    },
    district: {
      findMany: jest.fn().mockResolvedValue([{ id: 'dist-1', name: 'Bastar', places: [mockPlace] }]),
    }
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PlacesModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/places (GET) - retrieve verified places', () => {
    return request(app.getHttpServer())
      .get('/places')
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toBe(1);
        expect(res.body[0].name).toBe('Tamra Gumar');
      });
  });

  it('/places/districts (GET) - retrieve districts list', () => {
    return request(app.getHttpServer())
      .get('/places/districts')
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toBe(1);
        expect(res.body[0].name).toBe('Bastar');
      });
  });

  it('/places (POST) - submit coordinate (Admin/Creator)', () => {
    return request(app.getHttpServer())
      .post('/places')
      .send({
        name: 'Tamra Gumar',
        shortDescription: 'Catchy tagline',
        categoryId: 'cat-1',
        districtId: 'dist-1',
        latitude: 19.2006,
        longitude: 81.6961
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.slug).toBe('tamra-gumar');
      });
  });
});
