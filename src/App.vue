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
            <el-dropdown trigger="hover" @command="handleDropdownCommand">
              <span class="username">{{ userStore.displayName() }}</span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                  <el-dropdown-item command="changePassword">修改密码</el-dropdown-item>
                  <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </div>
      </div>
    </nav>

    <!-- 修改密码弹窗 -->
    <el-dialog v-model="passwordDialogVisible" title="修改密码" width="420px" :close-on-click-modal="false">
      <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="80px">
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password placeholder="请输入旧密码" />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password placeholder="请输入新密码" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password placeholder="请再次输入新密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="passwordSubmitting" @click="handleChangePassword">确认修改</el-button>
      </template>
    </el-dialog>

    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { changePassword } from '@/api'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'

const userStore = useUserStore()
const router = useRouter()

const handleLogout = (): void => {
  userStore.logout()
  router.push('/login')
}

const goToUserProfile = (userId: number) => {
  router.push(`/user/${userId}`)
}

const handleDropdownCommand = (command: string) => {
  switch (command) {
    case 'profile':
      goToUserProfile(userStore.userInfo?.id as number)
      break
    case 'changePassword':
      openPasswordDialog()
      break
    case 'logout':
      handleLogout()
      break
  }
}

const passwordDialogVisible = ref(false)
const passwordSubmitting = ref(false)
const passwordFormRef = ref<FormInstance>()
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (_rule: any, value: string, callback: (err?: Error) => void) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules: FormRules = {
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '新密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const openPasswordDialog = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordFormRef.value?.resetFields()
  passwordDialogVisible.value = true
}

const handleChangePassword = async () => {
  const valid = await passwordFormRef.value?.validate().catch(() => false)
  if (!valid) return

  passwordSubmitting.value = true
  try {
    const res = await changePassword({
      userId: userStore.userInfo?.id as number,
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })
    if (res.code === 200) {
      ElMessage.success('密码修改成功，请重新登录')
      passwordDialogVisible.value = false
      handleLogout()
    } else {
      ElMessage.error(res.message || '修改失败')
    }
  } catch {
    ElMessage.error('修改失败，请稍后重试')
  } finally {
    passwordSubmitting.value = false
  }
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
  font-size: 17px;
  line-height: 21px;
}

.nav-menu .username:hover {
  opacity: 0.8;
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