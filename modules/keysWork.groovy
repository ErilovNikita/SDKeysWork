/**
 * Автор: Erilov.NA
 * Дата создания: 12.07.2024
 * Версия: 5
 * История:
 * nerilov - 12.07.2024 - v4.1.1 - создано
 * ekazantsev - 05.02.2025 - v5 - переписано на web_api_components с добавлением валидации пользователя + добавлены новые методы
 * ekazantsev - 09.02.2025 - v5.1 - добавлен метод получения всех ключей. исправлены баги пагинации
 *
 * Исходники ВП вы можете найти в репозиторих:
 * https://github.com/ErilovNikita/SDKeysWork/tree/main - основной
 * https://github.com/exeki/SDKeysWork
 */
package ru.sdkeyswork.keysWork

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import ru.kazantsev.nsd.modules.web_api_components.Preferences
import ru.kazantsev.nsd.modules.web_api_components.RequestProcessor
import ru.kazantsev.nsd.modules.web_api_components.WebApiException
import ru.kazantsev.nsd.modules.web_api_components.WebApiUtilities
import ru.naumen.core.server.script.api.accesskeys.IAccessKeyWrapper
import ru.naumen.core.server.script.api.injection.InjectApi
import ru.naumen.core.shared.dto.ISDtObject
import ru.naumen.core.server.script.api.accesskeys.AccessKey

//из либы https://github.com/exeki/nsd.sdk.global_variables для типизации
//import static ru.kazantsev.nsd.sdk.global_variables.ApiPlaceholder.*;

/**
 * Параметры, от низ зависит как будет работать модуль
 */
abstract class Parameters {
    /**
     * Разрешить всем пользоваться модулем на хостах,
     * которые соответствуют перечисленным хостам в параметре TEST_HOSTS.
     * При этом пользователи смогут работать только со своими ключами.
     */
    static final Boolean ALLOW_TO_ALL_IN_TEST_ENV = false
    /** Продакшн хост */
    static final List<String> TEST_HOSTS = [

    ]
}

abstract class Dto {
    static class KeysList {
        static class Pages {
            Integer count
            Integer current
            Integer pageSize
        }
        Pages pages
        List<Map<String, Object>> data = []
    }

    static class InitialData {
        Boolean canUse
        Boolean superUser
    }
}

/**
 * Утилитарные методы
 */
abstract class Utilities {

    @InjectApi
    static private class ApiHolder {}

    static private ApiHolder apiHolder = new ApiHolder()

    /**
     * Получить число ключей пользователя
     * @param username логин пользователя
     * @return число
     */
    static Integer getUsersKeysCount(String username) {
        String q = "SELECT COUNT(*) FROM ${AccessKey.class.getName()} WHERE username = :login"
        return apiHolder.api.db.query(q).set('login', username).list().last() as Integer
    }

    /**
     * Получить число всех ключей
     * @return число
     */
    static Integer getAllKeysCount() {
        String q = "SELECT COUNT(*) FROM ${AccessKey.class.getName()} WHERE username != 'naumen'"
        return apiHolder.api.db.query(q).list().last() as Integer
    }


    /**
     * Получить базовые настройки
     * @return
     */
    static Preferences getPrefs() {
        Preferences prefs = new Preferences().setDatePattern('dd.MM.yyyy HH:mm')
        //Boolean test = isTest()
        //if (!Parameters.ALLOW_TO_ALL_IN_TEST_ENV || !test) prefs.assertSuperuser(true)
        return prefs
    }

    /**
     * Проверить что модуль размещен на продакшене.
     * Проверка происходит путем сравнения текущего хоста с перечнем хостов в параметре TEST_HOSTS
     * @return да или нет
     */
    static Boolean isTest() {
        String baseUrl = apiHolder.api.web.getBaseUrl()
        return Parameters.TEST_HOSTS.any { baseUrl.contains(it) }
    }

    /**
     * Получить пользователя, или выкинуть ошибку если не найден
     * @param login логин пользователя
     * @return объект пользователя
     */
    static ISDtObject getUserOrThrow(String login) {
        ISDtObject user1 = apiHolder.utils.findFirst('employee', ['login': login])
        if (user1) return user1
        ISDtObject superUser = apiHolder.utils.findFirst("superUser", ["login": login])
        if (superUser) return superUser
        throw new WebApiException.BadRequest("Пользователя не существует")
    }
}

/**
 * Регулировка прав использования
 */
abstract class PermissionsService {

    @InjectApi
    static private class ApiHolder {}

    static private ApiHolder apiHolder = new ApiHolder()

    /**
     * Выкинуть ошибку о отсутствии прав у пользователя
     */
    private static void punish() {
        throw new WebApiException.Forbidden("Попытка работы с ключом, не принадлежащим пользователю.")
    }

