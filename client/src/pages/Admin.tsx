import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { api, buildUrl } from "@shared/routes";
import { Guest } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogOut, Plus, QrCode, Trash2, Link2, Phone, UserCheck, UserX, Clock, Users, Edit2 } from "lucide-react";

export default function Admin() {
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestPhone, setNewGuestPhone] = useState("");
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [editPhone, setEditPhone] = useState("");
  const [selectedQrGuest, setSelectedQrGuest] = useState<Guest | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check authentication
  const { data: authData, isLoading: authLoading } = useQuery({
    queryKey: [api.admin.checkAuth.path],
    queryFn: async () => {
      const res = await fetch(api.admin.checkAuth.path, { credentials: "include" });
      return res.json() as Promise<{ authenticated: boolean }>;
    },
  });

  // Get stats/guests
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: [api.admin.stats.path],
    queryFn: async () => {
      const res = await fetch(api.admin.stats.path, { credentials: "include" });
      if (!res.ok) throw new Error("Not authenticated");
      return res.json();
    },
    enabled: authData?.authenticated,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (pwd: string) => {
      const res = await fetch(api.admin.login.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd }),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Login failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.checkAuth.path] });
      queryClient.invalidateQueries({ queryKey: [api.admin.stats.path] });
      toast({ title: "Login successful", description: "Welcome to the admin panel!" });
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: "Login failed", description: err.message });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(api.admin.logout.path, {
        method: "POST",
        credentials: "include",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.checkAuth.path] });
      queryClient.invalidateQueries({ queryKey: [api.admin.stats.path] });
    },
  });

  // Create guest mutation
  const createGuestMutation = useMutation({
    mutationFn: async ({ name, phone }: { name: string; phone?: string }) => {
      const res = await fetch(api.admin.createGuest.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to create guest");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.stats.path] });
      setNewGuestName("");
      setNewGuestPhone("");
      toast({ title: "Guest created", description: "New guest has been added successfully." });
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: "Error", description: err.message });
    },
  });

  // Update guest mutation
  const updateGuestMutation = useMutation({
    mutationFn: async ({ id, phone }: { id: number; phone: string }) => {
      const res = await fetch(buildUrl(api.admin.updateGuest.path, { id }), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update guest");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.stats.path] });
      setEditingGuest(null);
      toast({ title: "Guest updated", description: "Guest information has been updated." });
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: "Error", description: err.message });
    },
  });

  // Delete guest mutation
  const deleteGuestMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(buildUrl(api.admin.deleteGuest.path, { id }), {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete guest");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.stats.path] });
      toast({ title: "Guest deleted", description: "Guest has been removed." });
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: "Error", description: err.message });
    },
  });

  // Create shortlink mutation
  const createShortlinkMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(buildUrl(api.admin.createShortlink.path, { id }), {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to create shortlink");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.admin.stats.path] });
      toast({ title: "Shortlink created", description: data.shortlink });
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: "Error", description: err.message });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(password);
  };

  const getWhatsAppLink = (guest: Guest) => {
    if (!guest.phone || !guest.shortlink) return null;
    const message = encodeURIComponent(
      `Halo ${guest.name},\n\nKami dengan senang hati mengundang Anda ke pernikahan Rizky & Davina.\n\nSilakan klik link berikut untuk melihat undangan: ${guest.shortlink}\n\nKami menantikan kehadiran Anda!`
    );
    const phone = guest.phone.replace(/\D/g, "");
    return `https://wa.me/${phone}?text=${message}`;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!authData?.authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-serif">Admin Login</CardTitle>
            <CardDescription>Enter the admin password to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const guests: Guest[] = stats?.guests || [];
  const presentGuests = guests.filter((g) => g.attendanceStatus === "present");
  const absentGuests = guests.filter((g) => g.attendanceStatus === "absent");
  const pendingGuests = guests.filter((g) => g.attendanceStatus === "pending");

  const renderGuestCard = (guest: Guest) => (
    <Card key={guest.id} className="relative">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{guest.name}</h3>
            <p className="text-sm text-muted-foreground truncate">{guest.slug}</p>
            {guest.phone && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Phone className="w-3 h-3" />
                {guest.phone}
              </p>
            )}
            {guest.shortlink && (
              <p className="text-sm text-primary truncate mt-1">
                <Link2 className="w-3 h-3 inline mr-1" />
                {guest.shortlink}
              </p>
            )}
            <Badge
              variant={
                guest.attendanceStatus === "present"
                  ? "default"
                  : guest.attendanceStatus === "absent"
                  ? "destructive"
                  : "secondary"
              }
              className="mt-2"
            >
              {guest.attendanceStatus === "present" && <UserCheck className="w-3 h-3 mr-1" />}
              {guest.attendanceStatus === "absent" && <UserX className="w-3 h-3 mr-1" />}
              {guest.attendanceStatus === "pending" && <Clock className="w-3 h-3 mr-1" />}
              {guest.attendanceStatus}
            </Badge>
          </div>

          <div className="flex flex-col gap-2">
            {/* QR Code Button */}
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" onClick={() => setSelectedQrGuest(guest)}>
                  <QrCode className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>QR Code for {guest.name}</DialogTitle>
                  <DialogDescription>
                    Scan this QR code or share the link to send the invitation.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center gap-4 py-4">
                  {guest.shortlink ? (
                    <>
                      <QRCodeSVG value={guest.shortlink} size={200} />
                      <p className="text-sm text-muted-foreground">{guest.shortlink}</p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No shortlink created yet.</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Edit Button */}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingGuest(guest);
                    setEditPhone(guest.phone || "");
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit {guest.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Phone Number</Label>
                    <Input
                      id="edit-phone"
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="e.g., 6281234567890"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button
                    onClick={() => updateGuestMutation.mutate({ id: guest.id, phone: editPhone })}
                    disabled={updateGuestMutation.isPending}
                  >
                    {updateGuestMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Create Shortlink Button */}
            {!guest.shortlink && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => createShortlinkMutation.mutate(guest.id)}
                disabled={createShortlinkMutation.isPending}
              >
                {createShortlinkMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Link2 className="w-4 h-4" />
                )}
              </Button>
            )}

            {/* WhatsApp Button */}
            {guest.phone && guest.shortlink && (
              <Button size="sm" variant="outline" asChild className="bg-green-50 hover:bg-green-100">
                <a href={getWhatsAppLink(guest)!} target="_blank" rel="noopener noreferrer">
                  <Phone className="w-4 h-4 text-green-600" />
                </a>
              </Button>
            )}

            {/* Delete Button */}
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete {guest.name}?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. The guest will be permanently removed.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button
                    variant="destructive"
                    onClick={() => deleteGuestMutation.mutate(guest.id)}
                    disabled={deleteGuestMutation.isPending}
                  >
                    {deleteGuestMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Delete"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-primary">Wedding Admin</h1>
            <p className="text-sm text-muted-foreground">Manage guests and invitations</p>
          </div>
          <Button variant="ghost" onClick={() => logoutMutation.mutate()}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.total || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Guests</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.present || 0}</p>
                  <p className="text-sm text-muted-foreground">Attending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <UserX className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.absent || 0}</p>
                  <p className="text-sm text-muted-foreground">Not Attending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.pending || 0}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Guest Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Guest
            </CardTitle>
            <CardDescription>
              Add a new guest to the invitation list. You can create a shortlink for them later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createGuestMutation.mutate({ name: newGuestName, phone: newGuestPhone || undefined });
              }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <div className="flex-1">
                <Input
                  placeholder="Guest name (e.g., JOHN DOE)"
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value.toUpperCase())}
                  required
                />
              </div>
              <div className="flex-1">
                <Input
                  type="tel"
                  placeholder="Phone number (e.g., 6281234567890)"
                  value={newGuestPhone}
                  onChange={(e) => setNewGuestPhone(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={createGuestMutation.isPending}>
                {createGuestMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Add Guest
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Guest List Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All ({guests.length})</TabsTrigger>
            <TabsTrigger value="present">Attending ({presentGuests.length})</TabsTrigger>
            <TabsTrigger value="absent">Not Attending ({absentGuests.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingGuests.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {statsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {guests.map(renderGuestCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="present">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {presentGuests.map(renderGuestCard)}
            </div>
          </TabsContent>

          <TabsContent value="absent">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {absentGuests.map(renderGuestCard)}
            </div>
          </TabsContent>

          <TabsContent value="pending">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingGuests.map(renderGuestCard)}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
