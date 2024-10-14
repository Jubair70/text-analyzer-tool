import { Test, TestingModule } from '@nestjs/testing';
import { TextController } from './text.controller';
import { TextService } from './text.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { Request } from 'express';

describe('TextController', () => {
  let controller: TextController;
  let textService: TextService;

  const mockTextService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    countWords: jest.fn(),
    countCharacters: jest.fn(),
    countSentences: jest.fn(),
    countParagraphs: jest.fn(),
    longestWordInParagraphs: jest.fn(),
    getUserReport: jest.fn(),
  };

  const mockRequest = (userId: number): Request =>
    ({
      user: { id: userId },
    }) as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TextController],
      providers: [
        {
          provide: TextService,
          useValue: mockTextService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<TextController>(TextController);
    textService = module.get<TextService>(TextService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new text for the user', async () => {
      const content = 'This is a sample text';
      const userId = 1;
      const createdText = { id: 1, content };

      mockTextService.create.mockResolvedValue(createdText);

      const result = await controller.create(content, mockRequest(userId));

      expect(textService.create).toHaveBeenCalledWith(content, userId);
      expect(result).toEqual(createdText);
    });
  });

  describe('findAll', () => {
    it('should find all texts for the user', async () => {
      const userId = 1;
      const textArray = [{ id: 1, content: 'Sample Text' }];

      mockTextService.findAll.mockResolvedValue(textArray);

      const result = await controller.findAll(mockRequest(userId));

      expect(textService.findAll).toHaveBeenCalledWith(userId);
      expect(result).toEqual(textArray);
    });
  });

  describe('findOne', () => {
    it('should find a single text by id for the user', async () => {
      const userId = 1;
      const textId = '1';
      const text = { id: 1, content: 'Sample Text' };

      mockTextService.findOne.mockResolvedValue(text);

      const result = await controller.findOne(textId, mockRequest(userId));

      expect(textService.findOne).toHaveBeenCalledWith(textId, userId);
      expect(result).toEqual(text);
    });
  });

  describe('update', () => {
    it('should update the text for the user', async () => {
      const userId = 1;
      const textId = '1';
      const updatedContent = 'Updated text content';
      const updatedText = { id: 1, content: updatedContent };

      mockTextService.update.mockResolvedValue(updatedText);

      const result = await controller.update(
        textId,
        updatedContent,
        mockRequest(userId),
      );

      expect(textService.update).toHaveBeenCalledWith(
        textId,
        updatedContent,
        userId,
      );
      expect(result).toEqual(updatedText);
    });
  });

  describe('remove', () => {
    it('should delete the text for the user', async () => {
      const userId = 1;
      const textId = '1';

      mockTextService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(textId, mockRequest(userId));

      expect(textService.remove).toHaveBeenCalledWith(textId, userId);
      expect(result).toBeUndefined();
    });
  });

  describe('getWordCount', () => {
    it('should return word count for the text', async () => {
      const userId = 1;
      const textId = '1';
      const content = 'This is a test sentence';
      const wordCount = 5;

      mockTextService.findOne.mockResolvedValue({ content });
      mockTextService.countWords.mockResolvedValue(wordCount);

      const result = await controller.getWordCount(textId, mockRequest(userId));

      expect(textService.findOne).toHaveBeenCalledWith(textId, userId);
      expect(textService.countWords).toHaveBeenCalledWith(content);
      expect(result).toEqual({ count: wordCount });
    });
  });

  describe('getCharacterCount', () => {
    it('should return character count for the text', async () => {
      const userId = 1;
      const textId = '1';
      const content = 'This is a test sentence';
      const characterCount = 21;

      mockTextService.findOne.mockResolvedValue({ content });
      mockTextService.countCharacters.mockResolvedValue(characterCount);

      const result = await controller.getCharacterCount(
        textId,
        mockRequest(userId),
      );

      expect(textService.findOne).toHaveBeenCalledWith(textId, userId);
      expect(textService.countCharacters).toHaveBeenCalledWith(content);
      expect(result).toEqual({ count: characterCount });
    });
  });

  describe('getSentenceCount', () => {
    let controller: TextController;
    let textService: TextService;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [TextController],
        providers: [
          {
            provide: TextService,
            useValue: mockTextService,
          },
        ],
      }).compile();

      controller = module.get<TextController>(TextController);
      textService = module.get<TextService>(TextService);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    // Helper function to create mock request
    const createMockRequest = (user: any): Request =>
      ({
        user,
      }) as any;

    it('should return the correct sentence count for a valid text', async () => {
      const textId = '1';
      const userId = 1;
      const user = { id: userId, username: 'testuser' };
      const mockText = {
        id: '1',
        content: 'This is the first sentence. This is the second sentence!',
        user: { id: 1, username: 'testuser' },
      };
      const content = mockText.content;
      const sentenceCount = 2;

      mockTextService.findOne.mockResolvedValue(mockText);

      mockTextService.countSentences.mockResolvedValue(sentenceCount);

      const mockReq = createMockRequest(user);

      const result = await controller.getSentenceCount(textId, mockReq);

      expect(textService.findOne).toHaveBeenCalledWith(textId, userId);
      expect(textService.countSentences).toHaveBeenCalledWith(content);
      expect(result).toEqual({ count: sentenceCount });
    });

    it('should propagate errors from countSentences method', async () => {
      const textId = '1';
      const userId = 1;
      const user = { id: userId, username: 'testuser' };
      const mockText = {
        id: '1',
        content: 'This is the first sentence. This is the second sentence!',
        user: { id: 1, username: 'testuser' },
      };
      const content = mockText.content;

      mockTextService.findOne.mockResolvedValue(mockText);

      const error = new Error('Sentence count failed');
      mockTextService.countSentences.mockRejectedValue(error);

      const mockReq = createMockRequest(user);

      await expect(
        controller.getSentenceCount(textId, mockReq),
      ).rejects.toThrow(error);

      expect(textService.findOne).toHaveBeenCalledWith(textId, userId);
      expect(textService.countSentences).toHaveBeenCalledWith(content);
    });
  });

  describe('TextController - getParagraphCount', () => {
    let controller: TextController;
    let textService: TextService;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [TextController],
        providers: [
          {
            provide: TextService,
            useValue: mockTextService,
          },
        ],
      }).compile();

      controller = module.get<TextController>(TextController);
      textService = module.get<TextService>(TextService);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    const createMockRequest = (user: any): Request =>
      ({
        user,
      }) as any;

    it('should return the correct paragraph count for a valid text', async () => {
      const textId = '1';
      const userId = 1;
      const user = { id: userId, username: 'testuser' };
      const mockText = {
        id: '1',
        content: 'Paragraph 1.\n\nParagraph 2.\n\nParagraph 3.',
        user: { id: 1, username: 'testuser' },
      };
      const content = mockText.content;
      const paragraphCount = 3;

      mockTextService.findOne.mockResolvedValue(mockText);

      mockTextService.countParagraphs.mockResolvedValue(paragraphCount);

      const mockReq = createMockRequest(user);

      const result = await controller.getParagraphCount(textId, mockReq);

      expect(textService.findOne).toHaveBeenCalledWith(textId, userId);
      expect(textService.countParagraphs).toHaveBeenCalledWith(content);
      expect(result).toEqual({ count: paragraphCount });
    });

    it('should propagate errors from countParagraphs method', async () => {
      const textId = '1';
      const userId = 1;
      const user = { id: userId, username: 'testuser' };
      const mockText = {
        id: '1',
        content: 'Paragraph 1.\n\nParagraph 2.\n\nParagraph 3.',
        user: { id: 1, username: 'testuser' },
      };
      const content = mockText.content;

      mockTextService.findOne.mockResolvedValue(mockText);

      const error = new Error('Paragraph count failed');
      mockTextService.countParagraphs.mockRejectedValue(error);

      const mockReq = createMockRequest(user);

      await expect(
        controller.getParagraphCount(textId, mockReq),
      ).rejects.toThrow(error);

      expect(textService.findOne).toHaveBeenCalledWith(textId, userId);
      expect(textService.countParagraphs).toHaveBeenCalledWith(content);
    });

    it('should throw an error if user information is missing in the request', async () => {
      const textId = '1';
      const user = undefined;

      const mockReq = createMockRequest(user);

      await expect(
        controller.getParagraphCount(textId, mockReq),
      ).rejects.toThrow();

      expect(textService.findOne).not.toHaveBeenCalled();
    });
  });

  describe('getUserReport', () => {
    it('should return user report', async () => {
      const userId = 1;
      const report = { textsAnalyzed: 5, wordCount: 100 };

      mockTextService.getUserReport.mockResolvedValue(report);

      const result = await controller.getUserReport(mockRequest(userId));

      expect(textService.getUserReport).toHaveBeenCalledWith(userId);
      expect(result).toEqual(report);
    });
  });

  describe('TextController - getLongestWords', () => {
    let controller: TextController;
    let textService: TextService;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [TextController],
        providers: [
          {
            provide: TextService,
            useValue: mockTextService,
          },
        ],
      }).compile();

      controller = module.get<TextController>(TextController);
      textService = module.get<TextService>(TextService);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    const createMockRequest = (user: any): Request =>
      ({
        user,
      }) as any;
    const mockText = {
      id: '1',
      content:
        'This is a test. Longest words are something like extraordinary or inconceivable.',
      user: { id: 1, username: 'testuser' },
    };

    it('should return the longest words for a valid text', async () => {
      const textId = '1';
      const userId = 1;
      const user = { id: userId, username: 'testuser' };
      const content = mockText.content;
      const longestWords = ['extraordinary', 'inconceivable'];

      mockTextService.findOne.mockResolvedValue(mockText);

      mockTextService.longestWordInParagraphs.mockResolvedValue(longestWords);

      const mockReq = createMockRequest(user);

      const result = await controller.getLongestWords(textId, mockReq);

      expect(textService.findOne).toHaveBeenCalledWith(textId, userId);
      expect(textService.longestWordInParagraphs).toHaveBeenCalledWith(content);
      expect(result).toEqual({ longestWords });
    });
  });
});
