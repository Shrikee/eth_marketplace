<template>
  <v-container>
    <h1>Current block: {{currentBlockNumber}}</h1>
    <v-row no-gutters>
      <v-col v-for="auction in auctionsList" :key="auction.name">
        <v-row align="center" justify="center" style="height: 300px;">
          <v-card class="ma-3 pa-6" outlined tile>
            <v-card-title>{{auction.name}}</v-card-title>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>{{auction.address}}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Starting price:</v-list-item-title>
              {{auction.startingPrice}}
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Highest Bid:</v-list-item-title>
              {{auction.highestBid}}
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Start block:</v-list-item-title>
              {{auction.startBlock}}
            </v-list-item>
            <v-list-item>
              <v-list-item-title>End block:</v-list-item-title>
              {{auction.endBlock}}
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Seller:</v-list-item-title>
              {{auction.beneficiary}}
            </v-list-item>
            <v-list-item
              class="blue-grey"
              v-if="currentBlockNumber > auction.endBlock"
            >Auction has ended</v-list-item>
            <v-list-item v-if="currentBlockNumber > auction.endBlock">
              <v-btn class="success" @click="claimTokens">Claim Tokens</v-btn>
            </v-list-item>
            <v-list-item v-if="currentBlockNumber > auction.endBlock">
              <v-btn class="light-green" @click="bWithdraw">Seller withdraw</v-btn>
            </v-list-item>
            <v-card-text></v-card-text>
            <v-card-actions>
              <v-btn
                color="primary"
                :to="{path: 'auctions/' + auction.address, query:
                  {
                    name: auction.name,
                    price: auction.startingPrice,
                    startBlock: auction.startBlock,
                    endBlock: auction.endBlock,
                    highestBid: auction.highestBid
                  }
                }"
              >Details</v-btn>
            </v-card-actions>
          </v-card>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Web3 from 'web3'
import storeContract from '~/static/Store.json'
import productAuctionContract from '~/static/ProductAutcion.json'

const web3 = new Web3(Web3.givenProvider)
const store = new web3.eth.Contract(
  storeContract.abi,
  process.env.STORE_CONTRACT_ADDRESS
)
let auction
let accounts
export default {
  data: () => ({
    currentBlockNumber: '',
    index: '',
    auction: '',
    auctionObj: {
      address: '',
      name: '',
      startingPrice: '',
      startBlock: '',
      endBlock: '',
      highestBid: '',
      beneficiary: ''
    },
    auctionsList: []
  }),
  created() {
    this.getIndex()
    this.initAccounts()
    this.getAuctionAddresses()
    this.getBlockNumber()
  },
  methods: {
    async initAccounts() {
      accounts = await web3.eth.getAccounts()
    },
    async claimTokens() {
      await auction.methods.claimTokens().send({ from: accounts[0] })
    },
    async bWithdraw() {
      await auction.methods.beneficiaryWithdraw().send({ from: accounts[0] })
    },
    async getBlockNumber() {
      this.currentBlockNumber = await web3.eth.getBlockNumber()
      console.log(this.currentBlockNumber)
    },
    async initAuction(_address) {
      auction = await new web3.eth.Contract(
        productAuctionContract.abi,
        _address
      )
    },
    // get auction list and place it to created
    async getIndex() {
      this.index = await store.methods.auctionCount().call()
      console.log('Index number: ' + this.index)
    },
    async getAuctionAddresses() {
      for (let i = 0; i <= this.index; i++) {
        let newAuctionObj = {}
        console.log(i)
        await store.methods
          .auctions(i)
          .call()
          .then(async address => {
            newAuctionObj.address = address
            console.log(newAuctionObj.address)
            await this.initAuction(address)
            newAuctionObj.name = await auction.methods.name().call()
            newAuctionObj.startingPrice = await auction.methods.price().call()
            newAuctionObj.startBlock = await auction.methods.startBlock().call()
            newAuctionObj.endBlock = await auction.methods.endBlock().call()
            newAuctionObj.highestBid = await auction.methods.highestBid().call()
            newAuctionObj.beneficiary = await auction.methods
              .beneficiary()
              .call()
            this.auctionsList.push(newAuctionObj)
            console.log(newAuctionObj)
          })
      }
    }
  }
}
</script>