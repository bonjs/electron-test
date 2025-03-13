<template>
  选择打印机
  <!-- <el-select style="max-width:200px" v-model="selectedPrinter" placeholder="请选择打印机">
    <el-option v-for="printer in printers" :key="printer.name" :label="printer.name" :value="printer.name"></el-option>
  </el-select> -->

  <q-select v-model="selectedPrinter" :options="printers" label="Standard" />

  <q-btn type="primary" @click="printDocument">打印</q-btn>
  <div>{{ printContent }}</div>

</template>

<script setup>
import { ref, onMounted} from 'vue'
import { useQuasar } from 'quasar'
const $q = useQuasar()

const printers = ref([]);
const selectedPrinter = ref("");
const printContent = ref("内容");

// 获取打印机列表
async function loadPrinters() {
    printers.value = await window.electronAPI.getPrinters();
}

// 发送打印请求
function printDocument() {
    if (!selectedPrinter.value || !printContent.value) {
      debugger
        // ElMessage.warning("请选择打印机并输入内容");
        $q.notify({
          message: '请选择打印机并输入内容',
          type: 'warning'
        })
        return;
    }

    window.electronAPI.printDocument({
        printerName: selectedPrinter.value,
        content: printContent.value
    });

    // ElMessage.success("已发送打印请求");
    $q.notify({
      message: '已发送打印请求',
      type: 'info'
    })
}

onMounted(loadPrinters); // 页面加载时自动获取打印机列表
</script>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
