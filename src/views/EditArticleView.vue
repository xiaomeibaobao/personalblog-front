<template>
  <div class="edit-container">
    <div class="edit-card">
      <h1 class="title">编辑文章</h1>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" label-position="right">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入文章标题" maxlength="100" show-word-limit />
        </el-form-item>

        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="form.categoryId" placeholder="请选择分类" clearable style="width: 100%">
            <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="标签" prop="tagIds">
          <div class="tag-selector">
            <el-select v-model="form.tagIds" multiple filterable allow-create default-first-option
              placeholder="请选择或输入新标签" style="width: 100%" @change="handleTagChange">
              <el-option v-for="tag in tagList" :key="tag.id" :label="tag.name" :value="tag.id" />
            </el-select>

            <!-- 热门标签推荐 -->
            <div class="hot-tags" v-if="hotTags.length > 0">
              <span class="hot-tags-label">热门推荐：</span>
              <el-tag v-for="tag in hotTags" :key="tag.id" size="small" class="hot-tag-item" @click="addHotTag(tag.id)">
                {{ tag.name }}
              </el-tag>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="摘要" prop="summary">
          <el-input v-model="form.summary" type="textarea" :rows="3" placeholder="请输入文章摘要（选填）" maxlength="500"
            show-word-limit />
        </el-form-item>

        <el-form-item label="封面图" prop="cover">
          <div class="cover-upload">
            <el-upload class="cover-uploader" :action="uploadUrl" :headers="uploadHeaders" :show-file-list="false"
              :on-success="handleUploadSuccess" :on-error="handleUploadError" :before-upload="beforeUpload">
              <img v-if="form.cover" :src="form.cover" class="cover-preview" />
              <el-icon v-else class="cover-uploader-icon">
                <Plus />
              </el-icon>
            </el-upload>
            <div class="cover-tip">建议尺寸：800x400，支持 jpg/png 格式</div>
          </div>
        </el-form-item>

        <!-- WangEditor 富文本编辑器 -->
        <el-form-item label="内容" prop="content">
          <div style="border: 1px solid #e4e7ed; border-radius: 4px; overflow: hidden;">
            <Toolbar :editor="editor" :defaultConfig="toolbarConfig" mode="default"
              style="border-bottom: 1px solid #e4e7ed;" />
            <Editor v-model="form.content" :defaultConfig="editorConfig" mode="default"
              style="height: 400px; overflow-y: hidden;" @onCreated="handleEditorCreated" />
          </div>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">发布</el-radio>
            <el-radio :label="0">存为草稿</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ form.status === 1 ? '更新并发布' : '保存草稿' }}
          </el-button>
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="danger" @click="handleDelete" :loading="deleting">
            删除文章
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, shallowRef } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { getCategoryList, getArticleDetail, updateArticle, deleteArticle, getAllTags, getHotTags, batchInsertTags } from '@/api'
import type { Category, ArticlePublishRequest, Tag } from '@/types'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const formRef = ref<FormInstance>()
const submitting = ref(false)
const deleting = ref(false)
const categories = ref<Category[]>([])

// 编辑器实例
const editor = shallowRef()

// 上传配置
const uploadUrl = '/api/upload/image'
const uploadHeaders = {
  token: `${localStorage.getItem('token')}`
}

// 工具栏配置
const toolbarConfig = {
  excludeKeys: ['group-video', 'fullScreen']
}

// 编辑器配置
const editorConfig = {
  placeholder: '请输入文章内容...',
  MENU_CONF: {
    uploadImage: {
      server: '/api/upload/image',
      headers: uploadHeaders,
      allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif'],
      maxFileSize: 2 * 1024 * 1024,
      onSuccess(file: File, res: any) {
        if (res.code === 200 && res.data?.url) {
          return res.data.url
        }
        return ''
      },
      onFailed(file: File, res: any) {
        ElMessage.error(res.message || '图片上传失败')
      },
      onError(file: File, err: any) {
        ElMessage.error('图片上传出错')
      }
    }
  }
}

const form = reactive<ArticlePublishRequest & { id?: number }>({
  id: undefined,
  title: '',
  categoryId: undefined,
  summary: '',
  cover: '',
  content: '',
  status: 1,
  tagIds: []
})

