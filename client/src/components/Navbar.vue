<script setup lang="ts">
import { ref } from 'vue';

const items = ref([
  { title: 'Click Me' },
  { title: 'Click Me 2' },
]);

</script>

<template>
  <nav
    class="
      p-6
      bg-primary
      flex justify-between items-center
    "
  >
    <div
      v-text="'Tetris'"
      class="text-6xl tracking-wider"
    />

    <v-menu>
      <template v-slot:activator="{ props }">
        <v-btn
          icon="mdi-dots-vertical"
          variant="text"
          v-bind="props"
        />
      </template>

      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
        >
          <v-list-item-title>
            {{ item.title }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </nav>
</template>