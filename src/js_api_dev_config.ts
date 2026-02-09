import type DevConfig from "nsd_js_api_proxy/dist/model/DevConfig";

const devConfig : DevConfig = {
    changeResponsibleResult: undefined,
    scheme: "https",
    host: import.meta.env.VITE_HOST,
    accessKey: import.meta.env.VITE_ACCESS_KEY,
    subjectUuid: "employee$29868201",
    appCode: "someAppCode",
    isAddForm: false,
    isEditForm: true,
    isOnObjectCard: false,
    currentUserUuid: "employee$40024401",
    currentUserLogin: "eadmin",
    currentLocale: "ru",
    viewMode: "normal",
    currentContentParameters : {
        "test" : "test1",
        "number1" : 1
    },
    objectDialogSelectionResult : {
        "classFqnpresentAttributesGroupCode" : "1231231"
    },
    appInitialHeight : 123,
    formValues : {}
}

export default devConfig
