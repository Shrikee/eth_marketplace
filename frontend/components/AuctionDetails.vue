<template>
  <v-container>
    <h2>Current block : {{currentBlockNumber}}</h2>
    <v-row>
      <v-col>
        <v-row align="start" justify="start" style="height: 300px;">
          <v-card class="ma-3 pa-6" outlined tile>
            <v-card-title>{{ name }}</v-card-title>
            <v-card-text>
              <v-list-item>
                Starting price:
                {{ price }}
              </v-list-item>
              <v-list-item>
                Start block:
                {{ startBlock }}
              </v-list-item>
              <v-list-item>
                End block:
                {{ endBlock }}
              </v-list-item>
              <v-list-item v-if="highestBid">
                Highest bid:
                {{ highestBid }}
              </v-list-item>
              <v-list-item class="error" v-if="endBlock < currentBlockNumber">
                <v-list-item-content>Auction has ended</v-list-item-content>
              </v-list-item>
            </v-card-text>
            <v-card-actions>
              <v-list-item>
                <v-text-field v-model="bid" label="Bid amount"></v-text-field>
              </v-list-item>
              <v-list-item>
                <v-btn class="success" @click="placeBid">Place bid</v-btn>
              </v-list-item>
            </v-card-actions>
          </v-card>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Web3 from 'web3'
import tokenContract from '~/static/VSTToken.json'
import storeContract from '~/static/Store.json'
import productAuctionContract from '~/static/ProductAutcion.json'

const web3 = new Web3(Web3.givenProvider)
const store = new web3.eth.Contract(
  storeContract.abi,
  process.env.STORE_CONTRACT_ADDRESS
)
const token = new web3.eth.Contract(
  tokenContract.abi,
  process.env.TOKEN_CONTRACT_ADDRESS
)
let accounts
let auction
export default {
  data: () => ({
    contractAddress: '',
    name: '',
    price: '',
    startBlock: '',
    endBlock: '',
    highestBid: '',
    currentBlockNumber: '',
    bid: ''
  }),
  methods: {
    getUrlParams() {
      this.contractAddress = this.$route.params.address
      console.log(this.$route.query)
      this.name = this.$route.query.name
      this.price = this.$route.query.price
      this.startBlock = this.$route.query.startBlock
      this.endBlock = this.$route.query.endBlock
      this.highestBid = this.$route.query.highestBid
    },
    async initAuction() {
      accounts = await web3.eth.getAccounts()
      console.log(accounts)
      auction = new web3.eth.Contract(
        productAuctionContract.abi,
        this.contractAddress
      )
    },
    async getBlockNumber() {
      this.currentBlockNumber = await web3.eth.getBlockNumber()
      console.log(this.currentBlockNumber)
    },
    async placeBid() {
      console.log('Bid: ' + this.bid)
      await token.methods
        .approve(this.contractAddress, this.bid)
        .send({ from: accounts[0] })
      await auction.methods.placeBid(this.bid).send({ from: accounts[0] })
    }
  },
  created() {
    this.getUrlParams()
    this.initAuction()
    this.getBlockNumber()
  }
}
</script>