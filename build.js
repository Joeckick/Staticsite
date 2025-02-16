const fs = require('fs-extra');
const path = require('path');
const marked = require('marked');
const frontMatter = require('front-matter');
const Handlebars = require('handlebars');

// Configure marked for security
const markdown = new marked.Marked({
    headerIds: false,
    mangle: false
});

// Register Handlebars helpers
Handlebars.registerHelper('formatDate', function(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});

// Ensure build directory exists
fs.ensureDirSync('dist');
fs.ensureDirSync('dist/blog');
fs.ensureDirSync('dist/css');
fs.ensureDirSync('dist/js');
fs.ensureDirSync('dist/images');

// Copy static assets
fs.copySync('src', 'dist', {
    filter: (src) => {
        // Don't copy content or template directories, but do copy index.html
        const isContent = src.includes('/content/');
        const isTemplate = src.includes('/templates/');
        const isIndex = src.endsWith('index.html');
        return (!isContent && !isTemplate) || isIndex;
    }
});

// Load templates
const loadTemplate = (templatePath) => {
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    return Handlebars.compile(templateContent);
};

// Extract excerpt from markdown content
const extractExcerpt = (content, length = 160) => {
    // Remove HTML tags and get plain text
    const text = content.replace(/<[^>]*>/g, '');
    // Get first few characters
    return text.slice(0, length).trim() + (text.length > length ? '...' : '');
};

// Process blog posts and return metadata for index
const processBlogPosts = async () => {
    const posts = [];
    const blogDir = 'src/content/blog';
    
    if (fs.existsSync(blogDir)) {
        const files = await fs.readdir(blogDir);
        const template = loadTemplate('src/templates/blog-post.html');
        
        for (const file of files) {
            if (path.extname(file) === '.md') {
                const content = await fs.readFile(path.join(blogDir, file), 'utf-8');
                const { attributes, body } = frontMatter(content);
                const htmlContent = markdown.parse(body);
                
                // Generate the blog post HTML
                const fullHTML = template({
                    ...attributes,
                    content: htmlContent
                });
                
                // Save the blog post
                const slug = path.basename(file, '.md');
                await fs.outputFile(
                    path.join('dist/blog', `${slug}.html`),
                    fullHTML
                );
                
                // Add to posts array for index page
                posts.push({
                    ...attributes,
                    slug,
                    excerpt: attributes.excerpt || extractExcerpt(htmlContent)
                });
            }
        }
    }
    
    // Sort posts by date, newest first
    return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
};

// Process regular pages
const processPages = async () => {
    const pagesDir = 'src/content/pages';
    if (fs.existsSync(pagesDir)) {
        const files = await fs.readdir(pagesDir);
        const template = loadTemplate('src/templates/page.html');
        
        for (const file of files) {
            if (path.extname(file) === '.md') {
                const content = await fs.readFile(path.join(pagesDir, file), 'utf-8');
                const { attributes, body } = frontMatter(content);
                const htmlContent = markdown.parse(body);
                
                const fullHTML = template({
                    ...attributes,
                    content: htmlContent
                });
                
                const targetFile = path.join(
                    'dist',
                    file.replace('.md', '.html')
                );
                
                await fs.outputFile(targetFile, fullHTML);
            }
        }
    }
};

// Build process
async function build() {
    try {
        // Process blog posts and get metadata
        const posts = await processBlogPosts();
        
        // Generate blog index
        if (posts.length > 0) {
            const indexTemplate = loadTemplate('src/templates/blog-index.html');
            const indexHTML = indexTemplate({ posts });
            await fs.outputFile('dist/blog/index.html', indexHTML);
        }

        // Process pages
        await processPages();

        console.log('Build completed successfully!');
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

build(); 