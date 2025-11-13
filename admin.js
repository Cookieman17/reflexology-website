// Admin Panel JavaScript

// Simple authentication (in production, use proper backend authentication)
const ADMIN_CREDENTIALS = {
    username: 'jane',
    password: 'reflexology2025'
};

// Blog posts storage (in production, use a database)
let blogPosts = JSON.parse(localStorage.getItem('blogPosts')) || [
    {
        id: 1,
        title: "The Healing Power of Reflexology",
        excerpt: "Discover how reflexology can help restore balance and promote natural healing in your body.",
        content: "Reflexology is an ancient healing practice that applies pressure to specific points on the feet, hands, and ears. These points correspond to different organs and systems in the body...",
        image: "",
        date: "2025-11-01",
        published: true
    }
];

// Authentication functions
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        // Store login session
        sessionStorage.setItem('adminLoggedIn', 'true');
        
        // Hide login form and show dashboard
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        
        // Load blog posts
        loadBlogPosts();
        
        errorDiv.style.display = 'none';
    } else {
        errorDiv.textContent = 'Invalid username or password';
        errorDiv.style.display = 'block';
    }
}

function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('adminDashboard').style.display = 'none';
    
    // Clear form
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// Check if already logged in
function checkAuthStatus() {
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        loadBlogPosts();
    }
}

// Tab management
function showTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.style.display = 'none');
    
    // Remove active class from all buttons
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab
    document.getElementById(tabName + 'Tab').style.display = 'block';
    event.target.classList.add('active');
}

// Blog post management
function showNewPostForm() {
    document.getElementById('newPostForm').style.display = 'block';
}

function hideNewPostForm() {
    document.getElementById('newPostForm').style.display = 'none';
    // Clear form
    document.getElementById('postTitle').value = '';
    document.getElementById('postExcerpt').value = '';
    document.getElementById('postContent').value = '';
    document.getElementById('postImage').value = '';
}

function createBlogPost(event) {
    event.preventDefault();
    
    const title = document.getElementById('postTitle').value;
    const excerpt = document.getElementById('postExcerpt').value;
    const content = document.getElementById('postContent').value;
    const image = document.getElementById('postImage').value;
    
    const newPost = {
        id: Date.now(),
        title: title,
        excerpt: excerpt || title.substring(0, 100) + '...',
        content: content,
        image: image,
        date: new Date().toISOString().split('T')[0],
        published: true
    };
    
    blogPosts.unshift(newPost); // Add to beginning of array
    saveBlogPosts();
    loadBlogPosts();
    hideNewPostForm();
    
    // Show success message
    showMessage('Blog post created successfully!', 'success');
    
    // Update the main site's blog section
    updateMainSiteBlog();
}

function loadBlogPosts() {
    const postsContainer = document.getElementById('blogPostsList');
    
    if (blogPosts.length === 0) {
        postsContainer.innerHTML = '<p>No blog posts yet. Create your first post!</p>';
        return;
    }
    
    const postsHTML = blogPosts.map(post => `
        <div class="blog-post-item">
            <div class="blog-post-info">
                <h4>${post.title}</h4>
                <p>Published on ${formatDate(post.date)}</p>
            </div>
            <div class="blog-post-actions">
                <button class="edit-btn" onclick="editPost(${post.id})">Edit</button>
                <button class="delete-btn" onclick="deletePost(${post.id})">Delete</button>
            </div>
        </div>
    `).join('');
    
    postsContainer.innerHTML = postsHTML;
}

function deletePost(postId) {
    if (confirm('Are you sure you want to delete this post?')) {
        blogPosts = blogPosts.filter(post => post.id !== postId);
        saveBlogPosts();
        loadBlogPosts();
        updateMainSiteBlog();
        showMessage('Post deleted successfully!', 'success');
    }
}

function editPost(postId) {
    const post = blogPosts.find(p => p.id === postId);
    if (post) {
        document.getElementById('postTitle').value = post.title;
        document.getElementById('postExcerpt').value = post.excerpt;
        document.getElementById('postContent').value = post.content;
        document.getElementById('postImage').value = post.image || '';
        
        // Remove the old post
        blogPosts = blogPosts.filter(p => p.id !== postId);
        
        showNewPostForm();
    }
}

function saveBlogPosts() {
    localStorage.setItem('blogPosts', JSON.stringify(blogPosts));
}

function updateMainSiteBlog() {
    // This would typically update the main site's blog section
    // For now, we'll store the posts in localStorage for the main site to read
    localStorage.setItem('publicBlogPosts', JSON.stringify(blogPosts.filter(post => post.published)));
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
}

function showMessage(message, type) {
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    
    // Insert at top of dashboard
    const dashboard = document.getElementById('adminDashboard');
    dashboard.insertBefore(messageDiv, dashboard.firstChild);
    
    // Remove after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
});

// Export blog posts for main site
window.getBlogPosts = function() {
    return JSON.parse(localStorage.getItem('publicBlogPosts')) || [];
};