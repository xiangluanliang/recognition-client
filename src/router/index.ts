import { createRouter, createWebHistory } from "vue-router"
import DefaultLayout from "@/layouts/DefaultLayout.vue"

const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/User/Login.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/",
    component: DefaultLayout,
    meta: { requiresAuth: false }, // 暂时跳过登录验证
    children: [
      {
        path: "",
        name: "Dashboard",
        component: () => import("@/views/Dashboard/index.vue"),
        meta: { title: "首页概览" },
      },
      {
        path: "/monitor",
        name: "Monitor",
        component: () => import("@/views/Monitor/index.vue"),
        meta: { title: "实时监控" },
      },
      {
        path: "/alarm-center",
        name: "AlarmCenter",
        component: () => import("@/views/AlarmCenter/index.vue"),
        meta: { title: "告警中心" },
      },
      {
        path: "/area-config",
        name: "AreaConfig",
        component: () => import("@/views/AreaConfig/index.vue"),
        meta: { title: "区域配置" },
      },
      {
        path: "/behavior-detect",
        name: "BehaviorDetect",
        component: () => import("@/views/BehaviorDetect/index.vue"),
        meta: { title: "行为检测" },
      },
      {
        path: "/face-auth",
        name: "FaceAuth",
        component: () => import("@/views/FaceAuth/index.vue"),
        meta: { title: "身份认证" },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 简化路由守卫，暂时跳过登录验证
router.beforeEach((to, from, next) => {
  // 暂时注释掉登录验证逻辑
  // const userStore = useUserStore()
  // if (to.meta.requiresAuth && !userStore.isLoggedIn) {
  //   next("/login")
  // } else if (to.path === "/login" && userStore.isLoggedIn) {
  //   next("/")
  // } else {
  //   next()
  // }

  // 直接放行所有路由
  next()
})

export default router
