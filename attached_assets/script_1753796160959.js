// MovieZone Redirect Page JavaScript
let countdown = 15; // 15 seconds timer
let timerInterval;
let movieId = '';
let movieQuality = '';
let secureToken = '';
let userId = '0';

// Initialize Telegram WebApp
if (window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
}

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    startTimer();
});

function initializePage() {
    try {
        // Get movie ID, quality, token and user ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const movieIdParam = urlParams.get('id');
        secureToken = urlParams.get('token') || '';
        userId = urlParams.get('uid') || '0';

        if (movieIdParam && secureToken) {
            const parts = movieIdParam.split('_');
            if (parts.length >= 2) {
                movieId = parts.slice(0, -1).join('_');
                movieQuality = parts[parts.length - 1];
                console.log('Movie ID:', movieId, 'Quality:', movieQuality, 'Token:', secureToken);
            } else {
                movieId = movieIdParam;
                movieQuality = 'unknown';
                console.log('Using full param as Movie ID:', movieId);
            }
        } else if (!secureToken) {
            // No secure token - this is invalid access
            showErrorAndRedirect('Invalid access. Please get a new download link from the bot.');
            return;
        } else {
            // Set default values if no ID provided (for testing)
            movieId = 'test_movie';
            movieQuality = '720p';
            console.log('No movie ID found, using defaults');
        }

        // Validate token with server
        validateTokenWithServer();

        // Set up event listeners
        setupEventListeners();

    } catch (error) {
        console.error('Error initializing page:', error);
        showErrorAndRedirect('Error loading page. Please try again.');
    }
}

function validateTokenWithServer() {
    """Validate token with server before allowing ad viewing"""
    if (!secureToken || !movieId || !movieQuality) {
        showErrorAndRedirect('Missing required parameters.');
        return;
    }

    // Send validation request to server
    fetch(`/validate_token?token=${secureToken}&movie_id=${movieId}&quality=${movieQuality}&user_id=${userId}`)
        .then(response => response.json())
        .then(data => {
            if (!data.valid) {
                showErrorAndRedirect('Invalid or expired download link. Please get a new link from the bot.');
            }
        })
        .catch(error => {
            console.error('Token validation error:', error);
            showErrorAndRedirect('Unable to verify download link. Please try again.');
        });
}

function showErrorAndRedirect(message) {
    """Show error message and redirect back to bot"""
    const botUsername = 'MovieZone969Bot';
    const errorHtml = `
        <div style="text-align: center; padding: 50px;">
            <h2 style="color: #dc3545;">❌ Error</h2>
            <p style="font-size: 1.2rem; margin: 20px 0;">${message}</p>
            <a href="https://t.me/${botUsername}" style="
                display: inline-block;
                background: #007bff;
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 25px;
                font-weight: bold;
                margin-top: 20px;
            ">🔙 Return to Bot</a>
        </div>
    `;
    
    document.body.innerHTML = errorHtml;
}

function setupEventListeners() {
    // Continue button click handler
    const continueBtn = document.getElementById('continueBtn');
    if (continueBtn) {
        continueBtn.addEventListener('click', function() {
            handleContinueToBot();
        });
    }

    // Scroll to bottom button click handler
    const scrollBtn = document.getElementById('scrollToBottomBtn');
    if (scrollBtn) {
        scrollBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Scroll button clicked - starting smooth scroll');
            
            // Change button text to show it's working
            const btnText = scrollBtn.querySelector('.btn-text');
            if (btnText) {
                const originalText = btnText.textContent;
                btnText.textContent = 'Scrolling...';
                
                setTimeout(() => {
                    btnText.textContent = originalText;
                }, 1500);
            }
            
            smoothScrollToBottom();
        });
    }
}

function startTimer() {
    const timerText = document.getElementById('timerText');
    const timerSeconds = document.getElementById('timerSeconds');

    timerInterval = setInterval(function() {
        countdown--;

        if (timerText) timerText.textContent = countdown;
        if (timerSeconds) timerSeconds.textContent = countdown;

        if (countdown <= 0) {
            clearInterval(timerInterval);
            showScrollButtonAndContinue();
        }
    }, 1000);
}