    /**
     * Проверка что пользователь может работать с приложением
     * @param user пользователь
     * @return да или нет
     */
    static Boolean canUserUseApplication(ISDtObject user) {
        if (isSuperuser(user)) return true
        return Parameters.ALLOW_TO_ALL_IN_TEST_ENV && Utilities.isTest()
    }

    /**
     * Проверить что пользователь может использовать приложение, иначе выкинуть исключение
     * @param user пользователь
     */
    static void assertUserCanUseApplication(ISDtObject user) {
        if (!canUserUseApplication(user)) throw new WebApiException.Forbidden("Нильзя")
    }

    /**
     * Проверить что пользователь является суперпользователем
     * @param user пользователь
     */
    static void assertUserIsSuperuser(ISDtObject user) {
        if (!isSuperuser(user)) punish()
    }

    /**
     * Проверить что ключ принадлежит пользователю
     * @param user пользователь
     * @param keyData данные ключа
     */
    static void assertKeysOwner(ISDtObject user, Map<String, Object> keyData) {
        if (isSuperuser(user)) return
        if (!isUsersKey(user, keyData)) punish()
    }

    /**
     * Проверить что ключ принадлежит пользователю
     * @param user пользователь
     * @param keyUuid uuid ключа
     */
    static void assertKeysOwner(ISDtObject user, String keyUuid) {
        Map<String, Object> keyData = apiHolder.api.auth.getAccessKeyInfo(keyUuid)
        assertKeysOwner(user, keyData)
    }

    /**
     * Проверка, что пользователю принадлежит ключ
     * @param user пользователь
     * @param uuid uuid ключа
     * @return да или нет
     */
    static Boolean isUsersKey(ISDtObject user, String uuid) {
        Map<String, Object> keyData = apiHolder.api.auth.getAccessKeyInfo(uuid)
        return isUsersKey(user, keyData)
    }

    /**
     * Проверка, что пользователю принадлежит ключ
     * @param user пользователь
     * @param keyData данные ключа
     * @return да или нет
     */
    static Boolean isUsersKey(ISDtObject user, Map<String, Object> keyData) {
        if (isSuperuser(user)) return true
        String employeeUuid = keyData?.get('employeeUuid')
        return user.getUUID() == employeeUuid
    }

    /**
     * Проверить что пользователь является суперпользователем
     * @param user пользователь
     * @return да или нет
     */
    static Boolean isSuperuser(ISDtObject user) {
        return user == null
    }

    /**
     * Проверить что логин принадлежит пользователю
     * @param user пользователь
     * @param login логин
     */
    static void asserUsersLogin(ISDtObject user, String login) {
        if (!isUsersLogin(user, login)) punish()
    }

    /**
     * Проверить что логин принадлежит пользователю
     * @param user пользователь
     * @param login логин
     */
    static Boolean isUsersLogin(ISDtObject user, String login) {
        if (isSuperuser(user)) return true
        String currentUserLogin = user.login as String
        if (currentUserLogin != login) return false
        return true
    }
}

/**
 * GET
 * Метод для получения данных ключей пользователя
 * url параметры:
 * value - Строковое значение логина сотрудника или UUID ключа
 * pageNumber - номер страницы
 * pageSize - размер страницы
 */
@SuppressWarnings(['unused', 'GrMethodMayBeStatic'])
void getUserAccessKeysPage(HttpServletRequest request, HttpServletResponse response, ISDtObject user) {
    RequestProcessor.create(request, response, user, Utilities.getPrefs().copy().assertHttpMethod('GET')).process { WebApiUtilities webUtils ->
        PermissionsService.assertUserCanUseApplication(user)
        String value = webUtils.getParamElseThrow('value').toLowerCase()
        PermissionsService.asserUsersLogin(user, value)
        Utilities.getUserOrThrow(value)
        Integer currentPage = webUtils.getParam('pageNumber', Integer).orElse(1)
        Integer pageSize = webUtils.getParam('pageSize', Integer).orElse(20)
        Integer offset = (currentPage - 1) * pageSize
        Integer limit = pageSize
        webUtils.setBodyAsJson(
                new Dto.KeysList(
                        data: api.auth.getEmployeeAccessKeysInfoByLogin(value, offset, limit) as Collection<Map<String, Object>>,
                        pages: new Dto.KeysList.Pages(
                                count: Utilities.getUsersKeysCount(value),
                                current: currentPage,
                                pageSize: pageSize
                        )
                )
        )
    }
}

/**
 * GET
 * Метод для получения данных ключей
 * url параметры:
 * pageNumber - номер страницы
 * pageSize - размер страницы
 */
