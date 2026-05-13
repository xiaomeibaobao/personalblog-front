<template>
  <div class="articles-container">
    <div class="search-header">
      <div class="search-header-right">
        <div class="search-input-wrapper">
          <el-input v-model="keyword" placeholder="请输入搜索关键词" size="large" clearable @keyup.enter="handleSearch"
            @clear="handleClear">
            <template #append>
              <el-button size="small" @click="handleSearch" :loading="loading">搜索</el-button>
            </template>
          </el-input>
        </div>

        <div class="search-result-info" v-if="total > 0">
          共找到 <strong>{{ total }}</strong> 篇文章
        </div>
      </div>
    </div>
    <!-- 文章列表 -->
    <div v-if="loading" class="loading">
      <el-skeleton :rows="3" animated />
    </div>

    <div v-else-if="articles.length === 0" class="empty">
      <el-empty description="没有找到相关文章">
      </el-empty>
    </div>
    <div v-else class="articles">
      <div v-for="article in articles" :key="article.id" class="article-card" @click="goToDetail(article.id)">
        <h2>{{ article.title }}</h2>
        <div class="info">
          <span @click.stop="goToUserProfile(article.userId)">作者：{{ article.authorName || article.userId }}</span>
          <span>分类：{{ article.categoryName || '未分类' }}</span>
          <span>阅读：{{ article.viewCount }}</span>
          <span>{{ formatDate(article.createTime) }}</span>
        </div>
        <p>{{ article.summary || article.content?.substring(0, 100) }}...</p>
      </div>
    </div>
    <!-- 分页组件 -->
    <div class="pagination-container" v-if="total > 0">
      <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :page-sizes="[5, 10, 20, 50]"
        :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
        @current-change="handlePageChange" />
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
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const keyword = ref('')

const formatDate = (dateStr: string): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

const goToDetail = (id: number): void => {
  router.push(`/article/${id}`)
}

// 页码改变
const handlePageChange = (page: number) => {
  pageNum.value = page
  loadArticles()
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 每页条数改变
const handleSizeChange = (size: number) => {
  pageSize.value = size
  pageNum.value = 1
  loadArticles()
}
const loadArticles = async (isReset: boolean = false) => {
  loading.value = true
  if(isReset) {
    pageNum.value = 1
  }
  try {
    const res = await getArticleList(pageNum.value, pageSize.value, keyword.value)
    if (res.code === 200) {
      articles.value = res.data.records || []
      total.value = res.data.total || 0
    }
  } catch (error) {
    ElMessage.error('加载文章失败')
  } finally {
    loading.value = false
  }
}

// 执行搜索
const handleSearch = async () => {
  await loadArticles(true)
}

// 清空搜索
const handleClear = () => {
  keyword.value = ''
}

const goToUserProfile = (userId: number) => {
  router.push(`/user/${userId}`)
}

onMounted(async () => {
  await loadArticles(true);
})
</script>

<style scoped>
.search-header {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e4e7ed;
}

.search-header-left {
  flex-shrink: 0;
}

.search-header-right {
  flex: 1;
}

.search-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 24px;
  font-weight: 600;
  color: #1f2d3d;
  margin: 0 0 12px 0;
}

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

.loading,
.empty {
  text-align: center;
  padding: 50px;
  color: #999;
}

.search-input-wrapper {
  margin-bottom: 10px;
}
</style>