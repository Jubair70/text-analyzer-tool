import { Test, TestingModule } from '@nestjs/testing';
import { TextController } from './text.controller';
import { TextService } from './text.service';
import { Text } from './text.entity';
import { NotFoundException } from '@nestjs/common';

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
};

describe('TextController', () => {
  let controller: TextController;
  let service: TextService;

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
    service = module.get<TextService>(TextService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test for POST /texts
  describe('create', () => {
    it('should create and return a new text', async () => {
      const content = "The quick brown fox jumps over the lazy dog.";
      const result: Text = {
        id: '1',
        content,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTextService.create.mockResolvedValue(result);

      expect(await controller.create(content)).toBe(result);
      expect(service.create).toHaveBeenCalledWith(content);
    });

    it('should throw an error if service fails', async () => {
      const content = "Sample text.";
      mockTextService.create.mockRejectedValue(new Error('Creation failed'));

      await expect(controller.create(content)).rejects.toThrow('Creation failed');
      expect(service.create).toHaveBeenCalledWith(content);
    });
  });

  // Test for GET /texts
  describe('findAll', () => {
    it('should return an array of texts', async () => {
      const texts: Text[] = [
        {
          id: '1',
          content: "Text one.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          content: "Text two.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockTextService.findAll.mockResolvedValue(texts);

      expect(await controller.findAll()).toBe(texts);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should return an empty array if no texts are found', async () => {
      mockTextService.findAll.mockResolvedValue([]);

      expect(await controller.findAll()).toEqual([]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  // Test for GET /texts/:id
  describe('findOne', () => {
    it('should return a single text', async () => {
      const id = '1';
      const text: Text = {
        id,
        content: "Sample text.",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTextService.findOne.mockResolvedValue(text);

      expect(await controller.findOne(id)).toBe(text);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if text not found', async () => {
      const id = 'non-existent-id';
      mockTextService.findOne.mockRejectedValue(new NotFoundException(`Text with ID ${id} not found`));

      await expect(controller.findOne(id)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  // Test for PUT /texts/:id
  describe('update', () => {
    it('should update and return the updated text', async () => {
      const id = '1';
      const newContent = "Updated text content.";
      const updatedText: Text = {
        id,
        content: newContent,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTextService.update.mockResolvedValue(updatedText);

      expect(await controller.update(id, newContent)).toBe(updatedText);
      expect(service.update).toHaveBeenCalledWith(id, newContent);
    });

    it('should throw NotFoundException if text to update is not found', async () => {
      const id = 'non-existent-id';
      const newContent = "Attempting to update.";
      mockTextService.update.mockRejectedValue(new NotFoundException(`Text with ID ${id} not found`));

      await expect(controller.update(id, newContent)).rejects.toThrow(NotFoundException);
      expect(service.update).toHaveBeenCalledWith(id, newContent);
    });
  });

  // Test for DELETE /texts/:id
  describe('remove', () => {
    it('should remove the text successfully', async () => {
      const id = '1';
      mockTextService.remove.mockResolvedValue(undefined);

      expect(await controller.remove(id)).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if text to delete is not found', async () => {
      const id = 'non-existent-id';
      mockTextService.remove.mockRejectedValue(new NotFoundException(`Text with ID ${id} not found`));

      await expect(controller.remove(id)).rejects.toThrow(NotFoundException);
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });

  // Tests for Analysis APIs

  // Test for GET /texts/:id/word-count
  describe('getWordCount', () => {
    it('should return the word count of the text', async () => {
      const id = '1';
      const text: Text = {
        id,
        content: "The quick brown fox jumps over the lazy dog.",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const wordCount = 9;

      mockTextService.findOne.mockResolvedValue(text);
      mockTextService.countWords.mockReturnValue(wordCount);

      expect(await controller.getWordCount(id)).toEqual({ count: wordCount });
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(service.countWords).toHaveBeenCalledWith(text.content);
    });

    it('should throw NotFoundException if text not found', async () => {
      const id = 'non-existent-id';
      mockTextService.findOne.mockRejectedValue(new NotFoundException(`Text with ID ${id} not found`));

      await expect(controller.getWordCount(id)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(service.countWords).not.toHaveBeenCalled();
    });
  });

  // Test for GET /texts/:id/character-count
  describe('getCharacterCount', () => {
    it('should return the character count of the text', async () => {
      const id = '1';
      const text: Text = {
        id,
        content: "Hello World!",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const characterCount = 10; // "helloworld" after normalization

      mockTextService.findOne.mockResolvedValue(text);
      mockTextService.countCharacters.mockReturnValue(characterCount);

      expect(await controller.getCharacterCount(id)).toEqual({ count: characterCount });
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(service.countCharacters).toHaveBeenCalledWith(text.content);
    });

    it('should throw NotFoundException if text not found', async () => {
      const id = 'non-existent-id';
      mockTextService.findOne.mockRejectedValue(new NotFoundException(`Text with ID ${id} not found`));

      await expect(controller.getCharacterCount(id)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(service.countCharacters).not.toHaveBeenCalled();
    });
  });

  // Test for GET /texts/:id/sentence-count
  describe('getSentenceCount', () => {
    it('should return the sentence count of the text', async () => {
      const id = '1';
      const text: Text = {
        id,
        content: "Hello World! How are you today?",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const sentenceCount = 2;

      mockTextService.findOne.mockResolvedValue(text);
      mockTextService.countSentences.mockReturnValue(sentenceCount);

      expect(await controller.getSentenceCount(id)).toEqual({ count: sentenceCount });
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(service.countSentences).toHaveBeenCalledWith(text.content);
    });

    it('should throw NotFoundException if text not found', async () => {
      const id = 'non-existent-id';
      mockTextService.findOne.mockRejectedValue(new NotFoundException(`Text with ID ${id} not found`));

      await expect(controller.getSentenceCount(id)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(service.countSentences).not.toHaveBeenCalled();
    });
  });

  // Test for GET /texts/:id/paragraph-count
  describe('getParagraphCount', () => {
    it('should return the paragraph count of the text', async () => {
      const id = '1';
      const text: Text = {
        id,
        content: "First paragraph.\n\nSecond paragraph.",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const paragraphCount = 2;

      mockTextService.findOne.mockResolvedValue(text);
      mockTextService.countParagraphs.mockReturnValue(paragraphCount);

      expect(await controller.getParagraphCount(id)).toEqual({ count: paragraphCount });
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(service.countParagraphs).toHaveBeenCalledWith(text.content);
    });

    it('should throw NotFoundException if text not found', async () => {
      const id = 'non-existent-id';
      mockTextService.findOne.mockRejectedValue(new NotFoundException(`Text with ID ${id} not found`));

      await expect(controller.getParagraphCount(id)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(service.countParagraphs).not.toHaveBeenCalled();
    });
  });

  // Test for GET /texts/:id/longest-words
  describe('getLongestWords', () => {
    it('should return the longest words in paragraphs of the text', async () => {
      const id = '1';
      const text: Text = {
        id,
        content: "The quick brown fox jumps over the lazy dog.\n\nThe lazy dog slept in the sun.",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const longestWords = ['jumps', 'slept'];

      mockTextService.findOne.mockResolvedValue(text);
      mockTextService.longestWordInParagraphs.mockReturnValue(longestWords);

      expect(await controller.getLongestWords(id)).toEqual({ longestWords });
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(service.longestWordInParagraphs).toHaveBeenCalledWith(text.content);
    });

    it('should throw NotFoundException if text not found', async () => {
      const id = 'non-existent-id';
      mockTextService.findOne.mockRejectedValue(new NotFoundException(`Text with ID ${id} not found`));

      await expect(controller.getLongestWords(id)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(service.longestWordInParagraphs).not.toHaveBeenCalled();
    });
  });
});
