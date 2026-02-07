export default interface Pagination {
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
