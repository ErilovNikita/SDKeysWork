let manifest = {
    name : "ServiceDesk KeysWork",
    version : "2.1.2"
}

window.parent.injectJsApi(window.parent, window);
let deg

document.addEventListener("DOMContentLoaded", () => {
    document.getElementsByClassName('app-name')[0].innerHTML = manifest.name
    document.getElementsByClassName('app-version')[0].innerHTML = "v" + manifest.version
});

function getDataTime(datacode) {

    let today = new Date()
    let todayDay = String(today.getDate())
    let todayMonth = String(today.getMonth() + 1).padStart(2, '0')
    let todayYear = today.getFullYear()

    let inData = new Date( Date.parse(datacode) )
    let inDataDay = String(inData.getDate()).padStart(2, '0')
    let inDataMonth = String(inData.getMonth() + 1).padStart(2, '0')
    let inDataYear = inData.getFullYear()
    let inDataHours = String(inData.getHours()).padStart(2, '0')
    let inDataMinutes = String(inData.getMinutes()).padStart(2, '0')
    let inDataStr = `${inDataDay}.${inDataMonth}.${inDataYear} ${inDataHours}:${inDataMinutes}`

    if (inDataYear === todayYear && inDataMonth === todayMonth) {
        if (inDataDay === todayDay) {
            return `Сегодня в ${inDataHours}:${inDataMinutes}`
        }
        if (parseInt(inDataDay) === ( parseInt(todayDay) - 1) ) {
            return `Вчера в ${inDataHours}:${inDataMinutes}`
        }
        if (parseInt(inDataDay) === ( parseInt(todayDay) + 1) ) {
            return `Завтра в ${inDataHours}:${inDataMinutes}`
        }
    }

    return inDataStr

}
function notResult() {
    console.log('Результата нету');
    if ( $('.start').attr('Class').indexOf('d-none') == -1 ) {
        $('.start').addClass('d-none')
    }

    if ( $('.users').attr('Class').indexOf('d-none') == -1 ) {
        $('.users').addClass('d-none')
    }

    if ( $('.security').attr('Class').indexOf('d-none') == -1 ) {
        $('.security').addClass('d-none')
    }

    if ( $('.empty').attr('Class').indexOf('d-none') != -1 ) {
        $('.empty').removeClass('d-none')
    }
    $('.tableBody').empty()

}
function Result(data) {
    $('.tableBody').empty()
    $('.tableBody').append(data)

    if ( $('.start').attr('Class').indexOf('d-none') == -1 ) {
        $('.start').addClass('d-none')
    }

    if ( $('.empty').attr('Class').indexOf('d-none') == -1 ) {
        $('.empty').addClass('d-none')
    }

    if ( $('.security').attr('Class').indexOf('d-none') == -1 ) {
        $('.security').addClass('d-none')
    }

    if ( $('.users').attr('Class').indexOf('d-none') != -1 ) {
        $('.users').removeClass('d-none')
    }

    $( ".removeKey" ).click(function() {
        if (jsApi.getCurrentUser().admin) {
            let UUID = this.parentNode.parentNode.getElementsByTagName('td')[0].innerText
            jsApi.restCall("exec/?func=modules.keysWork.removeAccessKey&params='" + UUID + "'").then((value) => {
                if ( $('.mailValue')[0].value != '') {
                    $('.btnSearchMail').trigger('click');
                } 
                if ($('.keyValue')[0].value != '') {
                    $('.btnSearchKey').trigger('click');
                }
            })
        } else {
            security()
        }
    });

    $( ".activeKey" ).click(function() {
        if (jsApi.getCurrentUser().admin) {
            let UUID = this.parentNode.parentNode.getElementsByTagName('td')[0].innerText
            jsApi.restCall("exec/?func=modules.keysWork.activateAccessKey&params='" + UUID + "'").then((value) => {
                if ( $('.mailValue')[0].value != '') {
                    $('.btnSearchMail').trigger('click');
                } 
                if ($('.keyValue')[0].value != '') {
                    $('.btnSearchKey').trigger('click');
                }
            })
        } else {
            security()
        }
    });

    $( ".page-link" ).click(function() {
        console.log('Выбрали страницу №' + this.text)
        getDataKey(this.text - 1)
    });

}
function security() {
    console.log('Не достаточно прав');
    $('.mailValue').prop("disabled",true);
    $('.btnSearchMail').prop("disabled",true);

    $('.tableBody').empty()

    if ( $('.start').attr('Class').indexOf('d-none') == -1 ) {
        $('.start').addClass('d-none')
    }

    if ( $('.empty').attr('Class').indexOf('d-none') == -1 ) {
        $('.empty').addClass('d-none')
    }

    if ( $('.users').attr('Class').indexOf('d-none') == -1 ) {
        $('.users').addClass('d-none')
    }

    if ( $('.security').attr('Class').indexOf('d-none') != -1 ) {
        $('.security').removeClass('d-none')
    }

}
function sendMailName(firstname, initials, domain, reg, page = 0) {
    console.log('Получение данных')

    jsApi.restCall("exec/?func=modules.keysWork.login2data&params='" + firstname + "','" + initials + "','" + domain + "','" + reg + "'").then((value) => {
        console.log('Получили: ' + value)
        if ( value == '[]' || value == [] ) {
            notResult()
        } else {
            let arrKeys = JSON.parse(value)
            if ( arrKeys.length == 0 ) {
                notResult()
            } else {
                let include = []

                let pageCount = Math.ceil(arrKeys.length/100)
                $('#pagination ul').empty()
                for (index = 0; index < pageCount; index++) {
                    pageButton = '<li class="page-item"><a class="page-link" href="#">' + ( index + 1 ) + '</a></li>'
                    $('#pagination ul').append(pageButton)
                }
                $('#pagination ul li.page-item')[page].classList.add('active')


                if (arrKeys.length > 100) {                   
                    arrKeys = arrKeys.slice(page * 100, (page * 100) + 100 )
                }

                for (index = 0; index < arrKeys.length; index++) {


                    let active = '<span class="activeKey"><svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" version="1.1">  <path transform="rotate(180 12 12)" stroke="null" fill="#ff4040" id="svg_1" d="m17,7l-10,0a5,5 0 0 0 -5,5a5,5 0 0 0 5,5l10,0a5,5 0 0 0 5,-5a5,5 0 0 0 -5,-5m0,8a3,3 0 0 1 -3,-3a3,3 0 0 1 3,-3a3,3 0 0 1 3,3a3,3 0 0 1 -3,3z"/></svg></span>'
                    if (arrKeys[index].active == true || arrKeys[index].active == 'true') {
                        active = '<span class="removeKey"><svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" version="1.1"><path fill="#5fbf00" id="svg_1" d="m17,7l-10,0a5,5 0 0 0 -5,5a5,5 0 0 0 5,5l10,0a5,5 0 0 0 5,-5a5,5 0 0 0 -5,-5m0,8a3,3 0 0 1 -3,-3a3,3 0 0 1 3,-3a3,3 0 0 1 3,3a3,3 0 0 1 -3,3z"></path></svg></span>'
                    }

                    let typeText = 'Одноразовый'
                    if ( arrKeys[index].type == 'REUSABLE' ) {
                        typeText = 'Многоразовый'
                    }

                    let item = `<tr>
                                    <td>${arrKeys[index].uuid}</td>
                                    <td>${getDataTime(arrKeys[index].creationDate)}</td>
                                    <td>${getDataTime(arrKeys[index].deadline)}</td>
                                    <td>${typeText}</td>
                                    <td style="text-align: center">${active}</td>
                                    <td scope="row">
                                        <a href="https://help.aptekivita.ru/sd/operator/#uuid:${arrKeys[index].link}">
                                            <i class="fa fa-arrow-up-right-from-square"></i> ${arrKeys[index].username}
                                        </a>
                                    </td>
                                </tr>`
                    include.push(item)
                }
                Result(include)
            }
        }
    })
}
async function key2info(keyValue) {
    return jsApi.restCall("exec/?func=modules.keysWork.key2info&params='" + keyValue + "'").then((value) => {
        console.log('Получили: ' + value)
        return JSON.parse(value)
    })
}
function addAccessKey(firstname, initials, domain, reg, days) {
    jsApi.restCall("exec/?func=modules.keysWork.addAccessKey&params='" + firstname + "','" + initials + "','" + domain + "','" + reg + "','" + days + "'").then((value) => {
        console.log('Получили: ' + value)
        $('.btnSearchMail').trigger('click');
    })
}
function getDataKey(activePage = 0) {
    if (jsApi.getCurrentUser().admin) {

        let firstname = 'null'
        let initials = 'null'
        let domain = 'null'
        let reg = 'null'

        let search = $('.mailValue').val()
        
        if (search.indexOf('.') != -1 && search.indexOf('@') != -1) {
            console.log('Валидная почта')
            firstname = search.split('.')[0]
            initials = search.split('.')[1].split('@')[0]
            domain = search.split('.')[1].split('@')[1]
            reg = search.split('.')[2]

            sendMailName(firstname, initials, domain, reg, activePage)
        } else {
            if (search.indexOf('.') != -1 || search.indexOf(',') != -1 || search.indexOf('@') != -1 || search.indexOf("'") != -1 || search.indexOf('"') != -1 || search.indexOf('(') != -1 || search.indexOf(')') != -1 || 
                search.indexOf('*') != -1 || search.indexOf('$') != -1 || search.indexOf('!') != -1 || search.indexOf("?") != -1 || search.indexOf('>') != -1 || search.indexOf('<') != -1 || search.indexOf('^') != -1 ) {
                    console.log('Мясо')
                    notResult()
            } else {
                console.log('Валидный логин')
                firstname = search
                initials = 'null'
                domain = 'null'
                reg = 'null'

                sendMailName(firstname, initials, domain, reg, activePage)
            }
        }
    } else {
        security()
    }
}

