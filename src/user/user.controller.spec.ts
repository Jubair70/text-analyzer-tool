import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles/roles.guard';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    create: jest.fn().mockResolvedValue({ id: 1, email: 'test@example.com', firstName: 'John' }),
    findOne: jest.fn().mockResolvedValue({ id: 1, email: 'test@example.com', firstName: 'John' }),
    update: jest.fn().mockResolvedValue({ id: 1, email: 'test@example.com', firstName: 'John Updated' }),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = { email: 'test@example.com', firstName: 'John', lastName: 'Doe',username:'',password:'' };
      const result = await controller.create(createUserDto);

      expect(userService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual({ id: 1, email: 'test@example.com', firstName: 'John' });
    });
  });

  describe('getProfile', () => {
    it('should return the profile of the authenticated user', async () => {
      const mockRequest = { user: { id: 1 } };
      const result = await controller.getProfile(mockRequest);

      expect(userService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual({ id: 1, email: 'test@example.com', firstName: 'John' });
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = { firstName: 'John Updated' };
      const result = await controller.update('1', updateUserDto);

      expect(userService.update).toHaveBeenCalledWith(1, updateUserDto);
      expect(result).toEqual({ id: 1, email: 'test@example.com', firstName: 'John Updated' });
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const result = await controller.remove('1');

      expect(userService.remove).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });
  });
});
