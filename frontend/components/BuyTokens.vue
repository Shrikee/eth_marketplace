<template>
  <v-container fluid>
    <v-btn @click="addMinter">Add minter</v-btn>
    <v-row>
      <v-col cols="12">
        <v-row align="center" justify="center" style="height: 300px;">
          <v-card class="ma-3 pa-6" outlined tile>
            <v-card-title>Buy tokens</v-card-title>
            <v-card-text>
              <v-list-item>1 VST = 0.001 ETH</v-list-item>
              <v-text-field v-model="ethAmount" label="Enter amount in ETH"></v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-btn color="success" @click="buyTokens">Buy</v-btn>
            </v-card-actions>
          </v-card>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Web3 from 'web3'
import crowdsaleContract from '~/static/Crowdsale.json'
import tokenContract from '~/static/VSTToken.json'
const crowdsaleContractAddress = process.env.CROWDSALE_CONTRACT_ADDRESS
const web3 = new Web3(Web3.givenProvider)
const crowdsale = new web3.eth.Contract(
  crowdsaleContract.abi,
  crowdsaleContractAddress
)
const token = new web3.eth.Contract(
  tokenContract.abi,
  process.env.TOKEN_CONTRACT_ADDRESS
)
let accounts
export default {
  data: () => ({
    ethAmount: '',
    minter: ''
  }),
  methods: {
    async buyTokens() {
      let amountWei = web3.utils.toWei(this.ethAmount, 'ether')
      console.log(amountWei)
      await web3.eth.sendTransaction({
        from: accounts[0],
        to: crowdsaleContractAddress,
        value: amountWei,
        gas: 500000
      })
    },
    async initAccounts() {
      accounts = await web3.eth.getAccounts()
    },
    async addMinter() {
      await token.methods
        .addMinter(crowdsaleContractAddress)
        .send({ from: accounts[0] })
    }
  },
  created() {
    this.initAccounts()
  }
}
</script>