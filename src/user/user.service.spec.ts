// src/user/user.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotFoundException } from '@nestjs/common';
import { Role } from '../auth/enums/role.enum';

describe('UserService', () => {
  let service: UserService;
  let userRepo: Repository<User>;

  // Mock data
  const mockUser = {
    id: 1,
    username: 'john_doe',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    hashedRefreshToken: 'hashed_token',
    role: Role.USER,
  };

  // Mock Repository
  const mockUserRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // a. Testing `create`
  describe('create', () => {
    it('should create and save a new user', async () => {
      const createUserDto = {
        username: 'jane_doe',
        email: 'jane.doe@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        password: 'securepassword', // Assume password is hashed elsewhere
        role: 'user',
      };

      const createdUser = { ...createUserDto, id: 2 } as User;

      mockUserRepo.create.mockReturnValue(createdUser);
      mockUserRepo.save.mockResolvedValue(createdUser);

      const result = await service.create(createUserDto);

      expect(userRepo.create).toHaveBeenCalledWith(createUserDto);
      expect(userRepo.save).toHaveBeenCalledWith(createdUser);
      expect(result).toEqual(createdUser);
    });

    
  });

  // b. Testing `findByEmail`
  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const email = 'john.doe@example.com';

      mockUserRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail(email);

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return undefined if user is not found by email', async () => {
      const email = 'nonexistent@example.com';

      mockUserRepo.findOne.mockResolvedValue(undefined);

      const result = await service.findByEmail(email);

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toBeUndefined();
    });
  });

  // c. Testing `findOne`
  describe('findOne', () => {
    it('should find a user by id with selected fields', async () => {
      const userId = 1;

      mockUserRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(userId);

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        select: ['id', 'firstName', 'lastName', 'hashedRefreshToken', 'role'],
      });
      expect(result).toEqual(mockUser);
    });

    it('should return undefined if user is not found by id', async () => {
      const userId = 99;

      mockUserRepo.findOne.mockResolvedValue(undefined);

      const result = await service.findOne(userId);

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        select: ['id', 'firstName', 'lastName', 'hashedRefreshToken', 'role'],
      });
      expect(result).toBeUndefined();
    });
  });

  // d. Testing `updateHashedRefreshToken`
  describe('updateHashedRefreshToken', () => {
    it('should update the hashedRefreshToken for the user', async () => {
      const userId = 1;
      const newHashedToken = 'new_hashed_token';

      const updateResult = { affected: 1 };

      mockUserRepo.update.mockResolvedValue(updateResult);

      const result = await service.updateHashedRefreshToken(userId, newHashedToken);

      expect(userRepo.update).toHaveBeenCalledWith(
        { id: userId },
        { hashedRefreshToken: newHashedToken },
      );
      expect(result).toEqual(updateResult);
    });

    it('should return affected count as 0 if no user is updated', async () => {
      const userId = 99;
      const newHashedToken = 'new_hashed_token';

      const updateResult = { affected: 0 };

      mockUserRepo.update.mockResolvedValue(updateResult);

      const result = await service.updateHashedRefreshToken(userId, newHashedToken);

      expect(userRepo.update).toHaveBeenCalledWith(
        { id: userId },
        { hashedRefreshToken: newHashedToken },
      );
      expect(result).toEqual(updateResult);
    });
  });

  // e. Testing `findByUsername`
  describe('findByUsername', () => {
    it('should find a user by username', async () => {
      const username = 'john_doe';

      mockUserRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.findByUsername(username);

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { username },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return undefined if user is not found by username', async () => {
      const username = 'nonexistent_user';

      mockUserRepo.findOne.mockResolvedValue(undefined);

      const result = await service.findByUsername(username);

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { username },
      });
      expect(result).toBeUndefined();
    });
  });

  // f. Testing `findById`
  describe('findById', () => {
    it('should find a user by id', async () => {
      const userId = 1;

      mockUserRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.findById(userId);

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return undefined if user is not found by id', async () => {
      const userId = 99;

      mockUserRepo.findOne.mockResolvedValue(undefined);

      const result = await service.findById(userId);

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(result).toBeUndefined();
    });
  });

  // g. Testing Unimplemented Methods
  describe('findAll, update, remove', () => {
    it('findAll should return a string message', () => {
      const result = service.findAll();
      expect(result).toBe('This action returns all user');
    });

    it('update should return a string message', () => {
      const userId = 1;
      const updateUserDto: UpdateUserDto = {
        firstName: 'Johnny',
        lastName: 'Doe',
        // Add other fields as necessary
      };

      const result = service.update(userId, updateUserDto);
      expect(result).toBe(`This action updates a #${userId} user`);
    });

    it('remove should return a string message', () => {
      const userId = 1;

      const result = service.remove(userId);
      expect(result).toBe(`This action removes a #${userId} user`);
    });
  });
});
