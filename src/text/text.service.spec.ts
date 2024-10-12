// src/text/text.service.spec.ts

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
      const savedText = { id: '1', content: textContent, createdAt: new Date(), updatedAt: new Date() };

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
        { id: '1', content: 'First text', createdAt: new Date(), updatedAt: new Date() },
        { id: '2', content: 'Second text', createdAt: new Date(), updatedAt: new Date() },
      ];

      repository.find.mockResolvedValue(texts);
      expect(await service.findAll()).toEqual(texts);
    });
  });

  describe('findOne', () => {
    it('should return a text by ID', async () => {
      const text = { id: '1', content: 'Sample text', createdAt: new Date(), updatedAt: new Date() };
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
      const existingText = { id: '1', content: 'Old content', createdAt: new Date(), updatedAt: new Date() };
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
      await expect(service.update('non-existent-id', 'Content')).rejects.toThrow(NotFoundException);
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
      await expect(service.remove('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('Text Analysis Functions', () => {
    const sampleText = "The quick brown fox jumps over the lazy dog. The lazy dog slept in the sun.";

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
      const expectedLongestWords = ['quick','brown','jumps', 'slept'];
      expect(service.longestWordInParagraphs(sampleText)).toEqual(expectedLongestWords);
    });
  });
});
