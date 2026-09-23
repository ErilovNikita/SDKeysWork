<script setup lang="ts">
import { onMounted, ref, watch } from "vue"
import type { TablePaginationConfig } from 'ant-design-vue'
import { Button, Table, Alert, type TableColumn, type TableView } from '@minitwiks/nsmp-vue-components'
import { notifyError, notifySuccess } from '../utils/notification'

import AccessKeySpan from "./list-columns/AccessKeySpan.vue"
import AccessKeySwitch from "./list-columns/AccessKeySwitch.vue"
import DeleteKey from "./list-columns/DeleteKeyButton.vue"
import EditKey from "./list-columns/EditKeyButton.vue"

import { LinkIcon, PrivacyIcon, DeleteIcon, PlusIcon, FilterIcon } from 'nsmp-icons'

import { SearchMode, IKeyInfo, IKeysList } from "../utils/types"
import { formatSmartDate, criticalDeadline } from "../utils/services"
import ConnectorService from "../utils/connector"
import { useSearchStore } from "../stores/search"
import { useUserStore } from "../stores/user"

const emit = defineEmits<{
  (e: 'showModal:CreateKey'): void
  (e: 'showModal:DeleteAllKeys'): void
  (e: 'showModal:Search'): void
  (e: 'showModal:AccessKeyInfo', value: string): void
}>()

const userStore = useUserStore()
const searchStore = useSearchStore()
const api: ConnectorService = new ConnectorService()

