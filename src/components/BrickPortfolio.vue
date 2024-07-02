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
              <v-btn color="primary" @click="handleList(item)" v-if="!item.price">上架</v-btn>
              <v-btn color="red" @click="handleRevoke(item)" v-if="item.price">下架</v-btn>
              <v-btn color="green" @click="handleUpdate(item)" v-if="item.price">改价</v-btn>
              <v-card-text v-if="item.price">{{ item.price }}ETH</v-card-text>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
      <v-dialog v-model="dialog" max-width="500" class="custom-dialog">
        <v-card>
          <v-card-title class="headline">上架方块</v-card-title>
          <v-card-text>
            <div style="margin-bottom: 20px;">
              授权方块给市场
              <v-btn style="float: right;color:red;" v-show="!approved" @click="approve()">授权</v-btn>
              <v-btn style="float:right;color: green;" v-show="approved">已授权</v-btn>
            </div>
            <div>
              上架
            </div>
            <div>
              <v-text-field style="float: left" v-model="price" label="输入价格/ETH"></v-text-field>
              <v-btn style="float: right;" @click="list()">上架</v-btn>
            </div>

          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" text @click="dialog = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="dialog2" max-width="500" class="custom-dialog">
        <v-card>
          <v-card-title class="headline">改价方块</v-card-title>
          <v-card-text>
            <div>
              修改价格
            </div>
            <div>
              <v-text-field style="float: left" v-model="price" label="输入价格/ETH"></v-text-field>
              <v-btn style="float: right;" @click="update()">改价</v-btn>
            </div>

          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" text @click="dialog2 = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      
    </v-container>
  </v-app>
</template>

<script>


//初始化合约调用相关
import { Contract,ethers } from 'ethers';
import brickABIJSON from '../ABIs/brickABI.json'
import modelABIJSON from '../ABIs/modelABI.json'
import marketABIJSON from '../ABIs/marketABI.json'

const openseaAPI = "bcee010a55b74f14ac1a3bbd8b9dd118"
const brickAddress = "0x8400431edd44ED24b1341024e1A5F7339554A13A"
const modelAddress = "0x35b637c929c88cd77ec8c53682bcfd309b7edcb9"
const marketAddress = "0x370297884a02dcf327020add676aec8a2f082999"
const brickABI = brickABIJSON
const modelABI = modelABIJSON
const marketABI = marketABIJSON
//获取provider,signer,可写合约contract
let signer
let provider
let brickContract
let modelContract
let marketContract
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
  marketContract = new Contract(marketAddress,marketABI,signer)
}
await getInf()


export default {
  name: 'BrickPortfolio',
  props: {

  },
  data(){
    return{
      items: [
      ],
      myAddress:'',
      dialog: false,
      dialog2: false,
      approved: false,
      handleItem: {},
      price: 0,
    }
  },
  mounted(){
    this.getInfo()
  },
  methods: {
    async handleList(item) {
      // 在这里处理上架逻辑，例如传递参数给API或其他函数
      this.approved = false
      this.handleItem = item
      this.dialog = true
      console.log('上架物品:', item);
      let res = await brickContract.getApproved(item.id)
      if(ethers.getAddress(res)===ethers.getAddress(marketAddress)){//已经授权
        this.approved = true
      }else{
        console.log('!=')
        console.log(res.toLowerCase())
        console.log(marketAddress.toLowerCase())
      }
    },
    async approve(){
      console.log('approve',this.handleItem.id)
      const tx = await brickContract.approve(marketAddress,this.handleItem.id)
      console.log('Transaction sent:', tx.hash)

      const receipt = await tx.wait();

      if (receipt.status === 1) {
        console.log('Transaction successful:', receipt);
        this.approved = true;
      } else {
        console.error('Transaction failed:', receipt);
      }
    },
    async list(){
      if(this.approved == true){//已经授权,处理上架逻辑

        if(this.price<=0){
          alert('请输入大于0的价格')
        }else{
          const tx = await marketContract.list(brickAddress,this.handleItem.id,ethers.parseEther(this.price))//转换为wei上架
          console.log('Transaction sent:', tx.hash)
          const receipt = await tx.wait();

          if (receipt.status === 1) {
            console.log('Transaction successful:', receipt);
            alert('上架成功！')
            this.dialog = false
            this.getInfo()

          } else {
            console.error('Transaction failed:', receipt);
          }
        }
      }else{
        alert('请先授权方块！')
      }
    },
    async getInfo(){
      this.items=[]
      console.log(openseaAPI,brickContract,modelContract,marketContract)
      await this.getMyAddress()
      await this.getBricks()
      await this.getListedBricks()
    },

    async getBricks(){
        const options = {method: 'GET', headers: {accept: 'application/json'}};

        await fetch('https://testnets-api.opensea.io/api/v2/chain/sepolia/account/'+this.myAddress+'/nfts?collection=brick-3', options)
        .then(response => response.json())
        .then(async (response) => {
            response.nfts.forEach(element => {
              this.getDetailInfo(element.identifier)
            });
        })
        .catch(err => console.error(err));
    },
    async getListedBricks(){//获取我已经上架的
      let sum = await brickContract.totalSupply()
      sum = Number(sum)
      for(let i=0;i<sum;i++){
        let proxy = await marketContract.nftList(brickAddress,i)
        if(proxy.owner.toLowerCase()==this.myAddress.toLowerCase()){//是我上架的
          let price = ethers.formatEther(proxy.price)
          this.getDetailInfo(i,price)
        }
      }
    },
    async getMyAddress(){
        // 获取用户地址
        const accounts = await provider.listAccounts();
        this.myAddress = accounts[0].address; // 第一个地址即为当前用户的地址
        //console.log('当前用户地址:', address);
        return this.myAddress
    },
    async getDetailInfo(id,price=0){
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
      console.log(id,r,img,price)
      let newItem
      if(price==0){
        newItem = {
          image: img,
          title: '#'+id,
          description: des,
          id: id
        }
      }else{
        newItem = {
          image: img,
          title: '#'+id,
          description: des,
          id: id,
          price: price
        }
      }

      this.items.push(newItem)
    },
    async handleRevoke(item){
      const tx = await marketContract.revoke(brickAddress,item.id)
      console.log('Transaction sent:', tx.hash)
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        console.log('Transaction successful:', receipt);
        alert('下架成功！')
        this.getInfo()

      } else {
        console.error('Transaction failed:', receipt);
      }
    },
    async handleUpdate(item){
      this.dialog2 = true
      this.handleItem = item
    },
    async update(){
      const tx = await marketContract.update(brickAddress,this.handleItem.id,ethers.parseEther(this.price))//转换为wei修改
      console.log('Transaction sent:', tx.hash)
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        console.log('Transaction successful:', receipt);
        alert('修改成功！')
        this.dialog2 = false
        this.getInfo()

      } else {
        console.error('Transaction failed:', receipt);
      }
    }
  },
}
</script>

<style>
.custom-dialog{
  max-height: 80vh;
}
</style>