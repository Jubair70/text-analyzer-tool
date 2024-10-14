import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Text } from '../entities/text.entity';
import { TextAnalysisDto } from './dto/text-analysis.dto';
import { UserService } from '../user/user.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class TextService {
  constructor(
    @InjectRepository(Text)
    private textRepository: Repository<Text>,
    private readonly userService: UserService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async create(content: string, userId: number) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const text = this.textRepository.create({ content, user });
    return this.textRepository.save(text);
  }

  async findAll(userId: number) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.textRepository.find({
      where: {
        user: { id: userId },
      },
      relations: {
        user: true,
      },
    });
  }

  async findOne(id: string, userId: number) {
    const text = await this.textRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!text) {
      throw new NotFoundException(`Text with ID ${id} not found`);
    }
    if (text.user.id !== userId) {
      throw new ForbiddenException(
        'Access to the requested resource is denied',
      );
    }
    return text;
  }

  async update(id: string, content: string, userId: number) {
    const text = await this.findOne(id, userId);
    text.content = content;
    return this.textRepository.save(text);
  }

  async remove(id: string, userId: number) {
    const result = await this.textRepository.delete({
      id,
      user: { id: userId },
    });
    if (result.affected === 0) {
      throw new NotFoundException(`Text with ID ${id} not found`);
    }
  }

  computeCountWords(content: string) {
    if (!content) return 0;
    const words = content.match(/\b[\w']+\b/g);
    return words ? words.length : 0;
  }

  async countWords(content: string) {
    const cacheKey = `countWords:${content}`;
    let count = await this.cacheManager.get(cacheKey);
    if (count !== undefined) {
      return count;
    }
    count = this.computeCountWords(content);
    await this.cacheManager.set(cacheKey, count);
    return count;
  }

  async countCharacters(content: string, excludePunctuation: boolean = false) {
    const cacheKey = `countCharacters:${excludePunctuation}:${content}`;
    let count = await this.cacheManager.get<number>(cacheKey);
    if (count !== undefined) {
      return count;
    }
    count = this.computeCountCharacters(content);
    await this.cacheManager.set(cacheKey, count);
    return count;
  }

  computeCountCharacters(
    content: string
  ): number {
    if (!content) return 0;
    let processedContent = content;
    processedContent = processedContent.replace(/\s/g, '');
    return processedContent.length;
  }

  async countSentences(content: string) {
    const cacheKey = `countSentences:${content}`;
    let count = await this.cacheManager.get(cacheKey);
    if (count !== undefined) {
      return count;
    }
    count = this.computeCountSentences(content);
    await this.cacheManager.set(cacheKey, count);
    return count;
  }

  computeCountSentences(content: string) {
    return content
      .split(/[.!?]+/)
      .filter((sentence) => sentence.trim().length > 0).length;
  }

  async countParagraphs(content: string) {
    const cacheKey = `countParagraphs:${content}`;
    let count = await this.cacheManager.get<number>(cacheKey);
    if (count !== undefined) {
      return count;
    }
    count = this.computeCountParagraphs(content);
    await this.cacheManager.set(cacheKey, count);
    return count;
  }

  computeCountParagraphs(content: string) {
    return content
      .split(/\n+/)
      .filter((paragraph) => paragraph.trim().length > 0).length;
  }

  async longestWordInParagraphs(content: string) {
    const cacheKey = `longestWordInParagraphs:${content}`;
    let longestWords = await this.cacheManager.get(cacheKey);
    if (longestWords !== undefined) {
      return longestWords;
    }
    longestWords = this.computeLongestWordInParagraphs(content);
    await this.cacheManager.set(cacheKey, longestWords);
    return longestWords;
  }

  computeLongestWordInParagraphs(content: string) {
    if (!content) return [];
    const normalizedSentence = content
      .toLowerCase()
      .replace(/[.,!?;:()'"`]/g, '');
    const words = normalizedSentence
      .split(/\s+/)
      .filter((word) => word.length > 0);

    if (words.length === 0) return [];
    const maxLength = Math.max(...words.map((word) => word.length));
    const longestWords = words.filter((word) => word.length === maxLength);
    return Array.from(new Set(longestWords));
  }

  async getUserReport(userId: number) {
    const texts = await this.findAll(userId);
    const report: TextAnalysisDto[] = texts.map((text) => ({
      id: text.id,
      content: text.content,
      wordCount: this.countWords(text.content),
      characterCount: this.countCharacters(text.content),
      sentenceCount: this.countSentences(text.content),
      paragraphCount: this.countParagraphs(text.content),
      longestWords: this.longestWordInParagraphs(text.content),
    }));
    return { userId, texts: report };
  }
}
