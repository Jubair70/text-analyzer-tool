import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TextController } from './text.controller';
import { TextService } from './text.service';
import { Text } from '../entities/text.entity';
import { UserService } from '../user/user.service';
import { User } from '../entities/user.entity';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [ CacheModule.register({
    isGlobal:true,
    host: 'localhost', 
    port: 6379,        
    ttl: 36000,         
    max: 10000,         
  }),TypeOrmModule.forFeature([Text]),TypeOrmModule.forFeature([User])],
  controllers: [TextController],
  providers: [TextService,UserService],
  exports: [TextService],
})
export class TextModule {}
