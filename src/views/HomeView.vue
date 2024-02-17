<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <p>Is dev? {{ isDevelopment }}</p>
    <HelloWorld msg="Welcome to Your Vue.js + TypeScript App" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import HelloWorld from '@/components/HelloWorld.vue'; // @ is an alias to /src

function isDev() {
  console.log(process.env.NODE_ENV);
  if (process.env.NODE_ENV === 'development') {
    return "development"
  } else {
    return "production"
  }
}

const isDevelopment = ref(undefined as unknown as string);
isDevelopment.value = isDev();

</script>
