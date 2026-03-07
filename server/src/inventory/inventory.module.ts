import { Module } from '@nestjs/common'
import { MulterModule } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { InventoryController } from './inventory.controller'
import { InventoryService } from './inventory.service'

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