// Методы для обработки нажатия Enter в полях
$("#mailValue").keyup(function(event) {
    if (event.keyCode === 13) {
        $(".btnSearchMail").click();
    }
});
$("#keyValue").keyup(function(event) {
    if (event.keyCode === 13) {
        $(".btnSearchKey").click();
    }
});

// Методы кнопок поиска
$( ".btnSearchMail" ).click(function() {
    $('.keyValue')[0].value = ''
    getDataKey()
});
$( ".btnSearchKey" ).click( async function() {

    $('.mailValue')[0].value = ''

    if (jsApi.getCurrentUser().admin) {
        let keyValue = $('.keyValue').val()
        console.log('Отправляю ключ')

        let keyData = await key2info(keyValue)

        if ( keyData ) {

            let stateButton = null
            if (keyData.active == true || keyData.active == 'true') {
                stateButton = '<span class="removeKey"><svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" version="1.1"><path fill="#5fbf00" id="svg_1" d="m17,7l-10,0a5,5 0 0 0 -5,5a5,5 0 0 0 5,5l10,0a5,5 0 0 0 5,-5a5,5 0 0 0 -5,-5m0,8a3,3 0 0 1 -3,-3a3,3 0 0 1 3,-3a3,3 0 0 1 3,3a3,3 0 0 1 -3,3z"></path></svg></span>'
            } else {
                stateButton = '<span class="activeKey"><svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" version="1.1">  <path transform="rotate(180 12 12)" stroke="null" fill="#ff4040" id="svg_1" d="m17,7l-10,0a5,5 0 0 0 -5,5a5,5 0 0 0 5,5l10,0a5,5 0 0 0 5,-5a5,5 0 0 0 -5,-5m0,8a3,3 0 0 1 -3,-3a3,3 0 0 1 3,-3a3,3 0 0 1 3,3a3,3 0 0 1 -3,3z"/></svg></span>'
            }

            Result( `<tr>
                        <td>${keyData.uuid}</td>
                        <td>${getDataTime(keyData.creationDate)}</td>
                        <td>${getDataTime(keyData.deadline)}</td>
                        <td>${keyData.type}</td>
                        <td>${stateButton}</td>
                        <th scope="row">
                            <a href="https://help.aptekivita.ru/sd/operator/#uuid:${keyData.link}" target="_blank">${keyData.username}</a>
                        </th>
                    </tr>` )
        }

    } else {
        security()
    }
});

