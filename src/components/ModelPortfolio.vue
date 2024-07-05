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
              <v-btn color="yellow" @click="handleDisassemble(item)" v-if="!item.price">拆除</v-btn>
              <v-btn color="red" @click="handleRevoke(item)" v-if="item.price">下架</v-btn>
              <v-btn color="green" @click="handleUpdate(item)" v-if="item.price">改价</v-btn>
              <v-card-text v-if="item.price">{{ item.price }}ETH</v-card-text>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
      <v-dialog v-model="dialog" max-width="500" class="custom-dialog">
        <v-card>
          <v-card-title class="headline">上架模型</v-card-title>
          <v-card-text>
            <div style="margin-bottom: 20px;">
              授权模型给市场
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
          <v-card-title class="headline">改价模型</v-card-title>
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

      <v-dialog v-model="dialog3" max-width="500" class="custom-dialog">
        <v-card>
          <v-card-title class="headline">拆除模型</v-card-title>
          <v-card-text>
            <div>
              你将获得：
            </div>
            <div style="color: gray;">普通方块:{{ getBrickNum[1] }}</div>
            <div style="color: green;">稀有方块:{{ getBrickNum[2] }}</div>
            <div style="color: blue;">罕见方块:{{ getBrickNum[3] }}</div>
            <div style="color: purple">史诗方块:{{ getBrickNum[4] }}</div>
            <div style="color: rgba(204,204,0,0.5)">传说方块:{{ getBrickNum[5] }}</div>
            <div>
              <v-btn style="float: right;" @click="disassemble()">拆除</v-btn>
            </div>

          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" text @click="dialog3 = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

    </v-container>
  </v-app>
</template>

<script>


//初始化合约调用相关
import { Contract, ethers } from 'ethers';
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
async function getInf() {
  if (window.ethereum == null) {
    console.log("MetaMask not installed; using read-only defaults")
    provider = ethers.getDefaultProvider()
  } else {
    provider = new ethers.BrowserProvider(window.ethereum)
    signer = await provider.getSigner()
  }
  brickContract = new Contract(brickAddress, brickABI, signer)
  modelContract = new Contract(modelAddress, modelABI, signer)
  marketContract = new Contract(marketAddress, marketABI, signer)
}
await getInf()


export default {
    name: 'ModelPortfolio',
    props: {

    },
    data() {
    return {
        items: [
        ],
        myAddress: '',
        dialog: false,
        dialog2: false,
        dialog3: false,
        approved: false,
        handleItem: {},
        price: 0,
        getBrickNum: [0,0,0,0,0,0],
    }
    },
    mounted() {
        this.getInfo()
    },
    methods: {
        async handleDisassemble(item){
          this.getBrickNum = [0,0,0,0,0,0]
          this.handleItem = item
          this.dialog3 = true
          item.rarities.forEach(element =>{
            this.getBrickNum[element]++
          })
          console.log(this.getBrickNum)
        },
        async disassemble(){

          console.log('拆除',this.handleItem)
          const tx = await modelContract.disAssemble(this.myAddress, this.handleItem.id,this.handleItem.brickNum,this.handleItem.rarities)
          console.log('Transaction sent:', tx.hash)

          const receipt = await tx.wait();

          if (receipt.status === 1) {
              console.log('Transaction successful:', receipt);
              alert('拆除成功')
              this.dialog3 = false
              this.getInfo()
          } else {
              console.error('Transaction failed:', receipt);
          }
        },

        async handleList(item) {
        // 在这里处理上架逻辑，例如传递参数给API或其他函数
        this.approved = false
        this.handleItem = item
        this.dialog = true
        console.log('上架物品:', item);
        let res = await modelContract.getApproved(item.id)
        if (ethers.getAddress(res) === ethers.getAddress(marketAddress)) {//已经授权
            this.approved = true
        } else {
            console.log('!=')
            console.log(res.toLowerCase())
            console.log(marketAddress.toLowerCase())
        }
        },
        async approve() {
          console.log('approve', this.handleItem.id)
          const tx = await modelContract.approve(marketAddress, this.handleItem.id)
          console.log('Transaction sent:', tx.hash)

          const receipt = await tx.wait();

          if (receipt.status === 1) {
              console.log('Transaction successful:', receipt);
              this.approved = true;
          } else {
              console.error('Transaction failed:', receipt);
          }
        },
        async list() {
        if (this.approved == true) {//已经授权,处理上架逻辑

            if (this.price <= 0) {
            alert('请输入大于0的价格')
            } else {
            const tx = await marketContract.list(modelAddress, this.handleItem.id, ethers.parseEther(this.price))//转换为wei上架
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
        } else {
            alert('请先授权模型！')
        }
        },
        async getInfo() {
            this.items = []
            console.log(openseaAPI, brickContract, modelContract, marketContract)
            await this.getMyAddress()
            await this.getModels()
            await this.getListedModels()
            console.log(this.items)
        },

        async getModels() {
        const options = { method: 'GET', headers: { accept: 'application/json' } };

        await fetch('https://testnets-api.opensea.io/api/v2/chain/sepolia/account/' + this.myAddress + '/nfts?collection=model-10', options)
            .then(response => response.json())
            .then(async (response) => {
            response.nfts.forEach(element => {
                this.getDetailInfo(element.identifier)
            });
            })
            .catch(err => console.error(err));
        },
        async getListedModels() {//获取我已经上架的
        let sum = await modelContract.totalSupply()
        sum = Number(sum)
        for (let i = 0; i < sum; i++) {
            let proxy = await marketContract.nftList(modelAddress, i)
            if (proxy.owner.toLowerCase() == this.myAddress.toLowerCase()) {//是我上架的
            let price = ethers.formatEther(proxy.price)
            this.getDetailInfo(i, price)
            }
        }
        },
        async getMyAddress() {
        // 获取用户地址
        const accounts = await provider.listAccounts();
        this.myAddress = accounts[0].address; // 第一个地址即为当前用户的地址
        //console.log('当前用户地址:', address);
        return this.myAddress
        },

        async getDetailInfo(id, price = 0) {

            let img
            let rarities=[]
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
                data.bricks.forEach(element =>{
                    rarities.push(element.data.rarity) 
                })

                let newItem = {
                    image: img,
                    title: '#'+id,
                    description: data.description,
                    id: id,
                    price: price,
                    brickNum:brickNum,
                    rarities:rarities
                }

                this.items.push(newItem)

            } catch (error) {
                console.error('Error fetching URI:', error);
            }
        },

        async handleRevoke(item) {
            const tx = await marketContract.revoke(modelAddress, item.id)
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
        async handleUpdate(item) {
            this.dialog2 = true
            this.handleItem = item
            },
            async update() {
            const tx = await marketContract.update(modelAddress, this.handleItem.id, ethers.parseEther(this.price))//转换为wei修改
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