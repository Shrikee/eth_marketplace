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
        <v-col v-for="prod in prodList" :key="prod.name" cols="12" sm="6" md="4" lg="3">
          <v-card>
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
              <v-btn color="success" href="google.com">Details {{ prod.name }}</v-btn>
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
const web3 = new Web3(Web3.givenProvider)
const contract = new web3.eth.Contract(
  storeContract.abi,
  process.env.CONTRACT_ADDRESS
)
export default {
  data: () => ({
    productItem: null,
    prodName: '',
    index: '_',
    item: null,
    prodList: []
  }),
  created() {
    this.getIndexAndPopulateProducts()
  },
  methods: {
    async getProduct(_name) {
      console.log(_name)
      await contract.methods
        .products(_name)
        .call()
        .then(res => {
          this.productItem = res
          console.log(this.productItem)
        })
    },
    async getIndexAndPopulateProducts() {
      await contract.methods
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
        await contract.methods
          .productIndex(i)
          .call()
          .then(async res => {
            await contract.methods
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