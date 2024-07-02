import { Contract, ethers } from 'ethers';
//初始化合约调用相关
import brickABIJSON from '@/ABIs/brickABI.json'
import modelABIJSON from '@/ABIs/modelABI.json'
import marketABIJSON from '@/ABIs/marketABI.json'

const openseaAPI = "bcee010a55b74f14ac1a3bbd8b9dd118"
const brickAddress = "0x8400431edd44ED24b1341024e1A5F7339554A13A"
const modelAddress = "0x35b637c929c88cd77ec8c53682bcfd309b7edcb9"
const marketAddress = "0x370297884a02dcf327020add676aec8a2f082999"
const brickABI = brickABIJSON
const modelABI = modelABIJSON
const marketABI = marketABIJSON
//获取provider,signer,可写合约contract
let signer: any;
let provider
let brickContract
let modelContract
let marketContract

export const contractStore = (() => {
    const InitSolidityContracts = async () => {
        if ((window as any).ethereum == null) {
            console.log("MetaMask not installed; using read-only defaults")
            provider = ethers.getDefaultProvider()
        } else {
            provider = new ethers.BrowserProvider((window as any).ethereum as any)
            signer = await provider.getSigner()
        }
        brickContract = new Contract(brickAddress, brickABI, signer)
        modelContract = new Contract(modelAddress, modelABI, signer)
        marketContract = new Contract(marketAddress, marketABI, signer)
    }

    return {
        InitSolidityContracts,
        brickContract,
        modelContract,
        marketContract
    }
})();

