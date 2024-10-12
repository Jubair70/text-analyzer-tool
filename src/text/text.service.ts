import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Text } from './text.entity';

@Injectable()
export class TextService {
  constructor(
    @InjectRepository(Text)
    private textRepository: Repository<Text>,
  ) {}

  create(content: string): Promise<Text> {
    const text = this.textRepository.create({ content });
    return this.textRepository.save(text);
  }

  findAll(): Promise<Text[]> {
    return this.textRepository.find();
  }

  findOne(id: string): Promise<Text> {
    return this.textRepository.findOne({ where: { id } });
  }

  async update(id: string, content: string): Promise<Text> {
    const text = await this.findOne(id);
    if (!text) {
      throw new NotFoundException(`Text with ID ${id} not found`);
    }
    text.content = content;
    return this.textRepository.save(text);
  }

  async remove(id: string): Promise<void> {
    const result = await this.textRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Text with ID ${id} not found`);
    }
  }

  // Analysis Functions
  countWords(content: string): number {
    return content.trim().split(/\s+/).length;
  }

  countCharacters(content: string): number {
    return content.replace(/\s/g, '').length;
  }

  countSentences(content: string): number {
    return content.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
  }

  countParagraphs(content: string): number {
    return content.split(/\n+/).filter(paragraph => paragraph.trim().length > 0).length;
  }

  longestWordInParagraphs(content: string): string[] {
    if (!content) return [];

  // Normalize the sentence: lowercase and remove punctuation
  const normalizedSentence = content
    .toLowerCase()
    .replace(/[.,!?;:()'"`]/g, '');

  // Split the sentence into words based on whitespace
  const words = normalizedSentence.split(/\s+/).filter(word => word.length > 0);

  if (words.length === 0) return [];

  // Determine the maximum length among the words
  const maxLength = Math.max(...words.map(word => word.length));

  // Filter and return all words that have the maximum length
  const longestWords = words.filter(word => word.length === maxLength);

  // Remove duplicates by converting to a Set and back to an array
  return Array.from(new Set(longestWords));
  }
}
