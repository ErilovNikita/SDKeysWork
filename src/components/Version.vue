<script setup lang="ts">
import { compareVersions, getLastVersion } from '../utils/services'
import { notifyError, notifyWarning } from '../utils/notification'

const notificationOptions = {
    placement: 'topRight',
    closable: false,
    expandedByDefault: true,
}

getLastVersion('ErilovNikita', 'SDKeysWork').then(remoteVersion => {
    switch(compareVersions(__APP_VERSION__, remoteVersion)) {
        case 1:
            notifyWarning('Тестовая версия', `Вы используете тестовую версию ${__APP_VERSION__}! Свяжитесь с поддержкой для исправления.`, notificationOptions)
            console.warn(`Последний релиз в репозитории: ${remoteVersion} < ${__APP_VERSION__}`)
            break
        case -1:
            notifyError('Устаревшая версия', `Ваша версия ${__APP_VERSION__} устарела! Сбросьте кеш браузера, чтобы получить новую версию.`, notificationOptions)
            console.warn(`Последний релиз в репозитории: ${remoteVersion} > ${__APP_VERSION__}`)
            break
    }
}) .catch(e => {
    notifyError('Ошибка проверки версии', (e as Error).message + '. Свяжитесь с поддержкой для исправления.', notificationOptions)
})
</script>
