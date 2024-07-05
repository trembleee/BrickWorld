<template>
  <v-app>
    <v-container fluid>
            <v-row>
                <v-col v-for="(item, index) in items" :key="index" cols="12" sm="6" md="4" lg="3">
                <v-card>
                    <v-img :src="item.image" aspect-ratio="1.7"></v-img>
                    <v-card-title>{{ item.title }}</v-card-title>
                    <v-card-text>{{ item.description }}</v-card-text>
                    <v-card-text>方块数：{{ item.brickNum }}</v-card-text>                              
                    <v-card-actions>
                    <v-card-text>{{ item.price }}ETH</v-card-text>
                    <v-btn color="primary" @click="purchase(item)" v-if="item.my==0">购买</v-btn>
                    <v-btn disabled v-if="item.my==1">我上架的</v-btn>
                    </v-card-actions>
                </v-card>
                </v-col>
        </v-row>

    </v-container>
  </v-app>
</template>


<script>

//初始化合约调用相关
import { Contract, ethers } from 'ethers';
import modelABIJSON from '../ABIs/modelABI.json'
import marketABIJSON from '../ABIs/marketABI.json'

const modelAddress = "0x35b637c929c88cd77ec8c53682bcfd309b7edcb9"
const marketAddress = "0x370297884a02dcf327020add676aec8a2f082999"
const modelABI = modelABIJSON
const marketABI = marketABIJSON
//获取provider,signer,可写合约contract
let signer
let provider
let modelContract
let marketContract
async function getInf() {
  if (window.ethereum == null) {
    console.log("MetaMask not installed; using read-only defaults")
    provider = ethers.getDefaultProvider()
  } else {
    provider = new ethers.BrowserProvider(window.ethereum)
    signer = await provider.getSigner()
  }
  modelContract = new Contract(modelAddress, modelABI, signer)
  marketContract = new Contract(marketAddress, marketABI, signer)
}
await getInf()


export default {
    name: 'ModelMarket',
    data() {
        return {
          items:[
              {title:'测试标题',description:"test",price:'0.01'}
          ],
          myAddress:'',
        };
    },
    mounted(){
        this.getMarket()
    },
    methods: {
        async getMarket(){
            this.items = []
            await this.getMyAddress()
            await this.getListedModels()
            console.log('modelmarket',this.items)
        },
        async getMyAddress(){
            // 获取用户地址
            const accounts = await provider.listAccounts();
            this.myAddress = accounts[0].address; // 第一个地址即为当前用户的地址
            //console.log('当前用户地址:', address);
            return this.myAddress
        },
        async getListedModels(){
            let sum = await modelContract.totalSupply()
            sum = Number(sum)
            for (let i = 0; i < sum; i++) {
                let proxy = await marketContract.nftList(modelAddress, i)
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
            let img
            let brickNum

            try {
                let uri = await modelContract.tokenURI(id);
                console.log(uri);

                // const proxyUrl = `https://cors-anywhere.herokuapp.com/${uri}`;
                const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${uri}`;              
                const response = await fetch(proxyUrl);             
                setTimeout(() => {
                  
                }, 201);

                if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('测试', data);
                img = data.thumbnailPicture
                brickNum = data.bricks.length

                let newItem = {
                    image: img,
                    title: '#'+id,
                    description: data.description,
                    id: id,
                    price: price,
                    brickNum:brickNum,
                }

                if(my){
                    newItem.my=1
                }
                else{
                    newItem.my=0
                }
                this.items.push(newItem)

            } catch (error) {
                console.error('Error fetching URI:', error);
            }

        },
        async purchase(item){
            const tx = await marketContract.purchase(
                modelAddress,
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