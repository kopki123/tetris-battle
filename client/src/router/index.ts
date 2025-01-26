import { createWebHistory, createRouter } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'lobby',
      component: () => import('@/views/lobby/Lobby.vue'),
    },
    {
      path: '/singleplayer',
      name: 'singleplayer',
      component: () => import('@/views/singleplayer/Singleplayer.vue'),
    },
    {
      path: '/multiplayer',
      name: 'multiplayer',
      component: () => import('@/views/multiplayer/Multiplayer.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      redirect: '/',
    },
  ],
});

let isFirstNavigation = true;

router.beforeEach(async () => {
  if(isFirstNavigation) {
    isFirstNavigation = false;
    return { name: 'lobby' };
  }
});

export default router;
