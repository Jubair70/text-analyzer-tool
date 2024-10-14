// src/text/text.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { TextService } from './text.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Text } from '../entities/text.entity';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Cache } from 'cache-manager';

describe('TextService', () => {
  let service: TextService;
  let textRepo: Repository<Text>;
  let userService: UserService;
  let cacheManager: Cache;

  // Mock data
  const mockUser = { id: 1, username: 'john_doe' };
  const mockText: Text = {
    id: '1',
    content: 'This is a sample text.',
    user: mockUser,
  } as any;

  // Mock Repository
  const mockTextRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  // Mock UserService
  const mockUserService = {
    findById: jest.fn(),
  };

  // Mock CacheManager
  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TextService,
        {
          provide: getRepositoryToken(Text),
          useValue: mockTextRepo,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<TextService>(TextService);
    textRepo = module.get<Repository<Text>>(getRepositoryToken(Text));
    userService = module.get<UserService>(UserService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and save a new text', async () => {
      const content = 'This is a sample text.';
      const userId = 1;

      mockUserService.findById.mockResolvedValue(mockUser);
      mockTextRepo.create.mockReturnValue(mockText);
      mockTextRepo.save.mockResolvedValue(mockText);

      const result = await service.create(content, userId);

      expect(userService.findById).toHaveBeenCalledWith(userId);
      expect(textRepo.create).toHaveBeenCalledWith({ content, user: mockUser });
      expect(textRepo.save).toHaveBeenCalledWith(mockText);
      expect(result).toEqual(mockText);
    });

    it('should throw NotFoundException if user is not found', async () => {
      const content = 'This is a sample text.';
      const userId = 1;

      mockUserService.findById.mockResolvedValue(undefined);

      await expect(service.create(content, userId)).rejects.toThrow(
        NotFoundException,
      );

      expect(userService.findById).toHaveBeenCalledWith(userId);
      expect(textRepo.create).not.toHaveBeenCalled();
      expect(textRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all texts for the user', async () => {
      const userId = 1;
      const texts = [mockText];

      mockUserService.findById.mockResolvedValue(mockUser);
      mockTextRepo.find.mockResolvedValue(texts);

      const result = await service.findAll(userId);

      expect(userService.findById).toHaveBeenCalledWith(userId);
      expect(textRepo.find).toHaveBeenCalledWith({
        where: { user: { id: userId } },
        relations: { user: true },
      });
      expect(result).toEqual(texts);
    });

    it('should throw NotFoundException if user is not found', async () => {
      const userId = 1;

      mockUserService.findById.mockResolvedValue(undefined);

      await expect(service.findAll(userId)).rejects.toThrow(NotFoundException);

      expect(userService.findById).toHaveBeenCalledWith(userId);
      expect(textRepo.find).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return the text if it belongs to the user', async () => {
      const textId = '1';
      const userId = 1;

      mockTextRepo.findOne.mockResolvedValue(mockText);

      const result = await service.findOne(textId, userId);

      expect(textRepo.findOne).toHaveBeenCalledWith({
        where: { id: textId },
        relations: ['user'],
      });
      expect(result).toEqual(mockText);
    });

    it('should throw NotFoundException if text is not found', async () => {
      const textId = '1';
      const userId = 1;

      mockTextRepo.findOne.mockResolvedValue(undefined);

      await expect(service.findOne(textId, userId)).rejects.toThrow(
        NotFoundException,
      );

      expect(textRepo.findOne).toHaveBeenCalledWith({
        where: { id: textId },
        relations: ['user'],
      });
    });

    it('should throw ForbiddenException if text does not belong to the user', async () => {
      const textId = '1';
      const userId = 2; // Different user

      const textWithDifferentUser = {
        ...mockText,
        user: { id: 3, username: 'jane_doe' },
      };

      mockTextRepo.findOne.mockResolvedValue(textWithDifferentUser);

      await expect(service.findOne(textId, userId)).rejects.toThrow(
        ForbiddenException,
      );

      expect(textRepo.findOne).toHaveBeenCalledWith({
        where: { id: textId },
        relations: ['user'],
      });
    });
  });
  describe('update', () => {
    it('should update the text content if it belongs to the user', async () => {
      const textId = '1';
      const userId = 1;
      const newContent = 'Updated content';

      const existingText = { ...mockText };
      const updatedText = { ...mockText, content: newContent };

      mockTextRepo.findOne.mockResolvedValue(existingText);
      mockTextRepo.save.mockResolvedValue(updatedText);

      const result = await service.update(textId, newContent, userId);

      expect(textRepo.save).toHaveBeenCalledWith(updatedText);
      expect(result).toEqual(updatedText);
    });

    it('should throw NotFoundException if text does not exist', async () => {
      const textId = '1';
      const userId = 1;
      const newContent = 'Updated content';

      mockTextRepo.findOne.mockResolvedValue(undefined);

      await expect(service.update(textId, newContent, userId)).rejects.toThrow(
        NotFoundException,
      );

      expect(textRepo.save).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if text does not belong to the user', async () => {
      const textId = '1';
      const userId = 2; // Different user
      const newContent = 'Updated content';

      const textWithDifferentUser = {
        ...mockText,
        user: { id: 3, username: 'jane_doe' },
      };

      mockTextRepo.findOne.mockResolvedValue(textWithDifferentUser);

      await expect(service.update(textId, newContent, userId)).rejects.toThrow(
        ForbiddenException,
      );

      expect(textRepo.save).not.toHaveBeenCalled();
    });
  });
  describe('remove', () => {
    it('should remove the text if it belongs to the user', async () => {
      const textId = '1';
      const userId = 1;

      mockTextRepo.delete.mockResolvedValue({ affected: 1 });

      await service.remove(textId, userId);

      expect(textRepo.delete).toHaveBeenCalledWith({
        id: textId,
        user: { id: userId },
      });
    });

    it('should throw NotFoundException if text does not exist', async () => {
      const textId = '1';
      const userId = 1;

      mockTextRepo.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(textId, userId)).rejects.toThrow(
        NotFoundException,
      );

      expect(textRepo.delete).toHaveBeenCalledWith({
        id: textId,
        user: { id: userId },
      });
    });
  });
  describe('countWords', () => {
    it('should return cached word count if available', async () => {
      const content = "It's a beautiful day!";
      const cachedCount = 5;

      mockCacheManager.get.mockResolvedValue(cachedCount);

      const result = await service.countWords(content);

      expect(cacheManager.get).toHaveBeenCalledWith(`countWords:${content}`);

      expect(result).toBe(cachedCount);
    });

    it('should compute and cache word count if not cached', async () => {
      const content = "It's a beautiful day!";
      const computedCount = 5;

      mockCacheManager.get.mockResolvedValue(undefined);
      jest.spyOn(service, 'computeCountWords').mockReturnValue(computedCount);
      mockCacheManager.set.mockResolvedValue(undefined);

      const result = await service.countWords(content);

      expect(cacheManager.get).toHaveBeenCalledWith(`countWords:${content}`);
      expect(service.computeCountWords).toHaveBeenCalledWith(content);
      expect(cacheManager.set).toHaveBeenCalledWith(
        `countWords:${content}`,
        computedCount,
      );
      expect(result).toBe(computedCount);
    });
  });

  describe('countCharacters', () => {
    it('should return cached character count if available', async () => {
      const content = 'Hello World!';
      const excludePunctuation = true;
      const cachedCount = 10;

      mockCacheManager.get.mockResolvedValue(cachedCount);

      const result = await service.countCharacters(content, excludePunctuation);

      expect(cacheManager.get).toHaveBeenCalledWith(
        `countCharacters:${excludePunctuation}:${content}`,
      );

      expect(result).toBe(cachedCount);
    });

    it('should compute and cache character count if not cached', async () => {
      const content = 'Hello World!';
      const excludePunctuation = true;
      const computedCount = 10;

      mockCacheManager.get.mockResolvedValue(undefined);
      jest
        .spyOn(service, 'computeCountCharacters')
        .mockReturnValue(computedCount);
      mockCacheManager.set.mockResolvedValue(undefined);

      const result = await service.countCharacters(content, excludePunctuation);

      expect(cacheManager.get).toHaveBeenCalledWith(
        `countCharacters:${excludePunctuation}:${content}`,
      );
      expect(service.computeCountCharacters).toHaveBeenCalledWith(content);
      expect(cacheManager.set).toHaveBeenCalledWith(
        `countCharacters:${excludePunctuation}:${content}`,
        computedCount,
      );
      expect(result).toBe(computedCount);
    });
  });

  describe('countSentences', () => {
   
    it('should return 1 for a single sentence', () => {
      const content = 'This is a single sentence.';
      const result = service.computeCountSentences(content);
      expect(result).toBe(1);
    });

    it('should return cached sentence count if available', async () => {
      const content = 'This is a sentence. This is another!';
      const cachedCount = 2;

      mockCacheManager.get.mockResolvedValue(cachedCount);

      const result = await service.countSentences(content);

      expect(cacheManager.get).toHaveBeenCalledWith(
        `countSentences:${content}`,
      );

      expect(result).toBe(cachedCount);
    });

    it('should compute and cache sentence count if not cached', async () => {
      const content = 'This is a sentence. This is another!';
      const computedCount = 2;

      mockCacheManager.get.mockResolvedValue(undefined);
      jest
        .spyOn(service, 'computeCountSentences')
        .mockReturnValue(computedCount);
      mockCacheManager.set.mockResolvedValue(undefined);

      const result = await service.countSentences(content);

      expect(cacheManager.get).toHaveBeenCalledWith(
        `countSentences:${content}`,
      );
      expect(service.computeCountSentences).toHaveBeenCalledWith(content);
      expect(cacheManager.set).toHaveBeenCalledWith(
        `countSentences:${content}`,
        computedCount,
      );
      expect(result).toBe(computedCount);
    });
  });

  describe('countParagraphs', () => {
    it('should return cached paragraph count if available', async () => {
      const content = 'Paragraph one.\n\nParagraph two.';
      const cachedCount = 2;

      mockCacheManager.get.mockResolvedValue(cachedCount);

      const result = await service.countParagraphs(content);

      expect(cacheManager.get).toHaveBeenCalledWith(
        `countParagraphs:${content}`,
      );
      expect(result).toBe(cachedCount);
    });

    it('should compute and cache paragraph count if not cached', async () => {
      const content = 'Paragraph one.\n\nParagraph two.';
      const computedCount = 2;

      mockCacheManager.get.mockResolvedValue(undefined);
      jest
        .spyOn(service, 'computeCountParagraphs')
        .mockReturnValue(computedCount);
      mockCacheManager.set.mockResolvedValue(undefined);

      const result = await service.countParagraphs(content);

      expect(cacheManager.get).toHaveBeenCalledWith(
        `countParagraphs:${content}`,
      );
      expect(service.computeCountParagraphs).toHaveBeenCalledWith(content);
      expect(cacheManager.set).toHaveBeenCalledWith(
        `countParagraphs:${content}`,
        computedCount,
      );
      expect(result).toBe(computedCount);
    });
  });

  describe('longestWordInParagraphs', () => {
    it('should return cached longest words if available', async () => {
      const content = 'This is a sample paragraph.\nAnother sample paragraph.';
      const cachedLongestWords = ['sample', 'another'];

      mockCacheManager.get.mockResolvedValue(cachedLongestWords);

      const result = await service.longestWordInParagraphs(content);

      expect(cacheManager.get).toHaveBeenCalledWith(
        `longestWordInParagraphs:${content}`,
      );
      expect(result).toEqual(cachedLongestWords);
    });

    it('should compute and cache longest words if not cached', async () => {
      const content = 'This is a sample paragraph.\nAnother sample paragraph.';
      const computedLongestWords = ['sample', 'another'];

      mockCacheManager.get.mockResolvedValue(undefined);
      jest
        .spyOn(service, 'computeLongestWordInParagraphs')
        .mockReturnValue(computedLongestWords);
      mockCacheManager.set.mockResolvedValue(undefined);

      const result = await service.longestWordInParagraphs(content);

      expect(cacheManager.get).toHaveBeenCalledWith(
        `longestWordInParagraphs:${content}`,
      );
      expect(service.computeLongestWordInParagraphs).toHaveBeenCalledWith(
        content,
      );
      expect(cacheManager.set).toHaveBeenCalledWith(
        `longestWordInParagraphs:${content}`,
        computedLongestWords,
      );
      expect(result).toEqual(computedLongestWords);
    });
  });

  describe('getUserReport', () => {
    it('should throw NotFoundException when no texts are found', async () => {
      const userId = 1;
      jest.spyOn(service, 'findAll').mockResolvedValue([]);

      await expect(service.getUserReport(userId)).resolves.toEqual({
        userId,
        texts: [],
      });

      expect(service.findAll).toHaveBeenCalledWith(userId);
    });
    it('should throw NotFoundException if user is not found', async () => {
      const userId = 1;
      mockUserService.findById.mockResolvedValue(undefined);
      await expect(service.getUserReport(userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(userService.findById).toHaveBeenCalledWith(userId);
    });
  });
});
