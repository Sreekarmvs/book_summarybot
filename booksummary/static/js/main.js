// Toggle section visibility
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    const arrow = document.getElementById(`${sectionId}Arrow`);
    
    if (section.classList.contains('hidden')) {
        section.classList.remove('hidden');
        arrow.classList.add('rotate-180');
    } else {
        section.classList.add('hidden');
        arrow.classList.remove('rotate-180');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const titleTab = document.getElementById('titleTab');
    const contentTab = document.getElementById('contentTab');
    const titleMode = document.getElementById('titleMode');
    const contentMode = document.getElementById('contentMode');
    const bookTitle = document.getElementById('bookTitle');
    const contentText = document.getElementById('contentText');
    const fileInput = document.getElementById('fileInput');
    const uploadButton = document.getElementById('uploadButton');
    const dropZone = document.getElementById('dropZone');
    const generateButton = document.getElementById('generateButton');
    const summaryType = document.getElementById('summaryType');
    const loading = document.getElementById('loading');
    const summaryContainer = document.getElementById('summaryContainer');
    const summaryContent = document.getElementById('summaryContent');
    const errorMessage = document.getElementById('errorMessage');

    // Add click event listeners for section toggles
    document.querySelectorAll('[data-toggle-section]').forEach(button => {
        button.addEventListener('click', () => {
            const sectionId = button.getAttribute('data-toggle-section');
            toggleSection(sectionId);
        });
    });

    // Tab switching
    titleTab.addEventListener('click', () => {
        titleTab.classList.add('active');
        contentTab.classList.remove('active');
        titleMode.classList.remove('hidden');
        contentMode.classList.add('hidden');
    });

    contentTab.addEventListener('click', () => {
        contentTab.classList.add('active');
        titleTab.classList.remove('active');
        contentMode.classList.remove('hidden');
        titleMode.classList.add('hidden');
    });

    // File upload handling
    uploadButton.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', handleFileSelect);
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length) {
            handleFileSelect({ target: { files } });
        }
    });

    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showError(data.error);
            } else {
                contentText.value = data.content;
            }
        })
        .catch(error => {
            showError('Error uploading file: ' + error.message);
        });
    }

    // Generate summary
    generateButton.addEventListener('click', () => {
        const selectedMode = titleTab.classList.contains('active') ? 'title' : 'content';

        if (selectedMode === 'title' && !bookTitle.value.trim()) {
            showError('Please enter a book title');
            return;
        }

        if (selectedMode === 'content' && !contentText.value.trim()) {
            showError('Please upload a file or paste content');
            return;
        }

        const requestData = {
            mode: selectedMode,
            summary_type: 'comprehensive'  // Default to comprehensive summary
        };

        if (selectedMode === 'title') {
            requestData.book_title = bookTitle.value.trim();
        } else {
            requestData.content = contentText.value.trim();
        }

        showLoading();
        hideError();
        hideSummary();

        fetch('/summarize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
        .then(response => response.json())
        .then(data => {
            hideLoading();
            if (data.error) {
                showError(data.error);
            } else {
                showSummary(data.summary);
            }
        })
        .catch(error => {
            hideLoading();
            showError('Error generating summary: ' + error.message);
        });
    });

    function showSummary(summary) {
        console.log('Showing summary:', summary); // Debug log
        
        // Clear previous content
        document.querySelectorAll('#summaryContainer .prose').forEach(el => {
            el.innerHTML = '';
        });
        document.getElementById('improvementSection').classList.add('hidden');

        // Make sure the summary container is visible
        const summaryContainer = document.getElementById('summaryContainer');
        summaryContainer.classList.remove('hidden');
        
        // Parse and display the new summary
        parseAndDisplaySummary(summary);
        
        // Show the first section by default
        toggleSection('summarySection');
    }

    function parseAndDisplaySummary(summary) {
        console.log('Parsing summary:', summary);

        // Clear previous content
        document.querySelectorAll('#summaryContainer .prose').forEach(el => {
            el.innerHTML = '';
        });

        // Extract sections using regex
        const sections = {};
        let currentSection = null;
        let currentContent = [];

        // Split the text into lines and process each line
        const lines = summary.split('\n');
        for (const line of lines) {
            // Check for section headers (1. Summary, 2. Key Points, etc.)
            const sectionMatch = line.match(/^\d\.\s+(Elaborate Summary|Summary|Key Points|Key Insights|Areas of Improvement)/);
            
            if (sectionMatch) {
                // If we were building a previous section, save it
                if (currentSection) {
                    sections[currentSection] = currentContent.join('\n');
                    currentContent = [];
                }
                // Start new section (map 'Elaborate Summary' to 'Summary')
                currentSection = sectionMatch[1].replace('Elaborate Summary', 'Summary');
            } else if (currentSection && line.trim()) {
                currentContent.push(line.trim());
            }
        }
        
        // Save the last section
        if (currentSection) {
            sections[currentSection] = currentContent.join('\n');
        }

        // Display each section
        if (sections['Summary']) {
            const summaryElement = document.getElementById('summarySection').querySelector('.prose');
            if (summaryElement) {
                const paragraphs = sections['Summary'].split('\n\n')
                    .filter(para => para.trim())
                    .map(para => para.trim());
                
                summaryElement.innerHTML = paragraphs
                    .map(para => `<p class="text-gray-700 leading-relaxed mb-4">${para}</p>`)
                    .join('');
            }
        }

        if (sections['Key Points']) {
            const keyPointsElement = document.getElementById('keyPoints').querySelector('.prose');
            if (keyPointsElement) {
                const points = sections['Key Points'].split('\n')
                    .filter(point => point.trim().startsWith('-'));
                
                keyPointsElement.innerHTML = `<ul class="list-none space-y-3">
                    ${points.map(point => `
                        <li class="flex items-start">
                            <span class="text-blue-500 mr-2 mt-1">•</span>
                            <span class="flex-1">${point.substring(1).trim()}</span>
                        </li>
                    `).join('')}
                </ul>`;
            }
        }

        if (sections['Key Insights']) {
            const insightsElement = document.getElementById('keyInsights').querySelector('.prose');
            if (insightsElement) {
                const insights = sections['Key Insights'].split('\n')
                    .filter(insight => insight.trim().startsWith('-'));
                
                insightsElement.innerHTML = `<ul class="list-none space-y-3">
                    ${insights.map(insight => `
                        <li class="flex items-start">
                            <span class="text-blue-500 mr-2 mt-1">•</span>
                            <span class="flex-1">${insight.substring(1).trim()}</span>
                        </li>
                    `).join('')}
                </ul>`;
            }
        }

        if (sections['Areas of Improvement']) {
            const improvementsElement = document.getElementById('improvements').querySelector('.prose');
            document.getElementById('improvementSection').classList.remove('hidden');
            if (improvementsElement) {
                const improvements = sections['Areas of Improvement'].split('\n')
                    .filter(improvement => improvement.trim().startsWith('-'));
                
                improvementsElement.innerHTML = `<ul class="list-none space-y-3">
                    ${improvements.map(improvement => `
                        <li class="flex items-start">
                            <span class="text-blue-500 mr-2 mt-1">•</span>
                            <span class="flex-1">${improvement.substring(1).trim()}</span>
                        </li>
                    `).join('')}
                </ul>`;
            }
        }

        // Show the summary container and expand the first section
        document.getElementById('summaryContainer').classList.remove('hidden');
        toggleSection('summarySection');
    }

    function hideSummary() {
        summaryContainer.classList.add('hidden');
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
    }

    function hideError() {
        errorMessage.classList.add('hidden');
    }

    // UI Helper Functions
    function showLoading() {
        loading.classList.remove('hidden');
    }

    function hideLoading() {
        loading.classList.add('hidden');
    }

    // Add event listener for summary type changes
    document.addEventListener('DOMContentLoaded', function() {
        const summaryTypeSelect = document.querySelector('select[name="summaryType"]');
        if (summaryTypeSelect) {
            summaryTypeSelect.addEventListener('change', function() {
                const summaryTypeDisplay = document.getElementById('summaryType');
                const formattedType = this.value.charAt(0).toUpperCase() + this.value.slice(1);
                summaryTypeDisplay.textContent = formattedType;
            });
        }
    });
}); 