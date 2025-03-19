document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const themeSwitch = document.getElementById('theme-switch');
    const markdownInput = document.getElementById('markdown-input');
    const previewBtn = document.getElementById('preview-btn');
    const printBtn = document.getElementById('print-btn');
    const previewContainer = document.getElementById('preview-container');
    const markdownPreview = document.getElementById('markdown-preview');
    const printContainer = document.getElementById('print-container');
    
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
        
        // Prepare print container with the content
        printContainer.innerHTML = content;
        
        // Add a small delay to ensure content is fully rendered
        setTimeout(() => {
            // Trigger the print dialog
            window.print();
        }, 200);
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