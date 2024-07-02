<template>
  <v-app>
    <!-- 区域1 -->
    <v-container class="top-area">
      <v-row>
        <v-col>
          <v-row>
            <v-col>
              <div>地址: {{ myAddress }}</div>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <div>余额: {{ myBalance }} ETH</div>
            </v-col>
          </v-row>
        </v-col>
        <v-col>
          <v-row>
            <v-col>
              <div style="margin-bottom: 20px;">方块数量: {{ this.brickNum }}</div>
              <div>
                    <v-row>
                        <v-col id="r1" :style="{ backgroundColor: colors[0] }">
                        <div>0</div>
                        </v-col>
                        <v-col id="r2" :style="{ backgroundColor: colors[1] }">
                        <div>0</div>
                        </v-col>
                        <v-col id="r3" :style="{ backgroundColor: colors[2] }">
                        <div>0</div>
                        </v-col>
                        <v-col id="r4" :style="{ backgroundColor: colors[3] }">
                        <div>0</div>
                        </v-col>
                        <v-col id="r5" :style="{ backgroundColor: colors[4] }">
                        <div>0</div>
                        </v-col>
                    </v-row>
              </div>

            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <div>模型数量: {{ this.modelNum }}</div>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>

    <!-- 区域2 -->
    <v-container class="bottom-area">
      <v-tabs v-model="tab">
        <v-tab>方块</v-tab>
        <v-tab>模型</v-tab>

        <v-tab-item>
          <BrickPortfolio />
        </v-tab-item>
        <v-tab-item>
          <ModelPortfolio />
        </v-tab-item>
      </v-tabs>
    </v-container>
  </v-app>
</template>

<script>

import BrickPortfolio from '../components/BrickPortfolio.vue';
import ModelPortfolio from '../components/ModelPortfolio.vue';

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
  components: {
    BrickPortfolio,
    ModelPortfolio
  },
  data() {
    return {
      tab: 0,
      colors: ['rgba(160,160,160,0.5)', 'rgba(102,255,102,0.5)', 'rgba(102,178,255,0.5)', 'rgba(178,102,255,0.5)', 'rgba(255,255,102,0.5)'],
      myAddress: '',
      myBalance: 0,
      brickNum: 0,
      modelNum: -1,
      myBricks:[],
      rarityCount:[],
      rarityNum:[0,0,0,0,0,0],//稀有度总数
    };
  },
  mounted() {
    this.refresh()
  },
  methods:{
    async refresh(){
        console.log(brickContract)//防止brickcontract未使用
        console.log(modelContract)
        console.log(openseaAPI)
        await this.getMyAddress()
        await this.getMyBalance()
        this.brickNum = await this.getBrickNum()
        this.modelNum = await this.getModelNum()
        await this.getMyBricks()
        await this.getMyRarity()
        setTimeout(() => {
            this.rarityCount.forEach(element => {
                this.rarityNum[element]++
            });
            document.getElementById("r1").innerHTML = this.rarityNum[1];
            document.getElementById("r2").innerHTML = this.rarityNum[2];
            document.getElementById("r3").innerHTML = this.rarityNum[3];
            document.getElementById("r4").innerHTML = this.rarityNum[4];
            document.getElementById("r5").innerHTML = this.rarityNum[5];
        }, 1000);
        
    },
    async getMyAddress(){
        // 获取用户地址
        const accounts = await provider.listAccounts();
        this.myAddress = accounts[0].address; // 第一个地址即为当前用户的地址
        //console.log('当前用户地址:', address);
        return this.myAddress
    },
    async getMyBalance(){
        try {
            // 获取余额（以Wei为单位）
            const balance = await provider.getBalance(this.myAddress);

            // 将余额转换为Ether
            this.myBalance = parseFloat(ethers.formatEther(balance)).toFixed(6)//保留6位
        } 
        catch (error) {
                console.error(`Error fetching balance for ${this.myAddress}:`, error);
        }
    },
    async getBrickNum(){
        let myAdd = await this.getMyAddress()
        let num = parseInt(await brickContract.balanceOf(myAdd))
        return num
    },
    async getModelNum(){
        let myAdd = await this.getMyAddress()
        let num = parseInt(await modelContract.balanceOf(myAdd))
        return num
    },
    async getMyBricks(){
        this.myBricks = []
        this.myRarities = []
        const options = {method: 'GET', headers: {accept: 'application/json'}};

        await fetch('https://testnets-api.opensea.io/api/v2/chain/sepolia/account/'+this.myAddress+'/nfts?collection=brick-3', options)
        .then(response => response.json())
        .then(response => {
            response.nfts.forEach(element => {
                this.myBricks.push(Number(element.identifier))
            });
        })
        .catch(err => console.error(err));
        console.log(this.myBricks)
    },
    async getMyRarity(){
        await this.myBricks.forEach(element => {
            brickContract.getRarity(element).then(res=>{
                this.rarityCount.push(Number(res))
            })
        });
    }
  },
};
</script>

<style>
.top-area{
    height: 20%;
}
.bottom-area{
    height: 80%;
}
.rarity-cols{
    height: 40px;
}
</style>
