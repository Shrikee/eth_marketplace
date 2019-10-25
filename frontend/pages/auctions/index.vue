<template>
  <v-container fluid>
    <v-btn class="success" to="/auctions/CreateAuction">Create new auction</v-btn>
    <ListAuctions />
  </v-container>
</template>

<script>
import ListAuctions from '~/components/ListAuctions'
export default {
  components: { ListAuctions }
}
</script>