const pagination = ref<TablePaginationConfig>({
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

const tableColumns: Record<string, TableColumn[]> = {
  full: [
    { title: 'Пользователь', dataIndex: 'username', key: 'username', width: 230 },
    { title: 'Значение ключа', dataIndex: 'uuid', key: 'uuid', width: 320 },
    { title: 'Описание', dataIndex: 'description', key: 'description' },
    { title: 'Тип', dataIndex: 'type', key: 'type' },
    { title: 'Активен', dataIndex: 'active', key: 'active', align: 'center', width: 100 },
    { title: 'Дата создания', dataIndex: 'creationDate', key: 'creationDate', width: 150 },
    { title: 'Дедлайн', dataIndex: 'deadline', key: 'deadline', width: 150 },
    { title: 'Последнее использование', dataIndex: 'lastUsageDate', key: 'lastUsageDate', width: 150 },
    { title: 'Активности', key: 'actions', align: 'center', resizable: false, width: 150 },
  ],
  short: [
    { title: 'Пользователь', dataIndex: 'username', key: 'username', width: 230 },
    { title: 'Значение ключа', dataIndex: 'uuid', key: 'uuid', width: 320 },
    { title: 'Описание', dataIndex: 'description', key: 'description' },
    { title: 'Активен', dataIndex: 'active', key: 'active', align: 'center', width: 100 },
    { title: 'Дедлайн', dataIndex: 'deadline', key: 'deadline', width: 150 },
    { title: 'Активности', key: 'actions', align: 'center', resizable: false, width: 150 },
  ],
}

const views: TableView[] = [
  { title: 'Основной вид', columns: tableColumns.short },
  { title: 'Вся информация', columns: tableColumns.full },
]

const elements = ref<IKeyInfo[]>([])
const loading = ref<boolean>(false)
const selected = ref<IKeyInfo[]>([])

const handlePaginationChange = (current: number, pageSize: number) => {
  pagination.value.current = current
  pagination.value.pageSize = pageSize
  getPage()
}

const showAccessKeyInfo = (accessKey: string) => {
  searchStore.mode = SearchMode.UUID
  searchStore.data = accessKey
  emit('showModal:AccessKeyInfo', accessKey)
}

pagination.value.onChange = handlePaginationChange

const getPage = (type:'all'|'user' = 'all') =>  {
  loading.value = true
  let promise: Promise<IKeysList>

  if (userStore.superUser == false && userStore.canUse == true) {
    promise = api.getAccessKeysPage(pagination.value.current ?? 1, pagination.value.pageSize ?? 10, userStore.login!)
  } else {
    if (type == 'user') promise = api.getAccessKeysPage(pagination.value.current ?? 1, pagination.value.pageSize ?? 10, searchStore.data!)
    else promise = api.getAccessKeysPage(pagination.value.current ?? 1, pagination.value.pageSize ?? 10)
  }

  promise.then((data: IKeysList) => {
    pagination.value.total = data.pages.count
    elements.value.length = 0
    elements.value.push(...data.data)    
    if (type == 'user') {
      notifySuccess('Запрос выполнен', {
        description: elements.value.length ? `Получено ключей ${elements.value.length} шт.` : `Ключей не найдено`,
      })
    } else searchStore.reset()
  }).catch((e:any) => {
    notifyError('Ошибка при загрузке списка', e)
    searchStore.reset()
  }).finally(() => loading.value = false)
}
const getUrl = (uuid: string) => `${jsApi.getAppBaseUrl()}operator/#uuid:${uuid}`
const resetCurrentPage = () => pagination.value.current = 1
const resetSearch = () => {
  resetCurrentPage()
  searchStore.reset()
  getPage()
}

onMounted(() => getPage())

watch(() => searchStore.trigger, () => {
  if (searchStore.mode === SearchMode.Login && searchStore.data) getPage('user') 
  else getPage('all')
})
</script>

<template>
  <Table
    :columns="tableColumns.short"
    v-model:selected-objects="selected"
    :data-source="elements"
    :loading="loading"
    :pagination="pagination"
    row-key="uuid"
    view-storage-key="keys"
    show-view-select
    :views="views"
    :resizableColumns="true"
    :scroll="{ x: 1000 }"
    :selectable="true"
  >
    <template #selectedObjectsActions>
      <Button type="text" v-if="selected.length == 1" @click="showAccessKeyInfo(selected[0].uuid)">Подробная информация</Button>
    </template>

    <template #start>
      <Button type="default" :icon="PlusIcon" @click="emit('showModal:CreateKey')">Создать ключ</Button>
      <Button type="default" :icon="FilterIcon" v-if="userStore?.superUser" @click="emit('showModal:Search')">Фильтрация</Button>
      <Button type="default" :icon="DeleteIcon" @click="emit('showModal:DeleteAllKeys')">Удалить все ключи</Button>

      <Alert :closable="false" :open="true" :showIcon="false" class="filter" v-if="searchStore.data && searchStore.mode == SearchMode.Login">
        <template #message>
          <div>
            <a-typography-link class="link" type="text" @click="emit('showModal:Search')">Изменить</a-typography-link>
            <a-typography-link class="link" v-if="searchStore.data" type="text" @click="resetSearch">Сбросить</a-typography-link>
            <a-typography-text>[{{ searchStore.mode == SearchMode.Login ? "Пользователь" : "Ключ" }}: {{ searchStore.data }}]</a-typography-text>
          </div>
        </template>
      </Alert>
    </template>

    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'username'">
        <a-typography-link :href="getUrl(record.employeeUuid)" target="_blank">
          <LinkIcon class="icon icon-link"/>{{record.username}}
        </a-typography-link>
      </template>

      <AccessKeySpan v-if="column.key === 'uuid'" :access-key="record as IKeyInfo" />

      <a-tooltip v-if="column.key === 'description'" :title="record.description">
        <a-typography-text :content="record.description" />
      </a-tooltip>
      
      <span v-if="column.key === 'type'">{{ record.type === 'REUSABLE' ? 'Многоразовый' : 'Одноразовый' }}</span>

      <AccessKeySwitch v-if="column.key === 'active'" :access-key="record as IKeyInfo" />

      <a-tag v-if="column.key === 'creationDate'" color="cyan" class="date-tag">
        {{ formatSmartDate(record.creationDate) }}
      </a-tag>

      <a-tag v-if="column.key === 'deadline'" :color="criticalDeadline(record.deadline) ? 'volcano' : 'green'" class="date-tag">
        {{ formatSmartDate(record.deadline) }}
      </a-tag>

      <a-tag v-if="column.key === 'lastUsageDate'" :color="record.lastUsageDate ? 'geekblue' : 'purple'" class="date-tag">
        {{ record.lastUsageDate ? formatSmartDate(record.lastUsageDate) : 'Никогда' }}
      </a-tag>

      <template v-if="column.key === 'actions'">
        <div class="actions">
          <a-popover>
            <template #content>
              <highlightjs style="margin-top: 0px;" language="json" :code="JSON.stringify(record, null, 4)" />
            </template>
            <Button type="text" class="icon" shape="circle" :icon="PrivacyIcon" />
          </a-popover>
          <EditKey :access-key="record as IKeyInfo" />
          <DeleteKey :access-key="record as IKeyInfo" />
        </div>
      </template>
    </template>
  </Table>
</template>

<style scoped>
.date-tag { font-size: 11px !important; }
.icon.icon-link { margin-bottom: -3px; }
.svg { margin-bottom: -10px !important; }
.actions { display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; }
.filter .link { margin-right: 10px; font-size: 12px !important;}
.filter { margin-top: 10px; padding: 5px 14px !important;}
.filter .link:nth-child(2) { padding-right: 7px; border-right: 1px solid rgba(0, 0, 0, .35); }
</style>
