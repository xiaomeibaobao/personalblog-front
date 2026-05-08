<template>
  <div class="article-detail" v-loading="loading">
    <!-- 文章内容 -->
    <div v-if="article" class="article-card">
      <h1 class="title">{{ article.title }}</h1>
      
      <div class="meta">
        <div class="meta-item">
          <el-icon><User /></el-icon>
          <span>{{ article.authorName || article.userId }}</span>
        </div>
        <div class="meta-item">
          <el-icon><Folder /></el-icon>
          <span>{{ article.categoryName || '未分类' }}</span>
        </div>
        <div class="meta-item">
          <el-icon><View /></el-icon>
          <span>{{ article.viewCount }} 阅读</span>
        </div>
        <div class="meta-item">
          <el-icon><Clock /></el-icon>
          <span>{{ formatDate(article.createTime) }}</span>
        </div>
      </div>
      
      <div class="content" v-html="article.content"></div>
    </div>
    
    <!-- 加载中 -->
    <div v-else-if="loading" class="loading">加载中...</div>
    
    <!-- 文章不存在 -->
    <div v-else class="error">
      <el-empty description="文章不存在或已被删除" />
    </div>
    
    <!-- 评论区域 -->
    <div v-if="article" class="comments-section">
      <h3 class="comments-title">
        <el-icon><ChatLineSquare /></el-icon>
        评论 ({{ comments.length }})
      </h3>
      
      <!-- 发表评论 -->
      <div class="comment-form" v-if="userStore.isLoggedIn()">
        <el-input
          v-model="commentContent"
          type="textarea"
          :rows="4"
          placeholder="写下你的评论..."
          maxlength="500"
          show-word-limit
        />
        <div class="form-actions">
          <el-button type="primary" @click="submitComment" :loading="commentLoading">
            发表评论
          </el-button>
        </div>
      </div>
      <div v-else class="login-tip">
        <el-alert
          title="提示"
          type="info"
          :closable="false"
          show-icon
        >
          <template #default>
            <router-link to="/login">登录后发表评论</router-link>
          </template>
        </el-alert>
      </div>
      
      <!-- 评论列表 -->
      <div class="comment-list" v-if="comments.length > 0">
        <div v-for="comment in comments" :key="comment.id" class="comment-item">
          <div class="comment-header">
            <div class="comment-author">
              <el-icon><User /></el-icon>
              <span>{{ comment.authorName || comment.userId }}</span>
            </div>
            <div class="comment-time">{{ formatDate(comment.createTime) }}</div>
          </div>
          <div class="comment-content">{{ comment.content }}</div>
          <div class="comment-actions" v-if="userStore.isLoggedIn() && userStore.userInfo.id === comment.userId">
            <el-button type="danger" link size="small" @click="handleDeleteComment(comment.id)">
              <el-icon><Delete /></el-icon> 删除
            </el-button>
          </div>
        </div>
      </div>
      <div v-else class="no-comments">
        <el-empty description="暂无评论，快来抢沙发！" :image-size="80" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Folder, View, Clock, ChatLineSquare, Delete } from '@element-plus/icons-vue'
import { getArticleDetail, getComments, addComment, deleteComment as deleteCommentApi } from '@/api'
import { useUserStore } from '@/stores/user'
import type { Article, Comment } from '@/types'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const article = ref<Article | null>(null)
const comments = ref<Comment[]>([])
const commentContent = ref('')
const commentLoading = ref(false)

// 格式化日期
const formatDate = (dateStr: string): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`
}

// 加载文章详情
const loadArticle = async () => {
  const id = parseInt(route.params.id as string)
  if (isNaN(id)) {
    router.push('/')
    return
  }
  
  try {
    const res = await getArticleDetail(id)
    if (res.code === 200 && res.data) {
      article.value = res.data
    } else {
      article.value = null
    }
  } catch (error) {
    console.error('加载文章失败', error)
    article.value = null
  }
}

// 加载评论列表
const loadComments = async () => {
  const id = parseInt(route.params.id as string)
  try {
    const res = await getComments(id)
    if (res.code === 200) {
      comments.value = res.data || []
    }
  } catch (error) {
    console.error('加载评论失败', error)
  }
}

// 发表评论
const submitComment = async () => {
  if (!commentContent.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }
  
  commentLoading.value = true
  try {
    const res = await addComment({
      articleId: parseInt(route.params.id as string),
      content: commentContent.value
    })
    if (res.code === 200) {
      ElMessage.success('评论成功')
      commentContent.value = ''
      loadComments()
    }
  } catch (error) {
    console.error('评论失败', error)
  } finally {
    commentLoading.value = false
  }
}

// 删除评论
const handleDeleteComment = async (commentId: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const res = await deleteCommentApi(commentId)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadComments()
    }
  } catch (error) {
    // 用户取消删除
    if (error !== 'cancel') {
      console.error('删除评论失败', error)
    }
  }
}

// 删除文章
const handleDeleteArticle = async () => {
  if (!article.value) return
  
  try {
    await ElMessageBox.confirm('确定要删除这篇文章吗？删除后不可恢复！', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const { deleteArticle } = await import('@/api')
    const res = await deleteArticle(article.value.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      router.push('/my-articles')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除文章失败', error)
    }
  }
}

onMounted(() => {
  loadArticle()
  loadComments()
})
</script>

<style scoped>
.article-detail {
  max-width: 900px;
  margin: 0 auto;
}

.article-card {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.title {
  font-size: 28px;
  font-weight: 600;
  color: #1f2d3d;
  margin-bottom: 20px;
  line-height: 1.3;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 24px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #909399;
  font-size: 14px;
}

.content {
  line-height: 1.8;
  font-size: 16px;
  color: #2c3e50;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 评论区域 */
.comments-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-top: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.comments-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #1f2d3d;
  margin-bottom: 20px;
}

.comment-form {
  margin-bottom: 30px;
}

.form-actions {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

.login-tip {
  margin-bottom: 20px;
}

.login-tip a {
  color: #409eff;
  text-decoration: none;
  margin-left: 8px;
}

.comment-list {
  margin-top: 20px;
}

.comment-item {
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.comment-author {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  color: #1f2d3d;
}

.comment-time {
  font-size: 12px;
  color: #c0c4cc;
}

.comment-content {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 8px;
}

.comment-actions {
  text-align: right;
}

.loading, .error {
  text-align: center;
  padding: 60px;
  background: white;
  border-radius: 12px;
}
</style>