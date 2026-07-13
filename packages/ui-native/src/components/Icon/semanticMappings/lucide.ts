/**
 * icons/semanticMappings/lucide.ts
 *
 * Semantic icon mapping for the lucide icon set. One file per icon library so
 * bundlers can tree-shake unused libraries from the registry import graph
 * and a future lazy-loading switch becomes trivial: any consumer that needs
 * only one set can import directly from this file instead of the barrel.
 */

import type { SemanticIconMapping } from '@oneui/shared';

export const lucide: SemanticIconMapping = {
    // Actions
    add: 'Plus',
    remove: 'Minus',
    close: 'X',
    edit: 'Pencil',
    delete: 'Trash2',
    copy: 'Copy',
    save: 'Save',
    refresh: 'RefreshCw',
    download: 'Download',
    upload: 'Upload',
    share: 'Share2',
    link: 'Link',
    unlink: 'Unlink',
    // Navigation
    menu: 'Menu',
    search: 'Search',
    home: 'Home',
    settings: 'Settings',
    arrowLeft: 'ArrowLeft',
    arrowRight: 'ArrowRight',
    arrowUp: 'ArrowUp',
    arrowDown: 'ArrowDown',
    chevronLeft: 'ChevronLeft',
    chevronRight: 'ChevronRight',
    chevronUp: 'ChevronUp',
    chevronDown: 'ChevronDown',
    externalLink: 'ExternalLink',
    firstPage: 'ChevronsLeft',
    lastPage: 'ChevronsRight',
    back: 'ArrowLeft',
    next: 'ArrowRight',
    // Status
    check: 'Check',
    checkCircle: 'CheckCircle',
    warning: 'AlertTriangle',
    error: 'XCircle',
    info: 'Info',
    help: 'HelpCircle',
    loading: 'Loader2',
    // Media
    play: 'Play',
    pause: 'Pause',
    stop: 'Square',
    volumeOn: 'Volume2',
    volumeOff: 'VolumeX',
    microphone: 'Mic',
    image: 'Image',
    video: 'Video',
    // User
    user: 'User',
    users: 'Users',
    userAdd: 'UserPlus',
    userRemove: 'UserMinus',
    logout: 'LogOut',
    // UI
    eye: 'Eye',
    eyeOff: 'EyeOff',
    lock: 'Lock',
    unlock: 'Unlock',
    star: 'Star',
    starFilled: 'Star',
    heart: 'Heart',
    heartFilled: 'Heart',
    bookmark: 'Bookmark',
    bookmarkFilled: 'Bookmark',
    filter: 'Filter',
    sort: 'ArrowUpDown',
    grid: 'LayoutGrid',
    list: 'List',
    moreHorizontal: 'MoreHorizontal',
    // Communication
    mail: 'Mail',
    phone: 'Phone',
    chat: 'MessageCircle',
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
    layers: 'Layers',
    components: 'Blocks',
    canvas: 'Frame',
    create: 'BrainCircuit',
    sparkles: 'Sparkles',
    // Platforms / device surfaces
    globe: 'Globe',
    smartphone: 'Smartphone',
    tablet: 'Tablet',
    monitor: 'Monitor',
    tv: 'Tv',
    printer: 'FileText',
    billboard: 'SignpostBig',
    bus: 'Bus',
};
