<template>
  <main>
    <TheWelcome />
  </main>
</template>

<script setup>
import API from '@/api';
import { ElMessage } from 'element-plus';

const handleDoubleClick = async () => {
    try {
        const response = await API.doubleNum({ num: 6 });
        console.log('加倍后的数字是:', response.info.num);
    } catch (error) {
        console.error('调用失败', error);
    }
}
</script>
