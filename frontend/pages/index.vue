<template>
  <v-layout
    column
    justify-center
    align-center
  >
    <v-flex
      xs12
      sm8
      md6
    >
      <div class="text-center">
      </div>
      <v-card>
        <SellProduct/>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import SellProduct from '~/components/SellProduct.vue'

export default {
  components: {
    SellProduct
  }
}
</script>
