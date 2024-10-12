import { Controller, Get, Post, Body, Param, Put, Delete,UseGuards } from '@nestjs/common';
import { TextService } from './text.service';
import { Text } from './text.entity';
import { JwtStrategy } from '../auth/jwt.strategy';
import { Throttle } from '@nestjs/throttler';

@Controller('texts')
@UseGuards(JwtStrategy) 
export class TextController {
  constructor(private readonly textService: TextService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post()
  create(@Body('content') content: string): Promise<Text> {
    return this.textService.create(content);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Get()
  findAll(): Promise<Text[]> {
    return this.textService.findAll();
  }

  @Throttle({ default: { limit: 7, ttl: 60000 } })
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Text> {
    return this.textService.findOne(id);
  }

  @Throttle({ default: { limit: 6, ttl: 60000 } })
  @Put(':id')
  update(@Param('id') id: string, @Body('content') content: string): Promise<Text> {
    return this.textService.update(id, content);
  }

  @Throttle({ default: { limit: 2, ttl: 60000 } })
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.textService.remove(id);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Get(':id/word-count')
  getWordCount(@Param('id') id: string): Promise<{ count: number }> {
    return this.textService.findOne(id).then(text => ({
      count: this.textService.countWords(text.content),
    }));
  }

  @Throttle({ default: { limit: 6, ttl: 60000 } })
  @Get(':id/character-count')
  getCharacterCount(@Param('id') id: string): Promise<{ count: number }> {
    return this.textService.findOne(id).then(text => ({
      count: this.textService.countCharacters(text.content),
    }));
  }

  @Throttle({ default: { limit: 4, ttl: 60000 } })
  @Get(':id/sentence-count')
  getSentenceCount(@Param('id') id: string): Promise<{ count: number }> {
    return this.textService.findOne(id).then(text => ({
      count: this.textService.countSentences(text.content),
    }));
  }

  @Throttle({ default: { limit: 7, ttl: 60000 } })
  @Get(':id/paragraph-count')
  getParagraphCount(@Param('id') id: string): Promise<{ count: number }> {
    return this.textService.findOne(id).then(text => ({
      count: this.textService.countParagraphs(text.content),
    }));
  }

  @Throttle({ default: { limit: 2, ttl: 60000 } })
  @Get(':id/longest-words')
  getLongestWords(@Param('id') id: string): Promise<{ longestWords: string[] }> {
    return this.textService.findOne(id).then(text => ({
      longestWords: this.textService.longestWordInParagraphs(text.content),
    }));
  }
}
