/**
 * icons/semanticMappings/tabler.ts
 *
 * Semantic icon mapping for the tabler icon set. One file per icon library so
 * bundlers can tree-shake unused libraries from the registry import graph
 * and a future lazy-loading switch becomes trivial: any consumer that needs
 * only one set can import directly from this file instead of the barrel.
 */

import type { SemanticIconMapping } from '@oneui/shared';

export const tabler: SemanticIconMapping = {
    // Actions
    add: 'IconPlus',
    remove: 'IconMinus',
    close: 'IconX',
    edit: 'IconPencil',
    delete: 'IconTrash',
    copy: 'IconCopy',
    save: 'IconDeviceFloppy',
    refresh: 'IconRefresh',
    download: 'IconDownload',
    upload: 'IconUpload',
    share: 'IconShare',
    link: 'IconLink',
    unlink: 'IconUnlink',
    // Navigation
    menu: 'IconMenu2',
    search: 'IconSearch',
    home: 'IconHome',
    settings: 'IconSettings',
    arrowLeft: 'IconArrowLeft',
    arrowRight: 'IconArrowRight',
    arrowUp: 'IconArrowUp',
    arrowDown: 'IconArrowDown',
    chevronLeft: 'IconChevronLeft',
    chevronRight: 'IconChevronRight',
    chevronUp: 'IconChevronUp',
    chevronDown: 'IconChevronDown',
    externalLink: 'IconExternalLink',
    firstPage: 'IconChevronsLeft',
    lastPage: 'IconChevronsRight',
    back: 'IconArrowLeft',
    next: 'IconArrowRight',
    // Status
    check: 'IconCheck',
    checkCircle: 'IconCircleCheck',
    warning: 'IconAlertTriangle',
    error: 'IconCircleX',
    info: 'IconInfoCircle',
    help: 'IconHelp',
    loading: 'IconLoader2',
    // Media
    play: 'IconPlayerPlay',
    pause: 'IconPlayerPause',
    stop: 'IconPlayerStop',
    volumeOn: 'IconVolume',
    volumeOff: 'IconVolumeOff',
    microphone: 'IconMicrophone',
    image: 'IconPhoto',
    video: 'IconVideo',
    // User
    user: 'IconUser',
    users: 'IconUsers',
    userAdd: 'IconUserPlus',
    userRemove: 'IconUserMinus',
    logout: 'IconLogout',
    // UI
    eye: 'IconEye',
    eyeOff: 'IconEyeOff',
    lock: 'IconLock',
    unlock: 'IconLockOpen',
    star: 'IconStar',
    starFilled: 'IconStarFilled',
    heart: 'IconHeart',
    heartFilled: 'IconHeartFilled',
    bookmark: 'IconBookmark',
    bookmarkFilled: 'IconBookmarkFilled',
    filter: 'IconFilter',
    sort: 'IconArrowsSort',
    grid: 'IconLayoutGrid',
    list: 'IconList',
    moreHorizontal: 'IconDots',
    // Communication
    mail: 'IconMail',
    phone: 'IconPhone',
    chat: 'IconMessage',
    notification: 'IconBell',
    // Files
    file: 'IconFile',
    folder: 'IconFolder',
    document: 'IconFileText',
    // Misc
    calendar: 'IconCalendar',
    clock: 'IconClock',
    location: 'IconMapPin',
    sun: 'IconSun',
    moon: 'IconMoon',
    palette: 'IconPalette',
    // Design System navigation
    layers: 'IconStack2',
    components: 'IconComponents',
    canvas: 'IconFrame',
    create: 'IconBrain',
    sparkles: 'IconSparkles',
    // Platforms / device surfaces
    globe: 'IconWorld',
    smartphone: 'IconDeviceMobile',
    tablet: 'IconDeviceTablet',
    monitor: 'IconDeviceDesktop',
    tv: 'IconDeviceTv',
    printer: 'IconPrinter',
    billboard: 'IconSignLeft',
    bus: 'IconBus',
};
