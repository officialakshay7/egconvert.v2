// Supported file formats and their configurations
const SUPPORTED_FORMATS = {
    // Images
    'jpg': { category: 'image', icon: 'fas fa-file-image', name: 'JPEG', description: 'JPEG Image' },
    'jpeg': { category: 'image', icon: 'fas fa-file-image', name: 'JPEG', description: 'JPEG Image' },
    'png': { category: 'image', icon: 'fas fa-file-image', name: 'PNG', description: 'PNG Image' },
    'gif': { category: 'image', icon: 'fas fa-file-image', name: 'GIF', description: 'GIF Image' },
    'bmp': { category: 'image', icon: 'fas fa-file-image', name: 'BMP', description: 'Bitmap Image' },
    'tiff': { category: 'image', icon: 'fas fa-file-image', name: 'TIFF', description: 'TIFF Image' },
    'tif': { category: 'image', icon: 'fas fa-file-image', name: 'TIFF', description: 'TIFF Image' },
    'svg': { category: 'image', icon: 'fas fa-file-image', name: 'SVG', description: 'SVG Vector' },
    'webp': { category: 'image', icon: 'fas fa-file-image', name: 'WEBP', description: 'WebP Image' },
    'ico': { category: 'image', icon: 'fas fa-file-image', name: 'ICO', description: 'Icon File' },
    'psd': { category: 'image', icon: 'fas fa-file-image', name: 'PSD', description: 'Photoshop Document' },

    // Documents
    'pdf': { category: 'document', icon: 'fas fa-file-pdf', name: 'PDF', description: 'PDF Document' },
    'doc': { category: 'document', icon: 'fas fa-file-word', name: 'DOC', description: 'Word Document' },
    'docx': { category: 'document', icon: 'fas fa-file-word', name: 'DOCX', description: 'Word Document' },
    'xls': { category: 'document', icon: 'fas fa-file-excel', name: 'XLS', description: 'Excel Spreadsheet' },
    'xlsx': { category: 'document', icon: 'fas fa-file-excel', name: 'XLSX', description: 'Excel Spreadsheet' },
    'ppt': { category: 'document', icon: 'fas fa-file-powerpoint', name: 'PPT', description: 'PowerPoint' },
    'pptx': { category: 'document', icon: 'fas fa-file-powerpoint', name: 'PPTX', description: 'PowerPoint' },
    'txt': { category: 'document', icon: 'fas fa-file-alt', name: 'TXT', description: 'Text File' },
    'rtf': { category: 'document', icon: 'fas fa-file-alt', name: 'RTF', description: 'Rich Text Format' },
    'odt': { category: 'document', icon: 'fas fa-file-alt', name: 'ODT', description: 'OpenDocument Text' },
    'ods': { category: 'document', icon: 'fas fa-file-excel', name: 'ODS', description: 'OpenDocument Spreadsheet' },
    'odp': { category: 'document', icon: 'fas fa-file-powerpoint', name: 'ODP', description: 'OpenDocument Presentation' },

    // Audio
    'mp3': { category: 'audio', icon: 'fas fa-file-audio', name: 'MP3', description: 'MP3 Audio' },
    'wav': { category: 'audio', icon: 'fas fa-file-audio', name: 'WAV', description: 'WAV Audio' },
    'flac': { category: 'audio', icon: 'fas fa-file-audio', name: 'FLAC', description: 'FLAC Audio' },
    'aac': { category: 'audio', icon: 'fas fa-file-audio', name: 'AAC', description: 'AAC Audio' },
    'ogg': { category: 'audio', icon: 'fas fa-file-audio', name: 'OGG', description: 'OGG Audio' },
    'm4a': { category: 'audio', icon: 'fas fa-file-audio', name: 'M4A', description: 'M4A Audio' },
    'wma': { category: 'audio', icon: 'fas fa-file-audio', name: 'WMA', description: 'WMA Audio' },
    'aiff': { category: 'audio', icon: 'fas fa-file-audio', name: 'AIFF', description: 'AIFF Audio' },
    'au': { category: 'audio', icon: 'fas fa-file-audio', name: 'AU', description: 'AU Audio' },

    // Video
    'mp4': { category: 'video', icon: 'fas fa-file-video', name: 'MP4', description: 'MP4 Video' },
    'avi': { category: 'video', icon: 'fas fa-file-video', name: 'AVI', description: 'AVI Video' },
    'mov': { category: 'video', icon: 'fas fa-file-video', name: 'MOV', description: 'MOV Video' },
    'wmv': { category: 'video', icon: 'fas fa-file-video', name: 'WMV', description: 'WMV Video' },
    'flv': { category: 'video', icon: 'fas fa-file-video', name: 'FLV', description: 'FLV Video' },
    'mkv': { category: 'video', icon: 'fas fa-file-video', name: 'MKV', description: 'MKV Video' },
    'webm': { category: 'video', icon: 'fas fa-file-video', name: 'WEBM', description: 'WebM Video' },
    'm4v': { category: 'video', icon: 'fas fa-file-video', name: 'M4V', description: 'M4V Video' },
    '3gp': { category: 'video', icon: 'fas fa-file-video', name: '3GP', description: '3GP Video' },
    'mpg': { category: 'video', icon: 'fas fa-file-video', name: 'MPG', description: 'MPEG Video' },
    'mpeg': { category: 'video', icon: 'fas fa-file-video', name: 'MPEG', description: 'MPEG Video' },

    // Archives
    'zip': { category: 'archive', icon: 'fas fa-file-archive', name: 'ZIP', description: 'ZIP Archive' },
    'rar': { category: 'archive', icon: 'fas fa-file-archive', name: 'RAR', description: 'RAR Archive' },
    '7z': { category: 'archive', icon: 'fas fa-file-archive', name: '7Z', description: '7-Zip Archive' },
    'tar': { category: 'archive', icon: 'fas fa-file-archive', name: 'TAR', description: 'TAR Archive' },
    'gz': { category: 'archive', icon: 'fas fa-file-archive', name: 'GZ', description: 'GZIP Archive' },
    'bz2': { category: 'archive', icon: 'fas fa-file-archive', name: 'BZ2', description: 'BZIP2 Archive' },

    // Ebooks
    'epub': { category: 'ebook', icon: 'fas fa-book', name: 'EPUB', description: 'EPUB Ebook' },
    'mobi': { category: 'ebook', icon: 'fas fa-book', name: 'MOBI', description: 'MOBI Ebook' },
    'azw': { category: 'ebook', icon: 'fas fa-book', name: 'AZW', description: 'AZW Ebook' },
    'azw3': { category: 'ebook', icon: 'fas fa-book', name: 'AZW3', description: 'AZW3 Ebook' },
    'fb2': { category: 'ebook', icon: 'fas fa-book', name: 'FB2', description: 'FB2 Ebook' },

    // CAD
    'dwg': { category: 'cad', icon: 'fas fa-drafting-compass', name: 'DWG', description: 'AutoCAD Drawing' },
    'dxf': { category: 'cad', icon: 'fas fa-drafting-compass', name: 'DXF', description: 'AutoCAD Exchange' },
    'step': { category: 'cad', icon: 'fas fa-drafting-compass', name: 'STEP', description: 'STEP 3D Model' },
    'stp': { category: 'cad', icon: 'fas fa-drafting-compass', name: 'STP', description: 'STEP 3D Model' },
    'iges': { category: 'cad', icon: 'fas fa-drafting-compass', name: 'IGES', description: 'IGES 3D Model' },
    'igs': { category: 'cad', icon: 'fas fa-drafting-compass', name: 'IGS', description: 'IGES 3D Model' }
};

