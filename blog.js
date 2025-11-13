// Blog Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadBlogPosts();
    setupNewsletterForm();
});

async function loadBlogPosts() {
    let blogPosts = [];
    
    // Try to load from GitHub JSON file first
    try {
        const response = await fetch('./posts.json');
        if (response.ok) {
            blogPosts = await response.json();
        } else {
            // Fallback to localStorage
            blogPosts = JSON.parse(localStorage.getItem('publicBlogPosts')) || [];
        }
    } catch (error) {
        console.error('Error loading posts:', error);
        // Fallback to localStorage
        blogPosts = JSON.parse(localStorage.getItem('publicBlogPosts')) || [];
    }
    
    const blogContainer = document.getElementById('blogPosts');
    const noPostsDiv = document.getElementById('noPosts');
    
    if (blogPosts.length === 0) {
        blogContainer.style.display = 'none';
        noPostsDiv.style.display = 'block';
        return;
    }
    
    blogContainer.style.display = 'grid';
    noPostsDiv.style.display = 'none';
    
    const postsHTML = blogPosts.map(post => `
        <article class="blog-post-card">
            <div class="blog-post-image">
                ${post.image ? 
                    `<img src="${post.image}" alt="${post.title}" onerror="this.parentElement.innerHTML='<span>Wellness & Healing</span>'">`
                    : '<span>Wellness & Healing</span>'
                }
            </div>
            <div class="blog-post-content">
                <div class="blog-post-date">${formatDate(post.date)}</div>
                <h2 class="blog-post-title">${post.title}</h2>
                <p class="blog-post-excerpt">${post.excerpt}</p>
                <a href="#" class="read-more-btn" onclick="openBlogModal(${post.id})">Read More</a>
            </div>
        </article>
    `).join('');
    
    blogContainer.innerHTML = postsHTML;
}

function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-GB', options);
}

async function openBlogModal(postId) {
    let blogPosts = [];
    
    // Load posts from GitHub JSON file
    try {
        const response = await fetch('./posts.json');
        if (response.ok) {
            blogPosts = await response.json();
        } else {
            blogPosts = JSON.parse(localStorage.getItem('publicBlogPosts')) || [];
        }
    } catch (error) {
        blogPosts = JSON.parse(localStorage.getItem('publicBlogPosts')) || [];
    }
    
    const post = blogPosts.find(p => p.id === postId);
    
    if (!post) return;
    
    // Create modal if it doesn't exist
    let modal = document.getElementById('blogModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'blogModal';
        modal.className = 'blog-modal';
        document.body.appendChild(modal);
    }
    
    // Set modal content
    modal.innerHTML = `
        <div class="blog-modal-content">
            <div class="blog-modal-header">
                <button class="close-modal" onclick="closeBlogModal()">&times;</button>
                <h2>${post.title}</h2>
                <div class="blog-modal-date">${formatDate(post.date)}</div>
            </div>
            <div class="blog-modal-body">
                ${post.image ? `<img src="${post.image}" alt="${post.title}" style="width: 100%; margin-bottom: 2rem; border-radius: 10px;">` : ''}
                <div class="blog-modal-text">
                    ${formatBlogContent(post.content)}
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeBlogModal() {
    const modal = document.getElementById('blogModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function formatBlogContent(content) {
    // Convert line breaks to paragraphs
    return content
        .split('\n\n')
        .filter(paragraph => paragraph.trim())
        .map(paragraph => `<p>${paragraph.trim()}</p>`)
        .join('');
}

function setupNewsletterForm() {
    const form = document.querySelector('.newsletter-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = this.querySelector('input[type="email"]').value;
            
            // In a real implementation, you would send this to your email service
            alert('Thank you for subscribing! You\'ll receive wellness tips and healing insights from Jane.');
            
            // Clear the form
            this.querySelector('input[type="email"]').value = '';
        });
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('blogModal');
    if (modal && e.target === modal) {
        closeBlogModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeBlogModal();
    }
});