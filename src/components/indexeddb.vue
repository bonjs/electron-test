<template>
  <q-btn type="primary" @click="add">add</q-btn>
  <q-btn type="primary" @click="rollback">rollback</q-btn>

  <div class="q-pa-md">
    <q-markup-table>
      <thead>
        <tr>
          <th class="text-left">ID</th>
          <th class="text-right">name</th>
          <th class="text-right">time</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in dataList" v-bind:key="item.ID">
          <td class="text-left">{{index}}</td>
          <td class="text-right">{{item.name}}</td>
          <td class="text-right">{{ item.time }}</td>
        </tr>
      </tbody>
    </q-markup-table>
  </div>
</template>

<script setup>
import { ref, onMounted} from 'vue'

import { useQuasar } from 'quasar'
const $q = useQuasar()

const dataList = ref([]);
const dbName = "MyDatabase";
const storeName = "MyStore";

async function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function fetchData() {
    const db = await openDatabase();
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => {
        dataList.value = request.result; // ✅ 让 Vue 3 自动更新 UI
    };

    request.onerror = () => {
        // ElMessage.error("查询数据失败！");
        $q.notify({
          message: '查询数据失败！',
          type: 'warning'
        })
    };
}

async function add() {
  const db = await openDatabase();
  const transaction = db.transaction(storeName, "readwrite");
  const store = transaction.objectStore(storeName);
  store.add({ name: "示例数据", time: new Date().toISOString() });

  transaction.oncomplete = () => {
    // ElMessage.success("数据已添加！");
    $q.notify({
      message: '数据已添加！',
      type: 'positive'
    })
    fetchData();
  };
  transaction.onerror = () => {
    // ElMessage.error("添加数据失败！");
    $q.notify({
      message: '添加数据失败！',
      type: 'warning'
    })
  };
}

async function getData() {
  const db = await openDatabase();
  const transaction = db.transaction(storeName, "readonly");
  const store = transaction.objectStore(storeName);
  const request = store.getAll();

  request.onsuccess = () => {
    dataList.value = request.result;
  };

  request.onerror = () => {
    // ElMessage.error("查询数据失败！");
    $q.notify({
      message: '添加数据失败！',
      type: 'warning'
    })
  };
}

async function rollback() {
  const db = await openDatabase();
  const transaction = db.transaction(storeName, "readwrite");
  const store = transaction.objectStore(storeName);

  try {
    // ElMessage.info("尝试添加一条数据");
    $q.notify({
      message: '尝试添加一条数据',
      type: 'info'
    })
    store.add({ name: "事务测试数据", time: new Date().toISOString() });

    throw new Error("模拟错误，触发回滚！");
    transaction.commit(); // 这行代码不会执行
  } catch (error) {
    // ElMessage.error(error.message);
    $q.notify({
      message: error.message,
      type: 'warning'
    })
    transaction.abort();
    // ElMessage.warning("事务已回滚：" + error.message);
    $q.notify({
      message: "事务已回滚：" + error.message,
      type: 'warning'
    })
  }
}


onMounted(fetchData); 

</script>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
