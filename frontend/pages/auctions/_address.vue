<template>
  <v-container>
    <v-row>
      <h1>Hello _address</h1>
      <AuctionDetails />
    </v-row>
  </v-container>
</template>

<script>
import AuctionDetails from '~/components/AuctionDetails.vue'
export default {
  data: () => ({}),
  components: {
    AuctionDetails
  }
}
</script>