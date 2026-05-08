import request from './request'
import type {
  Result,
  LoginRequest,
  RegisterRequest,
  Article,
  ArticlePublishRequest,
  Category,
  Comment,
  CommentCreateRequest,
  UserInfo
} from '@/types'

// ========== 用户相关 ==========
export const register = (data: RegisterRequest): Promise<Result<string>> => {
  return request.post('/api/user/register', data)
}

export const login = (data: LoginRequest): Promise<Result<string>> => {
  return request.post('/api/user/login', data)
}

/**
 * 获取当前登录用户信息
 */
export const getCurrentUser = (): Promise<Result<UserInfo>> => {
  return request.get('/api/user/current')
}

// ========== 文章相关 ==========
export const getArticleList = (): Promise<Result<Article[]>> => {
  return request.get('/api/public/article/list')
}

export const getArticleDetail = (id: number): Promise<Result<Article>> => {
  return request.get(`/api/public/article/${id}`)
}

export const publishArticle = (data: ArticlePublishRequest): Promise<Result<number>> => {
  return request.post('/api/article/publish', data)
}
export const changeArticleStatus = (id: number, status: number): Promise<Result<String>> => {
  return request.post(`/api/article/statusupdate`, { id, status })
}

export const getMyArticles = (): Promise<Result<Article[]>> => {
  return request.get('/api/article/my')
}
export const updateArticle = (data: ArticlePublishRequest): Promise<Result<number>> => {
  return request.post('/api/article/update', data)
}
export const deleteArticle = (id: number): Promise<Result<string>> => {
  return request.post(`/api/article/delete`, null, { params: { id } })
}

// ========== 分类相关 ==========
export const getCategoryList = (): Promise<Result<Category[]>> => {
  return request.get('/api/public/category/list')
}
export const getCategoryDetail = (id: number): Promise<Result<Category>> => {
  return request.get(`/api/public/category/getcategory`, { params: { id } })
}
export const addCategory = (data: Category): Promise<Result<number>> => {
  return request.post('/api/category/add', data)
}
export const updateCategory = (data: Category): Promise<Result<number>> => {
  return request.post('/api/category/update', data)
}
export const deleteCategory = (id: number): Promise<Result<string>> => {
  return request.get(`/api/category/delete?id=${id}`)
}
// ========== 评论相关 ==========
export const getComments = (articleId: number): Promise<Result<Comment[]>> => {
  return request.get(`/api/public/comment/list`, { params: { articleId } })
}

export const addComment = (data: CommentCreateRequest): Promise<Result<string>> => {
  return request.post('/api/comment/add', data)
}
export const deleteComment = (id: number): Promise<Result<string>> => {
  return request.get(`/api/comment/delete?commentId=${id}`)
}