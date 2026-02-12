import { Ref, ref } from "vue"

export class ModalController {
    title: Ref<string>
    visiable: Ref<boolean>

    constructor(
        title: string
    ) {
        this.title = ref(title)
        this.visiable = ref(false)
    }

    show() {
        this.visiable.value = true
        return this
    }
    hidden() {
        this.visiable.value = false
        return this
    }
}

export class AttrGroupController {
    public title: Ref<string>
    public show: Ref<boolean>
    public activeKey: Ref<number | null>
    public items: Ref<Array<[string, string]>>

    constructor(
        title: string,
        items: Array<[string, string]> = []
    ) {
        this.title = ref(title)
        this.items = ref(items)
        this.show = ref(false)
        this.activeKey = ref(null)
    }

    open() {
        this.show.value = true
        this.activeKey.value = 1
        return this
    }
    close() {
        this.show.value = false
        this.activeKey.value = null
        return this
    }
}

export class AlertFiledObject {
    visiable: Ref<boolean>
    closable: Ref<boolean>
    showIcon: Ref<boolean>
    type: Ref<'success' | 'info' | 'warning' | 'error'>
    message: Ref<string | null>

    constructor(
        closable: boolean = true,
        type: 'success' | 'info' | 'warning' | 'error' = 'info',
        showIcon: boolean = true,
        message: string | null = null
    ) {
        this.visiable = ref(false)
        this.closable = ref(closable)
        this.showIcon = ref(showIcon)
        this.type = ref(type)
        this.message = ref(message)
    }

    show() { 
        this.visiable.value = true 
        return this
    }
    hidden() {
        this.visiable.value = false
        this.clear()
        return this
    }
    setMessage(message: string) {
        this.message.value = message
        this.show()
        return this
    }
    clear() { 
        this.message.value = null
        return this
    }
    setType(type: 'success' | 'info' | 'warning' | 'error') { 
        this.type.value = type
        return this
    }
}