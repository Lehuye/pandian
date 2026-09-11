<template>
<div class="asset-table-wrap">
  <input v-model="searchKey" placeholder="搜索资产名称/编号/保管人" class="search-input"/>
  <table border cellpadding="6" cellspacing="0" class="asset-table">
    <thead>
      <tr>
        <th>序号</th>
        <th>PO</th>
        <th>入帐日期</th>
        <th>资产分类</th>
        <th>保管部门</th>
        <th>保管人</th>
        <th>管理员</th>
        <th>名称</th>
        <th>规格型号</th>
        <th>存放位置名称</th>
        <th>状态</th>
        <th>固定资产编号</th>
        <th>管理部编号</th>
        <th>初资产编号</th>
        <th>序列号</th>
        <th>地盤编号</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in tableData" :key="row.uuid">
        <td>{{row.index}}</td>
        <td>{{row.po}}</td>
        <td>{{row.inDate}}</td>
        <td>{{row.assetCategory}}</td>
        <td>{{row.dept}}</td>
        <td>{{row.keeper}}</td>
        <td>{{row.manager}}</td>
        <td>{{row.name}}</td>
        <td>{{row.spec}}</td>
        <td>{{row.location}}</td>
        <td>{{row.status}}</td>
        <td>{{row.assetNo}}</td>
        <td>{{row.manageNo}}</td>
        <td>{{row.originAssetNo}}</td>
        <td>{{row.sn}}</td>
        <td>{{row.diskNo}}</td>
      </tr>
    </tbody>
  </table>
</div>
</template>

<script setup>
import { ref, computed } from 'vue'
const searchKey = ref('')
const assetList = ref([
  {
    uuid: '1',
    index: 121,
    po: '1TSK300001',
    inDate: '20200623',
    assetCategory: 'G545',
    dept: 'PTARS20618',
    keeper: '王敏',
    manager: '张智平',
    name: '数据采集卡',
    spec: 'USB6366,781445-01',
    location: '中国广东省深圳市南山区大道星河NOBDE工期B栋33',
    status: '在库',
    assetNo: 'G20060004',
    manageNo: 'RSRSRSRS-00061',
    originAssetNo: 'E1',
    sn: '',
    diskNo: '序号(在库)'
  },
  {
    uuid: '2',
    index: 410,
    po: '1NSI200040',
    inDate: '20180706',
    assetCategory: 'B545',
    dept: 'PTARS20618',
    keeper: '王敏',
    manager: '张智平',
    name: '电子白板',
    spec: 'PN-70TB3',
    location: '中国广东省深圳市南山区大道星河NOBDE工期B栋33',
    status: '在库',
    assetNo: 'B003497',
    manageNo: 'RSRSRSRS-00069',
    originAssetNo: '会议室',
    sn: '',
    diskNo: '序号(会议室)'
  }
])
const tableData = computed(()=>{
  if(!searchKey.value) return assetList.value
  const kw = searchKey.value.toLowerCase()
  return assetList.value.filter(item=> Object.values(item).some(v=>String(v).toLowerCase().includes(kw)))
})
</script>

<style scoped>
.search-input {
  padding: 6px 10px;
  width: 320px;
  margin-bottom:10px;
}
.asset-table {
  width:100%;
  border-collapse: collapse;
}
.asset-table th,.asset-table td {
  border:1px solid #999;
}
</style>
