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

// Copy static assets
fs.copySync('src', 'dist', {
    filter: (src) => {
        return !src.includes('/content/') && !src.includes('/templates/');
    }
});

// Load templates
const loadTemplate = (templatePath) => {
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    return Handlebars.compile(templateContent);
};

// Process Markdown files
const processMarkdown = async (sourcePath, targetPath, templateName) => {
    const files = await fs.readdir(sourcePath);
    const template = loadTemplate(`src/templates/${templateName}`);
    
    for (const file of files) {
        if (path.extname(file) === '.md') {
            const content = await fs.readFile(path.join(sourcePath, file), 'utf-8');
            const { attributes, body } = frontMatter(content);
            const htmlContent = markdown.parse(body);
            
            const templateData = {
                ...attributes,
                content: htmlContent
            };
            
            const fullHTML = template(templateData);
            
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
            await processMarkdown('src/content/blog', 'dist/blog', 'blog-post.html');
        }

        // Process pages
        if (fs.existsSync('src/content/pages')) {
            await processMarkdown('src/content/pages', 'dist', 'page.html');
        }

        console.log('Build completed successfully!');
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

build(); 