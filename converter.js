// Utility functions
function getFileExtension(filename) {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

function getFormatInfo(extension) {
    const formatTypes = {
        // Images
        'jpg': 'image', 'jpeg': 'image', 'png': 'image', 'gif': 'image',
        'webp': 'image', 'bmp': 'image', 'tiff': 'image', 'ico': 'image', 'svg': 'image',
        // Documents
        'pdf': 'document', 'doc': 'document', 'docx': 'document', 'xls': 'document',
        'xlsx': 'document', 'ppt': 'document', 'pptx': 'document', 'txt': 'document', 
        'rtf': 'document', 'odt': 'document',
        // Audio
        'mp3': 'audio', 'wav': 'audio', 'aac': 'audio', 'ogg': 'audio',
        'flac': 'audio', 'm4a': 'audio', 'wma': 'audio',
        // Video
        'mp4': 'video', 'avi': 'video', 'mov': 'video', 'wmv': 'video',
        'flv': 'video', 'mkv': 'video', 'webm': 'video'
    };
    
    return {
        type: formatTypes[extension] || 'unknown',
        name: extension.toUpperCase()
    };
}

function isConversionSupported(fromFormat, toFormat) {
    // Define supported conversions
    const supportedConversions = {
        // Image conversions
        'jpg': ['png', 'webp', 'gif', 'bmp'],
        'jpeg': ['png', 'webp', 'gif', 'bmp'],
        'png': ['jpg', 'webp', 'gif', 'bmp'],
        'gif': ['png', 'jpg', 'webp'],
        'webp': ['png', 'jpg', 'gif'],
        'bmp': ['png', 'jpg', 'webp'],
        // Document conversions (these would typically require server-side processing)
        'txt': ['pdf'],
        'pdf': ['txt'],
    };
    
    return supportedConversions[fromFormat]?.includes(toFormat) || false;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// File conversion logic and utilities
class FileConverter {
    constructor() {
        this.files = [];
        this.convertedFiles = [];
        this.conversionInProgress = false;
    }

    // Add files to the conversion queue
    addFiles(fileList) {
        const newFiles = [];
        
        for (let file of fileList) {
            const extension = getFileExtension(file.name);
            const formatInfo = getFormatInfo(extension);
            
            const fileData = {
                id: this.generateId(),
                file: file,
                name: file.name,
                size: file.size,
                extension: extension,
                formatInfo: formatInfo,
                status: 'pending',
                progress: 0,
                addedAt: new Date()
            };
            
            this.files.push(fileData);
            newFiles.push(fileData);
        }
        
        return newFiles;
    }

    // Remove a file from the queue
    removeFile(fileId) {
        this.files = this.files.filter(f => f.id !== fileId);
        return this.files;
    }

    // Get all files
    getFiles() {
        return this.files;
    }

    // Get file by ID
    getFileById(fileId) {
        return this.files.find(f => f.id === fileId);
    }

    // Clear all files
    clearFiles() {
        this.files = [];
        this.convertedFiles = [];
        this.conversionInProgress = false;
    }

    // Check if conversion is in progress
    isConverting() {
        return this.conversionInProgress;
    }

    // Start conversion process
    async convertFiles(targetFormat, onProgress, onFileComplete) {
        if (this.conversionInProgress) {
            throw new Error('Conversion already in progress');
        }

        this.conversionInProgress = true;
        this.convertedFiles = [];
        
        const totalFiles = this.files.length;
        
        try {
            for (let i = 0; i < this.files.length; i++) {
                const file = this.files[i];
                
                // Check if conversion is supported
                if (!isConversionSupported(file.extension, targetFormat)) {
                    file.status = 'error';
                    file.error = `Conversion from ${file.extension.toUpperCase()} to ${targetFormat.toUpperCase()} is not supported`;
                    continue;
                }

                // Update status
                file.status = 'converting';
                file.progress = 0;
                
                if (onProgress) {
                    onProgress(file, i, totalFiles);
                }

                // Perform actual conversion
                const convertedBlob = await this.performConversion(file, targetFormat, (progress) => {
                    file.progress = progress;
                    if (onProgress) {
                        onProgress(file, i, totalFiles);
                    }
                });
                
                if (!convertedBlob) {
                    file.status = 'error';
                    file.error = 'Conversion failed';
                    continue;
                }

                // Create converted file data
                const convertedFile = {
                    id: file.id,
                    originalName: file.name,
                    convertedName: this.getConvertedFileName(file.name, targetFormat),
                    originalFormat: file.extension,
                    targetFormat: targetFormat,
                    originalSize: file.size,
                    convertedSize: convertedBlob.size,
                    downloadUrl: URL.createObjectURL(convertedBlob),
                    blob: convertedBlob,
                    status: 'completed',
                    convertedAt: new Date()
                };

                this.convertedFiles.push(convertedFile);
                file.status = 'completed';
                file.progress = 100;
                
                if (onFileComplete) {
                    onFileComplete(convertedFile);
                }
                
                if (onProgress) {
                    onProgress(file, i + 1, totalFiles);
                }
            }
        } catch (error) {
            console.error('Conversion error:', error);
            throw error;
        } finally {
            this.conversionInProgress = false;
        }

        return this.convertedFiles;
    }

    // Perform actual file conversion
    async performConversion(file, targetFormat, onProgress) {
        if (onProgress) onProgress(10);
        
        try {
            // Handle different file types
            if (file.formatInfo.type === 'image') {
                return await this.convertImage(file, targetFormat, onProgress);
            } else if (file.formatInfo.type === 'document') {
                return await this.convertDocument(file, targetFormat, onProgress);
            } else {
                // For unsupported types, return the original file
                console.warn(`Conversion for ${file.formatInfo.type} files not implemented`);
                return file.file;
            }
        } catch (error) {
            console.error('Error during conversion:', error);
            return null;
        }
    }

    // Convert image files
    async convertImage(file, targetFormat, onProgress) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                if (onProgress) onProgress(30);
                
                const img = new Image();
                img.onload = function() {
                    if (onProgress) onProgress(60);
                    
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    
                    if (onProgress) onProgress(80);
                    
                    try {
                        // Convert to target format
                        canvas.toBlob((blob) => {
                            if (onProgress) onProgress(100);
                            resolve(blob);
                        }, `image/${targetFormat}`, 0.9);
                    } catch (error) {
                        reject(error);
                    }
                };
                
                img.onerror = reject;
                img.src = e.target.result;
            };
            
            reader.onerror = reject;
            reader.readAsDataURL(file.file);
        });
    }

    // Convert document files (basic implementation)
    async convertDocument(file, targetFormat, onProgress) {
        // This is a simplified implementation
        // Real document conversion would typically require server-side processing
        
        if (onProgress) onProgress(30);
        
        return new Promise((resolve) => {
            // Simulate document conversion
            setTimeout(() => {
                if (onProgress) onProgress(70);
                
                // For demonstration, we'll create a simple text representation
                let content = `Converted from: ${file.extension} to ${targetFormat}\n`;
                content += `Original filename: ${file.name}\n`;
                content += `Original size: ${formatFileSize(file.size)}\n`;
                content += `Conversion date: ${new Date().toISOString()}\n`;
                
                if (onProgress) onProgress(100);
                
                resolve(new Blob([content], { type: 'text/plain' }));
            }, 1000);
        });
    }

    // Generate converted filename
    getConvertedFileName(originalName, targetFormat) {
        const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
        return `${nameWithoutExt}.${targetFormat}`;
    }

    // Get converted files
    getConvertedFiles() {
        return this.convertedFiles;
    }

    // Get converted file by ID
    getConvertedFileById(fileId) {
        return this.convertedFiles.find(f => f.id === fileId);
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    // Download a single file
    downloadFile(fileId) {
        const file = this.convertedFiles.find(f => f.id === fileId);
        if (file && file.downloadUrl) {
            const link = document.createElement('a');
            link.href = file.downloadUrl;
            link.download = file.convertedName;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Track download
            console.log(`Downloaded: ${file.convertedName}`);
        } else {
            console.error('File not found or download URL not available');
        }
    }

    // Download all files (individual downloads with delay)
    async downloadAllFiles() {
        if (this.convertedFiles.length === 0) {
            console.warn('No files to download');
            return;
        }

        console.log(`Starting download of ${this.convertedFiles.length} files...`);
        
        for (let i = 0; i < this.convertedFiles.length; i++) {
            const file = this.convertedFiles[i];
            this.downloadFile(file.id);
            
            // Add delay between downloads to prevent browser blocking
            if (i < this.convertedFiles.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
    }

    // Get conversion statistics
    getStats() {
        const totalFiles = this.files.length;
        const completedFiles = this.files.filter(f => f.status === 'completed').length;
        const errorFiles = this.files.filter(f => f.status === 'error').length;
        const pendingFiles = this.files.filter(f => f.status === 'pending').length;
        const convertingFiles = this.files.filter(f => f.status === 'converting').length;
        
        return {
            total: totalFiles,
            completed: completedFiles,
            errors: errorFiles,
            pending: pendingFiles,
            converting: convertingFiles,
            progress: totalFiles > 0 ? (completedFiles / totalFiles) * 100 : 0
        };
    }

    // Validate file before adding
    validateFile(file) {
        const maxSize = 100 * 1024 * 1024; // 100MB
        const errors = [];
        
        if (file.size > maxSize) {
            errors.push(`File size exceeds 100MB limit (${formatFileSize(file.size)})`);
        }
        
        if (file.size === 0) {
            errors.push('File is empty');
        }
        
        const extension = getFileExtension(file.name);
        if (!extension) {
            errors.push('File has no extension');
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    // Clean up resources
    cleanup() {
        // Revoke blob URLs to free memory
        this.convertedFiles.forEach(file => {
            if (file.downloadUrl && file.downloadUrl.startsWith('blob:')) {
                URL.revokeObjectURL(file.downloadUrl);
            }
        });
        
        this.clearFiles();
    }
}

// Quality settings for different formats
const QUALITY_SETTINGS = {
    'jpg': [
        { value: 'high', label: 'High Quality (95%)', quality: 95 },
        { value: 'medium', label: 'Medium Quality (80%)', quality: 80 },
        { value: 'low', label: 'Low Quality (60%)', quality: 60 }
    ],
    'png': [
        { value: 'lossless', label: 'Lossless', quality: 100 }
    ],
    'webp': [
        { value: 'high', label: 'High Quality (90%)', quality: 90 },
        { value: 'medium', label: 'Medium Quality (75%)', quality: 75 },
        { value: 'low', label: 'Low Quality (50%)', quality: 50 }
    ]
};

// Get quality options for a format
function getQualityOptions(format) {
    return QUALITY_SETTINGS[format] || [];
}

// Conversion presets for common use cases
const CONVERSION_PRESETS = {
    'web-optimized': {
        name: 'Web Optimized',
        description: 'Optimized for web use with smaller file sizes',
        formats: {
            'image': 'webp'
        }
    },
    'high-quality': {
        name: 'High Quality',
        description: 'Maximum quality with larger file sizes',
        formats: {
            'image': 'png'
        }
    },
    'universal': {
        name: 'Universal Compatibility',
        description: 'Compatible with most devices and software',
        formats: {
            'image': 'jpg'
        }
    }
};

// Get conversion presets
function getConversionPresets() {
    return CONVERSION_PRESETS;
}
