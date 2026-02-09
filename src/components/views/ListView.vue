<!--suppress VueUnrecognizedSlot -->
<script setup lang="ts">
import InitialData from "../../model/InitialData.ts";
import KeyInfo from "../../model/KeyInfo.ts";
import {onMounted, ref} from "vue";
import Pagination from "../../model/Pagination.ts";
import {connector, devMode} from "../../main.ts";
import KeysList from "../../model/KeysList.ts";
import MostBeautifulJsonEver from "../list-columns/MostBeautifulJsonEver.vue";
import AccessKeySpan from "../list-columns/AccessKeySpan.vue";
import AccessKeySwitch from "../list-columns/AccessKeySwitch.vue";
import {notification} from 'ant-design-vue';
import DeleteKey from "../list-columns/DeleteKeyButton.vue";

interface Props {
  initData: InitialData,
  login: string | null
}

interface Emits {
  (e: 'update:empty'): void
}

const emit = defineEmits<Emits>()

const props = defineProps<Props>()

/** Конфигурация пагинации */
const pagination = ref<Pagination>({
  position: ['bottomLeft'],
  current: 1,
  pageSize: 10,
  total: 1,
  showTotal: (total: number) => "Всего: " + total,
  size: 'small',
  pageSizeOptions: devMode ? [5, 20, 50, 100] : [20, 50, 100],
  hideOnSinglePage: false,
  defaultCurrent: 1,
  showQuickJumper: true
})

const elements = ref<KeyInfo[]>([])
const loading = ref<boolean>(false)

/**
 * Обработчик изменения таблицы (пагинация, сортировка, фильтрация)
 * @param newPagination новое состояние пагинации
 */
function handleTableChange(newPagination: Pagination) {
  Object.assign(pagination.value, newPagination)
  console.log(newPagination)
  getPage()
}

function getPage() {
  loading.value = true
  let promise: Promise<KeysList>
  if (props.login && props.login.trim().length != 0) promise = connector.getUserAccessKeysPage(props.login, pagination.value.current, pagination.value.pageSize)
  else promise = connector.getAllAccessKeysPage(pagination.value.current, pagination.value.pageSize)
  promise.then((data: KeysList) => {
    console.log(data)
    pagination.value.total = data.pages.count
    elements.value.length = 0
    elements.value.push(...data.data)
    if (elements.value.length == 0) emit("update:empty")
    //throw new Error("тест")
  }).catch((e) => {
    pagination.value.total = 1
    elements.value.length = 0
    notification.error({
      message: "Ошибка при загрузке списка",
      description: e.message,
      placement: 'top',
      duration: 5
    })
  }).finally(() => loading.value = false)
}

onMounted(() => {
  getPage()
})

function extSearch() {
  pagination.value.current = 1
  getPage()
}

defineExpose({
  extSearch
})
</script>

<template>
  <a-table class="table"
           size="small"
           :bordered="true"
           :selections="true"
           :data-source="elements"
           :pagination="pagination"
           :loading="loading"
           :scroll="{ x: 500 }"
           @change="handleTableChange">
    <a-table-column title="JSON"
                    data-index="key"
                    :filteredValue="false"
                    key="key">
      <template #customRender="{record}">
        <a-popover>
          <template #content>
            <MostBeautifulJsonEver :data="record"/>
          </template>
          <a-button type="link">JSON</a-button>
        </a-popover>
      </template>
    </a-table-column>
    <a-table-column title="Активен"
                    data-index="active"
                    key="active">
      <template #customRender="{record}">
        <AccessKeySwitch :access-key="record"/>
      </template>
    </a-table-column>
    <a-table-column title="UUID"
                    data-index="uuid"
                    key="uuid">
      <template #customRender="{record}">
        <AccessKeySpan :access-key="record"/>
      </template>
    </a-table-column>
    <a-table-column title="Описание"
                    data-index="description"
                    key="description">
      <template #customRender="{record}">
        <a-typography-text :content="record.description"/>
      </template>
    </a-table-column>
    <a-table-column title="Пользователь"
                    data-index="username"
                    key="username"/>
    <a-table-column title="Тип"
                    data-index="type"
                    key="type">
      <template #customRender="{record}">
        <span v-if="record.type == 'REUSABLE'">Многоразовый</span>
        <span v-if="record.type == 'DISPOSABLE'">Одноразовый</span>
      </template>
    </a-table-column>
    <a-table-column title="Дата создания"
                    data-index="creationDate"
                    key="creationDate"/>
    <a-table-column title="Дедлайн"
                    data-index="deadline"
                    key="deadline"/>
    <a-table-column title="Последнее использование"
                    data-index="lastUsageDate"
                    key="lastUsageDate"/>
    <a-table-column title=" "
                    data-index="delete"
                    key="delete">
      <template #customRender="{record}">
        <DeleteKey :access-key="record" @update:deleted="getPage"/>
      </template>
    </a-table-column>
  </a-table>

</template>

<style scoped>

</style>
