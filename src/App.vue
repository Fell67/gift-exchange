<script setup>
  import contentBox from "@/components/contentBox.vue"
</script>

<template>
  <v-app 
    color="background"
  >
    <v-card
      color="secondary"
    >
      <v-card-title
        class="text-accent text-center"
        style="padding: 2rem;"
      >
        Gift Exchange
      </v-card-title>
    </v-card>
    <v-card
      color="primary"
    >
      <v-card-text
        class="text-area"
      >
        <v-switch
          v-model="theme"
          color="accent"
          true-value="Light"
          false-value="Dark"
          :label="`Theme: ${theme}`"
          tabindex="0"
        >
        </v-switch>
        <contentBox />
      </v-card-text>
    </v-card>
  </v-app>
</template>

<script>
  import contentBox from "@/components/contentBox.vue"

  export default {
      name: "ContentBox",
      components: {
        contentBox: contentBox
      },
      data () {
        return {
          theme: ""
        }
      },
      watch: {
        theme: function changeTheme() {
          if (this.theme === "Light") {
            this.$vuetify.theme.name = "Light"  
          } else if (this.theme === "Dark") {
            this.$vuetify.theme.name = "Dark"  
          }
        }
      },
      created () {
        this.theme = this.$vuetify.theme.name
      }
  }
</script>

<style scoped>
  .text-area {
    padding: 1rem 25rem;
  }

  @media screen and (max-width: 1255px) {
    .text-area {
      padding: 1rem;
    } 
  }
</style>