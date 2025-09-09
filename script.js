// Main application logic
class ConvertioApp {
    constructor() {
        this.converter = new FileConverter();
        this.currentStep = 'upload';
        this.selectedToFormat = '';
        this.selectedFromFormat = '';
        this.dragCounter = 0;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateFormatSelectors();
        this.showStep('upload');
    }

    setupEventListeners() {
        // File input and upload area
        const fileInput = document.getElementById('file-input');
        const selectFilesBtn = document.getElementById('select-files-btn');
        const uploadArea = document.getElementById('upload-area');

        selectFilesBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files));

        // Drag and drop events
        uploadArea.addEventListener('dragenter', this.handleDragEnter.bind(this));
        uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        uploadArea.addEventListener('drop', this.handleDrop.bind(this));

        // Prevent default drag behaviors on document
        document.addEventListener('dragenter', this.preventDefaults.bind(this));
        document.addEventListener('dragover', this.preventDefaults.bind(this));
        document.addEventListener('dragleave', this.preventDefaults.bind(this));
        document.addEventListener('drop', this.preventDefaults.bind(this));

        // Add more files button
        const addMoreBtn = document.getElementById('add-more-btn');
        addMoreBtn.addEventListener('click', () => fileInput.click());

        // Format selectors
        const fromFormatSelect = document.getElementById('from-format');
        const toFormatSelect = document.getElementById('to-format');
        
        fromFormatSelect.addEventListener('change', (e) => {
            this.selectedFromFormat = e.target.value;
            this.updateToFormatOptions();
            this.updateConvertButton();
        });
        
        toFormatSelect.addEventListener('change', (e) => {
            this.selectedToFormat = e.target.value;
            this.updateConvertButton();
        });

        // Convert button
        const convertBtn = document.getElementById('convert-btn');
        convertBtn.addEventListener('click', () => this.startConversion());

        // Download buttons
        const downloadAllBtn = document.getElementById('download-all-btn');
        const convertMoreBtn = document.getElementById('convert-more-btn');
        
        downloadAllBtn.addEventListener('click', () => this.downloadAll());
        convertMoreBtn.addEventListener('click', () => this.resetConverter());

        // Sign up link in upload area
        const chooseFilesBtn = document.getElementById('choose-files-btn');
        chooseFilesBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // In a real app, this would open a sign-up modal
            alert('Sign up functionality would be implemented here');
        });
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleDragEnter(e) {
        this.preventDefaults(e);
        this.dragCounter++;
        e.currentTarget.classList.add('dragover');
    }

    handleDragOver(e) {
        this.preventDefaults(e);
        e.currentTarget.classList.add('dragover');
    }

    handleDragLeave(e) {
        this.preventDefaults(e);
        this.dragCounter--;
        if (this.dragCounter === 0) {
            e.currentTarget.classList.remove('dragover');
        }
    }

    handleDrop(e) {
        this.preventDefaults(e);
        this.dragCounter = 0;
        e.currentTarget.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.addFiles(files);
        }
    }

    handleFileSelect(files) {
        if (files.length > 0) {
            this.addFiles(files);
        }
    }

    addFiles(files) {
        const validFiles = [];
        const errors = [];

        // Validate files before adding
        for (let file of files) {
            const validation = this.converter.validateFile(file);
            if (validation.valid) {
                validFiles.push(file);
            } else {
                errors.push(`${file.name}: ${validation.errors.join(', ')}`);
            }
        }

        // Show errors if any
        if (errors.length > 0) {
            this.showError('Some files could not be added:\n' + errors.join('\n'));
        }

        // Add valid files
        if (validFiles.length > 0) {
            this.converter.addFiles(validFiles);
            this.updateFilesList();
            this.showStep('convert');
            this.updateFormatSelectors();
        }
    }

    updateFilesList() {
        const filesList = document.getElementById('files-list');
        const files = this.converter.getFiles();
        
        filesList.innerHTML = '';
        
        files.forEach(file => {
            const fileItem = this.createFileItem(file);
            filesList.appendChild(fileItem);
        });
    }

    createFileItem(file) {
        const div = document.createElement('div');
        div.className = 'file-item';
        div.setAttribute('data-file-id', file.id);
        
        const statusClass = file.status === 'error' ? 'text-danger' : 
                           file.status === 'completed' ? 'text-success' : 
                           file.status === 'converting' ? 'text-primary' : '';

        div.innerHTML = `
            <div class="file-icon" style="color: ${getCategoryColor(file.formatInfo.category)}">
                <i class="${file.formatInfo.icon}"></i>
            </div>
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-details ${statusClass}">
                    ${file.formatInfo.description} • ${formatFileSize(file.size)}
                    ${file.status === 'converting' ? `• ${Math.round(file.progress)}%` : ''}
                    ${file.status === 'error' ? `• ${file.error}` : ''}
                </div>
                ${file.status === 'converting' ? `
                    <div class="progress mt-2" style="height: 4px;">
                        <div class="progress-bar" style="width: ${file.progress}%"></div>
                    </div>
                ` : ''}
            </div>
            <div class="file-actions">
                <button class="btn btn-outline-danger btn-sm" onclick="app.removeFile('${file.id}')" 
                        ${file.status === 'converting' ? 'disabled' : ''}>
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        if (file.status === 'converting') {
            div.classList.add('converting');
        }
        
        return div;
    }

    removeFile(fileId) {
        if (this.converter.isConverting()) {
            this.showError('Cannot remove files during conversion');
            return;
        }

        this.converter.removeFile(fileId);
        this.updateFilesList();
        
        if (this.converter.getFiles().length === 0) {
            this.showStep('upload');
            this.resetSelectors();
        } else {
            this.updateFormatSelectors();
        }
    }

    updateFormatSelectors() {
        const files = this.converter.getFiles();
        const fromFormatSelect = document.getElementById('from-format');
        const toFormatSelect = document.getElementById('to-format');
        
        // Get all unique formats from uploaded files
        const uploadedFormats = [...new Set(files.map(f => f.extension))];
        
        // Update "from" selector
        fromFormatSelect.innerHTML = '<option value="">from</option>';
        uploadedFormats.forEach(format => {
            const formatInfo = getFormatInfo(format);
            const option = document.createElement('option');
            option.value = format;
            option.textContent = formatInfo.name;
            fromFormatSelect.appendChild(option);
        });

        // If only one format, auto-select it
        if (uploadedFormats.length === 1) {
            fromFormatSelect.value = uploadedFormats[0];
            this.selectedFromFormat = uploadedFormats[0];
        }

        this.updateToFormatOptions();
    }

    updateToFormatOptions() {
        const toFormatSelect = document.getElementById('to-format');
        const files = this.converter.getFiles();
        
        toFormatSelect.innerHTML = '<option value="">to</option>';
        
        if (files.length === 0) return;

        // Get target formats based on selected from format or all uploaded formats
        let availableFormats = new Set();
        
        if (this.selectedFromFormat) {
            // Show formats for selected source format
            getAvailableFormats(this.selectedFromFormat).forEach(format => {
                availableFormats.add(format);
            });
        } else {
            // Show formats available for all uploaded files
            const uploadedFormats = [...new Set(files.map(f => f.extension))];
            uploadedFormats.forEach(format => {
                getAvailableFormats(format).forEach(target => {
                    availableFormats.add(target);
                });
            });
        }

        // Group formats by category
        const formatsByCategory = {};
        availableFormats.forEach(format => {
            const formatInfo = getFormatInfo(format);
            if (!formatsByCategory[formatInfo.category]) {
                formatsByCategory[formatInfo.category] = [];
            }
            formatsByCategory[formatInfo.category].push({
                value: format,
                label: formatInfo.name
            });
        });

        // Add options grouped by category
        const categoryOrder = ['image', 'document', 'video', 'audio', 'archive', 'ebook', 'cad'];
        
        categoryOrder.forEach(category => {
            if (formatsByCategory[category] && formatsByCategory[category].length > 0) {
                const optgroup = document.createElement('optgroup');
                optgroup.label = category.charAt(0).toUpperCase() + category.slice(1);
                
                formatsByCategory[category]
                    .sort((a, b) => a.label.localeCompare(b.label))
                    .forEach(format => {
                        const option = document.createElement('option');
                        option.value = format.value;
                        option.textContent = format.label;
                        optgroup.appendChild(option);
                    });
                
                toFormatSelect.appendChild(optgroup);
            }
        });
        
        this.updateConvertButton();
    }

    updateConvertButton() {
        const convertBtn = document.getElementById('convert-btn');
        const hasFiles = this.converter.getFiles().length > 0;
        const hasTargetFormat = this.selectedToFormat !== '';
        
        convertBtn.disabled = !(hasFiles && hasTargetFormat) || this.converter.isConverting();
        
        if (this.converter.isConverting()) {
            convertBtn.innerHTML = '<span class="spinner me-2"></span>Converting...';
        } else {
            convertBtn.innerHTML = 'Convert';
        }
    }

    async startConversion() {
        if (!this.selectedToFormat) {
            this.showError('Please select a target format');
            return;
        }

        const files = this.converter.getFiles();
        if (files.length === 0) {
            this.showError('No files to convert');
            return;
        }

        // Update UI to show conversion in progress
        this.updateConvertButton();
        
        try {
            await this.converter.convertFiles(
                this.selectedToFormat,
                (file, current, total) => this.updateConversionProgress(file, current, total),
                (convertedFile) => this.onFileConverted(convertedFile)
            );
            
            // Show download section after conversion completes
            setTimeout(() => {
                this.showDownloadSection();
            }, 500);
            
        } catch (error) {
            console.error('Conversion failed:', error);
            this.showError('Conversion failed. Please try again.');
            this.updateConvertButton();
        }
    }

    updateConversionProgress(file, current, total) {
        // Update the specific file item
        const fileItem = document.querySelector(`[data-file-id="${file.id}"]`);
        if (fileItem) {
            const fileDetails = fileItem.querySelector('.file-details');
            const progressBar = fileItem.querySelector('.progress-bar');
            
            if (file.status === 'converting') {
                fileItem.classList.add('converting');
                if (progressBar) {
                    progressBar.style.width = `${file.progress}%`;
                }
                if (fileDetails) {
                    fileDetails.innerHTML = `${file.formatInfo.description} • ${formatFileSize(file.size)} • ${Math.round(file.progress)}%`;
                    fileDetails.className = 'file-details text-primary';
                }
            } else if (file.status === 'completed') {
                fileItem.classList.remove('converting');
                if (fileDetails) {
                    fileDetails.innerHTML = `${file.formatInfo.description} • ${formatFileSize(file.size)} • Completed`;
                    fileDetails.className = 'file-details text-success';
                }
            } else if (file.status === 'error') {
                fileItem.classList.remove('converting');
                if (fileDetails) {
                    fileDetails.innerHTML = `${file.formatInfo.description} • ${formatFileSize(file.size)} • ${file.error}`;
                    fileDetails.className = 'file-details text-danger';
                }
            }
        }
        
        // Update convert button
        this.updateConvertButton();
    }

    onFileConverted(convertedFile) {
        console.log('File converted:', convertedFile.convertedName);
    }

    showDownloadSection() {
        this.showStep('download');
        
        const downloadList = document.getElementById('download-list');
        const convertedFiles = this.converter.getConvertedFiles();
        
        downloadList.innerHTML = '';
        
        if (convertedFiles.length === 0) {
            downloadList.innerHTML = '<p class="text-muted text-center">No files were successfully converted.</p>';
            return;
        }
        
        convertedFiles.forEach(file => {
            const downloadItem = this.createDownloadItem(file);
            downloadList.appendChild(downloadItem);
        });
    }

    createDownloadItem(file) {
        const div = document.createElement('div');
        div.className = 'download-item';
        
        const targetFormatInfo = getFormatInfo(file.targetFormat);
        
        div.innerHTML = `
            <div class="download-info">
                <div class="download-icon">
                    <i class="${targetFormatInfo.icon}"></i>
                </div>
                <div>
                    <div class="file-name">${file.convertedName}</div>
                    <div class="file-details text-muted">
                        ${targetFormatInfo.description} • ${formatFileSize(file.convertedSize)}
                    </div>
                </div>
            </div>
            <button class="btn btn-primary" onclick="app.downloadFile('${file.id}')">
                <i class="fas fa-download me-2"></i>Download
            </button>
        `;
        
        return div;
    }

    downloadFile(fileId) {
        this.converter.downloadFile(fileId);
    }

    async downloadAll() {
        const downloadAllBtn = document.getElementById('download-all-btn');
        const originalText = downloadAllBtn.innerHTML;
        
        downloadAllBtn.innerHTML = '<span class="spinner me-2"></span>Downloading...';
        downloadAllBtn.disabled = true;
        
        try {
            await this.converter.downloadAllFiles();
        } catch (error) {
            console.error('Download failed:', error);
            this.showError('Download failed. Please try downloading files individually.');
        } finally {
            downloadAllBtn.innerHTML = originalText;
            downloadAllBtn.disabled = false;
        }
    }

    resetConverter() {
        this.converter.cleanup();
        this.selectedToFormat = '';
        this.selectedFromFormat = '';
        this.showStep('upload');
        this.resetSelectors();
        
        // Reset form elements
        document.getElementById('file-input').value = '';
    }

    resetSelectors() {
        document.getElementById('from-format').innerHTML = '<option value="">from</option>';
        document.getElementById('to-format').innerHTML = '<option value="">to</option>';
        this.updateConvertButton();
    }

    showStep(step) {
        // Hide all steps
        const steps = ['upload-step', 'convert-step', 'download-step'];
        steps.forEach(stepId => {
            const stepElement = document.getElementById(stepId);
            if (stepElement) {
                stepElement.classList.remove('active');
            }
        });
        
        // Show target step
        const targetStep = document.getElementById(`${step}-step`);
        if (targetStep) {
            targetStep.classList.add('active');
        }
        
        this.currentStep = step;
    }

    showError(message) {
        // Create error alert
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger alert-dismissible fade show position-fixed';
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 400px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    showSuccess(message) {
        // Create success alert
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed';
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 400px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 3000);
    }
}

// Initialize the application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new ConvertioApp();
    
    // Add some demo functionality
    console.log('Convertio clone loaded successfully!');
    console.log('Supported formats:', Object.keys(SUPPORTED_FORMATS).length);
});

// Handle page unload to cleanup resources
window.addEventListener('beforeunload', () => {
    if (app && app.converter) {
        app.converter.cleanup();
    }
});

// Smooth scrolling for anchor links
document.addEventListener('click', (e) => {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + O to open file dialog
    if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        if (app.currentStep === 'upload' || app.currentStep === 'convert') {
            document.getElementById('file-input').click();
        }
    }
    
    // Escape to reset converter
    if (e.key === 'Escape' && !app.converter.isConverting()) {
        if (app.currentStep === 'download') {
            app.resetConverter();
        }
    }
});
