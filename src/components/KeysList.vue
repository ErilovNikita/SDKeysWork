<script setup lang="ts">
import { h, onMounted, ref, watch } from "vue"
import { notification } from 'ant-design-vue'

import AccessKeySpan from "./list-columns/AccessKeySpan.vue"
import AccessKeySwitch from "./list-columns/AccessKeySwitch.vue"
import DeleteKey from "./list-columns/DeleteKeyButton.vue"

import LinkIcon from '../assets/icons/link.svg'
import PrivacyIcon from '../assets/icons/privacy.svg'

import { SearchMode, IKeyInfo, IKeysList, IPagination } from "../utils/types"
import { formatSmartDate, criticalDeadline } from "../utils/services"
import ConnectorService from "../utils/connector"
import { useSearchStore } from "../stores/search"
import { useUserStore } from "../stores/user"

const user = useUserStore()
const searchStore = useSearchStore()
const api: ConnectorService = new ConnectorService()

const pagination = ref<IPagination>({
  position: ['bottomLeft'],
  current: 1,
  pageSize: 10,
  total: 1,
  showTotal: (total: number) => "Всего: " + total,
  size: 'small',
  pageSizeOptions: [20, 50, 100],
  hideOnSinglePage: false,
  defaultCurrent: 1,
  showQuickJumper: true
})

const elements = ref<IKeyInfo[]>([])
const loading = ref<boolean>(false)

const handleTableChange = (newPagination: IPagination) => {
  Object.assign(pagination.value, newPagination)
  getPage()
}

const getPage = (type:'all'|'user' = 'all') =>  {
  loading.value = true
  let promise: Promise<IKeysList>

  if (user.superUser == false && user.canUse == true) {
    promise = api.getUserAccessKeysPage(user.login!, pagination.value.current, pagination.value.pageSize)
  } else {
    if (type == 'user') promise = api.getUserAccessKeysPage(searchStore.data!, pagination.value.current, pagination.value.pageSize)
    else promise = api.getAllAccessKeysPage(pagination.value.current, pagination.value.pageSize)
  }

  promise.then((data: IKeysList) => {
    pagination.value.total = data.pages.count
    elements.value.length = 0
    elements.value.push(...data.data)    
    if (type == 'user') {
      notification.success({
        message: "Запрос выполнен",
        description: elements.value.length ? `Получено ключей ${elements.value.length} шт.` : `Ключей не найдено`,
        placement: 'bottomRight',
        duration: 5
      })
    } else searchStore.reset()
  }).catch((e:any) => {
    notification.error({
      message: "Ошибка при загрузке списка",
      description: e.message,
      placement: 'bottomRight',
      duration: 5
    })
    searchStore.reset()
  }).finally(() => loading.value = false)
}
const getUrl = (uuid: string) => `${jsApi.getAppBaseUrl()}operator/#uuid:${uuid}`

onMounted(() => getPage())

defineExpose({getPage})

watch(() => searchStore.trigger, () => {
  if (searchStore.mode === SearchMode.Login) getPage('user')
})
</script>

<template>
  <a-table class="table" :selections="true" :data-source="elements" :pagination="pagination" :loading="loading"
    :scroll="{ x: 1000 }" @change="handleTableChange">
    <a-table-column title="Пользователь" data-index="username" key="username" :custom-header-cell="() => ({ style: { minWidth: '240px' } })">
      <template #customRender="{ record }">
        <a-typography-link :href="getUrl(record.employeeUuid)" target="_blank">
          <LinkIcon class="icon icon-link"/>{{record.username}}
        </a-typography-link>
      </template>
    </a-table-column>
    <a-table-column title="Значение ключа" data-index="uuid" key="uuid" :custom-header-cell="() => ({ style: { minWidth: '350px' } })">
      <template #customRender="{ record }">
        <AccessKeySpan :access-key="record" />
      </template>
    </a-table-column>
    <a-table-column title="Описание" data-index="description" key="description" :custom-header-cell="() => ({ style: { minWidth: '200px' } })">
      <template #customRender="{ record }">
        <a-typography-text :content="record.description" />
      </template>
    </a-table-column>
    <a-table-column title="Тип" data-index="type" key="type">
      <template #customRender="{ record }">
        <span>{{ record.type == 'REUSABLE' ? "Многоразовый" : "Одноразовый" }}</span>
      </template>
    </a-table-column>
    <a-table-column title="Активен" data-index="active" key="active" align="center">
      <template #customRender="{ record }">
        <AccessKeySwitch :access-key="record" />
      </template>
    </a-table-column>
    <a-table-column title="Дата создания" data-index="creationDate" key="creationDate">
      <template #customRender="{ record }">
        <a-tag color="cyan" class="date-tag">
          {{ formatSmartDate(record.creationDate) }}
        </a-tag>
      </template>
    </a-table-column>
    <a-table-column title="Дедлайн" data-index="deadline" key="deadline">
      <template #customRender="{ record }">
        <a-tag :color="criticalDeadline(record.deadline) ? 'volcano' : 'green'" class="date-tag">
          {{ formatSmartDate(record.deadline) }}
        </a-tag>
      </template>
    </a-table-column>
    <a-table-column title="Последнее использование" data-index="lastUsageDate" key="lastUsageDate">
      <template #customRender="{ record }">
        <a-tag :color="record.lastUsageDate ? 'geekblue' : 'purple'" class="date-tag">
          {{ record.lastUsageDate ? formatSmartDate(record.lastUsageDate) : "Никогда" }}
        </a-tag>
      </template>
    </a-table-column>
    <a-table-column title="JSON" data-index="key" :filteredValue="false" key="key" align="center">
      <template #customRender="{ record }">
        <a-popover>
          <template #content>
            <highlightjs style="margin-top: 0px;" language='json' :code="JSON.stringify(record, null, 4)" />
          </template>
          <a-button 
            type="text"
            class="icon"
            shape="circle"
            :icon="h(PrivacyIcon)"
          />
        </a-popover>
      </template>
    </a-table-column>
    <a-table-column title="Удалить" data-index="delete" key="delete" align="center">
      <template #customRender="{ record }">
        <DeleteKey :access-key="record"/>
      </template>
    </a-table-column>
  </a-table>

</template>

<style scoped>
.date-tag { font-size: 11px !important; }
.icon.icon-link { margin-bottom: -3px; }
.svg { margin-bottom: -10px !important; }
</style>
