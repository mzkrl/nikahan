"use client";

import { useState, useEffect } from "react";
import {
    Loader2, Trash2, Plus, Link as LinkIcon, LogOut,
    Users, UserCheck, UserX, Clock, Copy, ExternalLink,
    RefreshCw, Search, QrCode
} from "lucide-react";

interface Guest {
    id: number;
    name: string;
    slug: string;
    phone?: string;
    shortlink?: string;
    attendanceStatus: string;
    wishes?: string;
    createdAt?: string;
}

interface Stats {
    total: number;
    attending: number;
    notAttending: number;
    pending: number;
}

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");

    const [guests, setGuests] = useState<Guest[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [newGuestName, setNewGuestName] = useState("");
    const [newGuestPhone, setNewGuestPhone] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [generatingShortlink, setGeneratingShortlink] = useState<number | null>(null);
    const [showQR, setShowQR] = useState<number | null>(null);

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
        setPassword("");
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

    const handleDeleteGuest = async (id: number, name: string) => {
        if (!confirm(`Delete guest "${name}"?`)) return;

        try {
            await fetch(`/api/admin/guests/${id}`, { method: "DELETE" });
            fetchData();
        } catch (error) {
            console.error("Failed to delete guest:", error);
        }
    };

    const generateShortlink = async (id: number) => {
        setGeneratingShortlink(id);
        try {
            const res = await fetch(`/api/admin/guests/${id}/shortlink`, { method: "POST" });
            if (res.ok) {
                fetchData();
            }
        } catch (error) {
            console.error("Failed to generate shortlink:", error);
        } finally {
            setGeneratingShortlink(null);
        }
    };

    const getInviteLink = (slug: string) => {
        const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
        return `${baseUrl}/?guest=${slug}`;
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        alert(`${label} copied!`);
    };

    const filteredGuests = guests.filter(guest => {
        const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            guest.slug.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === "all" || guest.attendanceStatus === filterStatus;
        return matchesSearch && matchesFilter;
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
                <Loader2 className="w-10 h-10 animate-spin text-amber-700" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 p-4">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-amber-100">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-amber-700" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">Wedding Admin</h1>
                        <p className="text-gray-500 mt-2">Enter password to continue</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-4 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-center text-lg"
                                placeholder="••••••••"
                                autoFocus
                            />
                        </div>

                        {loginError && (
                            <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">{loginError}</p>
                        )}

                        <button
                            type="submit"
                            className="w-full py-4 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-medium transition-colors shadow-lg shadow-amber-200"
                        >
                            Login
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
            {/* Header */}
            <header className="bg-white border-b border-amber-100 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Wedding Admin</h1>
                        <p className="text-sm text-gray-500">Dimas & Davina</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={fetchData}
                            className="p-2 text-gray-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Refresh data"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-4 space-y-6">
                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl p-5 shadow-sm border border-amber-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 rounded-lg">
                                    <Users className="w-5 h-5 text-amber-700" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                                    <p className="text-sm text-gray-500">Total</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-5 shadow-sm border border-green-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <UserCheck className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-green-600">{stats.attending}</p>
                                    <p className="text-sm text-gray-500">Attending</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-5 shadow-sm border border-red-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <UserX className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-red-600">{stats.notAttending}</p>
                                    <p className="text-sm text-gray-500">Not Attending</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                    <Clock className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-600">{stats.pending}</p>
                                    <p className="text-sm text-gray-500">Pending</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Guest Form */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-amber-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Add New Guest</h2>
                    <form onSubmit={handleCreateGuest} className="flex flex-wrap gap-3">
                        <input
                            type="text"
                            value={newGuestName}
                            onChange={(e) => setNewGuestName(e.target.value)}
                            placeholder="Guest name *"
                            className="flex-1 min-w-[200px] p-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                        <input
                            type="text"
                            value={newGuestPhone}
                            onChange={(e) => setNewGuestPhone(e.target.value)}
                            placeholder="Phone (optional)"
                            className="w-40 p-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                        <button
                            type="submit"
                            disabled={isCreating || !newGuestName.trim()}
                            className="px-6 py-3 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2 transition-colors"
                        >
                            {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Add
                        </button>
                    </form>
                </div>

                {/* Search & Filter */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-amber-100 flex flex-wrap gap-4 items-center">
                    <div className="flex-1 min-w-[200px] relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search guests..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex gap-2">
                        {["all", "present", "absent", "pending"].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === status
                                    ? "bg-amber-700 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Guest List */}
                <div className="bg-white rounded-xl shadow-sm border border-amber-100 overflow-hidden">
                    <div className="p-4 border-b border-amber-100">
                        <h2 className="text-lg font-bold text-gray-800">
                            Guest List ({filteredGuests.length})
                        </h2>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {filteredGuests.map((guest) => (
                            <div key={guest.id} className="p-4 hover:bg-amber-50/50 transition-colors">
                                <div className="flex flex-wrap items-start gap-4">
                                    {/* Guest Info */}
                                    <div className="flex-1 min-w-[200px]">
                                        <h3 className="font-semibold text-gray-800">{guest.name}</h3>
                                        <p className="text-sm text-gray-500">/{guest.slug}</p>
                                        {guest.phone && (
                                            <p className="text-sm text-gray-400 mt-1">{guest.phone}</p>
                                        )}
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <span
                                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${guest.attendanceStatus === "present"
                                                ? "bg-green-100 text-green-700"
                                                : guest.attendanceStatus === "absent"
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-gray-100 text-gray-600"
                                                }`}
                                        >
                                            {guest.attendanceStatus === "present" ? "Attending" :
                                                guest.attendanceStatus === "absent" ? "Not Attending" : "Pending"}
                                        </span>
                                    </div>

                                    {/* Wishes */}
                                    {guest.wishes && (
                                        <div className="w-full md:w-auto md:flex-1 md:min-w-[200px]">
                                            <p className="text-sm text-gray-500 italic line-clamp-2">&ldquo;{guest.wishes}&rdquo;</p>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => copyToClipboard(getInviteLink(guest.slug), "Invite link")}
                                            className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                                            title="Copy invite link"
                                        >
                                            <LinkIcon className="w-4 h-4" />
                                        </button>

                                        {guest.shortlink && !guest.shortlink.startsWith("{") ? (
                                            <button
                                                onClick={() => copyToClipboard(guest.shortlink!, "Shortlink")}
                                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                title="Copy shortlink"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => generateShortlink(guest.id)}
                                                disabled={generatingShortlink === guest.id}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                                                title={guest.shortlink && guest.shortlink.startsWith("{") ? "Regenerate (Fixed invalid link)" : "Generate shortlink"}
                                            >
                                                {generatingShortlink === guest.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <ExternalLink className="w-4 h-4" />
                                                )}
                                            </button>
                                        )}

                                        <button
                                            onClick={() => setShowQR(showQR === guest.id ? null : guest.id)}
                                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                                            title="Show QR code"
                                        >
                                            <QrCode className="w-4 h-4" />
                                        </button>

                                        <button
                                            onClick={() => handleDeleteGuest(guest.id, guest.name)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                            title="Delete guest"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* QR Code Display */}
                                {showQR === guest.id && (
                                    <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg inline-block">
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(guest.shortlink || getInviteLink(guest.slug))}`}
                                            alt={`QR for ${guest.name}`}
                                            className="w-36 h-36"
                                        />
                                        <p className="text-xs text-gray-500 mt-2 text-center max-w-36 truncate">
                                            {guest.shortlink || getInviteLink(guest.slug)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}

                        {filteredGuests.length === 0 && (
                            <div className="p-12 text-center text-gray-500">
                                <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                <p>No guests found</p>
                                {searchTerm && <p className="text-sm mt-1">Try a different search term</p>}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
