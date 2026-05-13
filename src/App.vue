<template>
  <div>
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-brand">
          <router-link to="/articles">博客系统</router-link>
        </div>
        <div class="nav-menu">
          <router-link to="/articles">首页</router-link>
          <router-link v-if="userStore.isLoggedIn()" to="/my-articles">我的文章</router-link>
          <router-link v-if="userStore.isLoggedIn()" to="/publish">发布文章</router-link>
          <template v-if="!userStore.isLoggedIn()">
            <router-link to="/login">登录</router-link>
            <router-link to="/register">注册</router-link>
          </template>
          <template v-else>
            <span class="username" @click.stop="goToUserProfile(userStore.userInfo?.id as number)">{{ userStore.displayName() }}</span>
            <a href="#" @click.prevent="handleLogout">退出</a>
          </template>
        </div>
      </div>
    </nav>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const handleLogout = (): void => {
  userStore.logout()
  router.push('/login')
}

const goToUserProfile = (userId: number) => {
  router.push(`/user/${userId}`)
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f5f5;
}

.navbar {
  background-color: #2c3e50;
  color: white;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
}

.nav-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand a {
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  text-decoration: none;
}

.nav-menu a, .nav-menu span {
  color: white;
  text-decoration: none;
  margin-left: 20px;
}

.nav-menu .username {
  margin-left: 20px;
  color: #42b983;
  cursor: pointer;
}

main {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

a {
  cursor: pointer;
}

/* 全局链接样式 */
a {
  text-decoration: none;
  color: #409eff;
}

button {
  cursor: pointer;
}
</style>