<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-row align="center" justify="center" style="height: 300px;">
          <v-card class="ma-3 pa-6" outlined tile>
            <v-card-title>Create auction</v-card-title>
            <v-card-text>
              <v-text-field v-model="name" label="Auction name"></v-text-field>
              <v-text-field v-model="price" label="Strating price"></v-text-field>
              <v-text-field v-model="duration" label="Duration in minutes"></v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-btn color="success" @click="createAuction">Create</v-btn>
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
import tokenContract from '~/static/VSTToken.json'

const web3 = new Web3(Web3.givenProvider)
const store = new web3.eth.Contract(
  storeContract.abi,
  process.env.STORE_CONTRACT_ADDRESS
)

let accounts

export default {
  data: () => ({
    name: '',
    price: '',
    duration: ''
  }),
  methods: {
    async createAuction() {
      accounts = await web3.eth.getAccounts()
      await store.methods
        .sellProduct(this.name, this.price, this.duration)
        .send({ from: accounts[0] })
    }
  }
}
</script>