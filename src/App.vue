<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <header style="padding: 10px 20px; border-bottom: 1px solid #eee;">
    <router-link to="/" style="margin-right: 15px;">首页</router-link>
    <router-link to="/login">登录</router-link>
  </header>
  <router-view />
</template>
