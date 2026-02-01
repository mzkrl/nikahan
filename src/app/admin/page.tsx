"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Plus, Link as LinkIcon, LogOut } from "lucide-react";

interface Guest {
    id: number;
    name: string;
    slug: string;
    phone?: string;
    shortlink?: string;
    attendanceStatus: string;
    wishes?: string;
}

interface Stats {
    total: number;
    attending: number;
    notAttending: number;
    pending: number;
}

export default function AdminPage() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");

    const [guests, setGuests] = useState<Guest[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [newGuestName, setNewGuestName] = useState("");
    const [newGuestPhone, setNewGuestPhone] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    // Check auth on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await fetch("/api/admin/check");
            const data = await res.json();
            setIsAuthenticated(data.isAdmin);
            if (data.isAdmin) {
                fetchData();
            }
        } catch (error) {
            console.error("Auth check failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchData = async () => {
        try {
            const [guestsRes, statsRes] = await Promise.all([
                fetch("/api/admin/guests"),
                fetch("/api/admin/stats"),
            ]);

            if (guestsRes.ok) {
                setGuests(await guestsRes.json());
            }
            if (statsRes.ok) {
                setStats(await statsRes.json());
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError("");

        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            if (res.ok) {
                setIsAuthenticated(true);
                fetchData();
            } else {
                setLoginError("Invalid password");
            }
        } catch (error) {
            setLoginError("Login failed");
        }
    };

    const handleLogout = async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        setIsAuthenticated(false);
        setGuests([]);
        setStats(null);
    };

    const handleCreateGuest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGuestName.trim()) return;

        setIsCreating(true);
        try {
            const res = await fetch("/api/admin/guests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newGuestName, phone: newGuestPhone }),
            });

            if (res.ok) {
                setNewGuestName("");
                setNewGuestPhone("");
                fetchData();
            }
        } catch (error) {
            console.error("Failed to create guest:", error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteGuest = async (id: number) => {
        if (!confirm("Are you sure you want to delete this guest?")) return;

        try {
            await fetch(`/api/admin/guests/${id}`, { method: "DELETE" });
            fetchData();
        } catch (error) {
            console.error("Failed to delete guest:", error);
        }
    };

    const copyInviteLink = (slug: string) => {
        const url = `${window.location.origin}/?guest=${slug}`;
        navigator.clipboard.writeText(url);
        alert("Invite link copied!");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-amber-700" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
                    <h1 className="text-3xl font-bold text-center mb-8 text-amber-700">Admin Login</h1>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500"
                                placeholder="Enter admin password"
                            />
                        </div>

                        {loginError && (
                            <p className="text-red-500 text-sm">{loginError}</p>
                        )}

                        <button
                            type="submit"
                            className="w-full py-3 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-medium transition-colors"
                        >
                            Login
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-amber-700 text-white py-4 px-6">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Wedding Admin</h1>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-6 space-y-8">
                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <p className="text-3xl font-bold text-amber-700">{stats.total}</p>
                            <p className="text-muted-foreground">Total Guests</p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <p className="text-3xl font-bold text-green-600">{stats.attending}</p>
                            <p className="text-muted-foreground">Attending</p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <p className="text-3xl font-bold text-red-600">{stats.notAttending}</p>
                            <p className="text-muted-foreground">Not Attending</p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <p className="text-3xl font-bold text-gray-600">{stats.pending}</p>
                            <p className="text-muted-foreground">Pending</p>
                        </div>
                    </div>
                )}

                {/* Add Guest Form */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h2 className="text-xl font-bold mb-4">Add New Guest</h2>
                    <form onSubmit={handleCreateGuest} className="flex flex-wrap gap-4">
                        <input
                            type="text"
                            value={newGuestName}
                            onChange={(e) => setNewGuestName(e.target.value)}
                            placeholder="Guest name"
                            className="flex-1 min-w-[200px] p-3 border rounded-lg focus:ring-2 focus:ring-amber-500"
                        />
                        <input
                            type="text"
                            value={newGuestPhone}
                            onChange={(e) => setNewGuestPhone(e.target.value)}
                            placeholder="Phone (optional)"
                            className="w-40 p-3 border rounded-lg focus:ring-2 focus:ring-amber-500"
                        />
                        <button
                            type="submit"
                            disabled={isCreating || !newGuestName.trim()}
                            className="px-6 py-3 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add Guest
                        </button>
                    </form>
                </div>

                {/* Guest List */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-bold">Guest List</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-amber-50">
                                <tr>
                                    <th className="text-left p-4 font-medium">Name</th>
                                    <th className="text-left p-4 font-medium">Status</th>
                                    <th className="text-left p-4 font-medium">Wishes</th>
                                    <th className="text-left p-4 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {guests.map((guest) => (
                                    <tr key={guest.id} className="border-t hover:bg-gray-50">
                                        <td className="p-4">
                                            <p className="font-medium">{guest.name}</p>
                                            <p className="text-sm text-muted-foreground">{guest.slug}</p>
                                        </td>
                                        <td className="p-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-medium ${guest.attendanceStatus === "present"
                                                        ? "bg-green-100 text-green-700"
                                                        : guest.attendanceStatus === "absent"
                                                            ? "bg-red-100 text-red-700"
                                                            : "bg-gray-100 text-gray-700"
                                                    }`}
                                            >
                                                {guest.attendanceStatus === "present"
                                                    ? "Attending"
                                                    : guest.attendanceStatus === "absent"
                                                        ? "Not Attending"
                                                        : "Pending"}
                                            </span>
                                        </td>
                                        <td className="p-4 max-w-xs truncate text-muted-foreground">
                                            {guest.wishes || "-"}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => copyInviteLink(guest.slug)}
                                                    className="p-2 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors"
                                                    title="Copy invite link"
                                                >
                                                    <LinkIcon className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteGuest(guest.id)}
                                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                    title="Delete guest"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {guests.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-muted-foreground">
                                            No guests yet. Add your first guest above!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
