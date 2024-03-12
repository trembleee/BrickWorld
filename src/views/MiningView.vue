<template>
  <div class="mining">
    <v-btn
      outlined
      color="#00ccff"
      class="mint"
      @click="getBrickNum()"
    >
      获取用户积木数
    </v-btn>
    <v-btn
      outlined
      color="#00ccff"
      class="mint"
      @click="mint()"
    >
      挖取一个积木
    </v-btn>
        <v-btn
      outlined
      color="#00ccff"
      class="mint"
      @click="test()"
    >
      testbutton
    </v-btn>
    <img class="test-img" :src="imgUrl" alt="no image now">
  </div>
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

    async test(){
      // this.searchTokenIdByMintHash('0xe861d124441b285a9c5d558fc05a530c1f2636c3a6be2833d9bbc35f61999f0c').then(res=>{
      //   console.log(res)
      // })

      // let brickURI = 'ipfs://bafkreiem3hf4zw4fefa7unoifypb3py4y2mymrcznwckgecx7yh3jendne'
      // await this.getIPFSJSON(brickURI)
      
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
        return tokenId 
      }
  
    },

    async mint(){
      await this.getMyAddress()
      const tx=await brickContract.mint(this.myAddress)
      await tx.wait()
      console.log(tx)
      console.log(tx.hash)

      let brickId = await this.searchTokenIdByMintHash(tx.hash)
      let brickURI = await this.getURIById(brickId)
      this.getIPFSJSON(brickURI)
      
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
  width: 100px;
  height: 150px;
}
</style>
