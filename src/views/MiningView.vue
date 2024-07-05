<template>
  <v-app>
    <div class="mining">
      <img class="test-img" :src="imgUrl" alt="铸造积木后查看">
      <v-btn
        outlined
        color="#00ccff"
        class="mint"
        @click="mint()"
      >
        挖取一个积木
      </v-btn>
    </div>
  </v-app>
</template>

<script>
import { Contract,ethers } from 'ethers';
import brickABIJSON from '../ABIs/brickABI.json'

const ipfsBaseUrl = 'https://ipfs.io/ipfs/'

const brickAddress = "0x8400431edd44ED24b1341024e1A5F7339554A13A"
const brickABI = brickABIJSON
//获取provider,signer,可写合约contract
let signer
let provider
let brickContract
async function getInf(){
  if (window.ethereum == null) {
    console.log("MetaMask not installed; using read-only defaults")
    provider = ethers.getDefaultProvider()
  } else {
      provider = new ethers.BrowserProvider(window.ethereum)
      signer = await provider.getSigner()
  }
  brickContract = new Contract(brickAddress,brickABI,signer)
}
getInf()

export default {
  name: 'MiningView',
  props: {
  },
  data() {
    return {
      myAddress:"",
      imgUrl:"",
    }
  },
  methods:{
    async getMyAddress(){
      // 获取用户地址
      const accounts = await provider.listAccounts();
      this.myAddress = accounts[0].address; // 第一个地址即为当前用户的地址
      //console.log('当前用户地址:', address);
      return this.myAddress
    },

    async getBrickNum(){
      let myAdd = await this.getMyAddress()
      let num = parseInt(await brickContract.balanceOf(myAdd))
      console.log(num)
      return num

    },

    async searchTokenIdByMintHash(hash){
      //mint的哈希查找tokenId
      let receipt;
      try {
        receipt = await provider.getTransactionReceipt(hash);
      } catch (error) {
        console.error('获取交易收据失败:', error);
      }
      if(receipt){
        let tokenId = parseInt(receipt.logs[0].topics[3])
        console.log(tokenId)
        return tokenId 
      }
  
    },

    async mint(){
      await this.getMyAddress()
      const tx=await brickContract.mint(this.myAddress)
      const receipt = await tx.wait()
      console.log(tx)

      if (receipt.status === 1) {
          console.log('Transaction successful:', receipt);
          alert('成功！')
      } else {
          console.error('Transaction failed:', receipt);
      }

      let brickId = await this.searchTokenIdByMintHash(tx.hash)
      let r = await brickContract.getRarity(brickId)
      r = Number(r)
      let newUrl
      switch (r) {
          case 1:
          newUrl = 'https://696b9fbef8ec8b266064095c69f2191c.ipfs.4everland.link/ipfs/bafybeiesu34t76ciq6t22taq4rfgewkfpe76iw4ofvsq634q6uneqvl5qy'
          break;
          case 2:
          newUrl = 'https://696b9fbef8ec8b266064095c69f2191c.ipfs.4everland.link/ipfs/bafybeidvvyquae5k6ge7b4a4tpn3y3gwvuyqyo73nbuo5f65ya76ncukxi'
          break;
          case 3:
          newUrl = 'https://696b9fbef8ec8b266064095c69f2191c.ipfs.4everland.link/ipfs/bafybeidntv3cewlapy5npy6uryikjcmpyq4wyi22r5vp5iu4cwg4rj3nrq'
          break;
          case 4:
          newUrl = 'https://696b9fbef8ec8b266064095c69f2191c.ipfs.4everland.link/ipfs/bafybeibqrapbkswzxfydgmlgci5jlho3nvqezmiygptvlbzzhi4euourze'
          break;
          case 5:
          newUrl = 'https://696b9fbef8ec8b266064095c69f2191c.ipfs.4everland.link/ipfs/bafybeihvlp3wb4lhhtqj2yllmxgpf6l3vbrfhbqnxczoqvpqnkpewpyfuy'
          break;
          default:
          break;
      }
      console.log('r img',r,newUrl)
      this.imgUrl = newUrl

      // let brickURI = await this.getURIById(brickId)
      // await this.getIPFSJSON(brickURI)
      
    },

    async getIPFSJSON(str){
      let cid = str.slice(7)
      fetch(ipfsBaseUrl+cid)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch IPFS content');
        }
        return response.text();
      })
      .then(data => {
        //结果没有返回，存入dataJson中了
        let JSONData = JSON.parse(data)
        this.imgUrl = JSONData.image
        console.log(JSONData.image)
        
      })
      .catch(error => {
        console.error('Error fetching IPFS content:', error);
      });
    },

    async getURIById(tokenId){
      let tokenURI = await brickContract.tokenURI(tokenId)
      return tokenURI
    }
 
  },
}
</script>

<style>
.mint{
  margin: 15px;
}
.test-img{
  width: 150px;
  height: 200px;
}
.mining {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh; /* 高度设为视口高度，确保垂直居中 */
  text-align: center;
}
</style>
