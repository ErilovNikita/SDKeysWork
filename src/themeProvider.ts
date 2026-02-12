import { ref } from 'vue'

const themeConfig: Record<string, any> = ref({
    components: {
        Button: {
            colorPrimary: '#ec8e2b',
            colorPrimaryHover: '#d37513',
            colorPrimaryActive: '#a45b0f',
            defaultShadow: 'none',
        },
        Checkbox: {
            lineHeight: 1,
            colorPrimary: 'rgb(0, 99, 176)',
            colorPrimaryHover: 'rgb(0, 99, 176)',
        },
        Table: {
            cellPaddingInlineSM: 12,
            rowSelectedBg: '#F1FBF2',
            rowSelectedHoverBg: '#DDF8C6',
        },
        Form: {
            itemMarginBottom: 0,
        },
    },
    token: {
        borderRadius: 2,
        colorPrimaryHover: 'rgb(0, 99, 176)',
        colorText: '#323232',
        fontFamily: 'Roboto, sans-serif',
        fontSize: 13,
        defaultShadow: 'none',
    }
})

export default themeConfig