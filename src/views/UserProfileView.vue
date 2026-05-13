<template>
  <div class="user-profile">
    <!-- 用户信息卡片 -->
    <div class="profile-card" v-if="profile">
      <div class="profile-header">
        <div class="profile-avatar">
          <el-avatar :size="120" :src="profile.avatar || defaultAvatar">
            {{ profile.username.charAt(0).toUpperCase() }}
          </el-avatar>
        </div>
        <div class="profile-info">
          <h1 class="profile-name">{{ profile.nickname || profile.username }}</h1>
          <div class="profile-username">@{{ profile.username }}</div>
          <div class="profile-email" v-if="profile.email">
            <el-icon><Message /></el-icon>
            {{ profile.email }}
          </div>
          <div class="profile-time">
            <el-icon><Clock /></el-icon>
            加入于 {{ formatDate(profile.createTime, 'YYYY年MM月DD日') }}
          </div>
        </div>
      </div>

      <div class="profile-stats">
        <div class="stat-item">
          <div class="stat-number">{{ profile.articleCount }}</div>
          <div class="stat-label">文章</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ profile.totalViewCount }}</div>
          <div class="stat-label">阅读量</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ profile.totalLikeCount }}</div>
          <div class="stat-label">获赞</div>
        </div>
      </div>
    </div>

    <!-- 文章列表 -->
    <div class="articles-section">
      <h2 class="section-title">发布的文章</h2>

      <div v-if="loading" class="loading-state">
        <el-skeleton :rows="3" animated />
      </div>

      <div v-else-if="articles.length === 0" class="empty-state">
        <el-empty description="暂无文章" />
      </div>

      <div v-else class="articles-list">
        <div
          v-for="article in articles"
          :key="article.id"
          class="article-item"
          @click="goToDetail(article.id)"
        >
          <div class="article-cover" v-if="article.cover">
            <img :src="article.cover" :alt="article.title" />
          </div>
          <div class="article-content">
            <h3 class="article-title">{{ article.title }}</h3>
            <p class="article-summary" v-if="article.summary">
              {{ article.summary }}
            </p>
            <div class="article-meta">
              <span class="meta-tag">
                <el-icon><Folder /></el-icon>
                {{ article.categoryName || '未分类' }}
              </span>
              <span class="meta-tag">
                <el-icon><View /></el-icon>
                {{ article.viewCount || 0 }}
              </span>
              <span class="meta-tag">
                <el-icon><ChatLineSquare /></el-icon>
                {{ article.commentCount || 0 }}
              </span>
              <span class="meta-tag">
                <el-icon><Clock /></el-icon>
                {{ formatDate(article.createTime, 'YYYY-MM-DD') }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页组件 -->
      <div class="pagination-wrapper" v-if="total > 0">
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Message, Clock, Folder, View, ChatLineSquare } from '@element-plus/icons-vue'
import { getUserProfile, getUserArticles } from '@/api'
import { formatDate } from '@/utils/dayjs'
import type { UserProfile, Article } from '@/types'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const profile = ref<UserProfile | null>(null)
const articles = ref<Article[]>([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// 跳转详情
const goToDetail = (id: number) => {
  router.push(`/article/${id}`)
}

// 加载用户信息
const loadProfile = async () => {
  const userId = parseInt(route.params.id as string)
  if (isNaN(userId)) {
    ElMessage.error('用户不存在')
    router.push('/')
    return
  }

  try {
    const res = await getUserProfile(userId)
    if (res.code === 200) {
      profile.value = res.data
    } else {
      ElMessage.error('用户不存在')
      router.push('/')
    }
  } catch (error) {
    console.error('加载用户信息失败', error)
    ElMessage.error('加载用户信息失败')
    router.push('/')
  }
}

// 加载文章列表
const loadArticles = async () => {
  const userId = parseInt(route.params.id as string)

  loading.value = true
  try {
    const res = await getUserArticles(userId, pageNum.value, pageSize.value)
    if (res.code === 200) {
      articles.value = res.data.records || []
      total.value = res.data.total
    }
  } catch (error) {
    console.error('加载文章失败', error)
    ElMessage.error('加载文章失败')
  } finally {
    loading.value = false
  }
}

// 每页条数改变
const handleSizeChange = (size: number) => {
  pageSize.value = size
  pageNum.value = 1
  loadArticles()
}

// 页码改变
const handlePageChange = (page: number) => {
  pageNum.value = page
  loadArticles()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 监听路由参数变化
watch(
  () => route.params.id,
  () => {
    pageNum.value = 1
    loadProfile()
    loadArticles()
  }
)

onMounted(() => {
  loadProfile()
  loadArticles()
})
</script>

<style lang="scss" scoped>
// ========== 变量定义 ==========
$primary-color: #409eff;
$success-color: #67c23a;
$warning-color: #e6a23c;
$danger-color: #f56c6c;

$text-primary: #1f2d3d;
$text-regular: #2c3e50;
$text-secondary: #606266;
$text-placeholder: #c0c4cc;

$border-color: #e4e7ed;
$border-light: #f0f0f0;

$bg-white: #ffffff;
$bg-gray: #f5f7fa;

$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;

$border-radius-sm: 4px;
$border-radius-md: 8px;
$border-radius-lg: 12px;
$border-radius-xl: 16px;

$font-size-xs: 12px;
$font-size-sm: 13px;
$font-size-md: 14px;
$font-size-lg: 16px;
$font-size-xl: 18px;
$font-size-xxl: 24px;

$shadow-sm: 0 1px 4px rgba(0, 0, 0, 0.04);
$shadow-md: 0 2px 12px rgba(0, 0, 0, 0.08);
$shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.12);

// ========== 混入 ==========
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@mixin flex-column {
  display: flex;
  flex-direction: column;
}

@mixin card {
  background: $bg-white;
  border-radius: $border-radius-xl;
  box-shadow: $shadow-md;
  overflow: hidden;
}

@mixin text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@mixin text-clamp($lines: 2) {
  display: -webkit-box;
  -webkit-line-clamp: $lines;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@mixin mobile {
  @media (max-width: 768px) {
    @content;
  }
}

@mixin tablet {
  @media (max-width: 1024px) {
    @content;
  }
}

// ========== 主容器 ==========
.user-profile {
  max-width: 1000px;
  margin: 0 auto;
}

// ========== 用户信息卡片 ==========
.profile-card {
  @include card;
  padding: $spacing-xl;
  margin-bottom: $spacing-lg;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-lg;
  }
}

.profile-header {
  display: flex;
  gap: $spacing-xl;
  margin-bottom: $spacing-lg;

  @include mobile {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: $spacing-md;
  }
}

.profile-avatar {
  flex-shrink: 0;
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: $font-size-xxl;
  font-weight: 600;
  color: $text-primary;
  margin: 0 0 $spacing-sm 0;
}

.profile-username {
  color: $text-placeholder;
  font-size: $font-size-sm;
  margin-bottom: $spacing-sm;
}

.profile-email,
.profile-time {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  color: $text-secondary;
  font-size: $font-size-sm;
  margin-top: $spacing-sm;

  @include mobile {
    justify-content: center;
  }
}

// ========== 统计卡片 ==========
.profile-stats {
  display: flex;
  gap: 48px;
  padding-top: $spacing-lg;
  border-top: 1px solid $border-color;
  justify-content: center;

  @include mobile {
    gap: $spacing-xl;
  }
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-number {
  font-size: $font-size-xxl;
  font-weight: 600;
  color: $primary-color;
}

.stat-label {
  font-size: $font-size-sm;
  color: $text-placeholder;
  margin-top: $spacing-xs;
}

// ========== 文章列表区域 ==========
.articles-section {
  @include card;
  padding: $spacing-lg;
}

.section-title {
  font-size: $font-size-xl;
  font-weight: 600;
  color: $text-primary;
  margin: 0 0 $spacing-lg 0;
  padding-bottom: $spacing-sm;
  border-bottom: 2px solid $border-color;
}

// ========== 文章列表 ==========
.articles-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.article-item {
  display: flex;
  gap: $spacing-lg;
  padding: $spacing-md;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: $bg-gray;
    transform: translateX($spacing-xs);

    .article-title {
      color: $primary-color;
    }
  }

  @include mobile {
    flex-direction: column;
    gap: $spacing-sm;
    padding: $spacing-sm;
  }
}

.article-cover {
  width: 180px;
  flex-shrink: 0;
  border-radius: $border-radius-md;
  overflow: hidden;
  background-color: $bg-gray;

  img {
    width: 100%;
    height: 110px;
    object-fit: cover;
    transition: transform 0.2s;
  }

  &:hover img {
    transform: scale(1.05);
  }

  @include mobile {
    width: 100%;

    img {
      height: 160px;
    }
  }
}

.article-content {
  flex: 1;
}

.article-title {
  font-size: $font-size-xl;
  font-weight: 600;
  color: $text-primary;
  margin: 0 0 $spacing-sm 0;
  transition: color 0.2s;
  @include text-clamp(1);
}

.article-summary {
  color: $text-secondary;
  font-size: $font-size-sm;
  line-height: 1.5;
  margin-bottom: $spacing-sm;
  @include text-clamp(2);
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-lg;
  margin-top: $spacing-sm;

  @include mobile {
    gap: $spacing-md;
  }
}

.meta-tag {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  color: $text-placeholder;
  font-size: $font-size-xs;

  .el-icon {
    font-size: $font-size-sm;
  }
}

// ========== 加载和空状态 ==========
.loading-state,
.empty-state {
  padding: 60px;
  text-align: center;
}

// ========== 分页 ==========
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: $spacing-lg;
  padding-top: $spacing-md;
  border-top: 1px solid $border-light;
}
</style>