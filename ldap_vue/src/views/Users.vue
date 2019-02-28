<template>
  <v-container v-if="clients">
    <v-toolbar flat color="white">
      <v-toolbar-title>Utilisateurs</v-toolbar-title>
      <v-divider
        class="mx-2"
        inset
        vertical
      ></v-divider>
      <v-spacer></v-spacer>
      <form-user v-on:update="getData"/>
    </v-toolbar>
    <v-data-table
      hide-actions
      :headers="headers"
      :items="clients"
      class="elevation-1"
    >
      <template slot="items" slot-scope="props">
        <td>{{ props.item.dn }}</td>
        <td>{{ props.item.cn }}</td>
        <td>{{ props.item.uid }}</td>
        <td>{{ props.item.description }}</td>
        <td class="justify-center layout px-0">
          <v-icon
            small
            class="mr-2"
            @click="
              dialogEdit = true
              toEdit = props.item
              comment = props.item.description"
          >
            edit
          </v-icon>
          <v-icon
            small
            @click="deleteItem(props.item.dn)"
          >
            delete
          </v-icon>
        </td>
      </template>
    </v-data-table>
    <v-dialog v-model="dialogEdit" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Edit</span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex xs12>
                <v-text-field
                  label="Commentaire"
                  v-model="comment"
                  persistent-hint
                  required
                ></v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="reset">Close</v-btn>
          <v-btn color="blue darken-1" flat @click="valid">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import axios from 'axios'

import FormUser from '@/components/FormUser.vue'
export default {
  data: () => ({
    clients: null,
    headers: [
      { text: 'dn', value: 'dn' },
      {
        text: 'cn',
        value: 'cn'
      },
      {
        text: 'uid',
        value: 'uid'
      },
      { text: 'Description', value: 'description' },
    ],
    dialogEdit: false,
    comment: '',
    toEdit: null,
    groups: []
  }),
  
  async mounted () {
    await this.getData()
  },

  components: {
    FormUser
  },

  methods: {
    async getData() {
      const resp = await axios({
      method:'get',
      url:'http://localhost:3000/users',
      responseType:'json'
    })
    // .then(async (response) => response);
    // this.clients = resp.data.filter(d => d.cn)
    this.clients = resp.data
    },

    async deleteItem (dn) {
      // const resp = await axios({
      //   method:'delete',
      //   url:'http://localhost:3000/users',
      //   responseType:'json',
      //   data: {dn: dn}
      // }).then(async (response) => response);
      // console.log({resp})
      const state = {
        dn: dn,
        supp: true
      }
      const res = axios.post('http://localhost:3000/users',{state: state}).then(async resut => resut)
      // console.log({res})
    },

    async updateItem (dn, state) {
      // const resp = await axios({
      //   method:'put',
      //   url:'http://localhost:3000/users',
      //   responseType:'json',
      //   data: {dn: dn, state: state}
      // }).then(async (response) => response);
      const res = axios.post('http://localhost:3000/users',{state: state}).then(async resut => resut)
      // console.log({res})
    },

    reset () {
      this.comment = ''
      this.dialogEdit = false
      this.toEdit = null
    },

    valid () {
      const state = {
        dn: this.toEdit.dn,
        comment: this.comment,
        edit: true
      }
      this.updateItem (this.toEdit.dn, state)
      this.reset()
    }
  }
}
</script>