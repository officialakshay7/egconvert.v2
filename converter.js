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

                // Simulate conversion process with progress updates
                await this.simulateConversion(file, targetFormat, (progress) => {
                    file.progress = progress;
                    if (onProgress) {
                        onProgress(file, i, totalFiles);
                    }
                });
                
                // Create converted file data
                const convertedFile = {
                    id: file.id,
                    originalName: file.name,
                    convertedName: this.getConvertedFileName(file.name, targetFormat),
                    originalFormat: file.extension,
                    targetFormat: targetFormat,
                    originalSize: file.size,
                    convertedSize: this.estimateConvertedSize(file.size, file.extension, targetFormat),
                    downloadUrl: this.createDownloadUrl(file.file, targetFormat),
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

    // Simulate conversion process with realistic progress updates
    async simulateConversion(file, targetFormat, onProgress) {
        const baseTime = 2000; // 2 seconds base
        const sizeMultiplier = Math.min(file.size / (1024 * 1024), 5); // Up to 5 seconds for large files
        const conversionTime = baseTime + (sizeMultiplier * 1000);
        
        const steps = 20;
        const stepTime = conversionTime / steps;
        
        for (let step = 0; step <= steps; step++) {
            const progress = Math.min((step / steps) * 100, 100);
            
            if (onProgress) {
                onProgress(progress);
            }
            
            if (step < steps) {
                await new Promise(resolve => setTimeout(resolve, stepTime));
            }
        }
    }

    // Generate converted filename
    getConvertedFileName(originalName, targetFormat) {
        const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
        return `${nameWithoutExt}.${targetFormat}`;
    }

    // Estimate converted file size (realistic simulation)
    estimateConvertedSize(originalSize, fromFormat, toFormat) {
        // Realistic size estimation based on format types and compression
        const sizeMultipliers = {
            // Image conversions
            'jpg': { 
                'png': 2.5, 'gif': 0.8, 'bmp': 5, 'webp': 0.7, 'tiff': 3.2, 'ico': 0.1 
            },
            'png': { 
                'jpg': 0.4, 'gif': 0.6, 'bmp': 3, 'webp': 0.5, 'tiff': 2.1, 'ico': 0.05 
            },
            'gif': { 
                'jpg': 1.2, 'png': 1.8, 'webp': 0.8, 'bmp': 4, 'tiff': 2.5 
            },
            'bmp': { 
                'jpg': 0.2, 'png': 0.3, 'gif': 0.15, 'webp': 0.1, 'tiff': 0.8 
            },
            'webp': {
                'jpg': 1.4, 'png': 2.0, 'gif': 1.2, 'bmp': 10, 'tiff': 3.5
            },
            
            // Audio conversions
            'wav': { 
                'mp3': 0.1, 'aac': 0.12, 'ogg': 0.15, 'flac': 0.6, 'm4a': 0.11, 'wma': 0.13 
            },
            'flac': { 
                'mp3': 0.15, 'wav': 1.7, 'aac': 0.18, 'ogg': 0.2, 'm4a': 0.16, 'wma': 0.19 
            },
            'mp3': { 
                'wav': 10, 'flac': 6, 'aac': 1.2, 'ogg': 1.1, 'm4a': 1.1, 'wma': 1.3 
            },
            'aac': {
                'mp3': 0.9, 'wav': 8.5, 'flac': 5.2, 'ogg': 1.0, 'm4a': 1.0, 'wma': 1.1
            },
            
            // Video conversions
            'mp4': {
                'avi': 1.2, 'mov': 1.1, 'wmv': 0.9, 'flv': 0.8, 'mkv': 1.0, 'webm': 0.7
            },
            'avi': {
                'mp4': 0.8, 'mov': 0.9, 'wmv': 0.7, 'flv': 0.6, 'mkv': 0.85, 'webm': 0.6
            },
            'mov': {
                'mp4': 0.9, 'avi': 1.1, 'wmv': 0.8, 'flv': 0.7, 'mkv': 0.95, 'webm': 0.65
            },
            
            // Document conversions
            'pdf': {
                'doc': 0.3, 'docx': 0.25, 'txt': 0.05, 'rtf': 0.15, 'odt': 0.2
            },
            'doc': {
                'pdf': 3.5, 'docx': 0.8, 'txt': 0.1, 'rtf': 1.2, 'odt': 0.9
            },
            'docx': {
                'pdf': 4.0, 'doc': 1.2, 'txt': 0.08, 'rtf': 1.5, 'odt': 1.0
            }
        };
        
        const multiplier = sizeMultipliers[fromFormat]?.[toFormat] || 1.0;
        const estimatedSize = Math.round(originalSize * multiplier);
        
        // Add some randomness to make it more realistic
        const variance = 0.1; // 10% variance
        const randomFactor = 1 + (Math.random() - 0.5) * variance * 2;
        
        return Math.max(1024, Math.round(estimatedSize * randomFactor)); // Minimum 1KB
    }

    // Create download URL (simulation)
    createDownloadUrl(originalFile, targetFormat) {
        // In a real application, this would be the URL to the converted file
        // For demonstration, we create a blob URL with modified content
        try {
            // Create a simple text file for demonstration
            const content = `Converted file: ${originalFile.name} -> ${targetFormat}\nOriginal size: ${formatFileSize(originalFile.size)}\nConverted at: ${new Date().toISOString()}`;
            const blob = new Blob([content], { type: 'text/plain' });
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error('Error creating download URL:', error);
            return URL.createObjectURL(originalFile);
        }
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
    ],
    'mp3': [
        { value: 'high', label: '320 kbps', bitrate: 320 },
        { value: 'medium', label: '192 kbps', bitrate: 192 },
        { value: 'low', label: '128 kbps', bitrate: 128 }
    ],
    'aac': [
        { value: 'high', label: '256 kbps', bitrate: 256 },
        { value: 'medium', label: '128 kbps', bitrate: 128 },
        { value: 'low', label: '96 kbps', bitrate: 96 }
    ],
    'mp4': [
        { value: 'hd', label: '1080p HD', resolution: '1920x1080' },
        { value: 'hd720', label: '720p HD', resolution: '1280x720' },
        { value: 'sd', label: '480p SD', resolution: '854x480' }
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
            'image': 'webp',
            'video': 'mp4',
            'audio': 'mp3'
        }
    },
    'high-quality': {
        name: 'High Quality',
        description: 'Maximum quality with larger file sizes',
        formats: {
            'image': 'png',
            'video': 'mov',
            'audio': 'flac'
        }
    },
    'universal': {
        name: 'Universal Compatibility',
        description: 'Compatible with most devices and software',
        formats: {
            'image': 'jpg',
            'video': 'mp4',
            'audio': 'mp3',
            'document': 'pdf'
        }
    }
};

// Get conversion presets
function getConversionPresets() {
    return CONVERSION_PRESETS;
}
