import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Copy, LogOut, Trash2, Edit } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { MovieLink, InsertMovieLink, ApiToken, InsertApiToken, QualityEpisode, InsertQualityEpisode, QualityZip, InsertQualityZip } from "@shared/schema";

const AdminPanel = () => {
  const [, setLocation] = useLocation();
  const [movieName, setMovieName] = useState("");
  const [originalLink, setOriginalLink] = useState("");
  const [adsEnabled, setAdsEnabled] = useState(true);
  const [generatedLink, setGeneratedLink] = useState("");
  
  // Quality movie link states
  const [qualityMovieName, setQualityMovieName] = useState("");
  const [quality480p, setQuality480p] = useState("");
  const [quality720p, setQuality720p] = useState("");
  const [quality1080p, setQuality1080p] = useState("");
  const [qualityAdsEnabled, setQualityAdsEnabled] = useState(true);
  const [generatedQualityLink, setGeneratedQualityLink] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [editingLink, setEditingLink] = useState<MovieLink | null>(null);
  const [editOriginalLink, setEditOriginalLink] = useState("");
  const [editAdsEnabled, setEditAdsEnabled] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Quality Episode states  
  const [seriesName, setSeriesName] = useState("");
  const [startFromEpisode, setStartFromEpisode] = useState("");
  const [episodes, setEpisodes] = useState<Array<{
    episodeNumber: number;
    quality480p: string;
    quality720p: string;
    quality1080p: string;
  }>>([{
    episodeNumber: 1,
    quality480p: "",
    quality720p: "",
    quality1080p: ""
  }]);
  const [episodeAdsEnabled, setEpisodeAdsEnabled] = useState(true);
  const [generatedEpisodeLink, setGeneratedEpisodeLink] = useState("");
  
  // Quality Zip states
  const [zipMovieName, setZipMovieName] = useState("");
  const [fromEpisode, setFromEpisode] = useState("");
  const [toEpisode, setToEpisode] = useState("");
  const [zipQuality480p, setZipQuality480p] = useState("");
  const [zipQuality720p, setZipQuality720p] = useState("");
  const [zipQuality1080p, setZipQuality1080p] = useState("");
  const [zipAdsEnabled, setZipAdsEnabled] = useState(true);
  const [generatedZipLink, setGeneratedZipLink] = useState("");
  
  // API Token states
  const [tokenName, setTokenName] = useState("");
  const [tokenType, setTokenType] = useState<"single" | "quality" | "episode" | "zip">("single");
  const [isTokenDialogOpen, setIsTokenDialogOpen] = useState(false);
  const [generatedToken, setGeneratedToken] = useState("");
  const [editingToken, setEditingToken] = useState<any | null>(null);
  const [isEditTokenDialogOpen, setIsEditTokenDialogOpen] = useState(false);
  
  // Quality link editing states
  const [editingQualityLink, setEditingQualityLink] = useState<any | null>(null);
  const [isEditQualityDialogOpen, setIsEditQualityDialogOpen] = useState(false);
  const [editQuality480p, setEditQuality480p] = useState("");
  const [editQuality720p, setEditQuality720p] = useState("");
  const [editQuality1080p, setEditQuality1080p] = useState("");
  const [editQualityAdsEnabled, setEditQualityAdsEnabled] = useState(true);
  
  // Quality Episode editing states
  const [editingQualityEpisode, setEditingQualityEpisode] = useState<any | null>(null);
  const [isEditEpisodeDialogOpen, setIsEditEpisodeDialogOpen] = useState(false);
  const [editSeriesName, setEditSeriesName] = useState("");
  const [editStartFromEpisode, setEditStartFromEpisode] = useState("");
  const [editEpisodesList, setEditEpisodesList] = useState<Array<{
    episodeNumber: number;
    quality480p: string;
    quality720p: string;
    quality1080p: string;
  }>>([]);
  const [editEpisodeAdsEnabled, setEditEpisodeAdsEnabled] = useState(true);
  
  // Quality Zip editing states
  const [editingQualityZip, setEditingQualityZip] = useState<any | null>(null);
  const [isEditZipDialogOpen, setIsEditZipDialogOpen] = useState(false);
  const [editZipMovieName, setEditZipMovieName] = useState("");
  const [editZipFromEpisode, setEditZipFromEpisode] = useState("");
  const [editZipToEpisode, setEditZipToEpisode] = useState("");
  const [editZipQuality480p, setEditZipQuality480p] = useState("");
  const [editZipQuality720p, setEditZipQuality720p] = useState("");
  const [editZipQuality1080p, setEditZipQuality1080p] = useState("");
  const [editZipAdsEnabled, setEditZipAdsEnabled] = useState(true);
  
  // Admin Settings states removed - credentials now managed only via Supabase

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("moviezone_admin_logged_in");
    if (!isLoggedIn) {
      setLocation("/");
      return;
    }
  }, [setLocation]);

  // Update episode numbers when startFromEpisode changes
  useEffect(() => {
    const startNumber = parseInt(startFromEpisode) || 1;
    setEpisodes(prev => prev.map((episode, index) => ({
      ...episode,
      episodeNumber: startNumber + index
    })));
  }, [startFromEpisode]);

  // Fetch movie links from API
  const { data: movieLinks = [], isLoading } = useQuery({
    queryKey: ["/api/movie-links"],
  });

  // Fetch quality movie links from API
  const { data: qualityMovieLinks = [], isLoading: isQualityLoading } = useQuery({
    queryKey: ["/api/quality-movie-links"],
  });

  // Fetch quality episodes from API
  const { data: qualityEpisodes = [], isLoading: isEpisodesLoading } = useQuery({
    queryKey: ["/api/quality-episodes"],
  });

  // Fetch quality zips from API
  const { data: qualityZips = [], isLoading: isZipsLoading } = useQuery({
    queryKey: ["/api/quality-zips"],
  });

  // Fetch API tokens
  const { data: apiTokens = [], isLoading: isTokensLoading } = useQuery({
    queryKey: ["/api/tokens"],
  });

  // Create movie link mutation
  const createMovieLinkMutation = useMutation({
    mutationFn: async (data: InsertMovieLink) => {
      return apiRequest("/api/movie-links", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/movie-links"] });
    },
  });

  // Create quality movie link mutation
  const createQualityMovieLinkMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/quality-movie-links", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quality-movie-links"] });
    },
  });

  // Create quality episode mutation
  const createQualityEpisodeMutation = useMutation({
    mutationFn: async (data: InsertQualityEpisode) => {
      return apiRequest("/api/quality-episodes", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quality-episodes"] });
    },
  });

  // Create quality zip mutation
  const createQualityZipMutation = useMutation({
    mutationFn: async (data: InsertQualityZip) => {
      return apiRequest("/api/quality-zips", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quality-zips"] });
    },
  });

  // Update quality episode mutation
  const updateQualityEpisodeMutation = useMutation({
    mutationFn: async ({ id, episodeData }: { id: number; episodeData: any }) => {
      return apiRequest(`/api/quality-episodes/${id}`, {
        method: "PATCH",
        body: JSON.stringify(episodeData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quality-episodes"] });
      // Force refresh to ensure UI updates immediately
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ["/api/quality-episodes"] });
      }, 100);
    },
  });

  // Delete quality episode mutation
  const deleteQualityEpisodeMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/quality-episodes/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quality-episodes"] });
    },
  });

  // Update quality zip mutation
  const updateQualityZipMutation = useMutation({
    mutationFn: async ({ id, zipData }: { id: number; zipData: any }) => {
      return apiRequest(`/api/quality-zips/${id}`, {
        method: "PATCH",
        body: JSON.stringify(zipData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quality-zips"] });
    },
  });

  // Delete quality zip mutation
  const deleteQualityZipMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/quality-zips/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quality-zips"] });
    },
  });

  // Delete movie link mutation
  const deleteMovieLinkMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/movie-links/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/movie-links"] });
    },
  });

  // Update movie link mutation
  const updateMovieLinkMutation = useMutation({
    mutationFn: async ({ id, originalLink, adsEnabled }: { id: number; originalLink: string; adsEnabled?: boolean }) => {
      const updateData: any = { originalLink };
      if (adsEnabled !== undefined) {
        updateData.adsEnabled = adsEnabled;
      }
      return apiRequest(`/api/movie-links/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updateData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/movie-links"] });
      setIsEditDialogOpen(false);
      setEditingLink(null);
      setEditOriginalLink("");
    },
  });

  // Create API token mutation
  const createTokenMutation = useMutation({
    mutationFn: async (data: { tokenName: string; tokenType: string }) => {
      return apiRequest("/api/tokens", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tokens"] });
      setGeneratedToken(data.tokenValue || data.token_value || "");
      setIsTokenDialogOpen(true);
      setTokenName("");
      setTokenType("single");
      toast({
        title: "Token Created",
        description: "API token generated successfully! Copy it now.",
      });
    },
  });

  // Update API token mutation
  const updateTokenMutation = useMutation({
    mutationFn: async ({ tokenId, isActive }: { tokenId: number; isActive: boolean }) => {
      return apiRequest(`/api/tokens/${tokenId}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tokens"] });
      setIsEditTokenDialogOpen(false);
      setEditingToken(null);
      toast({
        title: "Token Updated",
        description: "API token status updated successfully.",
      });
      // Force refresh tokens data
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ["/api/tokens"] });
      }, 100);
    },
  });

  // Delete quality movie link mutation
  const deleteQualityMovieLinkMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/quality-movie-links/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quality-movie-links"] });
    },
  });

  // Update quality movie link mutation
  const updateQualityMovieLinkMutation = useMutation({
    mutationFn: async ({ id, qualities }: { id: number; qualities: any }) => {
      return apiRequest(`/api/quality-movie-links/${id}`, {
        method: "PATCH",
        body: JSON.stringify(qualities),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quality-movie-links"] });
      // Force refresh to ensure UI updates immediately
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ["/api/quality-movie-links"] });
      }, 100);
    },
  });

  // Delete API token mutation
  const deleteTokenMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/tokens/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tokens"] });
      toast({
        title: "Token Deleted",
        description: "API token has been deleted.",
      });
    },
  });

  // Admin credentials mutation removed - now managed only via Supabase

  const generateShortId = () => {
    return Math.random().toString(36).substring(2, 8);
  };

  // API Token handlers
  const handleGenerateToken = async () => {
    if (!tokenName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a token name",
        variant: "destructive",
      });
      return;
    }

    try {
      await createTokenMutation.mutateAsync({
        tokenName: tokenName.trim(),
        tokenType,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate token",
        variant: "destructive",
      });
    }
  };



  const handleEditToken = (token: any) => {
    setEditingToken(token);
    setIsEditTokenDialogOpen(true);
  };

  const handleUpdateTokenStatus = async (isActive: boolean) => {
    if (!editingToken) return;
    
    try {
      await updateTokenMutation.mutateAsync({
        tokenId: editingToken.id,
        isActive,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update token status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteToken = async (tokenId: number) => {
    if (confirm("Are you sure you want to delete this token?")) {
      try {
        await deleteTokenMutation.mutateAsync(tokenId);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete token",
          variant: "destructive",
        });
      }
    }
  };

  const handleEditQualityLink = (link: any) => {
    setEditingQualityLink(link);
    setEditQuality480p(link.quality480p || link.quality_480p || "");
    setEditQuality720p(link.quality720p || link.quality_720p || "");
    setEditQuality1080p(link.quality1080p || link.quality_1080p || "");
    setEditQualityAdsEnabled(link.ads_enabled !== undefined ? link.ads_enabled : link.adsEnabled !== undefined ? link.adsEnabled : true);
    setIsEditQualityDialogOpen(true);
  };

  const handleUpdateQualityLink = async () => {
    if (!editingQualityLink) {
      toast({
        title: "Error",
        description: "No link selected for editing",
        variant: "destructive",
      });
      return;
    }

    // Check if at least one quality link is provided
    if (!editQuality480p.trim() && !editQuality720p.trim() && !editQuality1080p.trim()) {
      toast({
        title: "Error",
        description: "Please provide at least one quality link",
        variant: "destructive",
      });
      return;
    }

    try {
      // Always send all quality fields to ensure proper updates (including removal)
      const qualities: any = {
        quality480p: editQuality480p.trim() || null,
        quality720p: editQuality720p.trim() || null,
        quality1080p: editQuality1080p.trim() || null,
        adsEnabled: editQualityAdsEnabled,
      };

      await updateQualityMovieLinkMutation.mutateAsync({
        id: editingQualityLink.id,
        qualities,
      });
      toast({
        title: "Updated",
        description: "Quality link updated successfully!",
      });
      setIsEditQualityDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update quality link",
        variant: "destructive",
      });
    }
  };

  const handleDeleteQualityLink = async (id: number) => {
    if (confirm("Are you sure you want to delete this quality link?")) {
      try {
        await deleteQualityMovieLinkMutation.mutateAsync(id);
        toast({
          title: "Deleted",
          description: "Quality link deleted successfully!",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete quality link",
          variant: "destructive",
        });
      }
    }
  };

  // Quality Episode handlers
  const handleEditQualityEpisode = (episode: any) => {
    setEditingQualityEpisode(episode);
    setEditSeriesName(episode.series_name || episode.seriesName || "");
    setEditStartFromEpisode(String(episode.start_from_episode || episode.startFromEpisode || 1));
    
    try {
      const episodeList = JSON.parse(episode.episodes);
      setEditEpisodesList(episodeList);
    } catch (error) {
      setEditEpisodesList([{
        episodeNumber: 1,
        quality480p: "",
        quality720p: "",
        quality1080p: ""
      }]);
    }
    
    setEditEpisodeAdsEnabled(episode.ads_enabled !== undefined ? episode.ads_enabled : episode.adsEnabled !== undefined ? episode.adsEnabled : true);
    setIsEditEpisodeDialogOpen(true);
  };

  const handleUpdateQualityEpisode = async () => {
    if (!editingQualityEpisode) {
      toast({
        title: "Error",
        description: "No episode series selected for editing",
        variant: "destructive",
      });
      return;
    }

    if (!editSeriesName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a series name",
        variant: "destructive",
      });
      return;
    }

    // Validate that all episodes have at least one quality link
    for (const episode of editEpisodesList) {
      if (!episode.quality480p.trim() && !episode.quality720p.trim() && !episode.quality1080p.trim()) {
        toast({
          title: "Error",
          description: `Episode ${episode.episodeNumber} needs at least one quality link`,
          variant: "destructive",
        });
        return;
      }
    }

    try {
      const episodeData = {
        seriesName: editSeriesName.trim(),
        startFromEpisode: parseInt(editStartFromEpisode) || 1,
        episodes: JSON.stringify(editEpisodesList),
        adsEnabled: editEpisodeAdsEnabled,
      };

      await updateQualityEpisodeMutation.mutateAsync({
        id: editingQualityEpisode.id,
        episodeData,
      });
      
      toast({
        title: "Updated",
        description: "Quality episode series updated successfully!",
      });
      setIsEditEpisodeDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update quality episode series",
        variant: "destructive",
      });
    }
  };

  const handleEditEpisodeChange = (index: number, field: keyof (typeof editEpisodesList)[0], value: string | number) => {
    setEditEpisodesList(prev => prev.map((episode, i) => 
      i === index ? { ...episode, [field]: value } : episode
    ));
  };

  const handleAddEditEpisode = () => {
    const startNumber = parseInt(editStartFromEpisode) || 1;
    const nextEpisodeNumber = Math.max(...editEpisodesList.map(ep => ep.episodeNumber), startNumber - 1) + 1;
    setEditEpisodesList(prev => [...prev, {
      episodeNumber: nextEpisodeNumber,
      quality480p: "",
      quality720p: "",
      quality1080p: ""
    }]);
  };

  const handleRemoveEditEpisode = (index: number) => {
    if (editEpisodesList.length > 1) {
      setEditEpisodesList(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Admin credentials update removed - now managed only via Supabase database

  // Quality Episode handlers
  const handleAddEpisode = () => {
    const startNumber = parseInt(startFromEpisode) || 1;
    const nextEpisodeNumber = Math.max(...episodes.map(ep => ep.episodeNumber), startNumber - 1) + 1;
    setEpisodes(prev => [...prev, {
      episodeNumber: nextEpisodeNumber,
      quality480p: "",
      quality720p: "",
      quality1080p: ""
    }]);
  };

  const handleRemoveEpisode = (index: number) => {
    if (episodes.length > 1) {
      setEpisodes(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleEpisodeChange = (index: number, field: keyof (typeof episodes)[0], value: string | number) => {
    setEpisodes(prev => prev.map((episode, i) => 
      i === index ? { ...episode, [field]: value } : episode
    ));
  };

  const handleGenerateEpisodeLink = async () => {
    if (!seriesName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a series name",
        variant: "destructive",
      });
      return;
    }

    // Validate that all episodes have at least one quality link
    for (const episode of episodes) {
      if (!episode.quality480p.trim() && !episode.quality720p.trim() && !episode.quality1080p.trim()) {
        toast({
          title: "Error",
          description: `Episode ${episode.episodeNumber} needs at least one quality link`,
          variant: "destructive",
        });
        return;
      }
    }

    const shortId = generateShortId();
    try {
      const qualityEpisode = await createQualityEpisodeMutation.mutateAsync({
        seriesName,
        shortId,
        startFromEpisode: parseInt(startFromEpisode) || 1,
        episodes: JSON.stringify(episodes),
        adsEnabled: episodeAdsEnabled,
      });

      const shortUrl = `${window.location.origin}/e/${shortId}`;
      setGeneratedEpisodeLink(shortUrl);
      
      toast({
        title: "Success",
        description: "Quality episode series created successfully!",
      });

      // Reset form
      setSeriesName("");
      setStartFromEpisode("");
      setEpisodes([{
        episodeNumber: 1,
        quality480p: "",
        quality720p: "",
        quality1080p: ""
      }]);
      setEpisodeAdsEnabled(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create quality episode series",
        variant: "destructive",
      });
    }
  };

  // Quality Zip handlers
  const handleGenerateZipLink = async () => {
    if (!zipMovieName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a movie name",
        variant: "destructive",
      });
      return;
    }

    if (!fromEpisode.trim() || !toEpisode.trim()) {
      toast({
        title: "Error",
        description: "Please enter both from and to episode numbers",
        variant: "destructive",
      });
      return;
    }

    const fromEp = parseInt(fromEpisode);
    const toEp = parseInt(toEpisode);
    if (fromEp >= toEp) {
      toast({
        title: "Error",
        description: "From episode must be less than to episode",
        variant: "destructive",
      });
      return;
    }

    // Check if at least one quality link is provided
    if (!zipQuality480p.trim() && !zipQuality720p.trim() && !zipQuality1080p.trim()) {
      toast({
        title: "Error",
        description: "Please provide at least one quality link",
        variant: "destructive",
      });
      return;
    }

    const shortId = generateShortId();
    try {
      const qualityZip = await createQualityZipMutation.mutateAsync({
        movieName: zipMovieName.trim(),
        shortId,
        fromEpisode: fromEp,
        toEpisode: toEp,
        quality480p: zipQuality480p.trim() || undefined,
        quality720p: zipQuality720p.trim() || undefined,
        quality1080p: zipQuality1080p.trim() || undefined,
        adsEnabled: zipAdsEnabled,
      });

      const shortUrl = `${window.location.origin}/z/${shortId}`;
      setGeneratedZipLink(shortUrl);
      
      toast({
        title: "Success",
        description: "Quality zip link created successfully!",
      });

      // Reset form
      setZipMovieName("");
      setFromEpisode("");
      setToEpisode("");
      setZipQuality480p("");
      setZipQuality720p("");
      setZipQuality1080p("");
      setZipAdsEnabled(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create quality zip link",
        variant: "destructive",
      });
    }
  };

  const handleEditQualityZip = (zip: any) => {
    setEditingQualityZip(zip);
    setEditZipMovieName(zip.movie_name || zip.movieName || "");
    setEditZipFromEpisode(String(zip.from_episode || zip.fromEpisode || ""));
    setEditZipToEpisode(String(zip.to_episode || zip.toEpisode || ""));
    setEditZipQuality480p(zip.quality_480p || zip.quality480p || "");
    setEditZipQuality720p(zip.quality_720p || zip.quality720p || "");
    setEditZipQuality1080p(zip.quality_1080p || zip.quality1080p || "");
    setEditZipAdsEnabled(zip.ads_enabled !== undefined ? zip.ads_enabled : zip.adsEnabled !== undefined ? zip.adsEnabled : true);
    setIsEditZipDialogOpen(true);
  };

  const handleUpdateQualityZip = async () => {
    if (!editingQualityZip) {
      toast({
        title: "Error",
        description: "No zip selected for editing",
        variant: "destructive",
      });
      return;
    }

    if (!editZipMovieName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a movie name",
        variant: "destructive",
      });
      return;
    }

    if (!editZipFromEpisode.trim() || !editZipToEpisode.trim()) {
      toast({
        title: "Error",
        description: "Please enter both from and to episode numbers",
        variant: "destructive",
      });
      return;
    }

    const fromEp = parseInt(editZipFromEpisode);
    const toEp = parseInt(editZipToEpisode);
    if (fromEp >= toEp) {
      toast({
        title: "Error",
        description: "From episode must be less than to episode",
        variant: "destructive",
      });
      return;
    }

    // Check if at least one quality link is provided
    if (!editZipQuality480p.trim() && !editZipQuality720p.trim() && !editZipQuality1080p.trim()) {
      toast({
        title: "Error",
        description: "Please provide at least one quality link",
        variant: "destructive",
      });
      return;
    }

    try {
      const zipData = {
        movieName: editZipMovieName.trim(),
        fromEpisode: fromEp,
        toEpisode: toEp,
        quality480p: editZipQuality480p.trim() || null,
        quality720p: editZipQuality720p.trim() || null,
        quality1080p: editZipQuality1080p.trim() || null,
        adsEnabled: editZipAdsEnabled,
      };

      await updateQualityZipMutation.mutateAsync({
        id: editingQualityZip.id,
        zipData,
      });
      
      toast({
        title: "Updated",
        description: "Quality zip updated successfully!",
      });
      setIsEditZipDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update quality zip",
        variant: "destructive",
      });
    }
  };

  const handleDeleteQualityZip = async (id: number) => {
    if (confirm("Are you sure you want to delete this quality zip?")) {
      try {
        await deleteQualityZipMutation.mutateAsync(id);
        toast({
          title: "Deleted",
          description: "Quality zip deleted successfully!",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete quality zip",
          variant: "destructive",
        });
      }
    }
  };

  const handleGenerateLink = async () => {
    if (!movieName.trim() || !originalLink.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both movie name and original link",
        variant: "destructive",
      });
      return;
    }

    const shortId = generateShortId();
    const shortLink = `${window.location.origin}/m/${shortId}`;
    
    try {
      await createMovieLinkMutation.mutateAsync({
        movieName: movieName.trim(),
        originalLink: originalLink.trim(),
        shortId,
        adsEnabled,
      });
      
      setGeneratedLink(shortLink);
      toast({
        title: "Link Generated",
        description: "Short link created successfully!",
      });

      // Clear form
      setMovieName("");
      setOriginalLink("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create movie link",
        variant: "destructive",
      });
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    toast({
      title: "Copied",
      description: "Link copied to clipboard!",
    });
    // Clear the generated link after copying
    setGeneratedLink("");
  };

  const handleGenerateQualityLink = async () => {
    if (!qualityMovieName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a movie name",
        variant: "destructive",
      });
      return;
    }

    // Check if at least one quality link is provided
    if (!quality480p.trim() && !quality720p.trim() && !quality1080p.trim()) {
      toast({
        title: "Error",
        description: "Please provide at least one quality link",
        variant: "destructive",
      });
      return;
    }

    const shortId = generateShortId();
    const shortLink = `${window.location.origin}/m/${shortId}`;
    
    try {
      const qualityLinks: any = {};
      if (quality480p.trim()) qualityLinks.quality480p = quality480p.trim();
      if (quality720p.trim()) qualityLinks.quality720p = quality720p.trim();
      if (quality1080p.trim()) qualityLinks.quality1080p = quality1080p.trim();

      await createQualityMovieLinkMutation.mutateAsync({
        movieName: qualityMovieName.trim(),
        shortId,
        adsEnabled: qualityAdsEnabled,
        ...qualityLinks
      });
      
      setGeneratedQualityLink(shortLink);
      toast({
        title: "Quality Link Generated",
        description: "Quality movie link created successfully!",
      });

      // Clear form
      setQualityMovieName("");
      setQuality480p("");
      setQuality720p("");
      setQuality1080p("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create quality movie link",
        variant: "destructive",
      });
    }
  };

  const handleCopyQualityLink = () => {
    navigator.clipboard.writeText(generatedQualityLink);
    toast({
      title: "Copied",
      description: "Quality link copied to clipboard!",
    });
    // Clear the generated link after copying
    setGeneratedQualityLink("");
  };

  const handleCopyEpisodeLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied!",
      description: "Episode series link copied to clipboard",
    });
    // Clear generated link after copying
    setGeneratedEpisodeLink("");
  };

  const handleCopyZipLink = () => {
    navigator.clipboard.writeText(generatedZipLink);
    toast({
      title: "Copied",
      description: "Quality zip link copied to clipboard!",
    });
    // Clear the generated link after copying
    setGeneratedZipLink("");
  };

  const handleDeleteLink = async (id: number) => {
    try {
      await deleteMovieLinkMutation.mutateAsync(id);
      toast({
        title: "Deleted",
        description: "Link deleted successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete movie link",
        variant: "destructive",
      });
    }
  };

  const handleEditLink = (link: any) => {
    setEditingLink(link);
    setEditOriginalLink(link.original_link || link.originalLink || "");
    setEditAdsEnabled(link.ads_enabled !== undefined ? link.ads_enabled : link.adsEnabled !== undefined ? link.adsEnabled : true);
    setIsEditDialogOpen(true);
  };

  const handleUpdateLink = async () => {
    if (!editingLink || !editOriginalLink.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid original link",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateMovieLinkMutation.mutateAsync({
        id: editingLink.id,
        originalLink: editOriginalLink.trim(),
        adsEnabled: editAdsEnabled,
      });
      toast({
        title: "Updated",
        description: "Link updated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update movie link",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("moviezone_admin_logged_in");
    setLocation("/");
    toast({
      title: "Logged Out",
      description: "Successfully logged out",
    });
  };

  const filteredLinks = (movieLinks as any[])
    .filter(link => 
      link?.movie_name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ?? false
    )
    .sort((a, b) => {
      if (sortBy === "name") {
        const nameA = a?.movie_name || "";
        const nameB = b?.movie_name || "";
        const comparison = nameA.localeCompare(nameB);
        return sortOrder === "asc" ? comparison : -comparison;
      } else {
        const dateA = a?.date_added ? new Date(a.date_added).getTime() : 0;
        const dateB = b?.date_added ? new Date(b.date_added).getTime() : 0;
        const comparison = dateA - dateB;
        return sortOrder === "asc" ? comparison : -comparison;
      }
    });

  // Combine single, quality, episode, and zip links for calculations
  const allLinks = [...(movieLinks as any[]), ...(qualityMovieLinks as any[]), ...(qualityEpisodes as any[]), ...(qualityZips as any[])];
  
  const totalViews = allLinks.reduce((sum, link) => sum + (link?.views || 0), 0);
  
  // Calculate today's stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayLinks = allLinks.filter(link => {
    if (!link?.date_added) return false;
    const linkDate = new Date(link.date_added);
    linkDate.setHours(0, 0, 0, 0);
    return linkDate.getTime() === today.getTime();
  }).length;
  
  const todayViews = allLinks
    .filter(link => {
      if (!link?.date_added) return false;
      const linkDate = new Date(link.date_added);
      linkDate.setHours(0, 0, 0, 0);
      return linkDate.getTime() === today.getTime();
    })
    .reduce((sum, link) => sum + (link?.views || 0), 0);
  
  // Get the most recent 5 links for the recent links section (combine all types)
  const recentLinks = [
    ...((movieLinks as any[]) || []).map((link: any) => ({ 
      ...link, 
      linkType: 'single',
      name: link.movie_name || link.movieName,
      url_prefix: '/m/'
    })),
    ...((qualityMovieLinks as any[]) || []).map((link: any) => ({ 
      ...link, 
      linkType: 'quality',
      name: link.movie_name || link.movieName,
      url_prefix: '/m/'
    })),
    ...((qualityEpisodes as any[]) || []).map((link: any) => ({ 
      ...link, 
      linkType: 'episode',
      name: link.series_name || link.seriesName,
      url_prefix: '/e/'
    })),
    ...((qualityZips as any[]) || []).map((link: any) => ({ 
      ...link, 
      linkType: 'zip',
      name: link.movie_name || link.movieName,
      url_prefix: '/z/'
    }))
  ]
    .slice()
    .sort((a, b) => {
      const dateA = a?.date_added ? new Date(a.date_added).getTime() : 0;
      const dateB = b?.date_added ? new Date(b.date_added).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center gap-4">
          <h1 className="text-lg md:text-xl font-bold truncate">Admin Panel</h1>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 border border-primary-foreground/20"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4">
        <Tabs defaultValue="home" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="tokens">API Tokens</TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-6">
            {/* Stats Cards - 2x2 Grid */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{allLinks.length}</div>
                  <div className="text-sm text-muted-foreground">Total Links</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{todayLinks}</div>
                  <div className="text-sm text-muted-foreground">Today's Links</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{totalViews}</div>
                  <div className="text-sm text-muted-foreground">Total Views</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{todayViews}</div>
                  <div className="text-sm text-muted-foreground">Today's Views</div>
                </CardContent>
              </Card>
            </div>

            {/* Link Generator with Tabs */}
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="single" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger value="single">Single</TabsTrigger>
                    <TabsTrigger value="quality">Quality</TabsTrigger>
                    <TabsTrigger value="episodes">Ep Quality</TabsTrigger>
                    <TabsTrigger value="zip">Ep Zip</TabsTrigger>
                  </TabsList>

                  <TabsContent value="single" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="movieName">Movie Name</Label>
                      <Input
                        id="movieName"
                        value={movieName}
                        onChange={(e) => setMovieName(e.target.value)}
                        placeholder="Enter movie name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="originalLink">Original Movie Link</Label>
                      <Input
                        id="originalLink"
                        value={originalLink}
                        onChange={(e) => setOriginalLink(e.target.value)}
                        placeholder="Enter original movie download link"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="ads-toggle"
                        checked={adsEnabled}
                        onCheckedChange={setAdsEnabled}
                      />
                      <Label htmlFor="ads-toggle">Enable Ads (10s timer)</Label>
                    </div>

                    <Button onClick={handleGenerateLink} className="w-full">
                      Generate Short Link
                    </Button>

                    {generatedLink && (
                      <div className="space-y-2">
                        <Label>Generated Short Link</Label>
                        <div className="flex gap-2">
                          <Input value={generatedLink} readOnly />
                          <Button onClick={handleCopyLink} size="icon">
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="quality" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="qualityMovieName">Movie Name</Label>
                      <Input
                        id="qualityMovieName"
                        value={qualityMovieName}
                        onChange={(e) => setQualityMovieName(e.target.value)}
                        placeholder="Enter movie name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="quality480p">480p Download Link</Label>
                      <Input
                        id="quality480p"
                        value={quality480p}
                        onChange={(e) => setQuality480p(e.target.value)}
                        placeholder="Enter 480p download link (optional)"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="quality720p">720p Download Link</Label>
                      <Input
                        id="quality720p"
                        value={quality720p}
                        onChange={(e) => setQuality720p(e.target.value)}
                        placeholder="Enter 720p download link (optional)"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="quality1080p">1080p Download Link</Label>
                      <Input
                        id="quality1080p"
                        value={quality1080p}
                        onChange={(e) => setQuality1080p(e.target.value)}
                        placeholder="Enter 1080p download link (optional)"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="quality-ads-toggle"
                        checked={qualityAdsEnabled}
                        onCheckedChange={setQualityAdsEnabled}
                      />
                      <Label htmlFor="quality-ads-toggle">Enable Ads (10s timer)</Label>
                    </div>

                    <Button onClick={handleGenerateQualityLink} className="w-full">
                      Generate Quality Link
                    </Button>

                    {generatedQualityLink && (
                      <div className="space-y-2">
                        <Label>Generated Short Link</Label>
                        <div className="flex gap-2">
                          <Input value={generatedQualityLink} readOnly />
                          <Button onClick={handleCopyQualityLink} size="icon">
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="episodes" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="seriesName">Series Name</Label>
                      <Input
                        id="seriesName"
                        value={seriesName}
                        onChange={(e) => setSeriesName(e.target.value)}
                        placeholder="Enter series/movie name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="startFromEpisode">Start From Episode</Label>
                      <Input
                        id="startFromEpisode"
                        type="number"
                        min={1}
                        value={startFromEpisode}
                        onChange={(e) => setStartFromEpisode(e.target.value)}
                        placeholder="Starting episode number"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Episodes ({episodes.length})</Label>
                        <Button onClick={handleAddEpisode} variant="outline" size="sm">
                          Add Episode
                        </Button>
                      </div>
                      
                      {episodes.map((episode, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="font-semibold">Episode {episode.episodeNumber}</Label>
                            {episodes.length > 1 && (
                              <Button 
                                onClick={() => handleRemoveEpisode(index)}
                                variant="destructive" 
                                size="sm"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <Label>480p Download Link</Label>
                            <Input
                              value={episode.quality480p}
                              onChange={(e) => handleEpisodeChange(index, 'quality480p', e.target.value)}
                              placeholder="480p download link"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>720p Download Link</Label>
                            <Input
                              value={episode.quality720p}
                              onChange={(e) => handleEpisodeChange(index, 'quality720p', e.target.value)}
                              placeholder="720p download link"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>1080p Download Link</Label>
                            <Input
                              value={episode.quality1080p}
                              onChange={(e) => handleEpisodeChange(index, 'quality1080p', e.target.value)}
                              placeholder="1080p download link"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="episode-ads-toggle"
                        checked={episodeAdsEnabled}
                        onCheckedChange={setEpisodeAdsEnabled}
                      />
                      <Label htmlFor="episode-ads-toggle">Enable Ads (10s timer)</Label>
                    </div>

                    <Button onClick={handleGenerateEpisodeLink} className="w-full">
                      Generate Episode Series Link
                    </Button>

                    {generatedEpisodeLink && (
                      <div className="space-y-2">
                        <Label>Generated Episode Series Link</Label>
                        <div className="flex gap-2">
                          <Input value={generatedEpisodeLink} readOnly />
                          <Button onClick={() => handleCopyEpisodeLink(generatedEpisodeLink)} size="icon">
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="zip" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="zipMovieName">Movie Name</Label>
                      <Input
                        id="zipMovieName"
                        value={zipMovieName}
                        onChange={(e) => setZipMovieName(e.target.value)}
                        placeholder="Enter movie name"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fromEpisode">From Episode</Label>
                        <Input
                          id="fromEpisode"
                          type="number"
                          min={1}
                          value={fromEpisode}
                          onChange={(e) => setFromEpisode(e.target.value)}
                          placeholder="1"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="toEpisode">To Episode</Label>
                        <Input
                          id="toEpisode"
                          type="number"
                          min={1}
                          value={toEpisode}
                          onChange={(e) => setToEpisode(e.target.value)}
                          placeholder="10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="zipQuality480p">480p Zip Download Link</Label>
                      <Input
                        id="zipQuality480p"
                        value={zipQuality480p}
                        onChange={(e) => setZipQuality480p(e.target.value)}
                        placeholder="Enter 480p zip download link (optional)"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="zipQuality720p">720p Zip Download Link</Label>
                      <Input
                        id="zipQuality720p"
                        value={zipQuality720p}
                        onChange={(e) => setZipQuality720p(e.target.value)}
                        placeholder="Enter 720p zip download link (optional)"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="zipQuality1080p">1080p Zip Download Link</Label>
                      <Input
                        id="zipQuality1080p"
                        value={zipQuality1080p}
                        onChange={(e) => setZipQuality1080p(e.target.value)}
                        placeholder="Enter 1080p zip download link (optional)"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="zip-ads-toggle"
                        checked={zipAdsEnabled}
                        onCheckedChange={setZipAdsEnabled}
                      />
                      <Label htmlFor="zip-ads-toggle">Enable Ads (10s timer)</Label>
                    </div>

                    <Button onClick={handleGenerateZipLink} className="w-full">
                      Generate Episode Zip Link
                    </Button>

                    {generatedZipLink && (
                      <div className="space-y-2">
                        <Label>Generated Episode Zip Link</Label>
                        <div className="flex gap-2">
                          <Input value={generatedZipLink} readOnly />
                          <Button onClick={handleCopyZipLink} size="icon">
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Recent Links Section */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Links</h3>
                {recentLinks.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No links created yet</p>
                ) : (
                  <div className="space-y-3">
                    {recentLinks.map((link) => (
                      <div key={`${link.linkType}-${link.id}`} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium truncate">{link.name}</p>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              link.linkType === 'quality'
                                ? 'bg-purple-100 text-purple-800' 
                                : link.linkType === 'episode'
                                ? 'bg-green-100 text-green-800'
                                : link.linkType === 'zip'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {link.linkType === 'quality' ? 'Quality' : link.linkType === 'episode' ? 'Episodes' : link.linkType === 'zip' ? 'Zip' : 'Single'}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {window.location.origin}{link.url_prefix}{link.short_id}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-sm text-muted-foreground">{link.views} views</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}${link.url_prefix}${link.short_id}`);
                              toast({
                                title: "Copied",
                                description: "Link copied to clipboard!",
                              });
                            }}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database" className="space-y-4">
            {/* Search and Sort */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 min-w-0">
                    <Input
                      placeholder="Search by movie name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={sortBy === "name" ? "default" : "outline"}
                      onClick={() => setSortBy("name")}
                      size="sm"
                      className="flex-1 sm:flex-none"
                    >
                      <span className="sm:hidden">Name</span>
                      <span className="hidden sm:inline">Sort by Name</span>
                    </Button>
                    <Button
                      variant={sortBy === "date" ? "default" : "outline"}
                      onClick={() => setSortBy("date")}
                      size="sm"
                      className="flex-1 sm:flex-none"
                    >
                      <span className="sm:hidden">Date</span>
                      <span className="hidden sm:inline">Sort by Date</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                      size="sm"
                    >
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Database with Tabs for Single/Quality/Episode Links */}
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="single-links" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger value="single-links">Single</TabsTrigger>
                    <TabsTrigger value="quality-links">Quality</TabsTrigger>
                    <TabsTrigger value="episode-links">Ep Quality</TabsTrigger>
                    <TabsTrigger value="zip-links">Ep Zip</TabsTrigger>
                  </TabsList>

                  <TabsContent value="single-links">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[150px]">Movie Name</TableHead>
                            <TableHead className="hidden lg:table-cell min-w-[200px]">Original Link</TableHead>
                            <TableHead className="min-w-[120px]">Short Link</TableHead>
                            <TableHead className="min-w-[80px]">Views</TableHead>
                            <TableHead className="hidden xl:table-cell">Date Added</TableHead>
                            <TableHead className="w-[120px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredLinks.map((link) => (
                            <TableRow key={link.id}>
                              <TableCell className="font-medium">{link.movie_name || link.movieName}</TableCell>
                              <TableCell className="hidden lg:table-cell max-w-64 truncate" title={link.original_link || link.originalLink}>{link.original_link || link.originalLink}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <code className="text-sm">/m/{link.short_id || link.shortId}</code>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const fullUrl = `${window.location.origin}/m/${link.short_id || link.shortId}`;
                                      navigator.clipboard.writeText(fullUrl);
                                      toast({
                                        title: "Copied",
                                        description: "Short link copied to clipboard!",
                                      });
                                    }}
                                  >
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">{link.views}</TableCell>
                              <TableCell className="hidden xl:table-cell">{new Date(link.date_added).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditLink(link)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteLink(link.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {filteredLinks.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No single links found
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="quality-links">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[150px]">Movie Name</TableHead>
                            <TableHead className="min-w-[100px]">Available Qualities</TableHead>
                            <TableHead className="min-w-[120px]">Short Link</TableHead>
                            <TableHead className="min-w-[80px]">Views</TableHead>
                            <TableHead className="hidden xl:table-cell">Date Added</TableHead>
                            <TableHead className="w-[120px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(qualityMovieLinks as any[]).map((link) => (
                            <TableRow key={link.id}>
                              <TableCell className="font-medium">{link.movie_name}</TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {(link.quality_480p && link.quality_480p.trim()) && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">480p</span>}
                                  {(link.quality_720p && link.quality_720p.trim()) && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">720p</span>}
                                  {(link.quality_1080p && link.quality_1080p.trim()) && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">1080p</span>}
                                  {!(link.quality_480p?.trim() || link.quality_720p?.trim() || link.quality_1080p?.trim()) && (
                                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">No qualities available</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <code className="text-sm">/m/{link.short_id || link.shortId}</code>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const fullUrl = `${window.location.origin}/m/${link.short_id || link.shortId}`;
                                      navigator.clipboard.writeText(fullUrl);
                                      toast({
                                        title: "Copied",
                                        description: "Quality link copied to clipboard!",
                                      });
                                    }}
                                  >
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">{link.views}</TableCell>
                              <TableCell className="hidden xl:table-cell">{new Date(link.date_added).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditQualityLink(link)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteQualityLink(link.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {(qualityMovieLinks as any[]).length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No quality links found
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="episode-links">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[150px]">Series Name</TableHead>
                            <TableHead className="min-w-[100px]">Episodes</TableHead>
                            <TableHead className="min-w-[120px]">Short Link</TableHead>
                            <TableHead className="min-w-[80px]">Views</TableHead>
                            <TableHead className="hidden xl:table-cell">Date Added</TableHead>
                            <TableHead className="w-[120px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(qualityEpisodes as any[]).map((episode) => (
                            <TableRow key={episode.id}>
                              <TableCell className="font-medium">{episode.series_name || episode.seriesName}</TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <span className="font-medium">
                                    {(() => {
                                      try {
                                        const episodes = JSON.parse(episode.episodes);
                                        const episodeNumbers = episodes.map((ep: any) => ep.episodeNumber).sort((a: number, b: number) => a - b);
                                        return episodeNumbers.join(', ');
                                      } catch {
                                        return "Invalid episodes data";
                                      }
                                    })()}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <code className="text-sm">/e/{episode.short_id || episode.shortId}</code>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const fullUrl = `${window.location.origin}/e/${episode.short_id || episode.shortId}`;
                                      navigator.clipboard.writeText(fullUrl);
                                      toast({
                                        title: "Copied",
                                        description: "Episode series link copied to clipboard!",
                                      });
                                    }}
                                  >
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">{episode.views}</TableCell>
                              <TableCell className="hidden xl:table-cell">{new Date(episode.date_added).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditQualityEpisode(episode)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                      if (confirm("Are you sure you want to delete this episode series?")) {
                                        deleteQualityEpisodeMutation.mutate(episode.id);
                                      }
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {(qualityEpisodes as any[]).length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No episode series found
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="zip-links">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[150px]">Movie Name</TableHead>
                            <TableHead className="min-w-[120px]">Episode Range</TableHead>
                            <TableHead className="min-w-[100px]">Available Qualities</TableHead>
                            <TableHead className="min-w-[120px]">Short Link</TableHead>
                            <TableHead className="min-w-[80px]">Views</TableHead>
                            <TableHead className="hidden xl:table-cell">Date Added</TableHead>
                            <TableHead className="w-[120px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(qualityZips as any[]).map((zip) => (
                            <TableRow key={zip.id}>
                              <TableCell className="font-medium">{zip.movie_name || zip.movieName}</TableCell>
                              <TableCell>
                                <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                                  {zip.from_episode || zip.fromEpisode} - {zip.to_episode || zip.toEpisode}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {(zip.quality_480p && zip.quality_480p.trim()) && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">480p</span>}
                                  {(zip.quality_720p && zip.quality_720p.trim()) && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">720p</span>}
                                  {(zip.quality_1080p && zip.quality_1080p.trim()) && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">1080p</span>}
                                  {!(zip.quality_480p?.trim() || zip.quality_720p?.trim() || zip.quality_1080p?.trim()) && (
                                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">No qualities available</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <code className="text-sm">/z/{zip.short_id || zip.shortId}</code>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const fullUrl = `${window.location.origin}/z/${zip.short_id || zip.shortId}`;
                                      navigator.clipboard.writeText(fullUrl);
                                      toast({
                                        title: "Copied",
                                        description: "Quality zip link copied to clipboard!",
                                      });
                                    }}
                                  >
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">{zip.views}</TableCell>
                              <TableCell className="hidden xl:table-cell">{new Date(zip.date_added).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditQualityZip(zip)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteQualityZip(zip.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {(qualityZips as any[]).length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No quality zip links found
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Tokens Tab */}
          <TabsContent value="tokens" className="space-y-6">
            {/* Token Generator */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold mb-4">Generate New API Token</h3>
                <div className="space-y-2">
                  <Label htmlFor="tokenName">Token Name</Label>
                  <Input
                    id="tokenName"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    placeholder="Enter token name (e.g., Telegram Bot Token)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tokenType">Token Type</Label>
                  <select
                    id="tokenType"
                    value={tokenType}
                    onChange={(e) => setTokenType(e.target.value as "single" | "quality" | "episode" | "zip")}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  >
                    <option value="single">Single Links API</option>
                    <option value="quality">Quality Links API</option>
                    <option value="episode">Quality Episodes API</option>
                    <option value="zip">Quality Zip API</option>
                  </select>
                </div>
                <Button 
                  onClick={handleGenerateToken}
                  disabled={createTokenMutation.isPending}
                  className="w-full"
                >
                  {createTokenMutation.isPending ? "Generating..." : "Generate Token"}
                </Button>
              </CardContent>
            </Card>

            {/* Token Display Dialog */}
            <Dialog open={isTokenDialogOpen} onOpenChange={setIsTokenDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New API Token Generated</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Copy this token now! It will not be shown again for security reasons.
                  </p>
                  <div className="flex gap-2">
                    <Input value={generatedToken} readOnly />
                    <Button 
                      onClick={() => {
                        if (generatedToken) {
                          navigator.clipboard.writeText(generatedToken);
                          toast({
                            title: "Copied",
                            description: "Token copied to clipboard!",
                          });
                        }
                      }} 
                      size="icon"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button 
                    onClick={() => {
                      setIsTokenDialogOpen(false);
                      setGeneratedToken("");
                    }}
                    className="w-full"
                  >
                    Close
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Existing Tokens Table */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Existing API Tokens</h3>
                {isTokensLoading ? (
                  <p className="text-center py-4">Loading tokens...</p>
                ) : (apiTokens as any[]).length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No tokens created yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Token Name</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Last Used</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(apiTokens as any[]).map((token) => (
                          <TableRow key={token.id}>
                            <TableCell className="font-medium">{token.tokenName || token.token_name}</TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                (token.isActive ?? token.is_active)
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                              }`}>
                                {(token.isActive ?? token.is_active) ? "Active" : "Inactive"}
                              </span>
                            </TableCell>
                            <TableCell>
                              {new Date(token.createdAt || token.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {(token.lastUsed || token.last_used)
                                ? new Date(token.lastUsed || token.last_used).toLocaleDateString()
                                : "Never"
                              }
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditToken(token)}
                                  disabled={updateTokenMutation.isPending}
                                  title="Edit Token Status"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteToken(token.id)}
                                  disabled={deleteTokenMutation.isPending}
                                  title="Delete Token"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* API Usage Documentation */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">API Usage Instructions</h3>
                <Tabs defaultValue="single-api" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="single-api">Single</TabsTrigger>
                    <TabsTrigger value="quality-api">Quality</TabsTrigger>
                    <TabsTrigger value="episode-api">Episode</TabsTrigger>
                    <TabsTrigger value="zip-api">Zip</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="single-api" className="space-y-4 text-sm">
                    <div>
                      <h4 className="font-medium mb-2">Endpoint:</h4>
                      <code className="bg-muted px-2 py-1 rounded">POST /api/create-short-link</code>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Headers:</h4>
                      <code className="bg-muted px-2 py-1 rounded">Authorization: Bearer YOUR_SINGLE_TOKEN_HERE</code>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Request Body:</h4>
                      <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`{
  "movieName": "Movie Title",
  "originalLink": "http://original-download-link.com"
}`}
                      </pre>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Response:</h4>
                      <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`{
  "success": true,
  "shortUrl": "https://yoursite.com/m/abc123",
  "shortId": "abc123",
  "movieName": "Movie Title",
  "originalLink": "http://original-download-link.com",
  "adsEnabled": true
}`}
                      </pre>
                    </div>
                  </TabsContent>

                  <TabsContent value="quality-api" className="space-y-4 text-sm">
                    <div>
                      <h4 className="font-medium mb-2">Endpoint:</h4>
                      <code className="bg-muted px-2 py-1 rounded">POST /api/create-quality-short-link</code>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Headers:</h4>
                      <code className="bg-muted px-2 py-1 rounded">Authorization: Bearer YOUR_QUALITY_TOKEN_HERE</code>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Request Body:</h4>
                      <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`{
  "movieName": "Movie Title",
  "quality480p": "http://480p-download-link.com",
  "quality720p": "http://720p-download-link.com",
  "quality1080p": "http://1080p-download-link.com"
}`}
                      </pre>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Response:</h4>
                      <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`{
  "success": true,
  "shortUrl": "https://yoursite.com/m/xyz789",
  "shortId": "xyz789",
  "movieName": "Movie Title",
  "qualities": {
    "480p": "http://480p-download-link.com",
    "720p": "http://720p-download-link.com",
    "1080p": "http://1080p-download-link.com"
  },
  "adsEnabled": true
}`}
                      </pre>
                    </div>
                  </TabsContent>

                  <TabsContent value="episode-api" className="space-y-4 text-sm">
                    <div>
                      <h4 className="font-medium mb-2">Endpoint:</h4>
                      <code className="bg-muted px-2 py-1 rounded">POST /api/create-quality-episode-link</code>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Headers:</h4>
                      <code className="bg-muted px-2 py-1 rounded">Authorization: Bearer YOUR_EPISODE_TOKEN_HERE</code>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Request Body:</h4>
                      <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`{
  "seriesName": "Series Title",
  "startFromEpisode": 1,
  "episodes": [
    {
      "episodeNumber": 1,
      "quality480p": "http://480p-episode1-link.com",
      "quality720p": "http://720p-episode1-link.com",
      "quality1080p": "http://1080p-episode1-link.com"
    },
    {
      "episodeNumber": 2,
      "quality480p": "http://480p-episode2-link.com",
      "quality720p": "http://720p-episode2-link.com",
      "quality1080p": "http://1080p-episode2-link.com"
    }
  ]
}`}
                      </pre>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Response:</h4>
                      <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`{
  "success": true,
  "shortUrl": "https://yoursite.com/e/def456",
  "shortId": "def456",
  "seriesName": "Series Title",
  "startFromEpisode": 1,
  "totalEpisodes": 2,
  "adsEnabled": true
}`}
                      </pre>
                    </div>
                  </TabsContent>

                  <TabsContent value="zip-api" className="space-y-4 text-sm">
                    <div>
                      <h4 className="font-medium mb-2">Endpoint:</h4>
                      <code className="bg-muted px-2 py-1 rounded">POST /api/create-quality-zip-link</code>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Headers:</h4>
                      <code className="bg-muted px-2 py-1 rounded">Authorization: Bearer YOUR_ZIP_TOKEN_HERE</code>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Request Body:</h4>
                      <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`{
  "movieName": "Movie Title",
  "fromEpisode": 1,
  "toEpisode": 10,
  "quality480p": "http://480p-zip-link.com",
  "quality720p": "http://720p-zip-link.com",
  "quality1080p": "http://1080p-zip-link.com"
}`}
                      </pre>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Response:</h4>
                      <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`{
  "success": true,
  "shortUrl": "https://yoursite.com/z/ghi789",
  "shortId": "ghi789",
  "movieName": "Movie Title",
  "fromEpisode": 1,
  "toEpisode": 10,
  "qualities": {
    "480p": "http://480p-zip-link.com",
    "720p": "http://720p-zip-link.com",
    "1080p": "http://1080p-zip-link.com"
  },
  "adsEnabled": true
}`}
                      </pre>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>


        </Tabs>

        {/* Edit Token Dialog */}
        <Dialog open={isEditTokenDialogOpen} onOpenChange={setIsEditTokenDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit API Token</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Token Name</Label>
                <Input value={editingToken?.tokenName || editingToken?.token_name || ""} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Token Value</Label>
                <div className="flex gap-2">
                  <Input value={editingToken?.tokenValue || editingToken?.token_value || ""} readOnly />
                  <Button 
                    onClick={() => {
                      const tokenValue = editingToken?.tokenValue || editingToken?.token_value;
                      if (tokenValue) {
                        navigator.clipboard.writeText(tokenValue);
                        toast({
                          title: "Copied",
                          description: "Token copied to clipboard!",
                        });
                      }
                    }} 
                    size="icon"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingToken?.isActive ?? editingToken?.is_active ?? false}
                    onCheckedChange={handleUpdateTokenStatus}
                    disabled={updateTokenMutation.isPending}
                  />
                  <Label>{(editingToken?.isActive ?? editingToken?.is_active) ? "Active" : "Inactive"}</Label>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsEditTokenDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Movie Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Movie Name</Label>
                <Input value={editingLink?.movieName || ""} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Short ID</Label>
                <Input value={editingLink?.shortId || ""} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editOriginalLink">Original Link</Label>
                <Input
                  id="editOriginalLink"
                  value={editOriginalLink}
                  onChange={(e) => setEditOriginalLink(e.target.value)}
                  placeholder="Enter new original movie link"
                />
              </div>
              <div className="flex items-center space-x-2 pb-2">
                <Switch
                  id="editAdsEnabled"
                  checked={editAdsEnabled}
                  onCheckedChange={setEditAdsEnabled}
                />
                <Label htmlFor="editAdsEnabled" className="text-sm">
                  Enable Ads
                </Label>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateLink}
                  disabled={updateMovieLinkMutation.isPending}
                >
                  {updateMovieLinkMutation.isPending ? "Updating..." : "Update"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Quality Link Dialog */}
        <Dialog open={isEditQualityDialogOpen} onOpenChange={setIsEditQualityDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Quality Movie Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Movie Name</Label>
                <Input value={editingQualityLink?.movie_name || ""} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Short ID</Label>
                <Input value={editingQualityLink?.short_id || ""} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editQuality480p">480p Download Link</Label>
                <Input
                  id="editQuality480p"
                  value={editQuality480p}
                  onChange={(e) => setEditQuality480p(e.target.value)}
                  placeholder="Enter 480p download link (optional)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editQuality720p">720p Download Link</Label>
                <Input
                  id="editQuality720p"
                  value={editQuality720p}
                  onChange={(e) => setEditQuality720p(e.target.value)}
                  placeholder="Enter 720p download link (optional)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editQuality1080p">1080p Download Link</Label>
                <Input
                  id="editQuality1080p"
                  value={editQuality1080p}
                  onChange={(e) => setEditQuality1080p(e.target.value)}
                  placeholder="Enter 1080p download link (optional)"
                />
              </div>
              <div className="flex items-center space-x-2 pb-2">
                <Switch
                  id="editQualityAdsEnabled"
                  checked={editQualityAdsEnabled}
                  onCheckedChange={setEditQualityAdsEnabled}
                />
                <Label htmlFor="editQualityAdsEnabled" className="text-sm">
                  Enable Ads
                </Label>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsEditQualityDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateQualityLink}
                  disabled={updateQualityMovieLinkMutation.isPending}
                >
                  {updateQualityMovieLinkMutation.isPending ? "Updating..." : "Update"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Quality Episode Dialog */}
        <Dialog open={isEditEpisodeDialogOpen} onOpenChange={setIsEditEpisodeDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Quality Episode Series</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Series Name</Label>
                <Input 
                  value={editSeriesName} 
                  onChange={(e) => setEditSeriesName(e.target.value)}
                  placeholder="Enter series/movie name"
                />
              </div>
              <div className="space-y-2">
                <Label>Short ID</Label>
                <Input value={editingQualityEpisode?.short_id || editingQualityEpisode?.shortId || ""} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editStartFromEpisode">Start From Episode</Label>
                <Input
                  id="editStartFromEpisode"
                  type="number"
                  min={1}
                  value={editStartFromEpisode}
                  onChange={(e) => setEditStartFromEpisode(e.target.value)}
                  placeholder="Starting episode number"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Episodes ({editEpisodesList.length})</Label>
                  <Button onClick={handleAddEditEpisode} variant="outline" size="sm">
                    Add Episode
                  </Button>
                </div>
                
                {editEpisodesList.map((episode, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold">Episode {episode.episodeNumber}</Label>
                      {editEpisodesList.length > 1 && (
                        <Button 
                          onClick={() => handleRemoveEditEpisode(index)}
                          variant="destructive" 
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label>480p Download Link</Label>
                      <Input
                        value={episode.quality480p}
                        onChange={(e) => handleEditEpisodeChange(index, 'quality480p', e.target.value)}
                        placeholder="480p download link"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>720p Download Link</Label>
                      <Input
                        value={episode.quality720p}
                        onChange={(e) => handleEditEpisodeChange(index, 'quality720p', e.target.value)}
                        placeholder="720p download link"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>1080p Download Link</Label>
                      <Input
                        value={episode.quality1080p}
                        onChange={(e) => handleEditEpisodeChange(index, 'quality1080p', e.target.value)}
                        placeholder="1080p download link"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-2 pb-2">
                <Switch
                  id="editEpisodeAdsEnabled"
                  checked={editEpisodeAdsEnabled}
                  onCheckedChange={setEditEpisodeAdsEnabled}
                />
                <Label htmlFor="editEpisodeAdsEnabled" className="text-sm">
                  Enable Ads (10s timer)
                </Label>
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsEditEpisodeDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateQualityEpisode}
                  disabled={updateQualityEpisodeMutation.isPending}
                >
                  {updateQualityEpisodeMutation.isPending ? "Updating..." : "Update"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Quality Zip Dialog */}
        <Dialog open={isEditZipDialogOpen} onOpenChange={setIsEditZipDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Quality Zip Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Movie Name</Label>
                <Input 
                  value={editZipMovieName} 
                  onChange={(e) => setEditZipMovieName(e.target.value)}
                  placeholder="Enter movie name"
                />
              </div>
              <div className="space-y-2">
                <Label>Short ID</Label>
                <Input value={editingQualityZip?.short_id || editingQualityZip?.shortId || ""} readOnly />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editZipFromEpisode">From Episode</Label>
                  <Input
                    id="editZipFromEpisode"
                    type="number"
                    min={1}
                    value={editZipFromEpisode}
                    onChange={(e) => setEditZipFromEpisode(e.target.value)}
                    placeholder="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editZipToEpisode">To Episode</Label>
                  <Input
                    id="editZipToEpisode"
                    type="number"
                    min={1}
                    value={editZipToEpisode}
                    onChange={(e) => setEditZipToEpisode(e.target.value)}
                    placeholder="10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editZipQuality480p">480p Zip Download Link</Label>
                <Input
                  id="editZipQuality480p"
                  value={editZipQuality480p}
                  onChange={(e) => setEditZipQuality480p(e.target.value)}
                  placeholder="Enter 480p zip download link (optional)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editZipQuality720p">720p Zip Download Link</Label>
                <Input
                  id="editZipQuality720p"
                  value={editZipQuality720p}
                  onChange={(e) => setEditZipQuality720p(e.target.value)}
                  placeholder="Enter 720p zip download link (optional)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editZipQuality1080p">1080p Zip Download Link</Label>
                <Input
                  id="editZipQuality1080p"
                  value={editZipQuality1080p}
                  onChange={(e) => setEditZipQuality1080p(e.target.value)}
                  placeholder="Enter 1080p zip download link (optional)"
                />
              </div>
              <div className="flex items-center space-x-2 pb-2">
                <Switch
                  id="editZipAdsEnabled"
                  checked={editZipAdsEnabled}
                  onCheckedChange={setEditZipAdsEnabled}
                />
                <Label htmlFor="editZipAdsEnabled" className="text-sm">
                  Enable Ads (10s timer)
                </Label>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsEditZipDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateQualityZip}
                  disabled={updateQualityZipMutation.isPending}
                >
                  {updateQualityZipMutation.isPending ? "Updating..." : "Update"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminPanel;