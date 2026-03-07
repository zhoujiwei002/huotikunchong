import { Injectable } from '@nestjs/common'
import { getSupabaseClient } from '../storage/database/supabase-client'

@Injectable()
export class InventoryService {
  private client = getSupabaseClient()

  // ==================== 昆虫管理 ====================

  async getInsects() {
    const { data, error } = await this.client
      .from('insects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`获取昆虫列表失败: ${error.message}`)
    }

    return data
  }

  async getInsectById(id: string) {
    const { data, error } = await this.client
      .from('insects')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(`获取昆虫信息失败: ${error.message}`)
    }

    return data
  }

  async createInsect(data: any) {
    // 提取库存相关参数和操作员信息
    const { location, quantity, operator, ...insectData } = data

    // 创建昆虫品种
    const { data: insect, error } = await this.client
      .from('insects')
      .insert(insectData)
      .select()
      .single()

    if (error) {
      throw new Error(`创建昆虫品种失败: ${error.message}`)
    }

    // 自动创建初始库存记录（使用传入的门店和数量，如果没有则使用默认值）
    await this.createInventory({
      insect_id: insect.id,
      quantity: quantity || 0,
      location: location || '公司总部',
    })

    // 添加操作记录：添加昆虫品种
    await this.client.from('inventory_logs').insert({
      insect_id: insect.id,
      operation_type: '添加',
      quantity: quantity || 0,
      location: location || '公司总部',
      price: insect.price,
      remark: `添加昆虫品种：${insect.name}${insect.species ? ` (${insect.species})` : ''}`,
      operator: operator || '未知用户',
    })

    return insect
  }

  async updateInsect(id: string, data: any) {
    const { data: insect, error } = await this.client
      .from('insects')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`更新昆虫信息失败: ${error.message}`)
    }

    return insect
  }

  async deleteInsect(id: string) {
    // 先删除该昆虫的所有库存记录
    const { error: inventoryError } = await this.client
      .from('inventory')
      .delete()
      .eq('insect_id', id)

    if (inventoryError) {
      throw new Error(`删除库存记录失败: ${inventoryError.message}`)
    }

    // 再删除该昆虫的所有操作记录
    const { error: logsError } = await this.client
      .from('inventory_logs')
      .delete()
      .eq('insect_id', id)

    if (logsError) {
      throw new Error(`删除操作记录失败: ${logsError.message}`)
    }

    // 最后删除昆虫品种
    const { error } = await this.client
      .from('insects')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`删除昆虫品种失败: ${error.message}`)
    }

    return { success: true }
  }

  // ==================== 库存管理 ====================

  async getInventory(location?: string) {
    let query = this.client
      .from('inventory')
      .select(`
        *,
        insects (
          id,
          name,
          species,
          price,
          description,
          image_url
        )
      `)
      .order('created_at', { ascending: false })

    if (location) {
      query = query.eq('location', location)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`获取库存列表失败: ${error.message}`)
    }

    return data
  }

  async getInventoryByInsectId(insectId: string) {
    const { data, error } = await this.client
      .from('inventory')
      .select('*')
      .eq('insect_id', insectId)

    if (error) {
      throw new Error(`获取库存信息失败: ${error.message}`)
    }

    return data
  }

  async createInventory(data: any) {
    const { data: inventory, error } = await this.client
      .from('inventory')
      .insert(data)
      .select()
      .single()

    if (error) {
      throw new Error(`创建库存记录失败: ${error.message}`)
    }

    return inventory
  }

  async updateInventory(id: string, data: any) {
    const { data: inventory, error } = await this.client
      .from('inventory')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`更新库存失败: ${error.message}`)
    }

    return inventory
  }

  async deleteInventory(id: string) {
    const { error } = await this.client
      .from('inventory')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`删除库存记录失败: ${error.message}`)
    }

    return { success: true }
  }

  async updateInventoryByInsectId(insectId: string, location: string, quantity: number) {
    const existing = await this.getInventoryByInsectId(insectId)
    const inventoryItem = existing.find(item => item.location === location)

    if (inventoryItem) {
      return await this.updateInventory(inventoryItem.id, { quantity })
    } else {
      return await this.createInventory({
        insect_id: insectId,
        location,
        quantity,
      })
    }
  }

  // ==================== 操作记录管理 ====================

  async getInventoryLogs(insectId?: string, operationType?: string) {
    let query = this.client
      .from('inventory_logs')
      .select(`
        *,
        insects (
          id,
          name,
          species
        )
      `)
      .order('created_at', { ascending: false })

    if (insectId) {
      query = query.eq('insect_id', insectId)
    }

    if (operationType) {
      query = query.eq('operation_type', operationType)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`获取操作记录失败: ${error.message}`)
    }

    return data
  }

  async createInventoryLog(data: any) {
    const { data: log, error } = await this.client
      .from('inventory_logs')
      .insert(data)
      .select()
      .single()

    if (error) {
      throw new Error(`创建操作记录失败: ${error.message}`)
    }

    // 更新库存
    const { quantity, operation_type, insect_id, location } = data

    // 获取当前库存
    const existing = await this.getInventoryByInsectId(insect_id)
    const inventoryItem = existing.find(item => item.location === location)

    let newQuantity = inventoryItem?.quantity || 0

    if (operation_type === '进货') {
      newQuantity += quantity
    } else if (operation_type === '销售' || operation_type === '死亡') {
      newQuantity -= quantity
    }

    if (newQuantity < 0) {
      newQuantity = 0
    }

    await this.updateInventoryByInsectId(insect_id, location, newQuantity)

    return log
  }

  // 串货功能：将库存从一个门店转移到另一个门店
  async transferInventory(data: any) {
    const { insect_id, source_location, target_location, quantity, remark } = data

    // 获取当前库存
    const existing = await this.getInventoryByInsectId(insect_id)

    // 检查源门店库存是否充足
    const sourceInventory = existing.find(item => item.location === source_location)
    if (!sourceInventory || sourceInventory.quantity < quantity) {
      throw new Error(`源门店库存不足，当前库存：${sourceInventory?.quantity || 0}，需要转移：${quantity}`)
    }

    // 减少源门店库存
    const sourceNewQuantity = sourceInventory.quantity - quantity
    await this.updateInventoryByInsectId(insect_id, source_location, sourceNewQuantity)

    // 增加目标门店库存
    const targetInventory = existing.find(item => item.location === target_location)
    const targetNewQuantity = (targetInventory?.quantity || 0) + quantity
    await this.updateInventoryByInsectId(insect_id, target_location, targetNewQuantity)

    // 创建操作记录
    const transferRemark = remark
      ? `${remark}（从 ${source_location} 转移到 ${target_location}）`
      : `从 ${source_location} 转移到 ${target_location}`

    const log = await this.createInventoryLog({
      insect_id,
      operation_type: '串货',
      quantity,
      location: target_location, // 记录到目标门店
      remark: transferRemark,
      image_url: null,
    })

    return log
  }

  async getInventorySummary() {
    const inventory = await this.getInventory()

    const summary = inventory.map((item: any) => ({
      insect: item.insects,
      quantity: item.quantity,
      location: item.location,
      status: this.getStockStatus(item.quantity),
    }))

    return summary
  }

  private getStockStatus(quantity: number): string {
    if (quantity === 0) return 'empty'
    if (quantity < 10) return 'low'
    return 'normal'
  }

  // ==================== 图片上传 ====================

  async uploadImage(file: Express.Multer.File) {
    if (!file) {
      throw new Error('文件不能为空')
    }

    try {
      // 导入 sharp（动态导入避免启动时问题）
      const sharp = require('sharp')

      // 设置 Sharp 的并发限制和内存限制，避免大图片导致内存不足
      sharp.cache({ memory: 50, files: 20, items: 100 })
      sharp.concurrency(1)

      console.log('开始处理图片:', {
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
      })

      // 获取图片元信息，检查尺寸
      const metadata = await sharp(file.buffer).metadata()
      console.log('图片原始尺寸:', {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
      })

      // 如果图片尺寸超过 2000x2000，先进行缩小以减少内存使用
      let imageProcessor = sharp(file.buffer)

      if (metadata.width && metadata.height) {
        const maxDimension = Math.max(metadata.width, metadata.height)
        if (maxDimension > 2000) {
          console.log('图片尺寸过大，先进行初步压缩')
          const scaleFactor = 2000 / maxDimension
          imageProcessor = imageProcessor.resize({
            width: Math.round(metadata.width * scaleFactor),
            height: Math.round(metadata.height * scaleFactor),
            fit: 'inside',
          })
        }
      }

      // 使用 sharp 处理图片：裁剪为正方形、调整大小、转换为 JPEG 格式
      // 减小尺寸和降低质量以节省内存
      const processedImage = await imageProcessor
        .resize({
          width: 600, // 从 800 减小到 600
          height: 600,
          fit: 'cover', // 裁剪为正方形，居中裁剪
          position: 'center',
          withoutEnlargement: true, // 如果图片小于目标尺寸，不放大
        })
        .jpeg({
          quality: 75, // 从 85 降低到 75，减少内存使用
          progressive: true, // 使用渐进式 JPEG
        })
        .toBuffer({
          resolveWithObject: true, // 返回包含信息的对象
        })

      console.log('图片处理完成:', {
        originalSize: file.size,
        processedSize: processedImage.info.size,
        compressionRatio: ((file.size - processedImage.info.size) / file.size * 100).toFixed(2) + '%',
      })

      // 生成唯一文件名（统一使用 .jpg 扩展名）
      const timestamp = Date.now()
      const random = Math.random().toString(36).substring(2, 8)
      const filename = `insect-${timestamp}-${random}.jpg`

      // 上传处理后的图片到 Supabase Storage
      const { data, error } = await this.client.storage
        .from('insect-images')
        .upload(filename, processedImage.data, {
          contentType: 'image/jpeg',
          upsert: false,
        })

      if (error) {
        throw new Error(`上传图片失败: ${error.message}`)
      }

      // 获取公开 URL
      const { data: urlData } = this.client.storage
        .from('insect-images')
        .getPublicUrl(filename)

      return {
        filename,
        url: urlData.publicUrl,
      }
    } catch (error) {
      console.error('图片处理失败:', error)
      throw new Error(`图片处理失败: ${error.message}`)
    }
  }
}
