import { useState, useEffect, useRef } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const RedirectPage = () => {
  const [match, params] = useRoute("/m/:id");
  const [countdown, setCountdown] = useState(10); // Changed to 10 seconds
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showContinueSection, setShowContinueSection] = useState(false);
  const viewsUpdated = useRef(false); // Prevent multiple view updates

  const id = params?.id;

  // Fetch movie link from API
  const { data: movieLink, isLoading } = useQuery({
    queryKey: ["/api/movie-links/", id],
    enabled: !!id,
  }) as { data: any, isLoading: boolean };

  // Update views mutation
  const updateViewsMutation = useMutation({
    mutationFn: async (shortId: string) => {
      return apiRequest(`/api/movie-links/${shortId}/views`, {
        method: "PATCH",
      });
    },
  });

  useEffect(() => {
    if (movieLink && !viewsUpdated.current) {
      // Update view count only once when component loads
      viewsUpdated.current = true;
      updateViewsMutation.mutate(movieLink.shortId);

      // If ads are disabled, redirect immediately
      if (!movieLink.adsEnabled) {
        window.location.href = movieLink.originalLink;
        return;
      }
    }
  }, [movieLink]);

  // Timer countdown effect
  useEffect(() => {
    if (!movieLink?.adsEnabled) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Timer finished - show scroll button and continue section
      setShowScrollButton(true);
      setShowContinueSection(true);
    }
  }, [countdown, movieLink?.adsEnabled]);

  const handleContinue = () => {
    if (movieLink) {
      window.location.href = movieLink.originalLink;
    }
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

  if (!movieLink) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: '15px', padding: '40px', textAlign: 'center', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '15px', color: '#333' }}>Link Not Found</h1>
          <p style={{ color: '#666', fontSize: '1rem', marginBottom: '25px' }}>The requested link could not be found or has expired.</p>
        </div>
      </div>
    );
  }

  // If ads are disabled, show loading message while redirecting
  if (!movieLink.adsEnabled) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: '15px', padding: '40px', textAlign: 'center', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '15px', color: '#333' }}>Redirecting...</h1>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>
            You will be redirected to {movieLink.movieName} shortly.
          </p>
        </div>
      </div>
    );
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
            🎬 {movieLink.movieName}
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
              <p style={{ color: 'white', fontSize: '1.2em', fontWeight: 'bold', marginBottom: '25px', opacity: '1', display: 'block', textAlign: 'center', textShadow: '0 2px 4px rgba(0,0,0,0.3)', margin: '0 0 25px 0' }}>
                <span style={{ fontSize: '1.2em', marginRight: '8px' }}>👇</span>
                Click here to get your movie
                <span style={{ fontSize: '1.2em', marginLeft: '8px' }}>👇</span>
              </p>
              <button 
                onClick={handleContinue}
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