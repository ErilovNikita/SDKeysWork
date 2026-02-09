import KeyInfo from "./KeyInfo.ts";

export default interface KeysList {
    pages: Pages
    data: KeyInfo[]
}

interface Pages {
    count: number
    current: number
}