// Conversion mappings - what formats can be converted to what
const CONVERSION_MAPPINGS = {
    'image': ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'svg', 'webp', 'ico', 'psd'],
    'document': ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'xls', 'xlsx', 'ppt', 'pptx', 'ods', 'odp'],
    'audio': ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma', 'aiff', 'au'],
    'video': ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'm4v', '3gp', 'mpg', 'mpeg'],
    'archive': ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'],
    'ebook': ['epub', 'mobi', 'azw', 'azw3', 'fb2', 'pdf'],
    'cad': ['dwg', 'dxf', 'step', 'stp', 'iges', 'igs', 'pdf']
};

// Popular conversion combinations
const POPULAR_CONVERSIONS = {
    'pdf': ['doc', 'docx', 'jpg', 'png', 'txt'],
    'jpg': ['png', 'gif', 'bmp', 'webp', 'pdf'],
    'png': ['jpg', 'gif', 'bmp', 'webp', 'ico'],
    'mp4': ['avi', 'mov', 'wmv', 'mkv', 'webm'],
    'mp3': ['wav', 'flac', 'aac', 'ogg', 'm4a'],
    'docx': ['pdf', 'doc', 'txt', 'rtf', 'odt'],
    'xlsx': ['xls', 'pdf', 'csv', 'ods']
};

// Get file extension from filename
function getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
}

// Get file format info
function getFormatInfo(extension) {
    return SUPPORTED_FORMATS[extension] || {
        category: 'unknown',
        icon: 'fas fa-file',
        name: extension ? extension.toUpperCase() : 'Unknown',
        description: 'Unknown File'
    };
}

// Get available conversion formats for a given format
function getAvailableFormats(fromFormat) {
    const formatInfo = getFormatInfo(fromFormat);
    const category = formatInfo.category;

    if (category === 'unknown') {
        // Return most common formats for unknown files
        return ['pdf', 'txt', 'jpg', 'png', 'mp3', 'mp4'];
    }

    return CONVERSION_MAPPINGS[category] || [];
}

// Get popular conversion formats for a given format
function getPopularFormats(fromFormat) {
    return POPULAR_CONVERSIONS[fromFormat] || getAvailableFormats(fromFormat).slice(0, 5);
}

// Check if conversion is supported
function isConversionSupported(fromFormat, toFormat) {
    const availableFormats = getAvailableFormats(fromFormat);
    return availableFormats.includes(toFormat);
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Get category color
function getCategoryColor(category) {
    const colors = {
        'image': '#e74c3c',
        'document': '#3498db',
        'audio': '#9b59b6',
        'video': '#e67e22',
        'archive': '#27ae60',
        'ebook': '#f39c12',
        'cad': '#34495e',
        'unknown': '#95a5a6'
    };

    return colors[category] || colors.unknown;
}

// Get all formats by category
function getFormatsByCategory() {
    const categories = {};

    Object.entries(SUPPORTED_FORMATS).forEach(([ext, info]) => {
        if (!categories[info.category]) {
            categories[info.category] = [];
        }
        categories[info.category].push({
            extension: ext,
            name: info.name,
            description: info.description
        });
    });

    // Sort formats within each category
    Object.keys(categories).forEach(category => {
        categories[category].sort((a, b) => a.name.localeCompare(b.name));
    });

    return categories;
}

// Search formats
function searchFormats(query) {
    const results = [];
    const searchTerm = query.toLowerCase();

    Object.entries(SUPPORTED_FORMATS).forEach(([ext, info]) => {
        if (
            ext.includes(searchTerm) ||
            info.name.toLowerCase().includes(searchTerm) ||
            info.description.toLowerCase().includes(searchTerm)
        ) {
            results.push({
                extension: ext,
                ...info
            });
        }
    });

    return results;
}