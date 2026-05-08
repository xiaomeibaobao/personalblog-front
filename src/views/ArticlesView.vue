<template>
  <div>
    <h1>文章列表</h1>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="articles.length === 0" class="empty">暂无文章</div>
    <div v-else class="articles">
      <div v-for="article in articles" :key="article.id" class="article-card" @click="goToDetail(article.id)">
        <h2>{{ article.title }}</h2>
        <div class="info">
          <span>作者：{{ article.authorName || article.userId }}</span>
          <span>分类：{{ article.categoryName || '未分类' }}</span>
          <span>阅读：{{ article.viewCount }}</span>
          <span>{{ formatDate(article.createTime) }}</span>
        </div>
        <p>{{ article.summary || article.content?.substring(0, 100) }}...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getArticleList } from '@/api'
import type { Article } from '@/types'

const router = useRouter()
const articles = ref<Article[]>([])
const loading = ref(false)

const formatDate = (dateStr: string): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

const goToDetail = (id: number): void => {
  router.push(`/article/${id}`)
}

onMounted(async () => {
  loading.value = true
  try {
    const res = await getArticleList()
    if (res.code === 200) {
      articles.value = res.data || []
    }
  } catch (error) {
    ElMessage.error('加载文章失败')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.articles {
  margin-top: 20px;
}

.article-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  cursor: pointer;
  transition: box-shadow 0.3s;
}

.article-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.article-card h2 {
  margin-bottom: 10px;
  color: #2c3e50;
}

.info {
  display: flex;
  gap: 20px;
  color: #999;
  font-size: 14px;
  margin-bottom: 10px;
}

.article-card p {
  color: #666;
  line-height: 1.6;
}

.loading, .empty {
  text-align: center;
  padding: 50px;
  color: #999;
}
</style>