<template>
  <v-dialog v-model="dialog" persistent max-width="600px">
    <v-btn slot="activator">Ajouter</v-btn>
    <v-card>
      <v-card-title>
        <span class="headline">Groupe</span>
      </v-card-title>
      <v-card-text>
        <v-form
          ref="form"
          v-model="valid"
          lazy-validation
        >
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex xs12 sm6 md4>
                <v-text-field v-model="state.name" label="Name" :rules="rules" ></v-text-field>
              </v-flex>
              <v-flex xs12 sm6 md4>
                <v-text-field v-model="state.description" label="Description" :rules="rules"></v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" flat @click="cancel">Close</v-btn>
        <v-btn color="blue darken-1" flat @click="save">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from 'axios'
export default {
  data: () => ({
    dialog: false,
    rules: [
      v => !!v || 'Required'
    ],
    state: {
      name: null,
      description: null
    },
    valid: true
  }),

  methods: {
    async save () {
      if (this.$refs.form.validate()) {
        const result = await axios.post('http://localhost:3000/groups', {
          state: this.state
        }).then(res => res)
        console.log({result})
        this.dialog = false
        this.$emit('update')
      }
    },

    cancel () {
      this.$refs.form.reset()
      this.$refs.form.resetValidation()
      this.dialog = false
    }
  }
}
</script>