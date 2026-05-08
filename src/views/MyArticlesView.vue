<template>
  <div class="my-articles-container">
    <div class="page-header">
      <h1 class="page-title">我的文章</h1>
      <el-button type="primary" @click="goToPublish">
        <el-icon><Plus /></el-icon>
        写新文章
      </el-button>
    </div>

    <!-- 标签切换 -->
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="全部" name="all" />
      <el-tab-pane label="已发布" name="published" />
      <el-tab-pane label="草稿" name="draft" />
    </el-tabs>

    <!-- 文章列表 -->
    <div v-if="loading" class="loading">
      <el-skeleton :rows="3" animated />
    </div>
    
    <div v-else-if="filteredArticles.length === 0" class="empty">
      <el-empty description="暂无文章，去写一篇吧" />
    </div>
    
    <div v-else class="article-list">
      <div
        v-for="article in filteredArticles"
        :key="article.id"
        class="article-card"
      >
        <div class="article-cover" v-if="article.cover">
          <img :src="article.cover" alt="封面" />
        </div>
        <div class="article-info">
          <div class="article-header">
            <h2 class="article-title" @click="goToDetail(article.id)">
              {{ article.title }}
            </h2>
            <div class="article-badges">
              <el-tag :type="article.status === 1 ? 'success' : 'warning'" size="small">
                {{ article.status === 1 ? '已发布' : '草稿' }}
              </el-tag>
            </div>
          </div>
          
          <div class="article-summary" v-if="article.summary">
            {{ article.summary }}
          </div>
          
          <div class="article-meta">
            <span class="meta-item">
              <el-icon><Folder /></el-icon>
              {{ article.categoryName || '未分类' }}
            </span>
            <span class="meta-item">
              <el-icon><View /></el-icon>
              {{ article.viewCount || 0 }} 阅读
            </span>
            <span class="meta-item">
              <el-icon><ChatLineSquare /></el-icon>
              {{ article.commentCount || 0 }} 评论
            </span>
            <span class="meta-item">
              <el-icon><Clock /></el-icon>
              {{ formatDate(article.createTime) }}
            </span>
          </div>
          
          <div class="article-actions">
            <el-button
              v-if="article.status === 0"
              type="primary"
              link
              size="small"
              @click="handlePublish(article.id)"
            >
              <el-icon><Promotion /></el-icon>
              发布
            </el-button>
            <el-button type="primary" link size="small" @click="goToEdit(article.id)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(article.id)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Folder, View, ChatLineSquare, Clock, Edit, Delete, Promotion } from '@element-plus/icons-vue'
import { getMyArticles, changeArticleStatus, deleteArticle } from '@/api'
import type { Article } from '@/types'

const router = useRouter()
const loading = ref(false)
const articles = ref<Article[]>([])
const activeTab = ref('all')

// 过滤文章
const filteredArticles = computed(() => {
  if (activeTab.value === 'all') {
    return articles.value
  }
  const status = activeTab.value === 'published' ? 1 : 0
  return articles.value.filter(article => article.status === status)
})

// 格式化日期
const formatDate = (dateStr: string): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  // 刚发布显示相对时间
  if (diff < 3600000) {
    return Math.floor(diff / 60000) + '分钟前'
  }
  if (diff < 86400000) {
    return Math.floor(diff / 3600000) + '小时前'
  }
  
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

// 加载我的文章
const loadMyArticles = async () => {
  loading.value = true
  try {
    const res = await getMyArticles()
    if (res.code === 200) {
      articles.value = res.data || []
    }
  } catch (error) {
    console.error('加载文章失败', error)
    ElMessage.error('加载文章失败')
  } finally {
    loading.value = false
  }
}

// 切换标签
const handleTabChange = () => {}

// 跳转详情
const goToDetail = (id: number) => {
  router.push(`/article/${id}`)
}

// 跳转编辑
const goToEdit = (id: number) => {
  router.push(`/edit/${id}`)
}

// 跳转发布页面
const goToPublish = () => {
  router.push('/publish')
}

// 发布草稿
const handlePublish = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要发布这篇文章吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })
    
    const res = await changeArticleStatus(id, 1)
    if (res.code === 200) {
      ElMessage.success('发布成功')
      loadMyArticles()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('发布失败', error)
    }
  }
}

// 删除文章
const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这篇文章吗？删除后不可恢复！', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const res = await deleteArticle(id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadMyArticles()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败', error)
    }
  }
}

onMounted(() => {
  loadMyArticles()
})
</script>

<style scoped>
.my-articles-container {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e4e7ed;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2d3d;
  margin: 0;
}

.loading {
  background: white;
  border-radius: 12px;
  padding: 24px;
}

.empty {
  background: white;
  border-radius: 12px;
  padding: 60px;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 20px;
}

.article-card {
  background: white;
  border-radius: 12px;
  display: flex;
  overflow: hidden;
  transition: box-shadow 0.3s;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.article-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.article-cover {
  width: 200px;
  flex-shrink: 0;
  overflow: hidden;
  background: #f5f7fa;
}

.article-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.article-info {
  flex: 1;
  padding: 20px;
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.article-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2d3d;
  margin: 0;
  cursor: pointer;
  transition: color 0.2s;
  flex: 1;
}

.article-title:hover {
  color: #409eff;
}

.article-badges {
  flex-shrink: 0;
}

.article-summary {
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 13px;
}

.article-actions {
  display: flex;
  gap: 16px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

/* 无封面时的样式 */
.article-card:not(:has(.article-cover)) .article-info {
  padding-left: 20px;
}

@media (max-width: 640px) {
  .article-cover {
    width: 120px;
  }
  
  .article-title {
    font-size: 16px;
  }
  
  .article-meta {
    gap: 12px;
  }
}
</style>