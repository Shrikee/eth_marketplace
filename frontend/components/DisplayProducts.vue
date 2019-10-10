<template>
  <v-layout>
    <v-container fluid>
      <v-text-field v-model="prodName" label="Input product name"></v-text-field>
      <v-btn color="success" dark large @click="getProduct(prodName)">Load product</v-btn>
      <v-card v-if="productItem">
        <v-card-title>{{ productItem.name }}</v-card-title>
        <v-divider></v-divider>
        <v-card-title>Price : {{ productItem.price }}</v-card-title>
        <v-card-title>Owner : {{ productItem.owner }}</v-card-title>
      </v-card>
      <v-flex>
        <h3>{{ prodList.length }}</h3>
      </v-flex>
      <v-row>
        <v-col v-for="prod in prodList" :key="prod.name" cols="3" sm="3" md="3" lg="3">
          <v-card v-if="prod.name">
            <v-card-title class="subheading font-weight-bold">{{ prod.name }}</v-card-title>

            <v-divider></v-divider>

            <v-list dense>
              <v-list-item>
                <v-list-item-content>Price:</v-list-item-content>
                <v-list-item-content class="align-end">{{ prod.price }}</v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>Owner:</v-list-item-content>
                <v-list-item-content class="align-end">{{ prod.owner }}</v-list-item-content>
              </v-list-item>
            </v-list>
            <v-card-actions>
              <v-btn
                color="success"
                @click="buyProduct(prod.name, prod.owner, prod.price)"
              >Buy product {{ prod.name }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
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
    productItem: null,
    prodName: '',
    index: '_',
    item: null,
    prodList: [],
    deals: [],
    userAddress: ''
  }),
  created() {
    this.getIndexAndPopulateProducts()
  },
  methods: {
    async getProduct(_name) {
      console.log(_name)
      await store.methods
        .products(_name)
        .call()
        .then(res => {
          this.productItem = res
          console.log(this.productItem)
        })
    },
    async buyProduct(_name, _seller, _price) {
      // console.log(
      //   `TypeOf _name: ${_name} ${typeof _name} _seller: ${_seller} ${typeof _seller} _price: ${_price} ${typeof _price}`
      // )
      let accounts = await web3.eth.getAccounts()
      await store.methods
        .purchaseProduct(_name)
        .send({ from: accounts[0] })
        .then(async res => {
          console.log('store buy resp: ' + res)
          if (res) {
            await token.methods
              .approve(_seller, _price)
              .send({ from: accounts[0] })
              .then(res => console.log(res))
          }
        })
    },
    async getIndexAndPopulateProducts() {
      await store.methods
        .productCount()
        .call()
        .then(res => {
          this.index = res
          this.populateProducts()
        })
    },
    async populateProducts() {
      for (let i = 0; i < this.index; i++) {
        console.log(i)
        await store.methods
          .productIndex(i)
          .call()
          .then(async res => {
            await store.methods
              .products(res)
              .call()
              .then(res => {
                if (res) {
                  this.prodList.push(res)
                  console.log('array: ' + JSON.stringify(this.prodList[i]))
                }
                console.log(res)
              })
          })
      }
    }
  }
}
</script>