const rules: FormRules = {
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    { min: 1, max: 100, message: '标题长度1-100字', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入文章内容', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ]
}

// 加载分类列表
const loadCategories = async () => {
  try {
    const res = await getCategoryList()
    if (res.code === 200) {
      categories.value = res.data || []
    }
  } catch (error) {
    console.error('加载分类失败', error)
  }
}

// 加载文章详情
const loadArticle = async () => {
  const id = parseInt(route.params.id as string)
  if (isNaN(id)) {
    ElMessage.error('文章ID无效')
    router.push('/my-articles')
    return
  }

  try {
    const res = await getArticleDetail(id, userStore.userInfo?.id || null)
    if (res.code === 200 && res.data) {
      form.id = res.data.id
      form.title = res.data.title
      form.categoryId = res.data.categoryId
      form.summary = res.data.summary
      form.cover = res.data.cover
      form.content = res.data.content
      form.status = res.data.status
      form.tagIds = res.data.tags?.map(tag => tag.id ?? 0) || []
    } else {
      ElMessage.error('文章不存在')
      router.push('/my-articles')
    }
  } catch (error) {
    console.error('加载文章失败', error)
    ElMessage.error('加载文章失败')
    router.push('/my-articles')
  }
}

// 编辑器创建完成
const handleEditorCreated = (instance: any) => {
  editor.value = instance
}

// 上传前校验
const beforeUpload = (file: File) => {
  const isImage = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传 JPG/PNG 格式图片')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB')
    return false
  }
  return true
}

// 上传成功
const handleUploadSuccess = (response: any) => {
  if (response.code === 200 && response.data) {
    form.cover = response.data.url
    ElMessage.success('上传成功')
  } else {
    ElMessage.error(response.message || '上传失败')
  }
}

// 上传失败
const handleUploadError = () => {
  ElMessage.error('上传失败')
}

// 提交更新
const handleSubmit = async () => {
  if (!formRef.value) return
  if (!form.id) return

  await formRef.value.validate()
  const selectedNewTagNames = form.tagIds?.filter(tagId => typeof tagId == "string")
  const res = await batchInsertTags(selectedNewTagNames as string[])
  const newTagIds = form.tagIds?.filter(tagId => typeof tagId == "number")
  if (res.code === 200) {
    newTagIds?.push(...res.data??[])    
  } else {
    ElMessage.error(res.message || '新增标签失败')
    return
  }
  submitting.value = true
  try {
    const res = await updateArticle({
      id: form.id,
      title: form.title,
      content: form.content,
      summary: form.summary || undefined,
      cover: form.cover || undefined,
      categoryId: form.categoryId,
      status: form.status,
      tagIds: newTagIds
    })

    if (res.code === 200) {
      ElMessage.success(form.status === 1 ? '更新成功' : '草稿已保存')
      router.push('/my-articles')
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error) {
    console.error('更新失败', error)
    ElMessage.error('操作失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

// 删除文章
const handleDelete = async () => {
  if (!form.id) return

  try {
    await ElMessageBox.confirm('确定要删除这篇文章吗？删除后不可恢复！', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    deleting.value = true
    const res = await deleteArticle(form.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      router.push('/my-articles')
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败', error)
    }
  } finally {
    deleting.value = false
  }
}

// 取消
const handleCancel = () => {
  router.back()
}

const tagList = ref<Tag[]>([])
const hotTags = ref<Tag[]>([])

// 加载标签列表
const loadTags = async () => {
  try {
    const res = await getAllTags()
    if (res.code === 200) {
      tagList.value = res.data || []
    }
  } catch (error) {
    console.error('加载标签失败', error)
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

// 添加热门标签
const addHotTag = (tagId: number) => {
  if (!form.tagIds?.includes(tagId)) {
    form.tagIds?.push(tagId)
  }
}

// 标签变化
const handleTagChange = (val: number[]) => {
  console.log('选中标签：', val)
}

onMounted(() => {
  loadCategories()
  loadArticle()
  loadTags()
  loadHotTags()
})

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})
</script>

<style lang="scss" scoped>
.edit-container {
  max-width: 1100px;
  margin: 0 auto;
}

.edit-card {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2d3d;
  margin-bottom: 28px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e4e7ed;
}

/* 封面图上传 */
.cover-upload {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cover-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.3s;
}

.cover-uploader:hover {
  border-color: #409eff;
}

.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.cover-preview {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.cover-tip {
  font-size: 12px;
  color: #909399;
}

.tag-selector {
  width: 100%;
}

.hot-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed $border-light;
}

.hot-tags-label {
  font-size: 12px;
  color: $text-placeholder;
}

.hot-tag-item {
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-1px);
    background-color: $primary-color;
    color: white;
  }
}
</style>