<script setup lang="ts">
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
    </v-menu>
  </nav>
</template>