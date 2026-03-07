import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseInterceptors, UploadedFile } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { InventoryService } from './inventory.service'

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // ==================== 昆虫管理 ====================

  @Get('insects')
  async getInsects() {
    try {
      const data = await this.inventoryService.getInsects()
      return { code: 200, msg: 'success', data }
    } catch (error) {
      return { code: 500, msg: error.message, data: null }
    }
  }

  @Get('insects/:id')
  async getInsectById(@Param('id') id: string) {
    try {
      const data = await this.inventoryService.getInsectById(id)
      return { code: 200, msg: 'success', data }
    } catch (error) {
      return { code: 500, msg: error.message, data: null }
    }
  }

  @Post('insects')
  async createInsect(@Body() body: any) {
    try {
      const data = await this.inventoryService.createInsect(body)
      return { code: 200, msg: 'success', data }
    } catch (error) {
      return { code: 500, msg: error.message, data: null }
    }
  }

  @Put('insects/:id')
  async updateInsect(@Param('id') id: string, @Body() body: any) {
    try {
      const data = await this.inventoryService.updateInsect(id, body)
      return { code: 200, msg: 'success', data }
    } catch (error) {
      return { code: 500, msg: error.message, data: null }
    }
  }

  @Delete('insects/:id')
  async deleteInsect(@Param('id') id: string) {
    try {
      const data = await this.inventoryService.deleteInsect(id)
      return { code: 200, msg: 'success', data }
    } catch (error) {
      return { code: 500, msg: error.message, data: null }
    }
  }

  // ==================== 库存管理 ====================

  @Get()
  async getInventory(@Query('location') location?: string) {
    try {
      const data = await this.inventoryService.getInventory(location)
      return { code: 200, msg: 'success', data }
    } catch (error) {
      return { code: 500, msg: error.message, data: null }
    }
  }

  @Get('summary')
  async getInventorySummary() {
    try {
      const data = await this.inventoryService.getInventorySummary()
      return { code: 200, msg: 'success', data }
    } catch (error) {
      return { code: 500, msg: error.message, data: null }
    }
  }

  @Get('insect/:insectId')
  async getInventoryByInsectId(@Param('insectId') insectId: string) {
    try {
      const data = await this.inventoryService.getInventoryByInsectId(insectId)
      return { code: 200, msg: 'success', data }
    } catch (error) {
      return { code: 500, msg: error.message, data: null }
    }
  }

  @Post()
  async createInventory(@Body() body: any) {
    try {
      const data = await this.inventoryService.createInventory(body)
      return { code: 200, msg: 'success', data }
    } catch (error) {
      return { code: 500, msg: error.message, data: null }
    }
  }

  @Put(':id')
  async updateInventory(@Param('id') id: string, @Body() body: any) {
    try {
      const data = await this.inventoryService.updateInventory(id, body)
      return { code: 200, msg: 'success', data }
    } catch (error) {
      return { code: 500, msg: error.message, data: null }
    }
  }

  @Delete(':id')
  async deleteInventory(@Param('id') id: string) {
    try {
      const data = await this.inventoryService.deleteInventory(id)
      return { code: 200, msg: 'success', data }
    } catch (error) {
      return { code: 500, msg: error.message, data: null }
    }
  }

  // ==================== 操作记录管理 ====================

  @Get('logs')
  async getInventoryLogs(
    @Query('insectId') insectId?: string,
    @Query('operationType') operationType?: string,
  ) {
    try {
      const data = await this.inventoryService.getInventoryLogs(insectId, operationType)
      return { code: 200, msg: 'success', data }
    } catch (error) {
      return { code: 500, msg: error.message, data: null }
    }
  }

  @Post('logs')
  async createInventoryLog(@Body() body: any) {
    try {
      const data = await this.inventoryService.createInventoryLog(body)
      return { code: 200, msg: 'success', data }
    } catch (error) {
      return { code: 500, msg: error.message, data: null }
    }
  }

  @Post('transfer')
  async transferInventory(@Body() body: any) {
    try {
      const data = await this.inventoryService.transferInventory(body)
      return { code: 200, msg: 'success', data }
    } catch (error) {
      return { code: 500, msg: error.message, data: null }
    }
  }

  // ==================== 图片上传 ====================

  @Post('upload-image')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 限制文件大小为 10MB
      },
      fileFilter: (req, file, callback) => {
        // 支持所有常见图片格式
        const allowedMimes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
          'image/gif',
          'image/bmp',
          'image/heic',
          'image/heif',
        ]
        if (allowedMimes.includes(file.mimetype)) {
          callback(null, true)
        } else {
          callback(new Error(`不支持的文件格式: ${file.mimetype}`), false)
        }
      },
    })
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    try {
      console.log('接收到文件:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      })
      const data = await this.inventoryService.uploadImage(file)
      return { code: 200, msg: 'success', data }
    } catch (error) {
      console.error('图片上传错误:', error)
      return { code: 500, msg: error.message, data: null }
    }
  }
}
