interface IUser {
    superUser: boolean
    canUse: boolean
    admin: boolean
    concurrentLicensed: boolean
    licensed: boolean
    login: string
    operatorLogo: string
    profiles: string[]
    roles: string[]
    title: string
    uuid: string
}

interface IPagination {
    position: string[] //'topLeft' | 'topCenter' | 'topRight' | 'bottomLeft' | 'bottomCenter' | 'bottomRight'
    size: 'small' | 'default'
    pageSizeOptions: number[] //20 | 50 | 100
    hideOnSinglePage: boolean,
    showTotal: Function,
    defaultCurrent: number,
    showQuickJumper: boolean,
    current: number,
    pageSize: number,
    total : number
}

interface IInitialData {
    canUse: boolean
    superUser: boolean
}

interface IPages {
    count: number
    current: number
}

interface IKeyInfo {
    lastUsageDate: string
    employeeUuid: string
    uuid: string
    type: string
    deadline: string
    creationDate: string
    description: string
    active: boolean
    username : string
}

interface IKeysList {
    pages: IPages
    data: IKeyInfo[]
}

enum SearchMode {
    UUID,
    Login
}

interface ICreateKeyForm {
  login: string | null,
  deadline: string | null,
  deadlineMode: "days" | "deadline",
  keyDays: number | null,
  description: string | null,
  onetime: boolean
}

interface IEditKeyForm {
  deadline: string,
  description: string,
}


export type {IUser, IInitialData, IPages, IKeysList, IKeyInfo, IPagination, ICreateKeyForm, IEditKeyForm}
export {SearchMode}