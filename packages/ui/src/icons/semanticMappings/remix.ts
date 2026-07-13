/**
 * icons/semanticMappings/remix.ts
 *
 * Semantic icon mapping for the remix icon set. One file per icon library so
 * bundlers can tree-shake unused libraries from the registry import graph
 * and a future lazy-loading switch becomes trivial: any consumer that needs
 * only one set can import directly from this file instead of the barrel.
 */

import type { SemanticIconMapping } from '@oneui/shared';

export const remix: SemanticIconMapping = {
    // Actions
    add: 'RiAddLine',
    remove: 'RiSubtractLine',
    close: 'RiCloseLine',
    edit: 'RiPencilLine',
    delete: 'RiDeleteBinLine',
    copy: 'RiFileCopyLine',
    save: 'RiSave3Line',
    refresh: 'RiRefreshLine',
    download: 'RiDownloadLine',
    upload: 'RiUploadLine',
    share: 'RiShareLine',
    link: 'RiLinkM',
    unlink: 'RiLinkUnlinkM',
    // Navigation
    menu: 'RiMenuLine',
    search: 'RiSearchLine',
    home: 'RiHomeLine',
    settings: 'RiSettings3Line',
    arrowLeft: 'RiArrowLeftLine',
    arrowRight: 'RiArrowRightLine',
    arrowUp: 'RiArrowUpLine',
    arrowDown: 'RiArrowDownLine',
    chevronLeft: 'RiArrowLeftSLine',
    chevronRight: 'RiArrowRightSLine',
    chevronUp: 'RiArrowUpSLine',
    chevronDown: 'RiArrowDownSLine',
    externalLink: 'RiExternalLinkLine',
    firstPage: 'RiSkipLeftLine',
    lastPage: 'RiSkipRightLine',
    back: 'RiArrowLeftLine',
    next: 'RiArrowRightLine',
    // Status
    check: 'RiCheckLine',
    checkCircle: 'RiCheckboxCircleLine',
    warning: 'RiAlertLine',
    error: 'RiCloseCircleLine',
    info: 'RiInformationLine',
    help: 'RiQuestionLine',
    loading: 'RiLoader4Line',
    // Media
    play: 'RiPlayLine',
    pause: 'RiPauseLine',
    stop: 'RiStopLine',
    volumeOn: 'RiVolumeUpLine',
    volumeOff: 'RiVolumeMuteLine',
    microphone: 'RiMicLine',
    image: 'RiImageLine',
    video: 'RiVideoLine',
    // User
    user: 'RiUserLine',
    users: 'RiGroupLine',
    userAdd: 'RiUserAddLine',
    userRemove: 'RiUserUnfollowLine',
    logout: 'RiLogoutBoxRLine',
    // UI
    eye: 'RiEyeLine',
    eyeOff: 'RiEyeOffLine',
    lock: 'RiLockLine',
    unlock: 'RiLockUnlockLine',
    star: 'RiStarLine',
    starFilled: 'RiStarFill',
    heart: 'RiHeartLine',
    heartFilled: 'RiHeartFill',
    bookmark: 'RiBookmarkLine',
    bookmarkFilled: 'RiBookmarkFill',
    filter: 'RiFilterLine',
    sort: 'RiSortAsc',
    grid: 'RiGridLine',
    list: 'RiListUnordered',
    moreHorizontal: 'RiMore2Line',
    // Communication
    mail: 'RiMailLine',
    phone: 'RiPhoneLine',
    chat: 'RiChat1Line',
    notification: 'RiNotification3Line',
    // Files
    file: 'RiFileLine',
    folder: 'RiFolderLine',
    document: 'RiFileTextLine',
    // Misc
    calendar: 'RiCalendarLine',
    clock: 'RiTimeLine',
    location: 'RiMapPinLine',
    sun: 'RiSunLine',
    moon: 'RiMoonLine',
    palette: 'RiPaletteLine',
    // Design System navigation
    layers: 'RiStackLine',
    components: 'RiAppsLine',
    canvas: 'RiLayoutLine',
    create: 'RiBrainLine',
    sparkles: 'RiSparkling2Line',
    // Platforms / device surfaces
    globe: 'RiGlobalLine',
    smartphone: 'RiSmartphoneLine',
    tablet: 'RiTabletLine',
    monitor: 'RiComputerLine',
    tv: 'RiTvLine',
    printer: 'RiPrinterLine',
    billboard: 'RiMegaphoneLine',
    bus: 'RiBusLine',
};
