<template>
  <v-flex>
    <v-text-field v-model="name" label="Product name"></v-text-field>
    <v-text-field v-model="price" label="Sell price"></v-text-field>
    <v-btn color="success" dark large @click="sellProduct">Sell</v-btn>
  </v-flex>
</template>

<script>
import Web3 from 'web3'
import storeContract from '~/static/Store.json'
export default {
  data: () => ({
    name: '',
    price: ''
  }),
  mounted() {
    this.getPermission()
  },
  methods: {
    async sellProduct() {
      const web3 = new Web3(Web3.givenProvider)
      console.log(web3)
      const accounts = await web3.eth.getAccounts()
      console.log(accounts)
      const contract = new web3.eth.Contract(
        storeContract.abi,
        process.env.CONTRACT_ADDRESS
      )
      await contract.methods
        .sellProduct(this.name, this.price)
        .send({
          from: accounts[0]
        })
    },
    getPermission() {
      window.addEventListener('load', async () => {
        // Modern dapp browsers...
        if (window.ethereum) {
          window.web3 = new Web3(ethereum)
          try {
            // Request account access if needed
            await ethereum.enable()
            // Acccounts now exposed
            web3.eth.sendTransaction({
              /* ... */
            })
          } catch (error) {
            // User denied account access...
          }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
          window.web3 = new Web3(web3.currentProvider)
          // Acccounts always exposed
          web3.eth.sendTransaction({
            /* ... */
          })
        }
        // Non-dapp browsers...
        else {
          console.log(
            'Non-Ethereum browser detected. You should consider trying MetaMask!'
          )
        }
      })
    }
  }
}
</script>