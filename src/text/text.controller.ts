import { Controller, Get, Post, Body, Param, Put, Delete,UseGuards,Req, UseInterceptors } from '@nestjs/common';
import { TextService } from './text.service';
import { Text } from '../entities/text.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('texts')
@UseGuards(JwtAuthGuard)
export class TextController {
  constructor(private readonly textService: TextService) {}

  @Post()
  create(@Body('content') content: string, @Req() req: Request): Promise<Text> {
    const user = req.user as any;
    return this.textService.create(content, user.id);
  }

  @Get()
  findAll(@Req() req: Request): Promise<Text[]> {
    const user = req.user as any;
    return this.textService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string,@Req() req: Request): Promise<Text> {
    const user = req.user as any;
    return this.textService.findOne(id, user.id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body('content') content: string, @Req() req: Request): Promise<Text> {
    const user = req.user as any;
    return this.textService.update(id, content, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request): Promise<void> {
    const user = req.user as any;
    return this.textService.remove(id, user.id);
  }

  @Get(':id/word-count')
  async getWordCount(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    let countPromise = await this.textService.findOne(id, user.id).then(res=>res.content)
    return {
      count: await this.textService.countWords(countPromise),
    }
  }

  @Get(':id/character-count')
  async getCharacterCount(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    let countPromise = await this.textService.findOne(id, user.id).then(res=>res.content)
    return {
      count: await this.textService.countCharacters(countPromise),
    }
  }

  @Get(':id/sentence-count')
  async getSentenceCount(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    let countPromise = await this.textService.findOne(id, user.id).then(res=>res.content)
    return {
      count: await this.textService.countSentences(countPromise),
    }
  }

  @Get(':id/paragraph-count')
  async getParagraphCount(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    let countPromise = await this.textService.findOne(id, user.id).then(res=>res.content)
    return {
      count: await this.textService.countParagraphs(countPromise),
    }
  }

  @Get(':id/longest-words')
  async getLongestWords(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    let countPromise = await this.textService.findOne(id, user.id).then(res=>res.content)
    return {
      longestWords: await this.textService.longestWordInParagraphs(countPromise),
    }
    
  }

  @Get('report/user')
  async getUserReport(@Req() req: Request): Promise<any> {
    const user = req.user as any;
    return this.textService.getUserReport(user.id);
  }
}
