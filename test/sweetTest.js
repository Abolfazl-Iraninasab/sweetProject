const { time , expectRevert  } = require("@openzeppelin/test-helpers")
const assert = require("assert")
const BN = require("bn.js")
const { sendEther, pow, frac } = require("./util")
const { web3 } = require("@openzeppelin/test-helpers/src/setup")
// const { inTransaction } = require("@openzeppelin/test-helpers/src/expectEvent")

const IERC20 = artifacts.require("IERC20")
// const IBNB = artifacts.require("IBNB")
const SweetToken = artifacts.require("SweetToken")
const Factory = artifacts.require("Factory")
const ISweetToken = artifacts.require("ISweetToken")

contract("Factory test" , (accounts) => {

    const BNB_ADDRESS = "0xB8c77482e45F1F44dE1745F52C74426C631bDD52" 
    const BNB_WHALE = "0xB4B3351918A9bEdC7D386c6a685c42E69920B34d"
    const BNB_DECIMALS = 18 
    const DEPOSIT_AMOUNT = pow(10, BNB_DECIMALS).mul(new BN(100))
    
    let BNB
    let factory
    let sweetToken
    let sweetToken_address 
    before(async () => {
        BNB = await IERC20.at(BNB_ADDRESS)
        factory = await Factory.new()
        sweetToken_address = await factory.sweetToken()
        sweetToken = await ISweetToken.at(sweetToken_address)

        console.log(`factory address : ${await factory.address}`)
        console.log(`sweetToken address : ${sweetToken_address}`)
        console.log(`sweetToken owner : ${await sweetToken.owner()}`)

        // transfering ETH to BNB_WHALE to be able to send BNB to our accounts
        await sendEther(web3, accounts[0], BNB_WHALE, 1);
        const bal = await BNB.balanceOf(BNB_WHALE)
        assert(bal.gte(DEPOSIT_AMOUNT), "whale balance < DEPOSIT_AMOUNT ")

        await BNB.transfer(accounts[0], DEPOSIT_AMOUNT, {
          from: BNB_WHALE,
        })
        console.log(`account[0] BNB balance : ${(await BNB.balanceOf(accounts[0])).div(pow(10, BNB_DECIMALS))}`)

        // sweetToken = await SweetToken.deployed(sweetToken_address)
        // sweetToken = await SweetToken.deployed()
        // sweetToken = await IERC20.at(sweetToken_address)
    })

    it("deposit BNB to Factory contract", async () => {
        await BNB.approve(factory.address,DEPOSIT_AMOUNT,{from: accounts[0]})
        await factory.deposit(DEPOSIT_AMOUNT,{from: accounts[0]})
    })

    it("try to redeem BNB after 3 days(should revert) ", async () => {
        // console.log(await time.latest())
        console.log(`current block.timestamp: ${(await web3.eth.getBlock('latest')).timestamp}`)

        await time.increase(time.duration.days(3))
        console.log(`block.timestamp after time manipulation(3 days) : ${(await web3.eth.getBlock('latest')).timestamp}`)

        await expectRevert(factory.redeem({from: accounts[0]}),"redeem tx reverted")

        // another way is to forcing blocks to be mined until blockNumber reaches 100
        // const block = await web3.eth.getBlockNumber()
        // await time.advanceBlockTo(block + 100)
    })

    it("try to redeem BNB after enough time passed" , async () =>{
        // console.log(await time.latest())
        console.log("-----------------------after another 4 days---------------------")
        console.log(`current block.timestamp: ${(await web3.eth.getBlock('latest')).timestamp}`)

        await time.increase(time.duration.days(10))
        console.log(`block.timestamp after time manipulation(10 days) : ${(await web3.eth.getBlock('latest')).timestamp}`)
        console.log(`balance : ${await factory.BNBbalance(factory.address)}`)

        await factory.redeem({from: accounts[0]})
    })
})

/*
ganache-cli --fork https://mainnet.infura.io/v3/5bc20cad614a4604b5a4ee51e8023cb9 --unlock 0xB4B3351918A9bEdC7D386c6a685c42E69920B34d  --networkId 999 
*/