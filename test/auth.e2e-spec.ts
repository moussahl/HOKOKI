import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { JwtStrategy } from '../src/auth/strategies/jwt.strategy';
import { ConfigModule } from '@nestjs/config';
import { User, UserRole } from '../src/database/entities/user.entity';
import { UsersModule } from '../src/users/users.module';
import { UsersService } from '../src/users/users.service';

const TEST_JWT_SECRET = 'test-secret';

const savedUser: User = {
  id: 'uuid-e2e-1',
  email: 'e2e@example.com',
  fullName: 'E2E User',
  passwordHash: '',
  role: UserRole.CITIZEN,
  preferredLanguage: 'ar',
  isVerifiedExpert: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  conversations: [],
  interests: [],
  procedureProgress: [],
  notifications: [],
  requestedExpertSessions: [],
  expertSessions: [],
};

const mockUserRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

describe('Auth endpoints (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({ secret: TEST_JWT_SECRET, signOptions: { expiresIn: '1h' } }),
        UsersModule,
      ],
      controllers: [AuthController],
      providers: [AuthService, JwtStrategy],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue(mockUserRepo)
      .overrideProvider('CONFIG_SERVICE')
      .useValue({ getOrThrow: () => TEST_JWT_SECRET, get: () => TEST_JWT_SECRET })
      .compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => jest.clearAllMocks());

  describe('POST /api/auth/register', () => {
    it('returns 400 when body is missing required fields', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'bad' })
        .expect(400);
    });

    it('returns 201 and a token on valid registration', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      mockUserRepo.create.mockReturnValue(savedUser);
      mockUserRepo.save.mockResolvedValue(savedUser);

      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'e2e@example.com', fullName: 'E2E User', password: 'password123' })
        .expect(201);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body.user.email).toBe('e2e@example.com');
    });

    it('returns 409 when email is already registered', async () => {
      mockUserRepo.findOne.mockResolvedValue(savedUser);

      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'e2e@example.com', fullName: 'E2E User', password: 'password123' })
        .expect(409);
    });
  });

  describe('POST /api/auth/login', () => {
    it('returns 400 when body is incomplete', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'e2e@example.com' })
        .expect(400);
    });

    it('returns 401 when user does not exist', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'password123' })
        .expect(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns 401 when no token is provided', () => {
      return request(app.getHttpServer()).get('/api/auth/me').expect(401);
    });
  });
});
