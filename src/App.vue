<template>
  <v-app>

    <TopBar></TopBar>

    <v-main>
      <router-view />
    </v-main>

  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import TopBar from './components/TopBar.vue'

export default Vue.extend({
  name: 'App',

  components: {
    TopBar
  },

  data: () => ({
  }),
});
</script>

<script setup lang="ts">
  import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/vue'

  // 1. Get projectId at https://cloud.walletconnect.com
  const projectId = '5a5bb9b30db6071d046f51d1922f28a6'

  // 2. Set chains
  // const mainnet = {
  //   chainId: 1,
  //   name: 'Ethereum',
  //   currency: 'ETH',
  //   explorerUrl: 'https://etherscan.io',
  //   rpcUrl: 'https://cloudflare-eth.com'
  // }
  const sepolia = {
    chainId:11155111,
    name: 'Sepolia',
    currency:'ETH',
    explorerUrl: 'https://sepolia.etherscan.io',
    rpcUrl:'https://1rpc.io/sepolia'
  }

  // 3. Create modal
  const metadata = {
    name: 'BrickWorld',
    description: 'BrickWorld description',
    url: '', // origin must match your domain & subdomain
    icons: ['']
  }

  createWeb3Modal({
    ethersConfig: defaultConfig({ metadata }),
    chains: [sepolia],
    projectId,
    enableAnalytics: false, // Optional - defaults to your Cloud configuration
    enableOnramp: true, // Optional - false as default
    themeMode: 'light'
  })
</script>

<style scoped>

</style>