<template>
  <main>
    <TheWelcome />
    <div>
      <el-input 
        v-model="num" 
        placeholder="请输入数字"
        style="width: 300px;" 
      />
      <p>{{ dnum }}</p>
      
      <el-button type="primary" @click="handleDoubleClick">
        双倍
      </el-button>
    </div>
  </main>
</template>

<script setup>
import API from '@/api';
import { ElMessage } from 'element-plus';
import { ref, computed, onMounted } from 'vue';

const num = ref(0)
const dnum = ref(0)
const handleDoubleClick = async () => {
    try {
        console.log(num)
        const response = await API.doubleNum({ num: num.value });
        console.log('加倍后的数字是:', response.info.num);
        dnum.value = response.info.num;
        ElMessage.success('操作成功！');
    } catch (error) {
        console.error('调用失败', error);
    }
}
</script>
