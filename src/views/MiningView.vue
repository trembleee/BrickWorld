<template>
  <div class="mining">
    <v-btn
      outlined
      color="#00ccff"
      class="mint"
      @click="mint()"
    >
      Outlined Button
    </v-btn>
  </div>
</template>

<script>
export default {
  name: 'MiningView',
  props: {
  },
  data() {
    return {
      
    }
  },
  methods:{
    mint(){
      
    }
  }
}
</script>

<style>
.mint{
  margin: 15px;
}
</style>
