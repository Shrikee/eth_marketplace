<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <div class="text-center"></div>
      <v-card>
        <Deals />
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import Deals from '~/components/Deals.vue'

export default {
  components: {
    Deals
  }
}
</script>
