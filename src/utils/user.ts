import Taro from '@tarojs/taro'

const USER_NICKNAME_KEY = 'user_nickname'

/**
 * 获取用户昵称
 */
export function getUserNickname(): string {
  try {
    const nickname = Taro.getStorageSync(USER_NICKNAME_KEY)
    return nickname || '未设置'
  } catch (error) {
    console.error('获取用户昵称失败:', error)
    return '未设置'
  }
}

/**
 * 设置用户昵称
 */
export function setUserNickname(nickname: string): void {
  try {
    Taro.setStorageSync(USER_NICKNAME_KEY, nickname)
  } catch (error) {
    console.error('设置用户昵称失败:', error)
  }
}

/**
 * 检查是否已设置昵称
 */
export function hasNickname(): boolean {
  try {
    const nickname = Taro.getStorageSync(USER_NICKNAME_KEY)
    return !!nickname && nickname.trim().length > 0
  } catch (error) {
    console.error('检查昵称失败:', error)
    return false
  }
}

/**
 * 清除用户昵称
 */
export function clearNickname(): void {
  try {
    Taro.removeStorageSync(USER_NICKNAME_KEY)
  } catch (error) {
    console.error('清除用户昵称失败:', error)
  }
}
