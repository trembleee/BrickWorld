<template>
  <div class="home">
    <img src="../assets/logo.png">
    <HomePage msg="Welcome to Brick World DApp" />
  </div>
</template>

<script>
// @ is an alias to /src
import HomePage from '@/components/HomePage.vue'

export default {
  name: 'HomeView',
  components: {
    HomePage
  }
}
</script>
