/* 
 * Автор: Erilov.NA
 * Дата создания: 12.07.2024
 * Версия: 4.1.1
 */

import groovy.json.JsonBuilder

/*
 * Метод для получения данных ключей по логину или UUID самого ключа
 * @param value - Строковое значение логина сотрудника или UUID ключа
 * @param pageNumber - Строковое значение номера страницы (По умолчанию = 1)
 */
String find(
    String value,
    String pageNumber = '1'
) {  
    // Приводим все к нижнему регистру
    value = value.toLowerCase()
    // Парсим текущую страницу
  	Integer currentPage = pageNumber.toInteger()
    // Создаем переменную для хранения результата
    Map result = [
        "pages" : [
            'count' :  1,
            'current' : currentPage
        ],
        "data" : []
    ]
  	// Ищем инфу по ключу
  	Map keyData = api.auth.getAccessKeyInfo(value)
  
  	if ( keyData ) {
      	result.data = [keyData]
    } else {
      	List findedData = []
      
        // Ищем похожие логины
        List<String> logins = utils.find('employee', [
            'login' : op.like("%${value}%")
        ]).login

        // Пытаемся получить информацию по ключам по точному совпадению логина
        try { 
            List<String> keysCurrentUsers = api.auth.findAccessKeysByEmployeeLogin(value) 
            keysCurrentUsers.each{ findedData << api.auth.getAccessKeyInfo( it ) }
        } catch (e) {}

        // Получаем информацию по ключам по каждому логину 
        for (String login in logins) {
            try {
                List findedAccessKeys = api.auth.findAccessKeysByEmployeeLogin(login) 
                for ( String findedAccessKey in findedAccessKeys ) {
                    if ( findedAccessKey && !(findedAccessKey in findedData?.uuid ) ) {
                        findedData << api.auth.getAccessKeyInfo( findedAccessKey )
                    }
                }
            } catch (e) {}
        }
      
      	findedData = findedData.sort{ it.uuid }
      	result.pages.count = Math.ceil(findedData.size()/ 20).toInteger()

        Integer start = 0
        Integer end = 20

        if ( currentPage != 1 ) {
            end = 20 * currentPage
            start = end - 20
            if (end > findedData.size()) {
                end = findedData.size()
            }
        }
      
      	for (Integer index = start; index < end; index++) {
            if (findedData[index]) {
          	    result.data << findedData[index]
            }
        }
    }
    return new JsonBuilder(result).toPrettyString()
}

/*
 * Метод для создания нового ключа с помошью логина
 * @param login - Строковое значение логина сотрудника
 * @param days - Целое число время жизни ключа в днях
 */
String addAccessKey(
    String login, 
    String days
) {
    Object createdKey = api.auth.getAccessKey(login).setDeadlineDays(days.toInteger())
  	return createdKey.getUuid()
}

/*
 * Метод для деактивации ключа с помощью его UUID
 * @param uuid - UUID самого ключа
 */
void removeAccessKey(
    String uuid
) {
 	api.auth.deactivateAccessKey(uuid)
}

/*
 * Метод для активации ключа с помощью его UUID
 * @param uuid - UUID самого ключа
 */
void activateAccessKey(
    String uuid
) {
	api.auth.activateAccessKey(uuid)
}

/*
 * Метод для получения кода темы из юзера
 * @param login - Логин пользователя
 */
String getThemeByUser( String login ) {
  	Object user = utils.findFirst('employee', ['login' : login])
  	Object superUser = utils.findFirst("superUser", ["login" : login])
  
  	if ( user ) {
        Object personalSettings = api.employee.getPersonalSettings(user?.UUID)
        return personalSettings.getThemeOperator()
    }
  	if ( superUser ) {
      	Object personalSettings = api.employee.getPersonalSettings('superUser$' + login)
        return personalSettings.getThemeOperator()
    }
  
  	return 'default'
}