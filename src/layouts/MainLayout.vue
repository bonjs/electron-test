<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer"/>

        <q-toolbar-title>
          my Quasar App
        </q-toolbar-title>
        <div>v1.0.2</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label header>
          Essential Links
        </q-item-label>

        <EssentialLink
          v-for="link in linksList"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-list bordered class="rounded-borders" style="margin-top:50px">
      <q-expansion-item label="远程接口调用" icon="folder">
        <q-card>
          <q-card-section>
            <q-btn type="primary" @click="apiCall">远程接口调用</q-btn>
            http://jsonplaceholder.typicode.com/posts
            <div  style="height: 200px; overflow: scroll;">返回：{{ data }}</div>
          </q-card-section>
        </q-card>
      </q-expansion-item>

      <q-expansion-item label="使用前端数据库 " icon="folder">
        <q-card>
          <q-card-section>
            <indexeddb></indexeddb>
          </q-card-section>
        </q-card>
      </q-expansion-item>

      <q-expansion-item label="打印" icon="folder">
        <q-card>
          <q-card-section>
            <printer></printer>
          </q-card-section>
        </q-card>
      </q-expansion-item>
      <q-expansion-item label="热更新" icon="folder">
        <q-card>
          <q-card-section>
            <q-btn type="primary" @click="hotUpdate">热更新</q-btn> 当前版本: v1.0.2
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </q-list>

  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'
import indexeddb from 'components/indexeddb.vue'
import printer from 'components/printer.vue'

const linksList = [
  {
    title: 'Docs',
    caption: 'quasar.dev',
    icon: 'school',
    link: 'https://quasar.dev'
  },
  {
    title: 'Github',
    caption: 'github.com/quasarframework',
    icon: 'code',
    link: 'https://github.com/quasarframework'
  },
  {
    title: 'Quasar Awesome',
    caption: 'Community Quasar projects',
    icon: 'favorite',
    link: 'https://awesome.quasar.dev'
  }
]

const leftDrawerOpen = ref(false)

let data = ref('')

async function apiCall() {
  // window.electronAPI.sendMessage('do-something', 'Hello from Vue!');
  let url = 'http://jsonplaceholder.typicode.com/posts';
  data.value = await window.electronAPI.getData(url);
  console.log('data', data);
}

async function hotUpdate() {
  let result = await window.electronAPI.update();
  console.log('hostUpdate', result);
}
async function testUpdate() {
  let result = await window.electronAPI.testUpdate();
  console.log('hostUpdate', result);
}

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
