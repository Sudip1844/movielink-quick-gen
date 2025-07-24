import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface MovieLink {
  id: string;
  movieName: string;
  originalLink: string;
  shortId: string;
  views: number;
  dateAdded: string;
  adsEnabled: boolean;
}

const RedirectPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  const [showScrollMessage, setShowScrollMessage] = useState(false);
  const [movieLink, setMovieLink] = useState<MovieLink | null>(null);

  useEffect(() => {
    // Load the specific link from localStorage
    const savedLinks = localStorage.getItem("moviezone_links");
    if (savedLinks) {
      const links: MovieLink[] = JSON.parse(savedLinks);
      const foundLink = links.find(link => link.shortId === id);
      
      if (foundLink) {
        setMovieLink(foundLink);
        
        // Update view count
        const updatedLinks = links.map(link => 
          link.shortId === id 
            ? { ...link, views: link.views + 1 }
            : link
        );
        localStorage.setItem("moviezone_links", JSON.stringify(updatedLinks));

        // If ads are disabled, redirect immediately
        if (!foundLink.adsEnabled) {
          window.location.href = foundLink.originalLink;
          return;
        }
      } else {
        // Link not found, redirect to home
        navigate("/");
        return;
      }
    } else {
      navigate("/");
      return;
    }
  }, [id, navigate]);

  useEffect(() => {
    if (!movieLink?.adsEnabled) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setShowScrollMessage(true);
    }
  }, [countdown, movieLink?.adsEnabled]);

  const handleContinue = () => {
    if (movieLink) {
      window.location.href = movieLink.originalLink;
    }
  };

  if (!movieLink) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Link Not Found</h1>
            <p className="text-muted-foreground mb-4">
              The requested link could not be found.
            </p>
            <Button onClick={() => navigate("/")}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If ads are disabled, show loading message while redirecting
  if (!movieLink.adsEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
            <p className="text-muted-foreground">
              You will be redirected to {movieLink.movieName} shortly.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-admin-header text-admin-header-foreground p-4 text-center">
        <h1 className="text-xl font-bold">MovieZone</h1>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        {/* Movie Info */}
        <Card className="mb-8">
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-2">{movieLink.movieName}</h2>
            <p className="text-muted-foreground">
              Preparing your download link...
            </p>
          </CardContent>
        </Card>

        {/* Timer Section */}
        <div className="text-center mb-8">
          {countdown > 0 ? (
            <div className="space-y-4">
              <div className="relative w-32 h-32 mx-auto">
                {/* Circular Progress */}
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 128 128">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (countdown / 10)}`}
                    className="text-primary transition-all duration-1000 ease-linear"
                    strokeLinecap="round"
                  />
                </svg>
                
                {/* Timer Number */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold text-primary">{countdown}</span>
                </div>
              </div>
              
              <p className="text-lg text-muted-foreground">
                Please wait while we prepare your link...
              </p>
            </div>
          ) : showScrollMessage ? (
            <div className="space-y-4">
              <div className="text-xl font-semibold text-primary">
                ↓ Scroll to Bottom ↓
              </div>
              <p className="text-muted-foreground">
                Scroll down to access your download link
              </p>
            </div>
          ) : null}
        </div>

        {/* Large spacing area when countdown is done */}
        {showScrollMessage && (
          <>
            {/* This creates the 60-70cm space you requested */}
            <div style={{ height: "60vh" }} className="flex items-center justify-center">
              <div className="text-center space-y-4 text-muted-foreground">
                <div className="text-lg">Advertisement Space</div>
                <div className="text-sm">
                  This area can be used for ads or other content
                </div>
              </div>
            </div>

            {/* Continue Button at the bottom */}
            <div className="text-center pb-8">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Ready to Download</h3>
                  <p className="text-muted-foreground mb-6">
                    Click the button below to access your movie download link for {movieLink.movieName}
                  </p>
                  <Button 
                    size="lg" 
                    onClick={handleContinue}
                    className="px-8 py-3"
                  >
                    Continue to Download
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RedirectPage;