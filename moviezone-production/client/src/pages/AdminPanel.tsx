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
import type { MovieLink, InsertMovieLink } from "@shared/schema";

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

  const generateShortId = () => {
    return Math.random().toString(36).substring(2, 8);
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

  const filteredLinks = (movieLinks as MovieLink[])
    .filter(link => 
      link.movieName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") {
        const comparison = a.movieName.localeCompare(b.movieName);
        return sortOrder === "asc" ? comparison : -comparison;
      } else {
        const comparison = new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
        return sortOrder === "asc" ? comparison : -comparison;
      }
    });

  const totalViews = (movieLinks as MovieLink[]).reduce((sum, link) => sum + link.views, 0);
  const todayViews = 0; // Would need to implement proper tracking for this
  const todayLinks = 0; // Would need to implement proper tracking for this
  
  // Get the most recent 10 links for the recent links section
  const recentLinks = (movieLinks as MovieLink[])
    .slice()
    .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
    .slice(0, 10);

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
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-6">
            {/* Stats Cards - 2x2 Grid */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{(movieLinks as MovieLink[]).length}</div>
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
                          <p className="font-medium truncate">{link.movieName}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {window.location.origin}/m/{link.shortId}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-sm text-muted-foreground">{link.views} views</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/m/${link.shortId}`);
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
                           <TableCell className="font-medium">{link.movieName}</TableCell>
                           <TableCell className="hidden lg:table-cell max-w-64 truncate" title={link.originalLink}>{link.originalLink}</TableCell>
                           <TableCell>
                             <div className="flex items-center gap-2">
                               <code className="text-sm">/m/{link.shortId}</code>
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => {
                                   const fullUrl = `${window.location.origin}/m/${link.shortId}`;
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
                           <TableCell className="hidden xl:table-cell">{new Date(link.dateAdded).toLocaleDateString()}</TableCell>
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
        </Tabs>

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