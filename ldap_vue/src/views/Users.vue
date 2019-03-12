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
      <form-user v-on:update="getData" v-if="info.login === 'Admin'"/>
      <v-btn color="red" v-if="info.login === 'Admin'" @click="dialogConfirmDelete = true">Tout supprimer</v-btn>
    </v-toolbar>
    <v-data-table
      hide-actions
      :headers="headers"
      :items="list"
      class="elevation-1"
    >
      <template slot="items" slot-scope="props">
        <td>{{ props.item.sn }}</td>
        <td>{{ props.item.uid }}</td>
        <td>{{ props.item.userPassword }}</td>
        <td>{{ props.item.description }}</td>
        <td class="justify-center layout px-0">
          <v-icon
            small
            class="mr-2"
            @click="
              dialogEdit = true
              toEdit = props.item
              comment = props.item.description
              pass = props.item.userPassword
              name= props.item.sn"
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
                  v-if="info.admin"
                ></v-text-field>
                <v-text-field
                  label="Nom"
                  v-model="name"
                  persistent-hint
                  required
                  v-if="info.admin"
                ></v-text-field>
                <v-text-field
                  label="Pass"
                  v-model="pass"
                  persistent-hint
                  required
                  v-else
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
    <v-dialog v-model="dialogConfirmDelete" persistent>
      <v-card>
        <v-card-title>
          <span class="headline">Tout supprimer ?</span>
        </v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="cancelDelete">Annuler</v-btn>
          <v-btn color="blue darken-1" flat @click="deleteAll">Valider</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import axios from 'axios'

import FormUser from '@/components/FormUser.vue'

import store from '../store.js'
export default {
  data: () => ({
    clients: null,
    headers: [
      {
        text: 'sn',
        value: 'sn'
      },
      {
        text: 'uid',
        value: 'uid'
      },
      {
        text: 'userPassword',
        value: 'userPassword'
      },
      { text: 'Description', value: 'description' },
    ],
    dialogEdit: false,
    comment: '',
    toEdit: null,
    groups: [],
    pass: '',
    info: '',
    name: '',
    dialogConfirmDelete: false
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
        url:'http://ldap_server:3000/users',
        responseType:'json'
      })
      this.clients = resp.data
      this.info = this.clients.find(c => c.login)
    },

    async deleteItem (dn) {
      const state = {
        dn: dn,
        supp: true
      }
      const res = await axios.post('http://ldap_server:3000/users',{state: state}).then(async resut => resut)
      await this.getData()
    },

    async updateItem (dn, state) {
      const res = await axios.post('http://ldap_server:3000/users',{state: state}).then(async resut => resut)
      await this.getData()
    },

    reset () {
      this.comment = ''
      this.dialogEdit = false
      this.toEdit = null
    },

    async valid () {
      let state = {
        dn: this.toEdit.dn,
        edit: true,
        admin: this.info.admin
      }
      if (this.info.admin) {
        state['comment'] = this.comment
        state['name'] = this.name
      } else {
        state['pass'] = this.pass
      }
      await this.updateItem (this.toEdit.dn, state)
      this.reset()
    },

    cancelDelete () {
      this.dialogConfirmDelete = false
    }, 

    async deleteAll () {
      Promise.all(this.clients.map(async c => {
        const state = {
          dn: c.dn,
          supp: true
        }
        await axios.post('http://ldap_server:3000/users',{state: state}).then(async resut => resut)
      }))
      await this.getData()
      this.cancelDelete()
    }
  },

  computed: {
    list() {
      return this.clients.filter(c => c.sn)
    }
  }
}
</script>