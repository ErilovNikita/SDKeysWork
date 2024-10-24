import { useBaseStore } from './stores'

let manifest = {
    "NAME" : "🔑 KeysWork",
    "DEV_URL" : "",
    "DEV_TOKEN" : "",
    "DEV_MODE" : false,
    "GITHUB_OWNER" : "ErilovNikita",
    "GITHUB_REPO" : "SDKeysWork",
    "VERSION" : '4.2.0'
}

class main {
    static manifest = manifest

    /**
     * Метод для формирования ссылки на модуль
     * @param {string} method - Метод обращения
     * @returns {Array<String>} params - Параметры
     */
    static getRequestUrl(
        method: String,
        params: Array<String>
    ) {
        const baseStore = useBaseStore()
        // Формируем ссылку и обновляем данные
        if (baseStore.dev.enable) {
            return baseStore.dev.url + `/sd/services/rest/exec?func=modules.keysWork.${method}&params="${params.join('","')}"&accessKey=${baseStore.dev.token}`
        } else {
            return jsApi.getAppRestBaseUrl() + `/exec/?func=modules.keysWork.${method}&params="${params.join('","')}"`
        }
    }

    /**
     * Метод получения кода темы 
     * @param {string} login - Строковое логина пользователя
     */
    static async getThemeCode(
        login: String,
    ) {
        const response = await fetch(main.getRequestUrl('getThemeByUser', [login]), {
            method: "GET",
            mode: "cors"
        })
        return await response.text()
    }

    /**
     * Метод деактивация ключа 
     * @param {string} accessKey - Строковое значение UUID ключа
     */
    static async disableKey(
        accessKey: String,
    ) {
        await fetch(main.getRequestUrl('removeAccessKey', [accessKey]), {
            method: "GET",
            mode: "cors"
        })
    }

    /**
     * Метод активации ключа 
     * @param {string} accessKey - Строковое значение UUID ключа
     */
    static async enableKey(
        accessKey: String,
    ) {
        await fetch(main.getRequestUrl('activateAccessKey', [accessKey]), {
            method: "GET",
            mode: "cors"
        })
    }
    
    /**
     * Метод создания нового ключа 
     * @param {string} login - Строковое значение UUID ключа
     * @param {string} lifespan - Строковое значение UUID ключа
     */
    static async addAccessKey(
        login: String,
        lifespan: String,
    ) {
        const response = await fetch(main.getRequestUrl('addAccessKey', [login, lifespan]), {
            method: "GET",
            mode: "cors"
        })
        let accessKey = await response.text()
        let status = response.status
        return {
            "status" : status,
            "accessKey": accessKey
        }
    }

    /**
     * Метод поиска данных о ключе
     * @param {string} findValue - Строковое значение UUID ключа или логина
     */
    static async getData(
        findValue:string,
        pageNumber:Number
    ) {
        const response = await fetch(main.getRequestUrl('find', [findValue, String(pageNumber)]), {
            method: "GET",
            mode: "cors"
        })
        const jsonData = await response.json()
        return jsonData
    }

    /**
     * Метод для получения релизной версии
     */
    static async getReleaseVersion() {
        const response = await fetch(`https://api.github.com/repos/${main.manifest.GITHUB_OWNER}/${main.manifest.GITHUB_REPO}/releases`, {
            method: "GET",
            mode: "cors"
        });
        const jsonData = await response.json();
        return jsonData[0]?.tag_name
    }
}

export default main;