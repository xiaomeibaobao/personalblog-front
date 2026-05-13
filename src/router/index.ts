import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/articles'
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue')
    },
    {
      path: '/articles',
      name: 'articles',
      component: () => import('@/views/ArticlesView.vue')
    },
    {
      path: '/article/:id',
      name: 'articleDetail',
      component: () => import('@/views/ArticleDetailView.vue')
    },
    {
      path: '/my-articles',
      name: 'myArticles',
      component: () => import('@/views/MyArticlesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/publish',
      name: 'publish',
      component: () => import('@/views/PublishView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/edit/:id',
      name: 'editArticle',
      component: () => import('@/views/EditArticleView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/user/:id',
      name: 'userProfile',
      component: () => import('@/views/UserProfileView.vue')
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  if(userStore.isLoggedIn() && !userStore.userInfo) {
    try {
      await userStore.getUserInfo()
    } catch (error) {
      userStore.logout()
      if(to.meta.requiresAuth) {
        next("login")
        return
      }
    }
  }
  if (to.meta.requiresAuth && !userStore.isLoggedIn()) {
    next('/login')
  } else {
    next()
  }
})

export default router