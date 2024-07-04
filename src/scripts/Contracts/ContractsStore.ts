import { Contract, ethers } from 'ethers';
//初始化合约调用相关
import brickABIJSON from '@/ABIs/brickABI.json'
import modelABIJSON from '@/ABIs/modelABI.json'
import marketABIJSON from '@/ABIs/marketABI.json'
import { bool } from 'aws-sdk/clients/signer';

const openseaAPI = "bcee010a55b74f14ac1a3bbd8b9dd118"
const brickContractAddress = "0x8400431edd44ED24b1341024e1A5F7339554A13A"
const modelContractAddress = "0x35b637c929c88cd77ec8c53682bcfd309b7edcb9"
const marketContractAddress = "0x370297884a02dcf327020add676aec8a2f082999"
const brickABI = brickABIJSON
const modelABI = modelABIJSON
const marketABI = marketABIJSON
//获取provider,signer,可写合约contract
let signer: any;
let provider: ethers.Provider = null as unknown as ethers.Provider;
let brickContract: ethers.Contract;
let modelContract: ethers.Contract;
let marketContract: ethers.Contract;
const owningBricksDefaults: { [rarity: string]: BrickWithIdAndRarity[] } = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: []
};
let owningBricks: { [rarity: string]: BrickWithIdAndRarity[] } = JSON.parse(JSON.stringify(owningBricksDefaults));
let accountAddress = '';

type BrickWithIdAndRarity = {
    id: string,
    rarity: string
};

export const contractStore = (() => {

    let bOwningBricksDirty = true;
    let bAccountAddressDirty = true;
    let latch = 1;

    const InitSolidityContracts = async () => {
        if ((window as any).ethereum == null) {
            console.log("MetaMask not installed; using read-only defaults")
            provider = ethers.getDefaultProvider()
        } else {
            provider = new ethers.BrowserProvider((window as any).ethereum as any)
            if (provider instanceof ethers.BrowserProvider) {
                signer = await provider.getSigner()
            }
        }
        brickContract = new Contract(brickContractAddress, brickABI, signer)
        console.log(brickContract);

        modelContract = new Contract(modelContractAddress, modelABI, signer)
        marketContract = new Contract(marketContractAddress, marketABI, signer)

        refreshOwningBricks();
    }

    const setOwningBricksDirty = (bDirty: bool) => {
        bOwningBricksDirty = bDirty;
    }

    const isOwningBricksDirty = () => {
        return bOwningBricksDirty;
    }

    const setAccountAddressDirty = (bDirty: bool) => {
        bAccountAddressDirty = bDirty;
    }

    const isAccountAddressDirty = () => {
        return bAccountAddressDirty;
    }

    async function refreshOwningBricks() {
        while (latch <= 0) {
            await new Promise((resolve) => {
                setTimeout(resolve, 100);
            })
                .then(() => {
                    console.log("Waiting for latch release.");
                });
        }

        latch--;
        if (isOwningBricksDirty()) {
            owningBricks = JSON.parse(JSON.stringify(owningBricksDefaults));
            await getAccountAddress();//先获取我的地址赋值给myAddress，后面获取brick要用
            await getBricks();
            setOwningBricksDirty(false);
        }
        latch++;
        // console.log("Owning bricks: ", owningBricks);
    }

    async function getAccountAddress() {
        if (provider instanceof ethers.BrowserProvider && isAccountAddressDirty()) {
            // 获取用户地址
            const accounts = await provider.listAccounts();
            accountAddress = accounts[0].address; // 第一个地址即为当前用户的地址
            //console.log('当前用户地址:', address);
            setAccountAddressDirty(false);
        }
        return accountAddress;
    }

    async function getBricks() {
        const options = { method: 'GET', headers: { accept: 'application/json' } };

        //调用opensea api获取地址拥有的所有brick nft
        await fetch('https://testnets-api.opensea.io/api/v2/chain/sepolia/account/' + accountAddress + '/nfts?collection=brick-3', options)
            .then(response => response.json())
            .catch(err => console.log(err))
            .then(async (response) => {
                response.nfts.forEach((element: any) => {
                    setBrick(element.identifier)//对每一个brick调用setbrick函数,获取稀有度加到数组中
                });

            })
            .catch(err => console.log(err));
    }

    async function setBrick(id: any) {
        const rarity = await brickContract.getRarity(id)//获取稀有度
        const brick = {
            id: id,
            rarity: String(rarity)
        } // 创建brick

        owningBricks[String(rarity)].push(brick);
        // 加入数组中
    }

    async function getOwningBricks() {
        await refreshOwningBricks();

        const data = JSON.stringify(owningBricks);

        const result = JSON.parse(data);

        return result;
    }

    async function setApprovalForAll(): Promise<boolean> {
        const tx = await brickContract.setApprovalForAll(modelContractAddress, true);

        console.log("setApprovalForAll sent: ", tx.hash);
        const receipt = await tx.wait();

        if (receipt.status === 1) {
            console.log("setApprovalForAll successful: ", receipt);
            return true;
        }
        else {
            console.log("setApprovalForAll failed: ", receipt);
            return false;
        }
    }

    async function isApprovedForAll(): Promise<boolean> {
        const tx = await brickContract.isApprovedForAll(getAccountAddress(), modelContractAddress);
        console.log(tx);
        return tx;
    }

    async function contractCall(contract: ethers.Contract, functionName: string, ...params: any[]) {
        const tx = await contract[functionName](...params);
        const ctxName = functionName;
        console.log("contractCall sent at " + ctxName, tx.hash);
        const receipt = await tx.wait();

        if (receipt.status === 1) {
            console.log(ctxName + " successful: ", receipt);
            return true;
        }
        else {
            console.log(ctxName + " failed: ", receipt);
            return false;
        }
    }

    async function contractCall_Brick(functionName: string, ...params: any[]) {
        return contractCall(brickContract, functionName, ...params);
    }

    async function contractCall_Model(functionName: string, ...params: any[]) {
        return contractCall(modelContract, functionName, ...params);
    }

    async function contractCall_Market(functionName: string, ...params: any[]) {
        return contractCall(marketContract, functionName, ...params);
    }

    function getBrickContract() {
        return brickContract;
    }

    function getModelContract() {
        return modelContract;
    }

    function getMarketContract() {
        return marketContract;
    }

    return {
        InitSolidityContracts,
        contractCall_Brick,
        contractCall_Model,
        contractCall_Market,
        getOwningBricks,
        refreshOwningBricks,
        getAccountAddress,
        modelContractAddress,
        isApprovedForAll
    }
})();

