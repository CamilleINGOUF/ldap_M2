<template>
  <v-container v-if="groups">
    <v-toolbar flat color="white">
      <v-toolbar-title>Groups</v-toolbar-title>
      <v-divider
        class="mx-2"
        inset
        vertical
      ></v-divider>
      <v-spacer></v-spacer>
      <form-group v-on:update="getData"/>
     <v-btn color="red" @click="dialogConfirmDelete = true">Tout supprimer</v-btn>
    </v-toolbar>
    <v-data-table
      hide-actions
      :headers="headers"
      :items="list"
      class="elevation-1"
    >
      <template slot="items" slot-scope="props">
        <td>{{ props.item.dn }}</td>
        <td>{{ props.item.cn }}</td>
        <td>{{ props.item.description }}</td>
        <td>{{ props.item.memberUid }}</td>
        <td class="justify-center layout px-0">
          <v-icon
            small
            @click="addUserDialog = true
                    groupToEdit = props.item"
          >
            add
          </v-icon>
          <v-icon
            small
            @click="removeUserDialog = true
                    groupToEdit = props.item"
          >
            remove
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

    <v-dialog v-model="addUserDialog" persistent max-width="600px" v-if="groupToEdit">
      <v-card>
        <v-card-title>
          <span class="headline">ajouter user</span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex xs12>
                <v-select
                  label="Utilisateur"
                  :items="listUser"
                  v-model="userToAdd"
                  persistent-hint
                  required
                  return-object
                  item-value="uid"
                  item-text="uid"
                ></v-select>
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

    <v-dialog v-model="removeUserDialog" persistent max-width="600px" v-if="groupToEdit">
      <v-card>
        <v-card-title>
          <span class="headline">enlever user</span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex xs12>
                <v-select
                  label="Utilisateur"
                  :items="listUser2"
                  v-model="userToRemove"
                  persistent-hint
                  required
                ></v-select>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="reset">Close</v-btn>
          <v-btn color="blue darken-1" flat @click="valid2">Save</v-btn>
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

import FormGroup from '@/components/FormGroup.vue'
export default {
  data: () => ({
    headers: [
      { text: 'dn', value: 'dn' },
      {
        text: 'cn',
        value: 'cn'
      },
      {
        text: 'description',
        value: 'description'
      },
      {
        text: 'memberUid',
        value: 'memberUid'
      }
    ],
    groups: null,
    addUserDialog: false,
    removeUserDialog: false,
    groupToEdit: null,
    users: [],
    userToAdd: null,
    userToRemove: null,
    dialogConfirmDelete: false
  }),
  
  async mounted () {
    await this.getData()
  },

  components: {
    FormGroup
  },

  methods: {
    async getData() {
      const resp = await axios({
        method:'get',
        url:'http://localhost:3000/groups',
        responseType:'json'
      })
      .then(async (response) => response);
      const resp2 = await axios({
        method:'get',
        url:'http://localhost:3000/users',
        responseType:'json'
      })
      .then(async (response) => response);
      // this.groups = resp.data.filter(d => d.cn)
      // this.users = resp2.data.filter(d => d.cn)
      this.groups = resp.data
      this.users = resp2.data
    },

    async deleteItem (dn) {
      const state = {
        dn: dn,
        supp: true
      }
      const res = axios.post('http://localhost:3000/groups',{state: state}).then(async resut => resut)
      // console.log({res})
      await this.getData()
    },

    reset () {
      this.userToAdd = null
      this.userToRemove = null
      this.removeUserDialog = null
      this.addUserDialog = false
      this.groupToEdit = null
    },

    async valid () {
      const state = {
        dn: this.groupToEdit.dn,
        uid: this.userToAdd.uid,
        addUser: true
      }
      await this.updateItem (this.groupToEdit.dn, state)
      this.reset()
      await this.getData()
    },

    async valid2 () {
      const state = {
        dn: this.groupToEdit.dn,
        uid: this.userToRemove,
        removeUser: true
      }
      this.updateItem (this.groupToEdit.dn, state)
      await this.getData()
      this.reset()
    },

    async updateItem (dn, state) {
      const res = await axios.post('http://localhost:3000/groups',{state: state}).then(async resut => resut)
      console.log({res})
      await this.getData()
    },

    cancelDelete () {
      this.dialogConfirmDelete = false
    }, 

    async deleteAll () {
      Promise.all(this.groups.map(async c => {
        const state = {
          dn: c.dn,
          supp: true
        }
        await axios.post('http://localhost:3000/groups',{state: state}).then(async resut => resut)
      }))
      await this.getData()
      this.cancelDelete()
    }
  },

  computed: {
    listUser () {
      const users =  this.users.filter(u => !this.groupToEdit.memberUid || !this.groupToEdit.memberUid.includes(u.uid))
      return users.filter(u => u.cn)
    },

    listUser2 () {
      return this.groupToEdit.memberUid
    },

    list () {
      return this.groups.filter(g => g.cn)
    }
  }
}
</script>