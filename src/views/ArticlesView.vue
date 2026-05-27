<template>
  <div class="articles-container">
    <div class="articles-main">
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

          <div class="hot-tags-filter" v-if="hotTags.length > 0">
            <span class="filter-label">热门标签：</span>
            <el-tag v-for="tag in hotTags" :key="tag.id" :type="selectedTagId === tag.id ? 'primary' : 'info'"
              effect="plain" class="filter-tag" @click="filterByTag(tag.id)">
              {{ tag.name }} ({{ tag.useCount }})
            </el-tag>
            <el-button v-if="selectedTagId" link type="primary" @click="clearFilter">清除筛选</el-button>
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
    <!-- 右侧：侧边栏 -->
    <div class="articles-sidebar">
      <!-- 热门文章（按阅读量） -->
      <div class="sidebar-card">
        <h3 class="sidebar-title">
          <el-icon>
            <TrendCharts />
          </el-icon>
          热门文章（阅读榜）
        </h3>
        <div class="hot-list">
          <div v-for="(article, index) in hotArticlesByView" :key="article.id" class="hot-item"
            @click="goToDetail(article.id)">
            <span class="hot-rank" :class="getRankClass(index + 1)">{{ index + 1 }}</span>
            <div class="hot-info">
              <div class="hot-title">{{ article.title }}</div>
              <div class="hot-meta">
                <span>{{ article.viewCount }} 阅读</span>
              </div>
            </div>
          </div>
          <div v-if="hotArticlesByView.length === 0" class="empty-tip">
            暂无热门文章
          </div>
        </div>
      </div>

      <!-- 热门文章（按点赞数） -->
      <div class="sidebar-card">
        <h3 class="sidebar-title">
          <el-icon>
            <Star />
          </el-icon>
          热门文章（点赞榜）
        </h3>
        <div class="hot-list">
          <div v-for="(article, index) in hotArticlesByLike" :key="article.id" class="hot-item"
            @click="goToDetail(article.id)">
            <span class="hot-rank" :class="getRankClass(index + 1)">{{ index + 1 }}</span>
            <div class="hot-info">
              <div class="hot-title">{{ article.title }}</div>
              <div class="hot-meta">
                <span>{{ article.likeCount }} 点赞</span>
              </div>
            </div>
          </div>
          <div v-if="hotArticlesByLike.length === 0" class="empty-tip">
            暂无热门文章
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getArticleList, getHotTags, getHotArticlesByView, getHotArticlesByLike } from '@/api'
import type { Article, Tag } from '@/types'
import { TrendCharts, Star } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const articles = ref<Article[]>([])
const loading = ref(false)
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const keyword = ref('')
const hotTags = ref<Tag[]>([])
const selectedTagId = ref<number | null>(null)
const hotArticlesByView = ref<Article[]>([])
const hotArticlesByLike = ref<Article[]>([])

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
  if (isReset) {
    pageNum.value = 1
  }
  try {
    const res = await getArticleList(pageNum.value, pageSize.value, keyword.value, selectedTagId.value)
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

// 加载热门标签
const loadHotTags = async () => {
  try {
    const res = await getHotTags()
    if (res.code === 200) {
      hotTags.value = res.data || []
    }
  } catch (error) {
    console.error('加载热门标签失败', error)
  }
}
// 按标签筛选
const filterByTag = (tagId: number) => {
  selectedTagId.value = tagId
  pageNum.value = 1
  router.push({
    query: { ...route.query, tagId: tagId.toString() }
  })
}
// 清除筛选
const clearFilter = () => {
  selectedTagId.value = null
  pageNum.value = 1
  const { tagId, ...restQuery } = route.query
  router.push({ query: restQuery })
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

// 获取排名样式
const getRankClass = (rank: number) => {
  if (rank === 1) return 'rank-1'
  if (rank === 2) return 'rank-2'
  if (rank === 3) return 'rank-3'
  return ''
}

// 加载热门文章
const loadHotArticles = async () => {
  try {
    const [viewRes, likeRes] = await Promise.all([
      getHotArticlesByView(5),
      getHotArticlesByLike(5)
    ])
    if (viewRes.code === 200) {
      hotArticlesByView.value = viewRes.data || []
    }
    if (likeRes.code === 200) {
      hotArticlesByLike.value = likeRes.data || []
    }
  } catch (error) {
    console.error('加载热门文章失败', error)
  }
}

// 监听 URL 参数变化
watch(() => route.query.tagId, (tagId) => {
  if (tagId) {
    selectedTagId.value = parseInt(tagId as string)
  } else {
    selectedTagId.value = null
  }
  loadArticles(true)
}, { immediate: true })

onMounted(async () => {
  await loadHotTags();
  await loadHotArticles()
})
</script>

<style lang="scss" scoped>
.search-header {
  display: flex;
  gap: 20px;
  // margin-bottom: 24px;
  padding-bottom: 16px;
  // border-bottom: 2px solid #e4e7ed;
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

.hot-tags-filter {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  padding: 16px;
  background: $bg-white;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-sm;
}

.filter-label {
  font-size: 14px;
  color: $text-secondary;
}

.filter-tag {
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
  }
}

.articles-container {
  display: flex;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.articles-main {
  flex: 3;
}

.articles-sidebar {
  flex: 1;
}

.sidebar-card {
  background: $bg-white;
  border-radius: $border-radius-lg;
  padding: $spacing-lg;
  margin-bottom: $spacing-lg;
  box-shadow: $shadow-sm;
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  font-size: $font-size-lg;
  font-weight: 600;
  color: $text-primary;
  margin: 0 0 $spacing-md 0;
  padding-bottom: $spacing-sm;
  border-bottom: 2px solid $border-color;
}

.hot-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.hot-item {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  cursor: pointer;
  padding: $spacing-sm;
  border-radius: $border-radius-sm;
  transition: background-color 0.2s;

  &:hover {
    background-color: $bg-gray;

    .hot-title {
      color: $primary-color;
    }
  }
}

.hot-rank {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-size-sm;
  font-weight: 600;
  color: $text-placeholder;
  flex-shrink: 0;

  &.rank-1 {
    color: #f56c6c;
    font-size: $font-size-lg;
  }

  &.rank-2 {
    color: #e6a23c;
  }

  &.rank-3 {
    color: #67c23a;
  }
}

.hot-info {
  flex: 1;
  min-width: 0;
}

.hot-title {
  font-size: $font-size-md;
  font-weight: 500;
  color: $text-regular;
  line-height: 1.4;
  @include text-ellipsis();
}

.hot-meta {
  font-size: $font-size-xs;
  color: $text-placeholder;
  margin-top: 4px;
}

.empty-tip {
  text-align: center;
  color: $text-placeholder;
  padding: $spacing-lg;
}

@include mobile {
  .articles-container {
    flex-direction: column;
  }
}
</style>