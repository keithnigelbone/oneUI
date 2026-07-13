/**
 * icons/semanticMappings/phosphor.ts
 *
 * Semantic icon mapping for the phosphor icon set. One file per icon library so
 * bundlers can tree-shake unused libraries from the registry import graph
 * and a future lazy-loading switch becomes trivial: any consumer that needs
 * only one set can import directly from this file instead of the barrel.
 */

import type { SemanticIconMapping } from '@oneui/shared';

export const phosphor: SemanticIconMapping = {
    // Actions
    add: 'Plus',
    remove: 'Minus',
    close: 'X',
    edit: 'PencilSimple',
    delete: 'Trash',
    copy: 'Copy',
    save: 'FloppyDisk',
    refresh: 'ArrowsClockwise',
    download: 'DownloadSimple',
    upload: 'UploadSimple',
    share: 'ShareNetwork',
    link: 'Link',
    unlink: 'LinkBreak',
    // Navigation
    menu: 'List',
    search: 'MagnifyingGlass',
    home: 'House',
    settings: 'Gear',
    arrowLeft: 'ArrowLeft',
    arrowRight: 'ArrowRight',
    arrowUp: 'ArrowUp',
    arrowDown: 'ArrowDown',
    chevronLeft: 'CaretLeft',
    chevronRight: 'CaretRight',
    chevronUp: 'CaretUp',
    chevronDown: 'CaretDown',
    externalLink: 'ArrowSquareOut',
    firstPage: 'CaretDoubleLeft',
    lastPage: 'CaretDoubleRight',
    back: 'ArrowLeft',
    next: 'ArrowRight',
    // Status
    check: 'Check',
    checkCircle: 'CheckCircle',
    warning: 'Warning',
    error: 'XCircle',
    info: 'Info',
    help: 'Question',
    loading: 'CircleNotch',
    // Media
    play: 'Play',
    pause: 'Pause',
    stop: 'Stop',
    volumeOn: 'SpeakerHigh',
    volumeOff: 'SpeakerX',
    microphone: 'Microphone',
    image: 'Image',
    video: 'VideoCamera',
    // User
    user: 'User',
    users: 'Users',
    userAdd: 'UserPlus',
    userRemove: 'UserMinus',
    logout: 'SignOut',
    // UI
    eye: 'Eye',
    eyeOff: 'EyeSlash',
    lock: 'Lock',
    unlock: 'LockOpen',
    star: 'Star',
    starFilled: 'StarFill',
    heart: 'Heart',
    heartFilled: 'HeartFill',
    bookmark: 'BookmarkSimple',
    bookmarkFilled: 'BookmarkSimpleFill',
    filter: 'Funnel',
    sort: 'SortAscending',
    grid: 'SquaresFour',
    list: 'ListBullets',
    moreHorizontal: 'DotsThreeOutline',
    // Communication
    mail: 'Envelope',
    phone: 'Phone',
    chat: 'ChatCircle',
    notification: 'Bell',
    // Files
    file: 'File',
    folder: 'Folder',
    document: 'FileText',
    // Misc
    calendar: 'Calendar',
    clock: 'Clock',
    location: 'MapPin',
    sun: 'Sun',
    moon: 'Moon',
    palette: 'Palette',
    // Design System navigation
    layers: 'StackSimple',
    components: 'Browsers',
    canvas: 'FrameCorners',
    create: 'Brain',
    sparkles: 'Sparkle',
    // Platforms / device surfaces
    globe: 'Globe',
    smartphone: 'DeviceMobile',
    tablet: 'DeviceTablet',
    monitor: 'Desktop',
    tv: 'Television',
    printer: 'Printer',
    billboard: 'Megaphone',
    bus: 'Bus',
};
