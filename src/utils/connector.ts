import type { IUser, IInitialData, IKeyInfo, IKeysList } from "./types"

/**
 * Подтвердить текущее окружение = разработка
 *
 * @returns true - если разработка, false - если нет
 */
export const isDev = (): boolean => {
  return import.meta.env.MODE == 'development'
}

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
    ): Promise<IKeysList> {
        let initUrl = "/exec?params=request,response,user" +
            "&func=modules." + ConnectorService.CONTROLLER_MODULE_CODE + ".getUserAccessKeysPage" +
            "&value=" + login
        if (pageNumber) initUrl += "&pageNumber=" + pageNumber.toString()
        if (pageSize) initUrl += "&pageSize=" + pageSize.toString()


        const response = await jsApi.restCallAsJson(initUrl, {method: "GET"})
        return response as IKeysList

    }

    /**
     * Получить страницу ключей пользователя
     * @param pageNumber номер страницы
     * @param pageSize размер страницы
     */
    async getAllAccessKeysPage(
        pageNumber: number | null = 1,
        pageSize: number | null = 20
    ): Promise<IKeysList> {
        let initUrl = "/exec?params=request,response,user&func=modules." + ConnectorService.CONTROLLER_MODULE_CODE + ".getAllAccessKeysPage"
        if (pageNumber) initUrl += "&pageNumber=" + pageNumber.toString()
        if (pageSize) initUrl += "&pageSize=" + pageSize.toString()

        const response = await jsApi.restCallAsJson(initUrl, {method: "GET"})
        return response as IKeysList
    }

    /**
     * Получить код темы текущего пользователя
     * @param login
     */
    async getThemeCode(
        login: String,
    ): Promise<string> {
        const initUrl = "/exec?params=request,response,user&func=modules." + ConnectorService.CONTROLLER_MODULE_CODE + ".getThemeByUser&login=" + login

        const response = await jsApi.restCall(initUrl, {method: "GET", responseType: "text"})
        return response as string

    }

    /**
     * Деактивировать ключ
     * @param accessKey uuid ключа
     */
    async disableKey(
        accessKey: String
    ): Promise<void> {
        const initUrl = "/exec?params=request,response,user&func=modules." + ConnectorService.CONTROLLER_MODULE_CODE + ".disableAccessKey&uuid=" + accessKey

        return await jsApi.restCall(initUrl, {method: "GET"})

    }

    /**
     * Включить ключ
     * @param accessKey
     */
    async enableKey(
        accessKey: String
    ): Promise<void> {
        const initUrl = "/exec?params=request,response,user&func=modules." + ConnectorService.CONTROLLER_MODULE_CODE + ".activateAccessKey&uuid=" + accessKey

        return await jsApi.restCall(initUrl, {method: "GET"})

    }

    /**
     * Включить ключ
     * @param accessKey
     */
    async deleteKey(
        accessKey: String
    ): Promise<void> {
        const initUrl = "/exec?params=request,response,user&func=modules." + ConnectorService.CONTROLLER_MODULE_CODE + ".deleteAccessKey&uuid=" + accessKey

        return await jsApi.restCall(initUrl, {method: "GET"})
    }

    /**
     * Удалить вообще все ключи пользователя
     * @param login логин пользователя
     */
    async deleteUserAccessKeys(login: string): Promise<void> {
        let initUrl = "/exec?params=request,response,user&func=modules." + ConnectorService.CONTROLLER_MODULE_CODE + ".deleteUserAccessKeys&username=" + login
        await jsApi.restCall(initUrl, {method: "GET"})
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
    ): Promise<IKeyInfo> {
        let initUrl = "/exec?params=request,response,user&func=modules." + ConnectorService.CONTROLLER_MODULE_CODE + ".addAccessKey&login=" + login
        if (lifespanInDays) initUrl += "&days=" + lifespanInDays.toString()
        if (description) initUrl += "&description=" + description
        if (disposable) initUrl += "&disposable=" + disposable.toString()
        if (deadline) initUrl += "&deadline=" + deadline
        const response = await jsApi.restCallAsJson(initUrl, {method: "GET"})
        return response as IKeyInfo
    }

    /**
     * Редактировать существующий ключ
     * @param uuid uuid ключа
     * @param description описание
     * @param deadline дедлайн
     */
    async editAccessKey(
        uuid: string,
        description: string,
        deadline: string
    ): Promise<IKeyInfo> {
        const initUrl = `/exec?params=request,response,user&func=modules.${ConnectorService.CONTROLLER_MODULE_CODE}.updateKey&uuid=${uuid}&description=${description}&deadline=${deadline}`
        const response = await jsApi.restCallAsJson(initUrl, {method: "GET"})
        return response as IKeyInfo
    }

    /**
     * Получить информацию по ключу
     * @param accessKey uuid ключа
     */
    async getAccessKeyInfo(
        accessKey: String
    ): Promise<IKeyInfo> {
        const initUrl = "/exec?params=request,response,user&func=modules." + ConnectorService.CONTROLLER_MODULE_CODE + ".getAccessKeyInfo&uuid=" + accessKey
        try {
            const response = await jsApi.restCallAsJson(initUrl, {method: "GET"})
            return response as IKeyInfo
        } catch (error: any) {
            throw new Error(error.responseText || error.message)
        }
    }

    /**
     * Получить данные о текущем пользователе
     */
    async getUserData(): Promise<IUser> {
        const initUrl = "/exec?params=request,response,user&func=modules." + ConnectorService.CONTROLLER_MODULE_CODE + ".getInitData"
        try {
            let currentUser:IUser = jsApi.getCurrentUser()

            const response: IInitialData = await jsApi.restCallAsJson(initUrl, {method: "GET"})

            currentUser.canUse = response.canUse
            currentUser.superUser = response.superUser

            return currentUser
        } catch (error: any) {
            throw new Error(error.responseText || error.message)
        }
    }
}
