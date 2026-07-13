/**
 * icons/semanticMappings/jio.ts
 *
 * Semantic icon mapping for the jio icon set. One file per icon library so
 * bundlers can tree-shake unused libraries from the registry import graph
 * and a future lazy-loading switch becomes trivial: any consumer that needs
 * only one set can import directly from this file instead of the barrel.
 */

import type { SemanticIconMapping } from '@oneui/shared';

export const jio: SemanticIconMapping = {
    // Actions
    add: 'IcAdd',
    remove: 'IcMinus',
    close: 'IcClose',
    edit: 'IcEdit',
    delete: 'IcTrashClear',
    copy: 'IcCopyDocument',
    save: 'IcSave',
    refresh: 'IcRefresh',
    download: 'IcDownload',
    upload: 'IcUpload',
    share: 'IcShare',
    link: 'IcLink',
    unlink: 'IcUnlink',
    // Navigation
    menu: 'IcBurgerMenu',
    search: 'IcSearch',
    home: 'IcHome',
    settings: 'IcSettings',
    arrowLeft: 'IcArrowBack',
    arrowRight: 'IcArrowNext',
    arrowUp: 'IcArrowUp',
    arrowDown: 'IcArrowDown',
    chevronLeft: 'IcChevronLeft',
    chevronRight: 'IcChevronRight',
    chevronUp: 'IcChevronUp',
    chevronDown: 'IcChevronDown',
    externalLink: 'IcOpenInNewTab',
    firstPage: 'IcFirstpage',
    lastPage: 'IcLastpage',
    back: 'IcBack',
    next: 'IcNext',
    // Status
    check: 'IcConfirm',
    checkCircle: 'IcSuccess',
    warning: 'IcWarning',
    error: 'IcError',
    info: 'IcInfo',
    help: 'IcHelp',
    loading: 'IcStatusLoading',
    // Media
    play: 'IcPlay',
    pause: 'IcPause',
    stop: 'IcStop',
    volumeOn: 'IcSound',
    volumeOff: 'IcSoundDisabled',
    microphone: 'IcMic',
    image: 'IcImage',
    video: 'IcVideo',
    // User
    user: 'IcProfile',
    users: 'IcGroup',
    userAdd: 'IcContactAdd',
    userRemove: 'IcAccountClose',
    logout: 'IcLogout',
    // UI
    eye: 'IcVisible',
    eyeOff: 'IcVisibleOff',
    lock: 'IcLock',
    unlock: 'IcLockUnlock',
    star: 'IcStar',
    starFilled: 'IcStar',
    heart: 'IcCare',
    heartFilled: 'IcCare',
    bookmark: 'IcBookmark',
    bookmarkFilled: 'IcBookmark',
    filter: 'IcFilter',
    sort: 'IcSort',
    grid: 'IcViewTile',
    list: 'IcList',
    moreHorizontal: 'IcMoreHorizontal',
    // Communication
    mail: 'IcMail',
    phone: 'IcCall',
    chat: 'IcChat',
    notification: 'IcNotification',
    // Files
    file: 'IcDocument',
    folder: 'IcFolder',
    document: 'IcDocumentPdf',
    // Misc
    calendar: 'IcCalendar',
    clock: 'IcTime',
    location: 'IcLocationPoint',
    sun: 'IcSunnyClear',
    moon: 'IcNightClear',
    palette: 'IcColourPalette',
    // Design System navigation
    layers: 'IcMapLayers',
    components: 'IcWidgets',
    canvas: 'IcFrame',
    create: 'IcMagic',
    sparkles: 'IcAiSparkle',
    // Platforms / device surfaces
    globe: 'IcGlobe',
    smartphone: 'IcMobile',
    tablet: 'IcTablet',
    monitor: 'IcLaptop',
    tv: 'IcTv',
    printer: 'IcPrint',
    billboard: 'IcMegaphone',
    bus: 'IcBusFront',
};
