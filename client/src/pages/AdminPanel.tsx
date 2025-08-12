import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import type { MovieLink, InsertMovieLink, ApiToken, InsertApiToken } from "@shared/schema";

const AdminPanel = () => {
  const [, setLocation] = useLocation();
  const [movieName, setMovieName] = useState("");
  const [originalLink, setOriginalLink] = useState("");
  const [adsEnabled, setAdsEnabled] = useState(true);
  const [generatedLink, setGeneratedLink] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [editingLink, setEditingLink] = useState<MovieLink | null>(null);
  const [editOriginalLink, setEditOriginalLink] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // API Token states
  const [tokenName, setTokenName] = useState("");
  const [isTokenDialogOpen, setIsTokenDialogOpen] = useState(false);
  const [generatedToken, setGeneratedToken] = useState("");
  const [editingToken, setEditingToken] = useState<any | null>(null);
  const [isEditTokenDialogOpen, setIsEditTokenDialogOpen] = useState(false);
  
  // Admin Settings states
  const [newAdminId, setNewAdminId] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("moviezone_admin_logged_in");
    if (!isLoggedIn) {
      setLocation("/");
      return;
    }
  }, [setLocation]);

  // Fetch movie links from API
  const { data: movieLinks = [], isLoading } = useQuery({
    queryKey: ["/api/movie-links"],
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
    mutationFn: async ({ id, originalLink }: { id: number; originalLink: string }) => {
      return apiRequest(`/api/movie-links/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ originalLink }),
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
    mutationFn: async (data: { tokenName: string }) => {
      return apiRequest("/api/tokens", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tokens"] });
      setGeneratedToken(data.tokenValue);
      setTokenName("");
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

  // Update admin credentials mutation
  const updateAdminMutation = useMutation({
    mutationFn: async (data: { adminId: string; adminPassword: string }) => {
      return apiRequest("/api/admin-config", {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      setNewAdminId("");
      setNewAdminPassword("");
      toast({
        title: "Credentials Updated",
        description: "Admin credentials updated successfully.",
      });
    },
  });

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
      });
      setIsTokenDialogOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate token",
        variant: "destructive",
      });
    }
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(generatedToken);
    toast({
      title: "Copied",
      description: "Token copied to clipboard!",
    });
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

  const handleUpdateAdminCredentials = async () => {
    if (!newAdminId.trim() || !newAdminPassword.trim()) {
      toast({
        title: "Error",
        description: "Please enter both admin ID and password",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateAdminMutation.mutateAsync({
        adminId: newAdminId.trim(),
        adminPassword: newAdminPassword.trim(),
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update admin credentials",
        variant: "destructive",
      });
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

  const handleEditLink = (link: MovieLink) => {
    setEditingLink(link);
    setEditOriginalLink(link.originalLink);
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

  const totalViews = (movieLinks as any[]).reduce((sum, link) => sum + (link?.views || 0), 0);
  
  // Calculate today's stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayLinks = (movieLinks as any[]).filter(link => {
    if (!link?.date_added) return false;
    const linkDate = new Date(link.date_added);
    linkDate.setHours(0, 0, 0, 0);
    return linkDate.getTime() === today.getTime();
  }).length;
  
  const todayViews = (movieLinks as any[])
    .filter(link => {
      if (!link?.date_added) return false;
      const linkDate = new Date(link.date_added);
      linkDate.setHours(0, 0, 0, 0);
      return linkDate.getTime() === today.getTime();
    })
    .reduce((sum, link) => sum + (link?.views || 0), 0);
  
  // Get the most recent 5 links for the recent links section
  const recentLinks = (movieLinks as any[])
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
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="tokens">API Tokens</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-6">
            {/* Stats Cards - 2x2 Grid */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{(movieLinks as any[]).length}</div>
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

            {/* Link Generator */}
            <Card>
              <CardContent className="p-6 space-y-4">
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
                      <div key={link.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{link.movie_name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {window.location.origin}/m/{link.short_id}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-sm text-muted-foreground">{link.views} views</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/m/${link.short_id}`);
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

            {/* Database Table */}
            <Card>
              <CardContent className="p-0">
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
                           <TableCell className="font-medium">{link.movie_name}</TableCell>
                           <TableCell className="hidden lg:table-cell max-w-64 truncate" title={link.original_link}>{link.original_link}</TableCell>
                           <TableCell>
                             <div className="flex items-center gap-2">
                               <code className="text-sm">/m/{link.short_id}</code>
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => {
                                   const fullUrl = `${window.location.origin}/m/${link.short_id}`;
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
                </div>
                {filteredLinks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No links found
                  </div>
                )}
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
                    <Button onClick={handleCopyToken} size="icon">
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
                            <TableCell className="font-medium">{token.token_name}</TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                token.is_active 
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                              }`}>
                                {token.is_active ? "Active" : "Inactive"}
                              </span>
                            </TableCell>
                            <TableCell>
                              {new Date(token.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {token.last_used 
                                ? new Date(token.last_used).toLocaleDateString()
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
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                {!token.is_active && (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteToken(token.id)}
                                    disabled={deleteTokenMutation.isPending}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
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
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">Endpoint:</h4>
                    <code className="bg-muted px-2 py-1 rounded">POST /api/create-short-link</code>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Headers:</h4>
                    <code className="bg-muted px-2 py-1 rounded">Authorization: Bearer YOUR_TOKEN_HERE</code>
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Admin Credentials</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newAdminId">New Admin ID</Label>
                    <Input
                      id="newAdminId"
                      type="text"
                      value={newAdminId}
                      onChange={(e) => setNewAdminId(e.target.value)}
                      placeholder="Enter new admin ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newAdminPassword">New Admin Password</Label>
                    <Input
                      id="newAdminPassword"
                      type="password"
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      placeholder="Enter new admin password"
                    />
                  </div>
                  <Button
                    onClick={handleUpdateAdminCredentials}
                    disabled={updateAdminMutation.isPending}
                    className="w-full"
                  >
                    {updateAdminMutation.isPending ? "Updating..." : "Update Credentials"}
                  </Button>
                </div>
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Important Notes:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Credentials are stored securely in Supabase database</li>
                    <li>• Changes take effect immediately across all admin sessions</li>
                    <li>• Make sure to remember your new credentials</li>
                    <li>• Use strong passwords for better security</li>
                  </ul>
                </div>
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
                <Input value={editingToken?.token_name || ""} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Token Value</Label>
                <div className="flex gap-2">
                  <Input value={editingToken?.token_value || ""} readOnly />
                  <Button 
                    onClick={() => {
                      if (editingToken?.token_value) {
                        navigator.clipboard.writeText(editingToken.token_value);
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
                    checked={editingToken?.is_active || false}
                    onCheckedChange={handleUpdateTokenStatus}
                    disabled={updateTokenMutation.isPending}
                  />
                  <Label>{editingToken?.is_active ? "Active" : "Inactive"}</Label>
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
      </div>
    </div>
  );
};

export default AdminPanel;