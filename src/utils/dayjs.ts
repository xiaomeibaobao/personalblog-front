import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

// 配置中文语言
dayjs.locale('zh-cn')

// 引入相对时间插件（用于显示"5分钟前"、"2小时前"等）
dayjs.extend(relativeTime)

/**
 * 格式化日期
 * @param date - 日期字符串或时间戳
 * @param format - 格式模板，默认 YYYY-MM-DD HH:mm:ss
 * @returns 格式化后的日期字符串
 */
export const formatDate = (date: string | Date | number, format: string = 'YYYY-MM-DD HH:mm:ss'): string => {
  if (!date) return ''
  return dayjs(date).format(format)
}

/**
 * 格式化日期（仅日期）
 */
export const formatDateOnly = (date: string | Date | number): string => {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DD')
}

/**
 * 格式化时间（仅时间）
 */
export const formatTimeOnly = (date: string | Date | number): string => {
  if (!date) return ''
  return dayjs(date).format('HH:mm:ss')
}

/**
 * 相对时间（如：5分钟前、2小时前、3天前）
 */
export const formatRelativeTime = (date: string | Date | number): string => {
  if (!date) return ''
  return dayjs(date).fromNow()
}

/**
 * 获取年份
 */
export const getYear = (date: string | Date | number): number => {
  if (!date) return 0
  return dayjs(date).year()
}

/**
 * 判断是否为今天
 */
export const isToday = (date: string | Date | number): boolean => {
  if (!date) return false
  return dayjs(date).isSame(dayjs(), 'day')
}

/**
 * 判断是否为昨天
 */
export const isYesterday = (date: string | Date | number): boolean => {
  if (!date) return false
  return dayjs(date).isSame(dayjs().subtract(1, 'day'), 'day')
}

export default dayjs