<template>
  <v-container>
    <v-card>
      <v-card-title>
        {{ status }}
      </v-card-title>
      <v-card-text>
        <v-form
          ref="form"
          v-model="valid"
          lazy-validation
        >
          <v-text-field
            v-model="name"
            :rules="nameRules"
            label="Name"
            required
          ></v-text-field>

          <v-text-field
            v-model="pass"
            :rules="passRules"
            label="Password"
            required
          ></v-text-field>

          <v-btn
            :disabled="!valid"
            color="success"
            @click="validate"
          >
            Validate
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import axios from 'axios'
import store from '../store.js'
export default {
  data: () => ({
    valid: true,
    name: '',
    nameRules: [
      v => !!v || 'Name is required'
    ],
    pass: '',
    passRules: [
      v => !!v || 'PassWord is required'
    ],
    status: 'Connexion'
  }),

  methods: {
    async validate () {
      if (this.$refs.form.validate()) {
        const res = await axios.post("http://localhost:3000/account/connect", {
          login: this.name,
          pass: this.pass
        }).then((res) => res)
        if(res.data) {
          this.status = "Succés !"
          location.reload();
        } else {
          this.status = "Echec !"
        }
      }
    }
  }
}
</script>