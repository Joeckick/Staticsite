const fs = require('fs-extra');
const path = require('path');
const marked = require('marked');
const frontMatter = require('front-matter');

// Configure marked for security
const markdown = new marked.Marked({
    headerIds: false,
    mangle: false
});

// Ensure build directory exists
fs.ensureDirSync('dist');
fs.ensureDirSync('dist/blog');
fs.ensureDirSync('dist/css');
fs.ensureDirSync('dist/js');

// Copy static assets
fs.copySync('src', 'dist', {
    filter: (src) => {
        return !src.includes('/content/');
    }
});

// Create HTML template
const createHTML = (content, metadata = {}) => {
    const title = metadata.title || 'Your Website';
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <header>
        <nav>
            <a href="/" class="logo">Your Site</a>
            <div class="nav-links">
                <a href="/">Home</a>
                <a href="/blog">Blog</a>
                <a href="/about">About</a>
                <a href="/faq">FAQ</a>
            </div>
        </nav>
    </header>

    <main>
        <article class="content">
            ${content}
        </article>
    </main>

    <footer>
        <p>&copy; 2024 Your Website. All rights reserved.</p>
    </footer>

    <script src="/js/main.js"></script>
</body>
</html>`;
};

// Process Markdown files
const processMarkdown = async (sourcePath, targetPath) => {
    const files = await fs.readdir(sourcePath);
    
    for (const file of files) {
        if (path.extname(file) === '.md') {
            const content = await fs.readFile(path.join(sourcePath, file), 'utf-8');
            const { attributes, body } = frontMatter(content);
            const htmlContent = markdown.parse(body);
            const fullHTML = createHTML(htmlContent, attributes);
            
            const targetFile = path.join(
                targetPath,
                file.replace('.md', '.html')
            );
            
            await fs.outputFile(targetFile, fullHTML);
        }
    }
};

// Build process
async function build() {
    try {
        // Process blog posts
        if (fs.existsSync('src/content/blog')) {
            await processMarkdown('src/content/blog', 'dist/blog');
        }

        // Process pages
        if (fs.existsSync('src/content/pages')) {
            await processMarkdown('src/content/pages', 'dist');
        }

        console.log('Build completed successfully!');
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

build(); 