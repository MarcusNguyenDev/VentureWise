import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheModule, CacheInterceptor } from '@nestjs/cache-manager';
import { APP_INTERCEPTOR } from '@nestjs/core';
import KeyvRedis, { RedisClientOptions } from '@keyv/redis';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        const host = 'localhost';
        const port = 6379;

        const options: RedisClientOptions = {
          socket: { host, port },
        };

        return { stores: [new KeyvRedis(options)], ttl: 1000 };
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {}