function showScrollButtonAndContinue() {
    // Mark ad as viewed with server
    markAdAsViewed();

    // Hide timer section
    const timerSection = document.getElementById('timerSection');
    if (timerSection) {
        timerSection.style.display = 'none';
    }

    // Show scroll to bottom button
    const scrollButtonContainer = document.getElementById('scrollButtonContainer');
    if (scrollButtonContainer) {
        scrollButtonContainer.style.display = 'block';
    }

    // Show continue button at bottom (but disabled initially)
    const downloadSection = document.getElementById('downloadSection');
    if (downloadSection) {
        downloadSection.style.display = 'block';
    }
    
    // Enable continue button after 10 seconds (anti-cheat buffer)
    const continueBtn = document.getElementById('continueBtn');
    if (continueBtn) {
        continueBtn.disabled = true;
        continueBtn.textContent = 'Please wait... (10s)';
        
        let buffer = 10;
        const bufferInterval = setInterval(() => {
            buffer--;
            continueBtn.textContent = `Please wait... (${buffer}s)`;
            
            if (buffer <= 0) {
                clearInterval(bufferInterval);
                continueBtn.disabled = false;
                continueBtn.textContent = 'Continue to Bot';
            }
        }, 1000);
    }
}

function markAdAsViewed() {
    """Mark ad as viewed on server"""
    try {
        fetch(`/mark_ad_viewed?token=${secureToken}&movie_id=${movieId}&quality=${movieQuality}&user_id=${userId}`, {
            method: 'POST'
        }).catch(error => {
            console.error('Failed to mark ad as viewed:', error);
        });
    } catch (error) {
        console.error('Error marking ad as viewed:', error);
    }
}

function smoothScrollToBottom() {
    console.log('Starting smooth scroll function');
    
    // First try to find the download section (if it's visible)
    const downloadSection = document.getElementById('downloadSection');
    if (downloadSection && downloadSection.style.display !== 'none') {
        console.log('Download section found and visible, scrolling to it');
        downloadSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
        return;
    }
    
    // Fallback: scroll to bottom of page with custom animation
    console.log('Scrolling to bottom of page');
    
    const startY = window.pageYOffset || document.documentElement.scrollTop;
    const targetY = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
    ) - window.innerHeight;
    
    const distance = targetY - startY;
    const duration = 8000; // 8 seconds for slower, smoother feel
    let startTime = null;
    
    function step(currentTime) {
        if (!startTime) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        
        // Ease-in-out function for natural feel
        const ease = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        const currentY = startY + (distance * ease);
        window.scrollTo(0, currentY);
        
        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            console.log('Smooth scroll completed');
        }
    }
    
    requestAnimationFrame(step);
}

function handleContinueToBot() {
    try {
        if (!movieId || !movieQuality || !secureToken) {
            alert('Error: Missing required information. Please get a new download link.');
            return;
        }

        // Create secure return URL for Telegram bot
        const botUsername = 'MovieZone969Bot'; // Replace with your actual bot username
        const returnUrl = `https://t.me/${botUsername}?start=${movieId}_${movieQuality}_${secureToken}`;

        // Notify user
        const continueBtn = document.getElementById('continueBtn');
        if (continueBtn) {
            continueBtn.textContent = 'Returning to bot...';
            continueBtn.disabled = true;
        }

        // Return to bot
        if (window.Telegram && window.Telegram.WebApp) {
            // If in Telegram WebApp, close the WebApp
            window.Telegram.WebApp.close();
        } else {
            // If not in Telegram, open bot in new tab
            window.open(returnUrl, '_blank');
        }

        // Show success message
        setTimeout(() => {
            if (continueBtn) {
                continueBtn.textContent = 'Returned to Bot!';
            }
        }, 1000);

    } catch (error) {
        console.error('Continue error:', error);
        alert('Error returning to bot. Please try again.');

        const continueBtn = document.getElementById('continueBtn');
        if (continueBtn) {
            continueBtn.textContent = 'Continue to Bot';
            continueBtn.disabled = false;
        }
    }
}

// Track view when page loads
function trackView() {
    try {
        if (movieId && movieQuality) {
            fetch(`/track_view?movie_id=${movieId}&quality=${movieQuality}&user_id=0`, {
                method: 'GET'
            }).catch(error => {
                console.error('Failed to track view:', error);
            });
        }
    } catch (error) {
        console.error('Error tracking view:', error);
    }
}

// Track when user completes viewing the ad
function trackAdCompletion() {
    try {
        if (movieId && movieQuality) {
            fetch(`/track_ad_completion?movie_id=${movieId}&quality=${movieQuality}&user_id=0`, {
                method: 'GET'
            }).catch(error => {
                console.error('Failed to track ad completion:', error);
            });
        }
    } catch (error) {
        console.error('Error tracking ad completion:', error);
    }
}

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Page is hidden, pause timer if needed
        if (timerInterval && countdown > 0) {
            clearInterval(timerInterval);
        }
    } else {
        // Page is visible again, resume timer if needed
        if (countdown > 0 && !timerInterval) {
            startTimer();
        }
    }
});

// Handle errors gracefully
window.addEventListener('error', function(e) {
    console.error('Page error:', e.error);
});

// Track view when page loads
window.addEventListener('load', function() {
    trackView();
});