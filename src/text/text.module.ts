// src/text/text.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TextController } from './text.controller';
import { TextService } from './text.service';
import { Text } from './text.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Text])],
  controllers: [TextController],
  providers: [TextService],
  exports: [TextService],
})
export class TextModule {}
