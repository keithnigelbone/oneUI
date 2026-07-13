/**
 * icons/semanticMappings/hugeicons.ts
 *
 * Semantic icon mapping for the hugeicons icon set. One file per icon library so
 * bundlers can tree-shake unused libraries from the registry import graph
 * and a future lazy-loading switch becomes trivial: any consumer that needs
 * only one set can import directly from this file instead of the barrel.
 */

import type { SemanticIconMapping } from '@oneui/shared';

export const hugeicons: SemanticIconMapping = {
    // Actions
    add: 'Add01Icon',
    remove: 'Minus01Icon',
    close: 'Cancel01Icon',
    edit: 'Edit01Icon',
    delete: 'Delete01Icon',
    copy: 'Copy01Icon',
    save: 'FloppyDiskIcon',
    refresh: 'Refresh01Icon',
    download: 'Download01Icon',
    upload: 'Upload01Icon',
    share: 'Share01Icon',
    link: 'Link01Icon',
    unlink: 'Unlink01Icon',
    // Navigation
    menu: 'Menu01Icon',
    search: 'Search01Icon',
    home: 'Home01Icon',
    settings: 'Settings01Icon',
    arrowLeft: 'ArrowLeft01Icon',
    arrowRight: 'ArrowRight01Icon',
    arrowUp: 'ArrowUp01Icon',
    arrowDown: 'ArrowDown01Icon',
    chevronLeft: 'ChevronLeftIcon',
    chevronRight: 'ChevronRightIcon',
    chevronUp: 'ChevronUpIcon',
    chevronDown: 'ChevronDownIcon',
    externalLink: 'LinkSquare01Icon',
    firstPage: 'ArrowLeftDoubleIcon',
    lastPage: 'ArrowRightDoubleIcon',
    back: 'ArrowLeft01Icon',
    next: 'ArrowRight01Icon',
    // Status
    check: 'Tick01Icon',
    checkCircle: 'CheckmarkCircle01Icon',
    warning: 'Alert01Icon',
    error: 'CancelCircleIcon',
    info: 'InformationCircleIcon',
    help: 'HelpCircleIcon',
    loading: 'Loading01Icon',
    // Media
    play: 'Play01Icon',
    pause: 'Pause01Icon',
    stop: 'Stop01Icon',
    volumeOn: 'VolumeHighIcon',
    volumeOff: 'VolumeMute01Icon',
    microphone: 'Microphone01Icon',
    image: 'Image01Icon',
    video: 'Video01Icon',
    // User
    user: 'UserIcon',
    users: 'UserGroup01Icon',
    userAdd: 'UserAdd01Icon',
    userRemove: 'UserRemove01Icon',
    logout: 'Logout03Icon',
    // UI
    eye: 'View01Icon',
    eyeOff: 'ViewOff01Icon',
    lock: 'LockIcon',
    unlock: 'UnlockIcon',
    star: 'Star01Icon',
    starFilled: 'StarIcon',
    heart: 'FavouriteIcon',
    heartFilled: 'FavouriteIcon',
    bookmark: 'Bookmark01Icon',
    bookmarkFilled: 'BookmarkIcon',
    filter: 'Filter01Icon',
    sort: 'SortingIcon',
    grid: 'GridViewIcon',
    list: 'Menu02Icon',
    moreHorizontal: 'MoreHorizontalIcon',
    // Communication
    mail: 'Mail01Icon',
    phone: 'Call01Icon',
    chat: 'Message01Icon',
    notification: 'Notification01Icon',
    // Files
    file: 'File01Icon',
    folder: 'Folder01Icon',
    document: 'Document01Icon',
    // Misc
    calendar: 'Calendar01Icon',
    clock: 'Clock01Icon',
    location: 'Location01Icon',
    sun: 'Sun01Icon',
    moon: 'Moon01Icon',
    palette: 'PaintBrush01Icon',
    // Design System navigation
    layers: 'Layers01Icon',
    components: 'BlocksIcon',
    canvas: 'FrameIcon',
    create: 'AiBrain01Icon',
    sparkles: 'SparklesIcon',
    // Platforms / device surfaces
    globe: 'Globe02Icon',
    smartphone: 'Smartphone01Icon',
    tablet: 'Tablet01Icon',
    monitor: 'ComputerIcon',
    tv: 'Tv01Icon',
    printer: 'PrinterIcon',
    billboard: 'Megaphone01Icon',
    bus: 'Bus01Icon',
};
