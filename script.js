
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const themeSwitch = document.getElementById('theme-switch');
    const markdownInput = document.getElementById('markdown-input');
    const previewBtn = document.getElementById('preview-btn');
    const printBtn = document.getElementById('print-btn');
    const previewContainer = document.getElementById('preview-container');
    const markdownPreview = document.getElementById('markdown-preview');
    const printFrame = document.getElementById('print-frame');
    
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
            
            // Show preview and enable print button
            previewContainer.style.display = 'block';
            printBtn.disabled = false;
        } else {
            alert('Please enter some markdown text to preview.');
        }
    });
    
    // Print button functionality
    printBtn.addEventListener('click', () => {
        const content = markdownPreview.innerHTML;
        
        if (!content) {
            alert('No content to print. Please preview your markdown first.');
            return;
        }
        
        // Begin printing process
        printFormattedContent(content);
    });
    
    // Function to handle printing
    function printFormattedContent(content) {
        // Get the title if available from the first H1 tag
        let title = "Document";
        const headerMatch = markdownInput.value.match(/^#\s+(.+)$/m);
        if (headerMatch && headerMatch[1]) {
            title = headerMatch[1].trim();
        }
        
        try {
            // Create a new document in the iframe with the content
            const frameDoc = printFrame.contentDocument || printFrame.contentWindow.document;
            
            // Create the complete HTML document for printing
            frameDoc.open();
            frameDoc.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${title}</title>
                    <style>
                        @page {
                            margin: 1cm;
                        }
                        body {
                            font-family: 'Georgia', serif;
                            font-size: 12pt;
                            line-height: 1.6;
                            color: #000;
                            background-color: #fff;
                            margin: 0;
                            padding: 2cm;
                        }
                        h1, h2, h3, h4, h5, h6 {
                            font-family: 'Georgia', serif;
                            margin-top: 1.5em;
                            margin-bottom: 0.5em;
                            line-height: 1.2;
                            page-break-after: avoid;
                        }
                        h1 {
                            font-size: 24pt;
                            border-bottom: 1px solid #e0e0e0;
                            padding-bottom: 0.3em;
                        }
                        h2 {
                            font-size: 18pt;
                            border-bottom: 1px solid #e0e0e0;
                            padding-bottom: 0.3em;
                        }
                        p {
                            margin-bottom: 1rem;
                        }
                        a {
                            color: #3a5a78;
                            text-decoration: none;
                        }
                        code {
                            font-family: monospace;
                            background-color: #f5f5f5;
                            padding: 0.2em 0.4em;
                            border-radius: 3px;
                        }
                        pre {
                            background-color: #f5f5f5;
                            padding: 1rem;
                            border-radius: 4px;
                            overflow-x: auto;
                            margin-bottom: 1rem;
                            page-break-inside: avoid;
                            white-space: pre-wrap;
                        }
                        blockquote {
                            border-left: 4px solid #3a5a78;
                            padding-left: 1rem;
                            margin-left: 0;
                            color: #555;
                            page-break-inside: avoid;
                        }
                        table {
                            border-collapse: collapse;
                            width: 100%;
                            margin-bottom: 1rem;
                            page-break-inside: avoid;
                        }
                        th, td {
                            padding: 0.5rem;
                            border: 1px solid #e0e0e0;
                        }
                        img {
                            max-width: 100%;
                            page-break-inside: avoid;
                        }
                        ul, ol {
                            margin-bottom: 1rem;
                            padding-left: 2rem;
                        }
                    </style>
                </head>
                <body>
                    <div class="print-document">
                        ${content}
                    </div>
                </body>
                </html>
            `);
            frameDoc.close();

            // Wait for the content to load properly
            printBtn.disabled = true;
            printBtn.textContent = 'Preparing...';
            
            // Use a timeout to ensure content is fully loaded
            setTimeout(() => {
                try {
                    // Focus on the iframe
                    printFrame.contentWindow.focus();
                    // Call the print function on the iframe
                    printFrame.contentWindow.print();
                    
                    // Reset the button after printing
                    printBtn.textContent = 'Print';
                    printBtn.disabled = false;
                } catch (e) {
                    console.error('Printing error:', e);
                    alert('There was an error opening the print dialog. Please try again.');
                    printBtn.textContent = 'Print';
                    printBtn.disabled = false;
                }
            }, 500);
            
        } catch (e) {
            console.error('Error preparing print document:', e);
            alert('There was an error preparing your document for printing. Please try again.');
            printBtn.textContent = 'Print';
            printBtn.disabled = false;
        }
    }
    
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

This is a simple, browser-based Markdown to printable document converter.

## How to use

1. Write or paste your Markdown content in this editor
2. Click "Preview" to see how it will look
3. Click "Print" to open your browser's print dialog

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