import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { InventoryModule } from './inventory/inventory.module';
import { InitModule } from './init/init.module';

@Module({
  imports: [InventoryModule, InitModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
