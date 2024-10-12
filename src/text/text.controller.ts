import { Controller, Get, Post, Body, Param, Put, Delete,UseGuards } from '@nestjs/common';
import { TextService } from './text.service';
import { Text } from './text.entity';
import { JwtStrategy } from '../auth/jwt.strategy';

@Controller('texts')
@UseGuards(JwtStrategy) 
export class TextController {
  constructor(private readonly textService: TextService) {}

  @Post()
  create(@Body('content') content: string): Promise<Text> {
    return this.textService.create(content);
  }

  @Get()
  findAll(): Promise<Text[]> {
    return this.textService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Text> {
    return this.textService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body('content') content: string): Promise<Text> {
    return this.textService.update(id, content);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.textService.remove(id);
  }

  // Analysis APIs
  @Get(':id/word-count')
  getWordCount(@Param('id') id: string): Promise<{ count: number }> {
    return this.textService.findOne(id).then(text => ({
      count: this.textService.countWords(text.content),
    }));
  }

  @Get(':id/character-count')
  getCharacterCount(@Param('id') id: string): Promise<{ count: number }> {
    return this.textService.findOne(id).then(text => ({
      count: this.textService.countCharacters(text.content),
    }));
  }

  @Get(':id/sentence-count')
  getSentenceCount(@Param('id') id: string): Promise<{ count: number }> {
    return this.textService.findOne(id).then(text => ({
      count: this.textService.countSentences(text.content),
    }));
  }

  @Get(':id/paragraph-count')
  getParagraphCount(@Param('id') id: string): Promise<{ count: number }> {
    return this.textService.findOne(id).then(text => ({
      count: this.textService.countParagraphs(text.content),
    }));
  }

  @Get(':id/longest-words')
  getLongestWords(@Param('id') id: string): Promise<{ longestWords: string[] }> {
    return this.textService.findOne(id).then(text => ({
      longestWords: this.textService.longestWordInParagraphs(text.content),
    }));
  }
}
