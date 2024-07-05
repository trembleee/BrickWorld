<template>
  <div class="background">
    <v-container fluid class="position-relative">
          <v-btn 
      color="primary" 
      class="blue-button position-absolute top-left"
      @click="navTo('mining')"
    >
      挖矿
    </v-btn>
    <v-btn 
      color="info" 
      class="blue-button position-absolute top-right"
      @click="navTo('marketPlace')"
    >
      市场
    </v-btn>
    <v-btn 
      color="light-blue" 
      class="blue-button position-absolute bottom-left"
      @click="navTo('portfolio')"
    >
      库存
    </v-btn>
    <v-btn 
      color="cyan" 
      class="blue-button position-absolute bottom-right"
      @click="navTo('build')"
    >
      拼接
    </v-btn>

    </v-container>
  </div>
</template>

<script>
export default {
  name: 'HomeView',
  methods: {    
    navTo(routeName) {
      this.$router.push({ name: routeName });
    }
  },
};

</script>

<style scoped>
.background {
  width: 100%;
  height: 100%;
  background-image: url('@/assets/background.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.position-relative {
  position: relative;
  width: 100%;
  height: 100%;
}
.blue-button {
  width: 20%;
  height: 15% !important;
  font-size: 30px;
  color: white;
}
.position-absolute {
  position: absolute;
}
.top-left {
  top: 15%; 
  left: 20%;
}
.top-right {
  top: 15%; 
  right: 20%;
}
.bottom-left {
  bottom: 40%; 
  left: 20%;
}
.bottom-right {
  bottom: 40%; 
  right: 20%;
}
</style>
