<template>
  <v-app>
    <v-container fluid>
      <v-row>
        <v-col v-for="(item, index) in items" :key="index" cols="12" sm="6" md="4" lg="3">
          <v-card>
            <v-img :src="item.image" aspect-ratio="1.7"></v-img>
            <v-card-title>{{ item.title }}</v-card-title>
            <v-card-text>{{ item.description }}</v-card-text>
            <v-card-actions>
              <v-btn color="primary" @click="handleShelf(item)">上架</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>


//初始化合约调用相关
import { Contract,ethers } from 'ethers';
import brickABIJSON from '../ABIs/brickABI.json'
import modelABIJSON from '../ABIs/modelABI.json'

const openseaAPI = "bcee010a55b74f14ac1a3bbd8b9dd118"
const brickAddress = "0x8400431edd44ED24b1341024e1A5F7339554A13A"
const modelAddress = "0x35b637c929c88cd77ec8c53682bcfd309b7edcb9"
const brickABI = brickABIJSON
const modelABI = modelABIJSON
//获取provider,signer,可写合约contract
let signer
let provider
let brickContract
let modelContract
async function getInf(){
  if (window.ethereum == null) {
    console.log("MetaMask not installed; using read-only defaults")
    provider = ethers.getDefaultProvider()
  } else {
      provider = new ethers.BrowserProvider(window.ethereum)
      signer = await provider.getSigner()
  }
  brickContract = new Contract(brickAddress,brickABI,signer)
  modelContract = new Contract(modelAddress,modelABI,signer)
}
getInf()


export default {
  name: 'BrickPortfolio',
  props: {

  },
  data(){
    return{
      items: [
      ],
      myAddress:'',
    }
  },
  mounted(){
    this.getInfo()
  },
  methods: {
    handleShelf(item) {
      // 在这里处理上架逻辑，例如传递参数给API或其他函数
      console.log('上架物品:', item);
    },
    async getInfo(){
      console.log(openseaAPI,brickContract,modelContract)
      await this.getMyAddress()
      await this.getBricks()
    },

    async getBricks(){
        const options = {method: 'GET', headers: {accept: 'application/json'}};

        await fetch('https://testnets-api.opensea.io/api/v2/chain/sepolia/account/'+this.myAddress+'/nfts?collection=brick-3', options)
        .then(response => response.json())
        .then(response => {
            response.nfts.forEach(element => {
              this.getDetailInfo(element.identifier)
            });
        })
        .catch(err => console.error(err));
    },

    async getMyAddress(){
        // 获取用户地址
        const accounts = await provider.listAccounts();
        this.myAddress = accounts[0].address; // 第一个地址即为当前用户的地址
        //console.log('当前用户地址:', address);
        return this.myAddress
    },
    async getDetailInfo(id){
      let r = await brickContract.getRarity(id)
      let img
      let des
      r = Number(r)
      switch (r) {
        case 1:
          img = 'https://696b9fbef8ec8b266064095c69f2191c.ipfs.4everland.link/ipfs/bafybeiesu34t76ciq6t22taq4rfgewkfpe76iw4ofvsq634q6uneqvl5qy'
          des = '普通方块'
          break;
        case 2:
          img = 'https://696b9fbef8ec8b266064095c69f2191c.ipfs.4everland.link/ipfs/bafybeidvvyquae5k6ge7b4a4tpn3y3gwvuyqyo73nbuo5f65ya76ncukxi'
          des= '稀有方块'
          break;
        case 3:
          img = 'https://696b9fbef8ec8b266064095c69f2191c.ipfs.4everland.link/ipfs/bafybeidntv3cewlapy5npy6uryikjcmpyq4wyi22r5vp5iu4cwg4rj3nrq'
          des = '罕见方块'
          break;
        case 4:
          img = 'https://696b9fbef8ec8b266064095c69f2191c.ipfs.4everland.link/ipfs/bafybeibqrapbkswzxfydgmlgci5jlho3nvqezmiygptvlbzzhi4euourze'
          des = '史诗方块'
          break;
        case 5:
          img = 'https://696b9fbef8ec8b266064095c69f2191c.ipfs.4everland.link/ipfs/bafybeihvlp3wb4lhhtqj2yllmxgpf6l3vbrfhbqnxczoqvpqnkpewpyfuy'
          des= '传说方块'
          break;
        default:
          break;
      }
      console.log(id,r,img)
      const newItem = {
        image: img,
        title: '#'+id,
        description: des
      }
      this.items.push(newItem)
    }
  },
}
</script>