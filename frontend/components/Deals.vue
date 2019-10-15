<template>
  <v-layout>
    <h1 v-if="!deal.name">No deals</h1>
    <v-card v-if="deal.name">
      <v-card-text>
        <h2>{{ deal.name }}</h2>
        <h3>Buyer: {{ deal.buyer }}</h3>
        <h3>Price: {{ deal.price }}</h3>
      </v-card-text>
      <v-card-actions>
        <v-btn
          large
          color="primary"
          @click="approveDeal(deal.buyer, deal.price) && clearDeal()"
        >Approve the deal</v-btn>
      </v-card-actions>
    </v-card>
  </v-layout>
</template>
<script>
import Web3 from 'web3'
import storeContract from '~/static/Store.json'
import tokenContract from '~/static/VSTToken.json'
import { type } from 'os'
const web3 = new Web3(Web3.givenProvider)
const store = new web3.eth.Contract(
  storeContract.abi,
  process.env.STORE_CONTRACT_ADDRESS
)
const token = new web3.eth.Contract(
  tokenContract.abi,
  process.env.TOKEN_CONTRACT_ADDRESS
)
export default {
  data: () => ({
    deal: {},
    userAddress: ''
  }),
  created() {
    this.getDeals()
    this.getUserAddress()
  },
  methods: {
    async getDeals() {
      const accounts = await web3.eth.getAccounts()
      console.log(`user acount : ${accounts[0]}`)
      await store.methods
        .deals(accounts[0])
        .call()
        .then(res => {
          this.deal = res
          console.log(`Deal res : ${typeof res} ${JSON.stringify(res)}`)
        })
    },
    async getUserAddress() {
      let addressArray = await web3.eth.getAccounts()
      return (this.userAddress = addressArray[0])
    },
    async approveDeal(_buyer, _price) {
      await this.getUserAddress()
      await token.methods
        .transferFrom(_buyer, this.userAddress, _price)
        .send({ from: this.userAddress })
        .then(res => console.log(res))
    },
    async clearDeal() {
      await store.methods
        .clearDeal(this.userAddress)
        .send({ from: this.userAddress })
    }
  }
}
</script>