@SuppressWarnings(['unused', 'GrMethodMayBeStatic'])
void getAllAccessKeysPage(HttpServletRequest request, HttpServletResponse response, ISDtObject user) {
    RequestProcessor.create(request, response, user, Utilities.getPrefs().copy().assertHttpMethod('GET')).process { WebApiUtilities webUtils ->
        PermissionsService.assertUserIsSuperuser(user)
        Integer currentPage = webUtils.getParam('pageNumber', Integer).orElse(1)
        Integer pageSize = webUtils.getParam('pageSize', Integer).orElse(20)
        Integer offset = (currentPage - 1) * pageSize
        Integer limit = pageSize
        webUtils.setBodyAsJson(
                new Dto.KeysList(
                        data: api.auth.getAllAccessKeysInfo(offset, limit) as Collection<Map<String, Object>>,
                        pages: new Dto.KeysList.Pages(
                                count: Utilities.getAllKeysCount(),
                                current: currentPage,
                                pageSize: pageSize
                        ),
                )
        )
    }
}

@SuppressWarnings(['unused', 'GrMethodMayBeStatic'])
void getAccessKeyInfo(HttpServletRequest request, HttpServletResponse response, ISDtObject user) {
    RequestProcessor.create(request, response, user, Utilities.getPrefs().copy().assertHttpMethod('GET')).process { WebApiUtilities webUtils ->
        PermissionsService.assertUserCanUseApplication(user)
        String value = webUtils.getParamElseThrow('uuid').toLowerCase()
        Map<String, Object> keyData = api.auth.getAccessKeyInfo(value)
        if (PermissionsService.isUsersKey(user, keyData)) webUtils.setBodyAsJson(keyData)
    }
}

/**
 * GET
 * Метод для создания нового ключа с помошью логина
 * url параметры:
 * login - Строковое значение логина сотрудника
 * days - Целое число время жизни ключа в днях. 1 по умолчанию
 * description - описание ключа. не обязательный
 * disposable - одноразовый. не обязательный
 * deadline - конкретный дедлайн ключа. паттерн указан в константах
 */
@SuppressWarnings(['unused', 'GrMethodMayBeStatic'])
void addAccessKey(HttpServletRequest request, HttpServletResponse response, ISDtObject user) {
    RequestProcessor.create(request, response, user, Utilities.getPrefs().copy().assertHttpMethod('GET')).process { WebApiUtilities webUtils ->
        PermissionsService.assertUserCanUseApplication(user)
        String login = webUtils.getParamElseThrow('login')
        PermissionsService.asserUsersLogin(user, login)
        Integer days = webUtils.getParam('days', Integer).orElse(1)
        String description = webUtils.getParam('description').orElse(null)
        Boolean disposable = webUtils.getParam('disposable', Boolean).orElse(false)
        Date deadline = webUtils.getParam('deadline', Date).orElse(null)
        IAccessKeyWrapper createdKey = api.auth.getAccessKey(login).setDeadlineDays(days.toInteger())
        if (description) createdKey.setDescription(description)
        if (disposable) createdKey.setDisposable()
        if (deadline) createdKey.setDeadline(deadline)
        webUtils.setBodyAsJson(createdKey)
    }
}

/**
 * GET
 * Метод для деактивации ключа с помощью его UUID
 * url параметры:
 * uuid - UUID самого ключа
 */
@SuppressWarnings(['unused', 'GrMethodMayBeStatic'])
void disableAccessKey(HttpServletRequest request, HttpServletResponse response, ISDtObject user) {
    RequestProcessor.create(request, response, user, Utilities.getPrefs().copy().assertHttpMethod('GET')).process { WebApiUtilities webUtils ->
        PermissionsService.assertUserCanUseApplication(user)
        String uuid = webUtils.getParamElseThrow('uuid')
        Map<String, Object> keyData = api.auth.getAccessKeyInfo(uuid)
        PermissionsService.assertKeysOwner(user, keyData)
        if (!PermissionsService.isUsersKey(user, keyData)) api.auth.deactivateAccessKey(uuid)
        else {
            //Без логаута
            def dao = api.auth.accessKeyDao
            dao.update(dao.get(uuid).setActive(false))
        }
    }
}

/**
 * GET
 * Метод для деактивации всех ключей пользователя
 * url параметры:
 * username - username пользователя
 */
