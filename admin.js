// Admin Panel JavaScript

// Simple authentication (in production, use proper backend authentication)
const ADMIN_CREDENTIALS = {
    username: 'jane',
    password: 'jane'
};

// Blog posts storage - loaded from GitHub JSON file
let blogPosts = [];

// Load posts from GitHub JSON file
async function loadPostsFromGitHub() {
    try {
        const response = await fetch('./posts.json');
        if (response.ok) {
            const posts = await response.json();
            blogPosts = posts;
        } else {
            console.error('Failed to load posts from GitHub');
            // Fallback to localStorage if JSON file fails
            blogPosts = JSON.parse(localStorage.getItem('blogPosts')) || [];
        }
    } catch (error) {
        console.error('Error loading posts:', error);
        // Fallback to localStorage
        blogPosts = JSON.parse(localStorage.getItem('blogPosts')) || [];
    }
}

// Authentication functions
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    
    console.log('Login attempt:', username, password);
    console.log('Expected:', ADMIN_CREDENTIALS.username, ADMIN_CREDENTIALS.password);
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password || 
        (username === 'jane' && password === 'jane')) {
        // Store login session
        sessionStorage.setItem('adminLoggedIn', 'true');
        
        // Hide login form and show dashboard
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        
        // Load blog posts from GitHub
        await loadPostsFromGitHub();
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
async function checkAuthStatus() {
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        await loadPostsFromGitHub();
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
    
    // Load analytics if analytics tab is selected
    if (tabName === 'analytics') {
        loadAnalytics();
    }
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

// Export posts to JSON format for updating GitHub file
function exportPostsToJSON() {
    const jsonContent = JSON.stringify(blogPosts, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'posts.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showMessage('Posts exported! Replace the posts.json file in your repository with the downloaded file, then commit and push to sync across all devices.', 'success');
}

// Show export instructions
function showSyncInstructions() {
    const instructions = `
To sync your blog posts across all devices:

1. Click "Export Posts" to download the updated posts.json file
2. Replace the posts.json file in your repository with the downloaded file
3. Commit and push the changes to GitHub
4. Posts will now be synced across all devices!

This process ensures all your blog posts are backed up and accessible from any device.
    `;
    
    if (confirm(instructions + '\n\nWould you like to export the posts now?')) {
        exportPostsToJSON();
    }
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
document.addEventListener('DOMContentLoaded', async function() {
    await loadPostsFromGitHub();
    checkAuthStatus();
});

// Analytics functions
function getVisitorStats() {
    const visits = JSON.parse(localStorage.getItem('siteVisits') || '[]');
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const stats = {
        allTime: visits.length,
        thisMonth: 0,
        thisWeek: 0,
        today: 0,
        recentVisits: []
    };
    
    visits.forEach(visit => {
        const visitDate = new Date(visit.timestamp);
        
        if (visitDate >= today) {
            stats.today++;
        }
        
        if (visitDate >= thisWeekStart) {
            stats.thisWeek++;
        }
        
        if (visitDate >= thisMonthStart) {
            stats.thisMonth++;
        }
    });
    
    // Get recent visits for detailed view
    stats.recentVisits = visits.slice(-10).reverse().map(visit => ({
        date: new Date(visit.timestamp).toLocaleDateString('en-GB'),
        time: new Date(visit.timestamp).toLocaleTimeString('en-GB'),
        browser: getBrowserName(visit.userAgent)
    }));
    
    return stats;
}

function getBrowserName(userAgent) {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
}

function loadAnalytics() {
    const stats = getVisitorStats();
    
    document.getElementById('todayCount').textContent = stats.today;
    document.getElementById('weekCount').textContent = stats.thisWeek;
    document.getElementById('monthCount').textContent = stats.thisMonth;
    document.getElementById('allTimeCount').textContent = stats.allTime;
    
    // Load recent visits table
    const recentVisitsTable = document.getElementById('recentVisitsTable');
    if (stats.recentVisits.length === 0) {
        recentVisitsTable.innerHTML = '<tr><td colspan="3">No recent visits recorded</td></tr>';
    } else {
        recentVisitsTable.innerHTML = stats.recentVisits.map(visit => `
            <tr>
                <td>${visit.date}</td>
                <td>${visit.time}</td>
                <td>${visit.browser}</td>
            </tr>
        `).join('');
    }
    
    // Create simple daily chart for last 7 days
    createDailyChart(stats);
}

function createDailyChart(stats) {
    const visits = JSON.parse(localStorage.getItem('siteVisits') || '[]');
    const chartContainer = document.getElementById('dailyChart');
    const dailyCounts = {};
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dailyCounts[dateStr] = 0;
    }
    
    // Count visits by day
    visits.forEach(visit => {
        const visitDate = new Date(visit.timestamp).toISOString().split('T')[0];
        if (dailyCounts.hasOwnProperty(visitDate)) {
            dailyCounts[visitDate]++;
        }
    });
    
    // Create simple bar chart
    const maxCount = Math.max(...Object.values(dailyCounts), 1);
    const chartHTML = Object.entries(dailyCounts).map(([date, count]) => {
        const height = (count / maxCount) * 100;
        const dayName = new Date(date).toLocaleDateString('en-GB', { weekday: 'short' });
        return `
            <div class="chart-bar">
                <div class="bar" style="height: ${height}%"></div>
                <div class="bar-label">${dayName}</div>
                <div class="bar-count">${count}</div>
            </div>
        `;
    }).join('');
    
    chartContainer.innerHTML = chartHTML;
}

// Export blog posts for main site
window.getBlogPosts = function() {
    return JSON.parse(localStorage.getItem('publicBlogPosts')) || [];
};