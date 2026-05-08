// 统一响应格式
export interface Result<T> {
  code: number
  message: string
  data: T
}

// 用户相关
export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
  nickname?: string
  email?: string
}

// 文章相关
export interface Article {
  id?: number
  title: string
  content: string
  summary?: string
  cover?: string
  categoryId?: number
  categoryName?: string
  userId: number
  authorName?: string
  viewCount?: number
  likeCount?: number
  status: number
  createTime?: string
  updateTime?: string
}

export interface ArticlePublishRequest {
  id?: number
  title?: string
  content?: string
  summary?: string
  cover?: string
  categoryId?: number
  status?: number
}

// 分类相关
export interface Category {
  id?: number
  name: string
  createTime?: string
}

// 评论相关
export interface Comment {
  id?: number
  articleId: number
  userId: number
  authorName?: string
  content: string
  likeCount: number
  createTime?: string
}

export interface CommentCreateRequest {
  articleId: number
  content: string
}

// 用户信息
export interface UserInfo {
  id: number
  username: string
  nickname: string
  email: string
  avatar: string
}