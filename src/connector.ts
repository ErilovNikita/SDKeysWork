import {jsApi} from "./main.ts"
import KeysList from "./model/KeysList.ts";
import KeyInfo from "./model/KeyInfo.ts";
import InitialData from "./model/InitialData.ts";


export default class ConnectorService {

    static CONTROLLER_MODULE_CODE: string = 'keysWork'

    /**
     * Получить страницу ключей пользователя
     * @param login логин пользователя, очевидно блять
     * @param pageNumber номер страницы
     * @param pageSize размер страницы
     */
    async getUserAccessKeysPage(
        login: string,
        pageNumber: number | null = 1,
        pageSize: number | null = 20
    ): Promise<KeysList> {
        let initUrl = "exec?params=request,response,user" +
            "&func=modules." + ConnectorService.CONTROLLER_MODULE_CODE + ".getUserAccessKeysPage" +
            "&value=" + login
        if (pageNumber) initUrl += "&pageNumber=" + pageNumber.toString()
        if (pageSize) initUrl += "&pageSize=" + pageSize.toString()


        const response = await jsApi.restCallAsJson(initUrl, {method: "GET"});
        return response as KeysList;

    }

    /**
     * Получить страницу ключей пользователя
     * @param pageNumber номер страницы
     * @param pageSize размер страницы
     */
    async getAllAccessKeysPage(
        pageNumber: number | null = 1,
        pageSize: number | null = 20
    ): Promise<KeysList> {
        let initUrl = "exec?params=request,response,user" +
            "&func=modules." + ConnectorService.CONTROLLER_MODULE_CODE + ".getAllAccessKeysPage"
        if (pageNumber) initUrl += "&pageNumber=" + pageNumber.toString()
        if (pageSize) initUrl += "&pageSize=" + pageSize.toString()

        const response = await jsApi.restCallAsJson(initUrl, {method: "GET"});
        return response as KeysList;
    }

    /**
     * Получить код темы текущего пользователя
     * @param login
     */
    async getThemeCode(
        login: String,
    ): Promise<string> {
        const initUrl = "exec?params=request,response,user" +
            "&func=modules." + ConnectorService.CONTROLLER_MODULE_CODE + ".getThemeByUser" +
            "&login=" + login

        const response = await jsApi.restCall(initUrl, {method: "GET", responseType: "text"});
        return response as string;

    }

    /**
     * Деактивировать ключ
     * @param accessKey uuid ключа
     */
    async disableKey(
        accessKey: String
    ): Promise<void> {
        const initUrl = "exec?params=request,response,user" +
            "&func=modules." + ConnectorService.CONTROLLER_MODULE_CODE + ".disableAccessKey" +
            "&uuid=" + accessKey

        return await jsApi.restCall(initUrl, {method: "GET"});

    }

    /**
     * Включить ключ
     * @param accessKey
     */
    async enableKey(
        accessKey: String
    ): Promise<void> {
        const initUrl = "exec?params=request,response,user" +
            "&func=modules." + ConnectorService.CONTROLLER_MODULE_CODE + ".activateAccessKey" +
            "&uuid=" + accessKey

        return await jsApi.restCall(initUrl, {method: "GET"});

    }

    /**
     * Включить ключ
     * @param accessKey
     */
    async deleteKey(
        accessKey: String
    ): Promise<void> {
        const initUrl = "exec?params=request,response,user" +
            "&func=modules." + ConnectorService.CONTROLLER_MODULE_CODE + ".deleteAccessKey" +
            "&uuid=" + accessKey

        return await jsApi.restCall(initUrl, {method: "GET"});
    }

    /**
     * Удалить вообще все ключи пользователя
     * @param login логин пользователя
     */
    async deleteUserAccessKeys(login: string): Promise<void> {
        let initUrl = "exec?params=request,response,user" +
            "&func=modules." + ConnectorService.CONTROLLER_MODULE_CODE + ".deleteUserAccessKeys" +
            "&username=" + login
        await jsApi.restCall(initUrl, {method: "GET"});
    }

    /**
     * Создать новый ключ
     * @param login логин
     * @param lifespanInDays срок жизни в днях
     * @param description описание
     * @param disposable одноразовый
     * @param deadline дедлайн
     */
    async addAccessKey(
        login: string,
        lifespanInDays: number | null = null,
        description: string | null = null,
        disposable: boolean | null = null,
        deadline: string | null = null
    ): Promise<KeyInfo> {
        let initUrl = "exec?params=request,response,user" +
            "&func=modules." + ConnectorService.CONTROLLER_MODULE_CODE + ".addAccessKey" +
            "&login=" + login
        if (lifespanInDays) initUrl += "&days=" + lifespanInDays.toString()
        if (description) initUrl += "&description=" + description
        if (disposable) initUrl += "&disposable=" + disposable.toString()
        if (deadline) initUrl += "&deadline=" + deadline
        const response = await jsApi.restCallAsJson(initUrl, {method: "GET"});
        return response as KeyInfo;
    }

    /**
     * Получить информацию по ключу
     * @param accessKey uuid ключа
     */
    async getAccessKeyInfo(
        accessKey: String
    ): Promise<KeyInfo> {
        const initUrl = "exec?params=request,response,user" +
            "&func=modules." + ConnectorService.CONTROLLER_MODULE_CODE + ".getAccessKeyInfo" +
            "&uuid=" + accessKey
        try {
            const response = await jsApi.restCallAsJson(initUrl, {method: "GET"});
            return response as KeyInfo;
        } catch (error: any) {
            throw new Error(error.responseText || error.message)
        }
    }

    /**
     * Получить данные для инициализации приложения
     */
    async getInitialData(): Promise<InitialData> {
        const initUrl = "exec?params=request,response,user" +
            "&func=modules." + ConnectorService.CONTROLLER_MODULE_CODE + ".getInitData"
        try {
            const response = await jsApi.restCallAsJson(initUrl, {method: "GET"});
            return response as InitialData;
        } catch (error: any) {
            throw new Error(error.responseText || error.message)
        }
    }
}
