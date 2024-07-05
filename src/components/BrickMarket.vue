<template>
  <v-app>
    <v-container fluid>
            <v-row>
                <!-- 左侧栏，占20% -->
                <v-col cols="12" md="3" lg="2">
                    <div class="left-column">
                        <!-- 左侧栏内容 -->
                        <!-- 复选框 -->
                        <v-checkbox
                            v-for="number in numbers"
                            :key="number.value"
                            :label="`${number.name}`"
                            :value="number.value"
                            :color="number.color"
                            v-model="selectedNumbers"
                        ></v-checkbox>
                        <v-btn style="margin-right: 5px" color="blue" @click="selectedNumbers = [1,2,3,4,5]">全选</v-btn>
                        <v-btn color="red" @click="selectedNumbers = [];">清除</v-btn>
                    </div>
                </v-col>
                <!-- 右侧栏，占80% -->
                <v-col cols="12" md="9" lg="10">
                    <div class="right-column">
                        <!-- 右侧栏内容:主体 -->
                        <v-row>
                            <v-col v-for="(item, index) in filteredItems" :key="index" cols="12" sm="6" md="4" lg="3">
                            <v-card>
                                <v-img :src="item.image" aspect-ratio="1.7"></v-img>
                                <v-card-title>{{ item.title }}</v-card-title>
                                <v-card-text>{{ item.description }}</v-card-text>
                                <v-card-actions>
                                <v-card-text>{{ item.price }}ETH</v-card-text>
                                <v-btn color="primary" @click="purchase(item)" v-if="item.my==0">购买</v-btn>
                                <v-btn disabled v-if="item.my==1">我上架的</v-btn>
                                </v-card-actions>
                            </v-card>
                            </v-col>
                        </v-row>
                    </div>
                </v-col>
        </v-row>

    </v-container>
  </v-app>
</template>

<script>

//初始化合约调用相关
import { Contract, ethers } from 'ethers';
import brickABIJSON from '../ABIs/brickABI.json'
import marketABIJSON from '../ABIs/marketABI.json'

const brickAddress = "0x8400431edd44ED24b1341024e1A5F7339554A13A"
const marketAddress = "0x370297884a02dcf327020add676aec8a2f082999"
const brickABI = brickABIJSON
const marketABI = marketABIJSON
//获取provider,signer,可写合约contract
let signer
let provider
let brickContract
let marketContract
async function getInf() {
  if (window.ethereum == null) {
    console.log("MetaMask not installed; using read-only defaults")
    provider = ethers.getDefaultProvider()
  } else {
    provider = new ethers.BrowserProvider(window.ethereum)
    signer = await provider.getSigner()
  }
  brickContract = new Contract(brickAddress, brickABI, signer)
  marketContract = new Contract(marketAddress, marketABI, signer)
}
await getInf()


export default {
    name: 'BrickMarket',
    data() {
        return {
        numbers: [
            {value:1,name:'普通',color:'gray'}, 
            {value:2,name:'稀有',color:'green'}, 
            {value:3,name:'罕见',color:'blue'}, 
            {value:4,name:'史诗',color:'purple'}, 
            {value:5,name:'传说',color:'yellow'}
        ],
        selectedNumbers: [1,2,3,4,5],
        items:[
            {title:'测试标题',description:"test",price:'0.01'}
        ],
        myAddress:'',
        };
    },
    computed:{
        filteredItems() {
            return this.items.filter(item => this.selectedNumbers.includes(item.rarity));
        }
    },
    mounted(){
        this.getMarket()
    },
    methods: {
        async getMarket(){
            this.items = []
            await this.getMyAddress()
            await this.getListedBricks()
        },
        async getMyAddress(){
            // 获取用户地址
            const accounts = await provider.listAccounts();
            this.myAddress = accounts[0].address; // 第一个地址即为当前用户的地址
            //console.log('当前用户地址:', address);
            return this.myAddress
        },
        async getListedBricks(){
            let sum = await brickContract.totalSupply()
            sum = Number(sum)
            for (let i = 0; i < sum; i++) {
                let proxy = await marketContract.nftList(brickAddress, i)
                if(proxy.price>0){
                    if (proxy.owner.toLowerCase() == this.myAddress.toLowerCase()) {//是我上架的
                        let price = ethers.formatEther(proxy.price)
                        this.pushItem(i, price,1)
                    }else{//其他人上架的
                        let price = ethers.formatEther(proxy.price)
                        this.pushItem(i, price)
                    }
                }
            }
        },
        async pushItem(id,price,my=0){
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
                des = '稀有方块'
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
                des = '传说方块'
                break;
                default:
                break;
            }
            console.log(id, r, img, price)
            let newItem = {
                image: img,
                title: '#' + id,
                description: des,
                id: id,
                price: price,
                rarity : r
            }
            if(my){
                newItem.my=1
            }
            else{
                newItem.my=0
            }
            this.items.push(newItem)
        },
        async purchase(item){
            const tx = await marketContract.purchase(
                brickAddress,
                item.id,
                {
                    value: ethers.parseEther(item.price) // 发送的ETH金额
                }
            );

            console.log('Transaction sent:', tx.hash)
            const receipt = await tx.wait();

            if (receipt.status === 1) {
                console.log('Transaction successful:', receipt);
                alert('购买成功！')
                this.getMarket()

            } else {
                console.error('Transaction failed:', receipt);
            }
        }

    }
};
</script>

<style>

</style>