@SuppressWarnings(['unused', 'GrMethodMayBeStatic'])
void deleteUserAccessKeys(HttpServletRequest request, HttpServletResponse response, ISDtObject user) {
    RequestProcessor.create(request, response, user, Utilities.getPrefs().copy().assertHttpMethod('GET')).process { WebApiUtilities webUtils ->
        PermissionsService.assertUserCanUseApplication(user)
        String username = webUtils.getParamElseThrow('username')
        PermissionsService.asserUsersLogin(user, username)
        if (!PermissionsService.isUsersLogin(user, username)) api.auth.removeAccessKeys(username)
        else {
            //Без логаута
            def dao = api.auth.accessKeyDao
            api.auth.getEmployeeAccessKeysInfoByLogin(username).each {
                dao.delete(it.uuid)
            }
        }

    }
}

/**
 * GET
 * Метод для активации ключа с помощью его UUID
 * url параметры:
 * uuid - UUID самого ключа
 */
@SuppressWarnings(['unused', 'GrMethodMayBeStatic'])
void activateAccessKey(HttpServletRequest request, HttpServletResponse response, ISDtObject user) {
    RequestProcessor.create(request, response, user, Utilities.getPrefs().copy().assertHttpMethod('GET')).process { WebApiUtilities webUtils ->
        PermissionsService.assertUserCanUseApplication(user)
        String uuid = webUtils.getParamElseThrow('uuid')
        PermissionsService.assertKeysOwner(user, uuid)
        api.auth.activateAccessKey(uuid)
    }
}

/**
 * GET
 * Метод для удаления ключа с помощью его UUID
 * url параметры:
 * uuid - UUID самого ключа
 */
@SuppressWarnings(['unused', 'GrMethodMayBeStatic'])
void deleteAccessKey(HttpServletRequest request, HttpServletResponse response, ISDtObject user) {
    RequestProcessor.create(request, response, user, Utilities.getPrefs().copy().assertHttpMethod('GET')).process { WebApiUtilities webUtils ->
        PermissionsService.assertUserCanUseApplication(user)
        String uuid = webUtils.getParamElseThrow('uuid')
        Map<String, Object> keyData = api.auth.getAccessKeyInfo(uuid)
        PermissionsService.assertKeysOwner(user, keyData)
        if (!PermissionsService.isUsersLogin(user, keyData.username as String)) {
            api.auth.logoutUser(keyData.username as String)
        }
        api.auth.accessKeyDao.delete(uuid)
    }
}

/**
 * GET
 * Метод для получения кода темы из юзера
 * @param login - Логин пользователя
 */
@SuppressWarnings(['unused', 'GrMethodMayBeStatic'])
void getThemeByUser(HttpServletRequest request, HttpServletResponse response, ISDtObject user) {
    RequestProcessor.create(request, response, user, Utilities.getPrefs().copy().assertHttpMethod('GET')).process { WebApiUtilities webUtils ->
        PermissionsService.assertUserCanUseApplication(user)
        String login = webUtils.getParamElseThrow('login')
        PermissionsService.asserUsersLogin(user, login)
        Object user1 = utils.findFirst('employee', ['login': login])
        Object superUser = utils.findFirst("superUser", ["login": login])
        if (superUser) {
            Object personalSettings = api.employee.getPersonalSettings('superUser$' + login)
            webUtils.setBodyAsString(personalSettings.getThemeOperator())
        } else if (user1) {
            Object personalSettings = api.employee.getPersonalSettings(user1.getUUID())
            webUtils.setBodyAsString(personalSettings.getThemeOperator())
        } else webUtils.setBodyAsString('default')
    }
}

/**
 * GET
 * Получить данные для инициализации
 */
@SuppressWarnings(['unused', 'GrMethodMayBeStatic'])
void getInitData(HttpServletRequest request, HttpServletResponse response, ISDtObject user) {
    RequestProcessor.create(request, response, user, Utilities.getPrefs().copy().assertHttpMethod('GET')).process { WebApiUtilities webUtils ->
        webUtils.setBodyAsJson(
                new Dto.InitialData(
                        superUser: PermissionsService.isSuperuser(user),
                        canUse: PermissionsService.canUserUseApplication(user)
                )
        )
    }
}

/*
//TODO на будущее
@SuppressWarnings(['unused', 'GrMethodMayBeStatic'])
void updateKey(HttpServletRequest request, HttpServletResponse response, ISDtObject user) {
    RequestProcessor.create(request, response, user, Utilities.getPrefs().copy().assertHttpMethod('GET')).process { WebApiUtilities webUtils ->
        PermissionsService.assertUserCanUseApplication(user)
        String uuid = webUtils.getParamElseThrow('uuid')
        def dao = api.auth.accessKeyDao
        def key = dao.get(uuid)
        String username = key.username
        PermissionsService.asserUsersLogin(user, username)
        String description = webUtils.getParam('description').orElse(null)
        String deadline = webUtils.getParamElseThrow('deadline', Date)
        key.setDescription(description)
        key.setDeadline(deadline)
        dao.update(key)
    }
}
 */
