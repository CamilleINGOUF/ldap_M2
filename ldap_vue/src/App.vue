<template>
  <v-app>
    <v-toolbar app>
      <v-toolbar-title>LDAP TP</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items class="align-center">
        <router-link to="/"><v-btn flat>Login</v-btn></router-link>
        <v-btn flat v-if="info.login" @click="disconnect">Déconnexion</v-btn>
        <router-link v-if="info.login" to="/users"><v-btn flat>Utilisateurs</v-btn></router-link>
        <router-link v-if="info.admin" to="/groups"><v-btn flat>Groupes</v-btn></router-link>
        <v-btn v-if="info.admin" @click="exportJSON" flat>Export</v-btn>
        <v-btn v-if="info.admin" @click="dialogImport = true" flat>Import</v-btn>
      </v-toolbar-items>
    </v-toolbar>

    <v-content>
      <router-view/>
    </v-content>
    <a id="downloadAnchorElem"></a>
    <v-dialog v-model="dialogImport" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Import</span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex xs12>
                <input type="file"
                  id="importJSON" name="importJSON"
                  accept="json" @change="onFileChange">
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
  </v-app>
</template>

<script>
import axios from 'axios'
import { Promise } from 'q';
export default {
  name: 'App',

  data: () => ({
    dialogImport: false,
    file: null,
    loggedAdmin: false,
    info: {admin: false}
  }),

  async mounted () {
    const resp2 = await axios({
      method:'get',
      url:'http://localhost:3000/users',
      responseType:'json'
    })
    this.info = resp2.data.find(d => d.login)
  },

  methods: {
    async disconnect () {
      // console.log('oui')
      const result = await axios.post("http://localhost:3000/account/disconnect").then(res => res)
      if(result) {
        this.loggedAdmin = false
        this.$router.push({path: '/'})
        location.reload();
      } else {
        // console.log('echec')
      }
    },

    async exportJSON () {
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
      console.log({people: resp.data, groups: resp2.data})
      const groups = resp.data.filter(g => g.cn)
      const people = resp2.data.filter(p => p.sn)
      let jsonData = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({groups: groups, people: people}))
      let downloadAnchorNode = document.getElementById('downloadAnchorElem');
      downloadAnchorNode.setAttribute("href", jsonData);
      downloadAnchorNode.setAttribute("download", "export.json");
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    },

    valid() {
      let reader = new FileReader()
      reader.onload = (e) => {
        this.import(JSON.parse(e.target.result));
      };
      reader.readAsText(this.file);
      this.reset()
    },

    reset () {
      this.dialogImport = false
    },

    onFileChange(e) {
      let files = e.target.files || e.dataTransfer.files;
      if (!files.length)
        return;
      this.file = files[0]
    },

    async import(jsonData) {
      const res = Promise.all(jsonData.people.map(async person => {
        await axios.post('http://localhost:3000/users', {
          state: {
            import: true,
            user: person,
            dn: person.dn
          }
        }).then(res => res)
      })).then(res => res)
      const res2 = Promise.all(jsonData.groups.map(async group => {
        await axios.post('http://localhost:3000/groups', {
          state: {
            import: true,
            group: group,
            dn: group.dn
          }
        }).then(res => res)
        // await Promise.all(group.memberUid.map(async m => {
        //   const state = {
        //     dn: group.dn,
        //     uid: m,
        //     addUser: true
        //   }
        //   console.log(state)
        //   await axios.post('http://localhost:3000/groups',{state: state}).then(async resut => resut)
        // })).then(res => res)
      })).then(res => res)
    }
  }
}
</script>
