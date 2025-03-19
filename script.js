document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const themeSwitch = document.getElementById('theme-switch');
    const markdownInput = document.getElementById('markdown-input');
    const previewBtn = document.getElementById('preview-btn');
    const downloadBtn = document.getElementById('download-btn');
    const previewContainer = document.getElementById('preview-container');
    const markdownPreview = document.getElementById('markdown-preview');
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('mdpdf-theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeSwitch.checked = true;
    }
    
    // Theme toggle functionality
    themeSwitch.addEventListener('change', () => {
        if (themeSwitch.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('mdpdf-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('mdpdf-theme', 'light');
        }
    });
    
    // Configure marked options for better rendering
    marked.setOptions({
        gfm: true,              // GitHub Flavored Markdown
        breaks: true,           // Convert line breaks to <br>
        headerIds: true,        // Add id to headers
        mangle: false,          // Don't mangle header ids
        sanitize: false,        // Don't sanitize HTML
        smartLists: true,       // Use smarter list behavior
        smartypants: true,      // Use "smart" typographic punctuation
        xhtml: false            // Don't output XHTML-compliant tags
    });
    
    // Preview button functionality
    previewBtn.addEventListener('click', () => {
        const markdownText = markdownInput.value.trim();
        
        if (markdownText) {
            // Render markdown to HTML
            markdownPreview.innerHTML = marked.parse(markdownText);
            
            // Show preview and enable download button
            previewContainer.style.display = 'block';
            downloadBtn.disabled = false;
        } else {
            alert('Please enter some markdown text to preview.');
        }
    });
    
    // Download button functionality
    downloadBtn.addEventListener('click', async () => {
        // Get the rendered HTML content
        const content = markdownPreview.innerHTML;
        
        if (!content) {
            alert('No content to download. Please preview your markdown first.');
            return;
        }
        
        // Create a temporary div with proper styling for PDF
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        tempDiv.className = 'preview-content';
        
        // Set styling for PDF output
        const style = document.createElement('style');
        const isDarkMode = themeSwitch.checked;
        
        style.textContent = `
            body {
                font-family: Georgia, serif;
                line-height: 1.6;
                color: ${isDarkMode ? '#f0f0f0' : '#1a1a1a'};
                background-color: ${isDarkMode ? '#000000' : '#ffffff'};
                padding: 2cm;
            }
            h1, h2, h3, h4, h5, h6 {
                font-family: Georgia, serif;
                margin-top: 1.5em;
                margin-bottom: 0.5em;
                line-height: 1.2;
            }
            h1 {
                font-size: 2rem;
                border-bottom: 1px solid ${isDarkMode ? '#333333' : '#e0e0e0'};
                padding-bottom: 0.3em;
            }
            h2 {
                font-size: 1.5rem;
                border-bottom: 1px solid ${isDarkMode ? '#333333' : '#e0e0e0'};
                padding-bottom: 0.3em;
            }
            p {
                margin-bottom: 1rem;
            }
            a {
                color: ${isDarkMode ? '#5b8ab8' : '#3a5a78'};
                text-decoration: none;
            }
            code {
                font-family: monospace;
                background-color: ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
                padding: 0.2em 0.4em;
                border-radius: $3px;
            }
            pre {
                background-color: ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
                padding: 1rem;
                border-radius: 4px;
                overflow-x: auto;
                margin-bottom: 1rem;
            }
            blockquote {
                border-left: 4px solid ${isDarkMode ? '#5b8ab8' : '#3a5a78'};
                padding-left: 1rem;
                margin-left: 0;
                color: ${isDarkMode ? 'rgba(240, 240, 240, 0.8)' : 'rgba(26, 26, 26, 0.8)'};
            }
            table {
                border-collapse: collapse;
                width: 100%;
                margin-bottom: 1rem;
            }
            th, td {
                padding: 0.5rem;
                border: 1px solid ${isDarkMode ? '#333333' : '#e0e0e0'};
            }
            ul, ol {
                margin-bottom: 1rem;
                padding-left: 2rem;
            }
        `;
        
        // Create container for the styled content
        const pdfContainer = document.createElement('div');
        pdfContainer.appendChild(style);
        pdfContainer.appendChild(tempDiv);
        
        // Get filename from the first header or default to "document"
        let filename = "document.pdf";
        const headerMatch = markdownInput.value.match(/^#\s+(.+)$/m);
        if (headerMatch && headerMatch[1]) {
            filename = headerMatch[1].trim().replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.pdf';
        }
        
        // Configure pdf options
        const opt = {
            margin: [0.5, 0.5, 0.5, 0.5],
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2,
                useCORS: true,
                letterRendering: true
            },
            jsPDF: { 
                unit: 'in', 
                format: 'letter', 
                orientation: 'portrait',
                putOnlyUsedFonts: true
            }
        };
        
        // Generate and download PDF
        try {
            downloadBtn.disabled = true;
            downloadBtn.textContent = 'Generating PDF...';
            
            await html2pdf()
                .set(opt)
                .from(pdfContainer)
                .save();
                
            downloadBtn.textContent = 'Download PDF';
            downloadBtn.disabled = false;
        } catch (error) {
            console.error('PDF generation error:', error);
            alert('There was an error generating your PDF. Please try again.');
            downloadBtn.textContent = 'Download PDF';
            downloadBtn.disabled = false;
        }
    });
    
    // Auto-resize textarea as content grows
    markdownInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
    
    // Check for saved content
    const savedContent = localStorage.getItem('mdpdf-content');
    if (savedContent) {
        markdownInput.value = savedContent;
    }
    
    // Save content as it's typed
    markdownInput.addEventListener('input', () => {
        localStorage.setItem('mdpdf-content', markdownInput.value);
    });
    
    // Add sample markdown helper
    if (!localStorage.getItem('mdpdf-content')) {
        markdownInput.value = `# Welcome to mdpdf

This is a simple, browser-based Markdown to PDF converter.

## How to use

1. Write or paste your Markdown content in this editor
2. Click "Preview" to see how it will look
3. Click "Download PDF" to generate and download your document

## Features

* **No server** - Everything happens in your browser
* **No storage** - Your content never leaves your device
* **Dark mode** - Toggle between light and dark themes

### Example formatting

* *Italic text* and **bold text**
* [Links](https://example.com)
* Lists like this one
* Code blocks:

\`\`\`
function hello() {
  console.log("Hello, world!");
}
\`\`\`

> Blockquotes for important callouts

Enjoy using mdpdf!`;
    }
});