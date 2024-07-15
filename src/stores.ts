import { defineStore } from 'pinia'

export const useBaseStore = defineStore('responseData', {
    state: () => {
        return { 
          searchValue: '',
          data: {},
          view: 'start',
          dev: {
            url: '',
            token: '',
            enable: false
          }
        }
    },
    actions: {
        set(inputData:Object, inputSearchValue:string = '') {
          if ( inputSearchValue != '') {
            this.searchValue = inputSearchValue
          }
          this.data = inputData
        },
        setView(viewName:string = '') {
          this.view = viewName
        },
        devMode(enable:boolean, url:string, token:string) {
          this.dev.enable = enable
          this.dev.url = url
          this.dev.token = token
        }
      }
})