// Методы по созданию нового ключа
$( ".btnKeyDays" ).click(function() {
    if (jsApi.getCurrentUser().admin) {

        let firstname = 'null'
        let initials = 'null'
        let domain = 'null'
        let reg = 'null'
        let days = $('.keyDays')[0].value
        let login = $('.mailValue').val()
        
        if (days == '') {
            days = $('.keyDays')[1].value
        }

        if (login.indexOf('.') != -1 && login.indexOf('@') != -1) {
            console.log('Валидная почта')
            firstname = login.split('.')[0]
            initials = login.split('.')[1].split('@')[0]
            domain = login.split('.')[1].split('@')[1]
            reg = login.split('.')[2]

            addAccessKey(firstname, initials, domain, reg, days)
        } else {
            if (login.indexOf('.') != -1 || login.indexOf(',') != -1 || login.indexOf('@') != -1 || login.indexOf("'") != -1 || login.indexOf('"') != -1 || login.indexOf('(') != -1 || login.indexOf(')') != -1 || 
                login.indexOf('*') != -1 || login.indexOf('$') != -1 || login.indexOf('!') != -1 || login.indexOf("?") != -1 || login.indexOf('>') != -1 || login.indexOf('<') != -1 || login.indexOf('^') != -1 ) {
                    console.log('Мясо')
                    notResult()
            } else {
                console.log('Валидный логин')
                firstname = login
                initials = 'null'
                domain = 'null'
                reg = 'null'

                addAccessKey(firstname, initials, domain, reg, parseInt(days) )
                $('.keyDays')[1].value = ''
                $('.keyDays')[0].value = ''
            }
        }
    } else {
        security()
    }
});

