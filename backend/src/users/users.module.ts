import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from '../database/entities/user.entity';
import { UsersController } from './users.controller';
import { AuthModule } from '../auth/auth.module';
import config from '../../ormconfig';

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => AuthModule), TypeOrmModule.forRoot(config)],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
