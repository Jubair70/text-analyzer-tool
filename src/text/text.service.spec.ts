import { Test, TestingModule } from '@nestjs/testing';
import { TextService } from './text.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Text } from './text.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

const mockTextRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('TextService', () => {
  let service: TextService;
  let repository: MockRepository<Text>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TextService,
        {
          provide: getRepositoryToken(Text),
          useFactory: mockTextRepository,
        },
      ],
    }).compile();

    service = module.get<TextService>(TextService);
    repository = module.get<MockRepository<Text>>(getRepositoryToken(Text));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a text', async () => {
      const textContent = 'Sample text';
      const savedText = {
        id: '1',
        content: textContent,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      repository.create.mockReturnValue(savedText);
      repository.save.mockResolvedValue(savedText);

      expect(await service.create(textContent)).toEqual(savedText);
      expect(repository.create).toHaveBeenCalledWith({ content: textContent });
      expect(repository.save).toHaveBeenCalledWith(savedText);
    });
  });

  describe('findAll', () => {
    it('should return an array of texts', async () => {
      const texts = [
        {
          id: '1',
          content: 'First text',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          content: 'Second text',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      repository.find.mockResolvedValue(texts);
      expect(await service.findAll()).toEqual(texts);
    });
  });

  describe('findOne', () => {
    it('should return a text by ID', async () => {
      const text = {
        id: '1',
        content: 'Sample text',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      repository.findOne.mockResolvedValue(text);
      expect(await service.findOne('1')).toEqual(text);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should return undefined if not found', async () => {
      repository.findOne.mockResolvedValue(undefined);
      expect(await service.findOne('non-existent-id')).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update and return the text', async () => {
      const existingText = {
        id: '1',
        content: 'Old content',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const updatedContent = 'New content';
      const updatedText = { ...existingText, content: updatedContent };

      repository.findOne.mockResolvedValue(existingText);
      repository.save.mockResolvedValue(updatedText);

      expect(await service.update('1', updatedContent)).toEqual(updatedText);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(repository.save).toHaveBeenCalledWith(updatedText);
    });

    it('should throw NotFoundException if text does not exist', async () => {
      repository.findOne.mockResolvedValue(undefined);
      await expect(
        service.update('non-existent-id', 'Content'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete the text', async () => {
      repository.delete.mockResolvedValue({ affected: 1 });
      await service.remove('1');
      expect(repository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if text does not exist', async () => {
      repository.delete.mockResolvedValue({ affected: 0 });
      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('Text Analysis Functions', () => {
    const sampleText =
      'The quick brown fox jumps over the lazy dog. The lazy dog slept in the sun.';

    it('should count words correctly', () => {
      expect(service.countWords(sampleText)).toBe(16);
    });

    it('should count characters correctly', () => {
      // Ignoring whitespaces: 16 words * average ~5 letters = ~80
      // Actual calculation:
      const charCount = sampleText.replace(/\s/g, '').length;
      expect(service.countCharacters(sampleText)).toBe(charCount);
    });

    it('should count sentences correctly', () => {
      expect(service.countSentences(sampleText)).toBe(2);
    });

    it('should count paragraphs correctly', () => {
      expect(service.countParagraphs(sampleText)).toBe(1);
    });

    it('should find the longest words in paragraphs correctly', () => {
      const expectedLongestWords = ['quick', 'brown', 'jumps', 'slept'];
      expect(service.longestWordInParagraphs(sampleText)).toEqual(
        expectedLongestWords,
      );
    });
  });

  describe('countWords', () => {
    it('should correctly count words in a standard sentence', () => {
      const content = 'The quick brown fox jumps over the lazy dog.';
      const count = service.countWords(content);
      expect(count).toBe(9);
    });

    it('should correctly count words with contractions', () => {
      const content = "Don't stop believing.";
      const count = service.countWords(content);
      expect(count).toBe(3);
    });

    it('should correctly count words with multiple spaces', () => {
      const content = 'Hello    world! This  is a test.';
      const count = service.countWords(content);
      expect(count).toBe(6);
    });

    it('should return 0 for empty or whitespace-only strings', () => {
      expect(service.countWords('')).toBe(0);
      expect(service.countWords('    ')).toBe(0);
    });

    it('should handle strings with numbers and alphanumeric words', () => {
      const content = 'Testing 123 and alphanumeric words like hello2u.';
      const count = service.countWords(content);
      expect(count).toBe(7);
    });

    it('should handle sentences with various punctuation marks', () => {
      const content = 'Wait!!! What??? Really...';
      const count = service.countWords(content);
      expect(count).toBe(3);
    });

    it('should handle mixed case words', () => {
      const content = 'HeLLo WoRLD';
      const count = service.countWords(content);
      expect(count).toBe(2);
    });

    it('should ignore standalone punctuation', () => {
      const content = '!!! ... ??? ,,, ;;;';
      const count = service.countWords(content);
      expect(count).toBe(0);
    });
  });

  describe('countCharacters', () => {
    it('should correctly count characters excluding spaces without excluding punctuation', () => {
      const content = 'Hello, World!';
      const count = service.countCharacters(content);
      expect(count).toBe(12); // "Hello,World!" has 12 characters
    });

    it('should correctly count characters excluding spaces and punctuation', () => {
      const content = 'Hello, World!';
      const count = service.countCharacters(content, true);
      expect(count).toBe(10); // "HelloWorld" has 10 characters
    });

    it('should return 0 for empty string', () => {
      const content = '';
      const count = service.countCharacters(content);
      expect(count).toBe(0);
    });

    it('should return 0 for string with only spaces and punctuation', () => {
      const content = '   !!!   ';
      const count = service.countCharacters(content, true);
      expect(count).toBe(0);
    });

    it('should handle multiple spaces correctly', () => {
      const content = 'Hello    World';
      const count = service.countCharacters(content);
      expect(count).toBe(10); // "HelloWorld" has 10 characters
    });

    it('should handle Unicode characters correctly', () => {
      const content = 'Café 😊';
      const count = service.countCharacters(content);
      expect(count).toBe(6); // "Café😊" has 6 characters
    });
  });

  describe('countSentences', () => {
    it('should correctly count the number of sentences', () => {
      const content = 'Hello World! How are you today? I am fine.';
      const count = service.countSentences(content);
      expect(count).toBe(3);
    });

    it('should return 0 for empty string', () => {
      const content = '';
      const count = service.countSentences(content);
      expect(count).toBe(0);
    });

    it('should handle multiple punctuation marks', () => {
      const content = 'Wait!!! What??? Really...';
      const count = service.countSentences(content);
      expect(count).toBe(3);
    });

    it('should handle sentences without punctuation', () => {
      const content = 'This is a sentence without punctuation';
      const count = service.countSentences(content);
      expect(count).toBe(1);
    });
  });

  describe('countParagraphs', () => {
    it('should correctly count the number of paragraphs', () => {
      const content = `First paragraph.
  
  Second paragraph.
  
  Third paragraph.`;
      const count = service.countParagraphs(content);
      expect(count).toBe(3);
    });

    it('should return 1 for a single paragraph without line breaks', () => {
      const content = 'This is a single paragraph without line breaks.';
      const count = service.countParagraphs(content);
      expect(count).toBe(1);
    });

    it('should return 0 for empty string', () => {
      const content = '';
      const count = service.countParagraphs(content);
      expect(count).toBe(0);
    });

    it('should handle multiple consecutive line breaks', () => {
      const content = `Paragraph one.
  
  
  Paragraph two.
  
  
  `;
      const count = service.countParagraphs(content);
      expect(count).toBe(2);
    });
  });

  describe('longestWordInParagraphs', () => {
    it('should return the longest words in each paragraph without duplicates', () => {
      const content = `The quick brown fox jumps over the lazy dog.
      An example of a longerword here.
      Short.`;
      const expected = ['longerword'];
      const result = service.longestWordInParagraphs(content);
      expect(result).toEqual(expected);
    });

    it('should return an empty array for empty content', () => {
      const content = '';
      const result = service.longestWordInParagraphs(content);
      expect(result).toEqual([]);
    });

    it('should handle paragraphs with multiple longest words of the same length', () => {
      const content = `This paragraph has two big words: elephant and giraffe.
      Another paragraph with equally long words: computer and hardware.`;
      const expected = ['paragraph'];
      const result = service.longestWordInParagraphs(content);
      expect(result).toEqual(expected);
    });

    it('should remove duplicate longest words across paragraphs', () => {
      const content = `Duplicate words here: test test TEST.
      Another duplicate: example Example.`;
      const expected = ['duplicate'];
      const result = service.longestWordInParagraphs(content);
      expect(result).toEqual(expected);
    });

    it('should handle Unicode characters correctly', () => {
      const content = `Café 😊 is open.
      Привет мир! Это тест.`;
      const expected = ['привет'];
      const result = service.longestWordInParagraphs(content);
      expect(result).toEqual(expected);
    });

    it('should handle paragraphs with only punctuation', () => {
      const content = `!!! ... ??? ,,, ;;;`;
      const expected = [];
      const result = service.longestWordInParagraphs(content);
      expect(result).toEqual(expected);
    });

    it('should handle paragraphs separated by multiple line breaks', () => {
      const content = `First paragraph.

      Second paragraph.


      Third paragraph.`;
      const expected = ['paragraph', 'paragraph', 'paragraph'];
      const result = service.longestWordInParagraphs(content);
      expect(result).toEqual(['paragraph']);
    });
  });
});
