/* 
 * Автор: Erilov.NA
 * Дата создания: 07.06.2021
 * Версия: 3.1.0
 */

import groovy.json.JsonBuilder

/*
 * Метод для получения и формирования данных о ключах
 * @param employee - Обькет системы класса Сотрудник
 */
def data(employee) {
  
    def json = []
  	def keyListSize = api.auth.findAccessKeysByEmployeeLogin( employee.login ).size()
  	def keyList = api.auth.getEmployeeAccessKeysInfoByLogin( employee.login, 0, keyListSize)

    if (keyList.size() > 0) {
      keyList.each {
        key = [
          "active" : it["active"],
          "creationDate" : it["creationDate"],
          "deadline" : it["deadline"],
          "type" : it["type"],
          "uuid" : it["uuid"],
          "username" : it["username"],
          "link" : employee.UUID,
		]
        json.add( key )
      }
    }

  	return new JsonBuilder(json).toPrettyString()
}

/*
 * Метод для поиска данных о ключах с помошью логина
 * @param firstname - Первая часть логина, до точки (Фамилия)
 * @param initials - Вторая часть логина, после точки (Инициалы)
 * @param domain - Домен почты
 * @param reg - Зона домена
 */
def login2data(
    String firstname, 
    String initials, 
    String domain, 
    String reg
) {
  	if (firstname && initials && domain && reg && firstname != 'null' && initials != 'null' && domain != 'null' && reg != 'null') {
        def employee = utils.find('employee', ['login' : firstname + '.' + initials + '@' + domain + '.' + reg], sp.ignoreCase())[0]
        return data(employee)
    } else {
        if (firstname && firstname != 'null' & firstname != '' & initials == 'null' & domain == 'null' && reg == 'null') {
            def bot = utils.find('employee', ['login' : firstname ], sp.ignoreCase())
            if (bot.size() == 1) {
                return data(bot[0])
            } else {
                return '[]'
            }
        } else {
            return '[]'
        }
    }
}

/*
 * Метод для поиска данных о ключе с помошью его UUID
 * @param UUID - UUID самого ключа
 */
def key2info(String UUID) {
  	def keyInfo = api.auth.getAccessKeyInfo( UUID )
  	def result = []

  	if (keyInfo) {
        result = [
          "active" : keyInfo["active"],
          "creationDate" : keyInfo["creationDate"],
          "deadline" : keyInfo["deadline"],
          "type" : keyInfo["type"],
          "uuid" : keyInfo["uuid"],
          "username" : keyInfo["username"],
          "link" : keyInfo["employeeUuid"]
        ]
    }

    return new JsonBuilder(result).toPrettyString()
}

/*
 * Метод для создания нового ключа с помошью логина
 * @param firstname - Первая часть логина, до точки (Фамилия)
 * @param initials - Вторая часть логина, после точки (Инициалы)
 * @param domain - Домен почты
 * @param reg - Зона домена
 * @param days - Время жизни ключа в днях
 */
def addAccessKey(String firstname, String initials, String domain, String reg, String days) {
  	if (firstname && initials && domain && reg &&firstname != 'null' && initials != 'null' && domain != 'null' && reg != 'null') {
        employee = utils.find('employee', ['login' : firstname + '.' + initials + '@' + domain + '.' + reg], sp.ignoreCase())[0]
        api.auth.getAccessKey(employee.login).setDeadlineDays(days.toInteger())
    } else {
        if (firstname && firstname != 'null' & firstname != '' & initials == 'null' & domain == 'null' && reg == 'null') {
            bot = utils.find('employee', ['login' : firstname ], sp.ignoreCase())
            if (bot.size() == 1) {
                api.auth.getAccessKey(bot.login).setDeadlineDays(days.toInteger())
            } else {
                return '[]'
            }
        } else {
            return '[]'
        }
    }
}

/*
 * Метод для деактивации ключа с помощью его UUID
 * @param UUID - UUID самого ключа
 */
def removeAccessKey(String UUID) {
 	api.auth.deactivateAccessKey(UUID)
}

/*
 * Метод для активации ключа с помощью его UUID
 * @param UUID - UUID самого ключа
 */
def activateAccessKey(String UUID) {
	api.auth.activateAccessKey(UUID)
}

/*
 * Метод для удаления ключа с помощью его UUID
 * @param UUID - UUID самого ключа
 */
def removeAllKeys(String UUID) {
	api.auth.removeAccessKeys(UUID)
}