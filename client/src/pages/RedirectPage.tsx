import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const RedirectPage = () => {
  const [location] = useLocation();
  const [countdown, setCountdown] = useState(10); // Changed to 10 seconds
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showContinueSection, setShowContinueSection] = useState(false);
  const [movieData, setMovieData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const viewsUpdated = useRef(false); // Prevent multiple view updates

  // Update views mutations for both link types
  const updateSingleViewsMutation = useMutation({
    mutationFn: async (shortId: string) => {
      return apiRequest(`/api/movie-links/${shortId}/views`, {
        method: "PATCH",
      });
    },
  });

  const updateQualityViewsMutation = useMutation({
    mutationFn: async (shortId: string) => {
      return apiRequest(`/api/quality-movie-links/${shortId}/views`, {
        method: "PATCH",
      });
    },
  });

  // Record ad view mutation (called when timer completes)
  const recordAdViewMutation = useMutation({
    mutationFn: async (data: { shortId: string; linkType: string }) => {
      return apiRequest(`/api/record-ad-view`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  });

  useEffect(() => {
    // Parse URL parameters to get movie data
    const urlParams = new URLSearchParams(window.location.search);
    const linkData = urlParams.get('link');
    const error = urlParams.get('error');

    if (error === 'expired') {
      setMovieData(null);
      setIsLoading(false);
      return;
    }

    if (linkData) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(linkData));
        setMovieData(parsedData);
        
        // Update view count only if user hasn't seen ad recently (IP-based duplicate protection)
        if (!viewsUpdated.current) {
          viewsUpdated.current = true;
          
          // Only update views if user hasn't seen this link recently (skipTimer = false means new view)
          if (!parsedData.skipTimer) {
            if (parsedData.linkType === "quality") {
              updateQualityViewsMutation.mutate(parsedData.shortId);
            } else {
              updateSingleViewsMutation.mutate(parsedData.shortId);
            }
          }

          // If ads are disabled OR user has already seen ad, skip timer
          if (!parsedData.adsEnabled || parsedData.skipTimer) {
            if (parsedData.linkType === "quality") {
              // For quality links without ads or with timer skip, show quality options
              setCountdown(0);
              setShowContinueSection(true);
              setIsLoading(false);
              return;
            } else {
              window.location.href = parsedData.originalLink;
              return;
            }
          }
        }
      } catch (error) {
        console.error("Error parsing link data:", error);
        setMovieData(null);
      }
    }
    setIsLoading(false);
  }, [location]);

  // Timer countdown effect
  useEffect(() => {
    if (!movieData?.adsEnabled || movieData?.skipTimer) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Timer finished - record ad view and show continue section
      recordAdViewMutation.mutate({ 
        shortId: movieData.shortId, 
        linkType: movieData.linkType || 'single' 
      });
      setShowScrollButton(true);
      setShowContinueSection(true);
    }
  }, [countdown, movieData?.adsEnabled, movieData?.skipTimer]);

  // Prevent scrolling during countdown
  useEffect(() => {
    if (movieData?.adsEnabled && !movieData?.skipTimer && countdown > 0) {
      // Disable scrolling
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      
      // Prevent scroll events
      const preventScroll = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      };
      
      const preventKeyboardScroll = (e: KeyboardEvent) => {
        if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) {
          e.preventDefault();
          return false;
        }
      };

      document.addEventListener('wheel', preventScroll, { passive: false });
      document.addEventListener('touchmove', preventScroll, { passive: false });
      document.addEventListener('keydown', preventKeyboardScroll, { passive: false });
      
      return () => {
        // Re-enable scrolling
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
        
        document.removeEventListener('wheel', preventScroll);
        document.removeEventListener('touchmove', preventScroll);
        document.removeEventListener('keydown', preventKeyboardScroll);
      };
    }
  }, [countdown, movieData?.adsEnabled, movieData?.skipTimer]);

  const handleContinue = (link: string) => {
    window.location.href = link;
  };

  const scrollToBottom = () => {
    const downloadSection = document.getElementById('downloadSection');
    if (downloadSection) {
      downloadSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: '15px', padding: '40px', textAlign: 'center', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '15px', color: '#333' }}>Loading...</h1>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>Fetching your link...</p>
        </div>
      </div>
    );
  }

  if (!movieData) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: '15px', padding: '40px', textAlign: 'center', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '15px', color: '#333' }}>Link Not Found</h1>
          <p style={{ color: '#666', fontSize: '1rem', marginBottom: '25px' }}>The requested link could not be found or has expired.</p>
        </div>
      </div>
    );
  }

  // If ads are disabled, show quality selection page or redirect immediately
  if (!movieData.adsEnabled) {
    if (movieData.linkType === "quality") {
      // Show no-ads quality selection page
      const availableQualities = Object.entries(movieData.qualityLinks || {})
        .filter(([_, url]) => url)
        .map(([quality, url]) => ({ quality: quality.replace('quality', '').replace('p', 'p'), url: url as string }));

      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: '15px', padding: '40px', textAlign: 'center', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)', maxWidth: '500px' }}>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#333' }}>{movieData.movieName}</h1>
            <p style={{ color: '#666', fontSize: '1rem', marginBottom: '30px' }}>Select quality to download:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {availableQualities.map(({ quality, url }, index) => (
                <button
                  key={index}
                  onClick={() => handleContinue(url)}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '15px 30px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.transform = 'scale(1)'}
                >
                  Continue ({quality})
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: '15px', padding: '40px', textAlign: 'center', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '15px', color: '#333' }}>Redirecting...</h1>
            <p style={{ color: '#666', fontSize: '1.1rem' }}>
              You will be redirected to {movieData.movieName} shortly.
            </p>
          </div>
        </div>
      );
    }
  }

  return (
    <>
      <style>{`
        /* Smooth transitions for timer circle */
      `}</style>
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
        overflowX: 'hidden'
      }}>
      
      {/* Timer Section (Always visible at top when countdown > 0) */}
      {countdown > 0 && (
        <div style={{
          width: '100%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '30px 20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
        }}>
          {/* Movie name label */}
          <div style={{ 
            color: 'white', 
            fontSize: '1.1em', 
            marginBottom: '10px', 
            textAlign: 'center',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            fontWeight: '500'
          }}>
            Movie name
          </div>
          
          {/* Movie name */}
          <h2 style={{ 
            color: 'white', 
            fontSize: '1.3em', 
            marginBottom: '30px', 
            textAlign: 'center',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            margin: '0 0 30px 0'
          }}>
            🎬 {movieData.movieName}
          </h2>
          
          <div style={{
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: '#e0e0e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            marginBottom: '30px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
          }}>
            {/* Progress Circle */}
            <svg 
              width="150" 
              height="150" 
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0,
                transform: 'rotate(-90deg)' 
              }}
            >
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4facfe" />
                  <stop offset="25%" stopColor="#00f2fe" />
                  <stop offset="50%" stopColor="#43e97b" />
                  <stop offset="75%" stopColor="#38f9d7" />
                  <stop offset="100%" stopColor="#4facfe" />
                </linearGradient>
              </defs>
              <circle
                cx="75"
                cy="75"
                r="65"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 65}`}
                strokeDashoffset={`${2 * Math.PI * 65 * (1 - countdown / 10)}`}
                style={{
                  transition: 'stroke-dashoffset 1s ease-in-out'
                }}
              />
            </svg>
            
            {/* Inner white circle with countdown number */}
            <div style={{
              width: '110px',
              height: '110px',
              borderRadius: '50%',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1)',
              position: 'relative',
              zIndex: 2
            }}>
              <div style={{
                fontSize: '2.8em',
                fontWeight: 'bold',
                color: '#333',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                {countdown}
              </div>
            </div>
          </div>
          
          <div style={{
            color: 'white',
            fontSize: '1.1em',
            textAlign: 'center',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            fontWeight: '500'
          }}>
            🎬 Your download is being prepared...
          </div>
        </div>
      )}

      {/* Scroll to Bottom Button (Hidden initially) */}
      {showScrollButton && (
        <div style={{
          textAlign: 'center',
          padding: '30px 20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          margin: '0'
        }}>
          <button 
            onClick={scrollToBottom}
            style={{
              background: 'linear-gradient(45deg, #28a745, #20c997)',
              color: 'white',
              border: 'none',
              padding: '18px 35px',
              fontSize: '1.1em',
              fontWeight: 'bold',
              borderRadius: '30px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 6px 20px rgba(40, 167, 69, 0.3)',
              width: '80%',
              maxWidth: '350px',
              margin: '0 auto',
              display: 'block'
            }}
          >
            <span style={{ fontSize: '1.1em', marginRight: '8px', display: 'inline-block' }}>⬇️</span>
            <span style={{ fontWeight: '600' }}>Scroll to Continue</span>
            <span style={{ fontSize: '1.1em', marginLeft: '8px', display: 'inline-block' }}>⬇️</span>
          </button>
        </div>
      )}

      {/* Main Content */}
      <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
        <header style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '30px 20px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.8em', marginBottom: '10px', textShadow: '0 2px 4px rgba(0,0,0,0.3)', margin: '0 0 10px 0' }}>
            🎬 MovieZone — Your One-Stop Movie Destination
          </h1>
          <p style={{ fontSize: '1em', opacity: '0.9', margin: '10px 0 0 0' }}>Welcome to your favorite movie world</p>
        </header>

        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>


          {/* Content Sections */}
          <div style={{ background: 'white', marginBottom: '20px', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderLeft: '4px solid #667eea' }}>
            <h2 style={{ color: '#333', marginBottom: '12px', fontSize: '1.1em', margin: '0 0 12px 0' }}>✅ Wide Range of Movie Categories</h2>
            <p style={{ color: '#666', lineHeight: '1.5', fontSize: '0.9em', margin: '0' }}>Bollywood, Hollywood, South Indian, Web Series, Bengali, Animation, Comedy, Action, Romance, Horror, Thriller, Sci-Fi, K-Drama, and 18+ content.</p>
          </div>

          <div style={{ background: 'white', marginBottom: '20px', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderLeft: '4px solid #667eea' }}>
            <h2 style={{ color: '#333', marginBottom: '12px', fontSize: '1.1em', margin: '0 0 12px 0' }}>✅ Multi-Language Movie Support</h2>
            <p style={{ color: '#666', lineHeight: '1.5', fontSize: '0.9em', margin: '0' }}>Bengali, Hindi, English, Tamil, Telugu, Gujarati — something for everyone!</p>
          </div>

          <div style={{ background: 'white', marginBottom: '20px', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderLeft: '4px solid #667eea' }}>
            <h2 style={{ color: '#333', marginBottom: '12px', fontSize: '1.1em', margin: '0 0 12px 0' }}>✅ Premium Download Experience</h2>
            <p style={{ color: '#666', lineHeight: '1.5', fontSize: '0.9em', margin: '0' }}>Descriptions, screenshots, cast information, and high-speed download links.</p>
          </div>

          <div style={{ background: 'white', marginBottom: '20px', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderLeft: '4px solid #667eea' }}>
            <h2 style={{ color: '#333', marginBottom: '12px', fontSize: '1.1em', margin: '0 0 12px 0' }}>✅ No Sign-Up Required</h2>
            <p style={{ color: '#666', lineHeight: '1.5', fontSize: '0.9em', margin: '0' }}>Open, browse, and download instantly.</p>
          </div>

          <div style={{ background: 'white', marginBottom: '20px', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderLeft: '4px solid #667eea' }}>
            <h2 style={{ color: '#333', marginBottom: '12px', fontSize: '1.1em', margin: '0 0 12px 0' }}>✅ Smart Movie Suggestions</h2>
            <p style={{ color: '#666', lineHeight: '1.5', fontSize: '0.9em', margin: '0' }}>Intelligent recommendations based on your interests.</p>
          </div>

          <div style={{ background: 'white', marginBottom: '20px', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderLeft: '4px solid #667eea' }}>
            <h2 style={{ color: '#333', marginBottom: '12px', fontSize: '1.1em', margin: '0 0 12px 0' }}>✅ Reward Video System</h2>
            <p style={{ color: '#666', lineHeight: '1.5', fontSize: '0.9em', margin: '0' }}>Unlock movies after a quick 10 second ad view.</p>
          </div>

          <div style={{ background: 'white', marginBottom: '20px', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderLeft: '4px solid #667eea' }}>
            <h2 style={{ color: '#333', marginBottom: '12px', fontSize: '1.1em', margin: '0 0 12px 0' }}>✅ Mobile-Optimized Interface</h2>
            <p style={{ color: '#666', lineHeight: '1.5', fontSize: '0.9em', margin: '0' }}>Fast, clean experience even on slow internet.</p>
          </div>

          <div style={{ background: 'white', marginBottom: '20px', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderLeft: '4px solid #667eea' }}>
            <h2 style={{ color: '#333', marginBottom: '12px', fontSize: '1.1em', margin: '0 0 12px 0' }}>✅ Regular Movie Updates</h2>
            <p style={{ color: '#666', lineHeight: '1.5', fontSize: '0.9em', margin: '0' }}>Fresh content added every week.</p>
          </div>

          <div style={{ background: 'white', marginBottom: '20px', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderLeft: '4px solid #667eea' }}>
            <h2 style={{ color: '#333', marginBottom: '12px', fontSize: '1.1em', margin: '0 0 12px 0' }}>✅ 100% Safe & Secure</h2>
            <p style={{ color: '#666', lineHeight: '1.5', fontSize: '0.9em', margin: '0' }}>No fake buttons, malware, or redirections.</p>
          </div>

          {/* Telegram Section */}
          <div style={{ background: 'linear-gradient(135deg, #0088cc, #0066aa)', color: 'white', borderLeft: '4px solid #0066aa', marginBottom: '20px', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: 'white', marginBottom: '12px', fontSize: '1.1em', margin: '0 0 12px 0' }}>✅ Join Our Telegram Channel</h2>
            <p style={{ color: 'rgba(255,255,255,0.9)', lineHeight: '1.5', fontSize: '0.9em', margin: '0' }}>
              👉 <a href="https://t.me/moviezone969" target="_blank" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold', background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '15px', display: 'inline-block', marginTop: '8px', fontSize: '0.9em' }}>t.me/moviezone969</a> — for instant updates.
            </p>
          </div>

          {/* Continue Button Section (Hidden initially) */}
          {showContinueSection && (
            <div id="downloadSection" style={{ background: 'linear-gradient(135deg, #28a745, #20c997)', color: 'white', textAlign: 'center', padding: '40px', margin: '30px 0', borderRadius: '12px', boxShadow: '0 8px 30px rgba(40, 167, 69, 0.3)' }}>
              <div style={{ fontSize: '4em', marginBottom: '20px', textAlign: 'center' }}>🎬</div>
              <h2 style={{ color: 'white', fontSize: '1.5em', fontWeight: 'bold', marginBottom: '25px', textAlign: 'center', textShadow: '0 2px 4px rgba(0,0,0,0.3)', margin: '0 0 25px 0' }}>
                {movieData.movieName}
              </h2>
              
              {movieData.linkType === "quality" ? (
                // Quality movie links - show multiple buttons
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
                  <p style={{ color: 'white', fontSize: '1.1em', marginBottom: '20px', textAlign: 'center', margin: '0 0 20px 0' }}>
                    Choose quality to download:
                  </p>
                  {Object.entries(movieData.qualityLinks || {})
                    .filter(([_, url]) => url)
                    .map(([quality, url], index) => (
                      <button 
                        key={index}
                        onClick={() => handleContinue(url as string)}
                        style={{
                          background: 'linear-gradient(45deg, #007bff, #0056b3)',
                          color: 'white',
                          border: 'none',
                          padding: '15px 30px',
                          fontSize: '1.1em',
                          fontWeight: 'bold',
                          borderRadius: '30px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                          minWidth: '200px'
                        }}
                      >
                        Continue ({quality.replace('quality', '').replace('p', 'p')})
                      </button>
                    ))}
                </div>
              ) : (
                // Single movie link - show single button
                <>
                  <p style={{ color: 'white', fontSize: '1.2em', fontWeight: 'bold', marginBottom: '25px', opacity: '1', display: 'block', textAlign: 'center', textShadow: '0 2px 4px rgba(0,0,0,0.3)', margin: '0 0 25px 0' }}>
                    <span style={{ fontSize: '1.2em', marginRight: '8px' }}>👇</span>
                    Click here to get your movie
                    <span style={{ fontSize: '1.2em', marginLeft: '8px' }}>👇</span>
                  </p>
                  <button 
                    onClick={() => handleContinue(movieData.originalLink)}
                    style={{
                      background: 'linear-gradient(45deg, #007bff, #0056b3)',
                      color: 'white',
                      border: 'none',
                      padding: '15px 30px',
                      fontSize: '1.1em',
                      fontWeight: 'bold',
                      borderRadius: '30px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                    }}
                  >
                    Continue
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <footer style={{ background: '#343a40', color: 'white', textAlign: 'center', padding: '30px 20px', marginTop: '50px' }}>
          <p style={{ margin: '0' }}>© 2025 Movie Zone | Enjoy your favorite movies</p>
        </footer>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .header h1 {
            font-size: 1.8em !important;
          }
        }
      `}</style>
    </div>
    </>
  );
};

export default RedirectPage;