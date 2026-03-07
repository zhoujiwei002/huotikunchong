/**
 * 用户信息管理
 */

import Taro from '@tarojs/taro'

const USER_NICKNAME_KEY = 'user_nickname'

/**
 * 获取用户昵称
 */
export const getUserNickname = (): string => {
  let nickname = Taro.getStorageSync(USER_NICKNAME_KEY)

  if (!nickname) {
    // 如果没有昵称，生成一个随机的
    const randomNum = Math.floor(Math.random() * 10000)
    nickname = `用户${randomNum}`
    setUserNickname(nickname)
  }

  return nickname
}

/**
 * 设置用户昵称
 */
export const setUserNickname = (nickname: string): void => {
  Taro.setStorageSync(USER_NICKNAME_KEY, nickname)
}
