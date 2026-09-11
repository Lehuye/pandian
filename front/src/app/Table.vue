<template>

<button @click="exportExcel">导出 Excel</button>
  <table border="1" cellpadding="6" cellspacing="0">
    <thead>
      <tr>
        <th>序號</th>
        <th>PO</th>
        <th>入帳日期</th>
        <th>資產分類</th>
        <th>保管部門</th>
        <th>保管人</th>
        <th>管理員</th>
        <th>名稱</th>
        <th>規格型號</th>
        <th>存放位置名稱</th>
        <th>狀態</th>
        <th>財產編號</th>
        <th>管制編號</th>
        <th>初盤結果</th>
        <th>複盤結果</th>
        <th>抽盤結果</th>
        <th>備註</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in memberList" :key="item.seq">
        <!--td>{{ item.seq }}</td>
        <td>{{ item.po }}</td>
        <td>{{ item.accountingDate }}</td>
        <td>{{ item.assetCategory }}</td>
        <td>{{ item.custodianDept }}</td>
        <td>{{ item.custodian }}</td>
        <td>{{ item.administrator }}</td>
        <td>{{ item.name }}</td>
        <td>{{ item.model }}</td>
        <td>{{ item.location }}</td>
        <td>{{ item.status }}</td>
        <td>{{ item.assetNo }}</td>
        <td>{{ item.controlNo }}</td>
        <td>{{ item.initialResult }}</td>
        <td>{{ item.recheckResult }}</td>
        <td>{{ item.spotResult }}</td>
        <td>{{ item.remark }}</td-->
        <td>{{ item["序號"] }}</td>
        <td>{{ item["PO"] }}</td>
        <td>{{ item["入帳日期"] }}</td>
        <td>{{ item["資產分類"] }}</td>
        <td>{{ item["保管部門"] }}</td>
        <td>{{ item["保管人"] }}</td>
        <td>{{ item["管理員"] }}</td>
        <td>{{ item["名稱"] }}</td>
        <td>{{ item["規格型號"] }}</td>
        <td>{{ item["存放位置名稱"] }}</td>
        <td>{{ item["狀態"] }}</td>
        <td>{{ item["財產編號"] }}</td>
        <td>{{ item["管制編號"] }}</td>
        <td>{{ item["初盤結果"] }}</td>
        <td>{{ item["複盤結果"] }}</td>
        <td>{{ item["抽盤結果"] }}</td>
        <td>{{ item["備註"] }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
import { ref } from "vue";
import rawAssetData from "@/assets/data";
const memberList = ref(rawAssetData);

import * as XLSX from "xlsx";

// 导出当前 memberList 为 Excel
function exportExcel() {
  if (!memberList.value || memberList.value.length === 0) {
    alert("没有可导出的数据");
    return;
  }
  // 转成二维数组（去掉uuid、src等内部字段）
  const headers = [
    "序號",
    "PO",
    "入帳日期",
    "資產分類",
    "保管部門",
    "保管人",
    "管理員",
    "名稱",
    "規格型號",
    "存放位置名稱",
    "狀態",
    "財產編號",
    "管制編號",
    "初盤結果",
    "複盤結果",
    "抽盤結果",
    "備註",
  ];
  const rows = memberList.value.map((item) => [
    item["序號"],
    item["PO"],
    item["入帳日期"],
    item["資產分類"],
    item["保管部門"],
    item["保管人"],
    item["管理員"],
    item["名稱"],
    item["規格型號"],
    item["存放位置名稱"],
    item["狀態"],
    item["財產編號"],
    item["管制編號"],
    item["初盤結果"],
    item["複盤結果"],
    item["抽盤結果"],
    item["備註"],
  ]);

  // 生成workbook
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "資產盤點");

  // 触发下载
  XLSX.writeFile(wb, "資產盤點.xlsx");
}
</script>
