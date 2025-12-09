import React, { useState, useEffect, useRef } from 'react';
import { Play, Info, Plus, Check, X, Search, Bell, ChevronDown, ArrowLeft, Trash2, SortAsc, LogOut, Star, Edit2, Save, XCircle, Clock, History, TrendingUp, Award, LayoutDashboard, Film, Users, BarChart3, PlusCircle, UserPlus, Upload, DollarSign, CreditCard, Camera } from 'lucide-react';

// ==========================================
// 1. CONFIG & SERVICES (Mô phỏng Backend)
// ==========================================

const API_URL = 'http://localhost:5000/api';
const USE_REAL_DB = true; // Đổi thành true nếu chạy server Node.js thật

// --- MOCK DATA ---
const DB_GENRES = { 'G01': 'Sci-Fi', 'G02': 'Drama', 'G10': 'Animation', 'G11': 'Action', 'G12': 'Horror', 'G13': 'Comedy', 'G14': 'Fantasy', 'G15': 'Crime', 'G16': 'Thriller', 'G17': 'Romance' };
const DB_ACTORS = { 'A001': { name: 'Henry Cavill' }, 'A002': { name: 'Robert Downey Jr.' }, 'A014': { name: 'Millie Bobby Brown' }, 'A020': { name: 'Cillian Murphy' }, 'A030': { name: 'Bryan Cranston' }, 'A031': { name: 'Lee Jung-jae' } };
const DB_DIRECTORS = { 'D001': { name: 'Christopher Nolan' }, 'D005': { name: 'Duffer Brothers' }, 'D010': { name: 'Russo Brothers' }, 'D020': { name: 'Vince Gilligan' } };
const DB_PLANS = { 'P1': { name: 'Basic', price: 120000, resolution: '720p', screens: 1 }, 'P2': { name: 'Standard', price: 180000, resolution: '1080p', screens: 2 }, 'P3': { name: 'Premium', price: 260000, resolution: '4K', screens: 4 } };

// Mock Progress for "Continue Watching"
const MOCK_USER_PROGRESS = {
    'M011': 75,
    'M202': 30, 
    'M001': 90, 
};

// Initial Users
const INITIAL_USERS = [
    { id: 'U001', username: 'anna', email: 'anna@gmail.com', role: 'user', plan: 'P1', status: 'Active', avatar: '' }, 
    { id: 'U002', username: 'john', email: 'john@yahoo.com', role: 'admin', plan: 'P2', status: 'Active', avatar: '' }, 
    { id: 'U003', username: 'admin', email: 'admin@ssc.com', role: 'admin', plan: 'P3', status: 'Active', avatar: '' },
];

// Initial Media
const INITIAL_MEDIA = [
  { media_ID: 'M001', title: 'Interstellar', type: 'Movie', release_date: '2014-11-07', description: 'Sci-fi space journey', duration: 169, box_office: 677000000, rating: 10, genre_ids: ['G01', 'G02'], actor_ids: ['A001'], director_ids: ['D001'], poster: 'https://image.tmdb.org/t/p/original/gEU2QniL6E77NI6lCU6MxlNBvIx.jpg', backdrop: 'https://image.tmdb.org/t/p/original/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg', video_id: 'zSWdZVtXT7E' },
  { media_ID: 'M101', title: 'Oppenheimer', type: 'Movie', release_date: '2023-07-21', description: 'The story of American scientist J. Robert Oppenheimer.', duration: 180, box_office: 950000000, rating: 9.2, genre_ids: ['G02'], actor_ids: ['A020'], director_ids: ['D001'], poster: 'https://image.tmdb.org/t/p/original/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', backdrop: 'https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg', video_id: 'uYPbbksJxIg' },
  { media_ID: 'M011', title: 'Stranger Things', type: 'Series', release_date: '2016-07-15', description: 'When a young boy vanishes, a small town uncovers a mystery.', total_seasons: 4, rating: 9.0, genre_ids: ['G01', 'G11', 'G12'], actor_ids: ['A014'], director_ids: ['D005'], poster: 'https://image.tmdb.org/t/p/original/49WJfeN0moxb9IPfGn8AIqMGskD.jpg', backdrop: 'https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYkOD8VG4OW.jpg', video_id: 'b9EkMc79ZSU' },
  { media_ID: 'M205', title: 'Breaking Bad', type: 'Series', release_date: '2008-01-20', description: 'A high school chemistry teacher diagnosed with lung cancer turns to meth.', total_seasons: 5, rating: 9.9, genre_ids: ['G15', 'G02'], actor_ids: ['A030'], director_ids: ['D020'], poster: 'https://image.tmdb.org/t/p/original/ggFHVNu6YYI5L9pCfOacjizRGt.jpg', backdrop: 'https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7Z.jpg', video_id: 'HhesaQXLuRY' },
  { media_ID: 'M202', title: 'Squid Game', type: 'Series', release_date: '2021-09-17', description: 'Hundreds of cash-strapped players accept a strange invitation.', total_seasons: 1, rating: 9.0, genre_ids: ['G11', 'G15', 'G16'], actor_ids: ['A031'], director_ids: [], poster: 'https://image.tmdb.org/t/p/original/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg', backdrop: 'https://image.tmdb.org/t/p/original/oaGvjB0DvdhXhOKs7.jpg', video_id: 'oqxAJKy0ii4' },
  { media_ID: 'M300', title: 'Arcane', type: 'Series', release_date: '2021-11-06', description: 'Set in Utopian Piltover and the oppressed underground of Zaun.', total_seasons: 2, rating: 9.8, genre_ids: ['G10', 'G11'], actor_ids: [], director_ids: [], poster: 'https://image.tmdb.org/t/p/original/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg', backdrop: 'https://image.tmdb.org/t/p/original/2Fk3AB8E9d7CntNR3zduqi9Zsu0.jpg', video_id: 'fXmAurh012s' }
];

const apiService = {
    fetchMedia: async () => {
        if (USE_REAL_DB) {
            try {
                const res = await fetch(`${API_URL}/media`);
                const data = await res.json();
                return Array.isArray(data) ? data : INITIAL_MEDIA;
            } catch (error) { 
                console.warn("DB Connection failed, using mock data."); 
                return INITIAL_MEDIA; 
            }
        }
        return INITIAL_MEDIA;
    },
    login: async (email, password) => {
        if (USE_REAL_DB) {
            try {
                const res = await fetch(`${API_URL}/login`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ email, password }) });
                return await res.json();
            } catch (e) { console.warn("Login API failed"); }
        }
        const user = INITIAL_USERS.find(u => (u.email === email || u.username === email));
        if (user) return { success: true, user };
        return { success: false, message: 'User not found' };
    }
};

// ==========================================
// 2. COMPONENTS
// ==========================================

const SafeImage = ({ src, alt, className }) => {
    const [imgSrc, setImgSrc] = useState(src);
    return <img src={imgSrc} alt={alt} className={className} onError={() => setImgSrc(`https://placehold.co/400x600/333/FFF?text=${encodeURIComponent(alt || 'Image')}`)} loading="lazy" />;
};

const Billboard = ({ movie, onInfoClick, onPlay }) => {
    if (!movie) return null;
    return (
        <div className="relative h-[56.25vw] md:h-[85vh] w-full">
            <SafeImage src={movie.backdrop} alt={movie.title} className="w-full h-full object-cover brightness-[60%]" />
            <div className="absolute top-[30%] md:top-[40%] left-4 md:left-12 w-[90%] md:w-[40%] text-white space-y-4">
                <h1 className="text-3xl md:text-6xl font-bold drop-shadow-lg">{movie.title}</h1>
                <p className="text-xs md:text-lg drop-shadow-md line-clamp-3">{movie.description}</p>
                <div className="flex flex-row items-center gap-3 mt-4">
                    <button onClick={() => onPlay(movie)} className="bg-white text-black md:text-xl font-bold flex flex-row items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded hover:bg-white/80 transition"><Play className="w-4 h-4 md:w-7 md:h-7 fill-black" /> Play</button>
                    <button onClick={onInfoClick} className="bg-gray-500/70 text-white md:text-xl font-bold flex flex-row items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded hover:bg-gray-500/50 transition"><Info className="w-4 h-4 md:w-7 md:h-7" /> More Info</button>
                </div>
            </div>
            <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-[#141414] to-transparent" />
        </div>
    );
};

const MovieCard = ({ movie, onMovieClick, progress }) => (
    <div onClick={() => onMovieClick(movie)} className="group relative w-[200px] h-[300px] flex-none cursor-pointer transition-transform duration-300 hover:scale-105 hover:z-50">
        <SafeImage src={movie.poster} alt={movie.title} className="w-full h-full object-cover rounded-md" />
        {progress && (<div className="absolute bottom-4 left-4 right-4 h-1 bg-gray-600 rounded-full overflow-hidden z-10 group-hover:hidden"><div className="h-full bg-red-600" style={{ width: `${progress}%` }}></div></div>)}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 rounded-md">
            <h3 className="text-white text-sm font-bold">{movie.title}</h3>
            <div className="flex items-center gap-2 mt-2">
                <button className="p-2 bg-white rounded-full hover:bg-gray-200"><Play className="w-3 h-3 fill-black text-black" /></button>
                <button className="p-2 border border-gray-400 rounded-full hover:bg-gray-800 text-white"><Info className="w-3 h-3" /></button>
            </div>
        </div>
    </div>
);

const RankedMovieCard = ({ movie, index, onMovieClick }) => (
    <div onClick={() => onMovieClick(movie)} className="relative w-[200px] h-[240px] flex-none cursor-pointer group hover:scale-105 transition-transform duration-300">
        <div className="absolute -left-6 bottom-0 z-0 font-black text-[180px] leading-none text-black" style={{ WebkitTextStroke: '4px #555' }}>{index + 1}</div>
        <div className="absolute right-0 top-0 bottom-0 w-[140px] z-10 rounded-md overflow-hidden shadow-lg">
            <SafeImage src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
        </div>
    </div>
);

const MovieRow = ({ title, movies, onMovieClick, useProgress }) => {
    if (!movies || movies.length === 0) return null;
    return (
        <div className="px-4 md:px-12 mt-4 space-y-2 mb-8">
            <h2 className="text-white text-lg font-bold">{title}</h2>
            <div className="flex flex-row overflow-x-auto gap-2 scrollbar-hide scroll-smooth py-2">
                {movies.map(m => <MovieCard key={m.media_ID} movie={m} onMovieClick={onMovieClick} progress={useProgress ? MOCK_USER_PROGRESS[m.media_ID] : null} />)}
            </div>
        </div>
    );
};

const RankedMovieRow = ({ title, movies, onMovieClick }) => {
    if (!movies || movies.length === 0) return null;
    return (
      <div className="px-4 md:px-12 mt-4 space-y-2 mb-12">
        <h2 className="text-white text-md md:text-xl font-bold">{title}</h2>
        <div className="flex flex-row overflow-x-auto gap-12 scrollbar-hide py-8 px-8">
          {movies.slice(0, 10).map((movie, idx) => (<RankedMovieCard key={movie.media_ID} index={idx} movie={movie} onMovieClick={onMovieClick} />))}
        </div>
      </div>
    );
};

const Modal = ({ media, onClose, onPlay }) => {
    if (!media) return null;
    const castNames = (media.actor_ids || []).map(id => DB_ACTORS[id]?.name).join(', ');
    const directorName = (media.director_ids || []).map(id => DB_DIRECTORS[id]?.name || id).join(', ');
    
    return (
        <div className="fixed inset-0 z-[1000] bg-black/80 flex justify-center overflow-y-auto pt-10 pb-10 px-4">
            <button onClick={onClose} className="fixed top-4 right-8 z-[1100] w-10 h-10 rounded-full bg-[#181818] border border-gray-600 flex items-center justify-center hover:bg-white/20 transition shadow-lg"><X className="w-6 h-6 text-white" /></button>
            <div className="relative w-full max-w-4xl bg-[#141414] rounded-lg shadow-2xl flex flex-col min-h-min mb-10 mt-6">
                <div className="relative h-[40vh] md:h-[50vh] shrink-0 w-full">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent z-[1]" />
                    <SafeImage src={media.backdrop} alt={media.title} className="w-full h-full object-cover rounded-t-lg" />
                    <div className="absolute bottom-10 left-10 z-[2]">
                        <h2 className="text-4xl font-bold text-white mb-4">{media.title}</h2>
                        <button onClick={() => onPlay(media)} className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded font-bold hover:bg-white/90"><Play className="w-6 h-6 fill-black" /> Play</button>
                    </div>
                </div>
                <div className="p-6 md:p-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
                        <div className="md:col-span-2 space-y-4">
                            <div className="flex items-center gap-4 text-sm font-semibold">
                                <span className="text-green-400">98% Match</span>
                                <span>{media.release_date.substring(0, 4)}</span>
                                <span className="border border-gray-500 px-1 text-xs">HD</span>
                                {media.type === 'Movie' && <span className="text-gray-400">{Math.floor(media.duration / 60)}h {media.duration % 60}m</span>}
                            </div>
                            <p className="text-lg leading-relaxed">{media.description}</p>
                            {media.type === 'Movie' && (
                                <div className="mt-4 p-3 bg-gray-800 rounded border border-gray-700 grid grid-cols-2 gap-4">
                                    <div><p className="text-xs text-gray-400">Box Office</p><p className="font-mono text-green-400">${Number(media.box_office).toLocaleString()}</p></div>
                                    <div><p className="text-xs text-gray-400">Duration</p><p className="font-mono text-white">{media.duration} mins</p></div>
                                </div>
                            )}
                        </div>
                        <div className="space-y-4 text-sm">
                            <div><span className="text-gray-500">Cast: </span>{castNames}</div>
                            <div><span className="text-gray-500">Director: </span>{directorName}</div>
                            <div><span className="text-gray-500">Genres: </span>{media.genre_ids?.map(id => DB_GENRES[id]).join(', ')}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const VideoPlayer = ({ movie, onClose }) => {
    const [showControls, setShowControls] = useState(true);
    useEffect(() => { const t = setTimeout(() => setShowControls(false), 3000); return () => clearTimeout(t); }, []);
    if (!movie) return null;
    return (
        <div className="fixed inset-0 z-[2000] bg-black flex flex-col">
            <div className={`absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-black/80 to-transparent z-50 transition-opacity ${showControls?'opacity-100':'opacity-0'}`}>
                 <button onClick={onClose} className="flex items-center gap-2 text-white hover:text-gray-300 bg-black/50 p-2 rounded-full px-4"><ArrowLeft className="w-8 h-8" /> <span className="text-xl font-bold">{movie.title}</span></button>
            </div>
            <div className="flex-1 w-full h-full">
                <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${movie.video_id}?autoplay=1&controls=1&rel=0`} title={movie.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
            </div>
        </div>
    );
};

// --- ADMIN PANELS ---
const AdminMediaModal = ({ media, onClose, onSave }) => {
    const [posterPreview, setPosterPreview] = useState(media?.poster || '');
    const [backdropPreview, setBackdropPreview] = useState(media?.backdrop || '');
    const handleImageChange = (e, setPreview) => {
        const file = e.target.files[0];
        if (file) { const reader = new FileReader(); reader.onloadend = () => setPreview(reader.result); reader.readAsDataURL(file); }
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        onSave({
            media_ID: media ? media.media_ID : `M${Date.now()}`,
            title: formData.get('title'), type: formData.get('type'), release_date: formData.get('date'),
            rating: parseFloat(formData.get('rating')), description: formData.get('description'),
            duration: formData.get('duration'), box_office: formData.get('box_office'),
            poster: posterPreview, backdrop: backdropPreview, video_id: 'zSWdZVtXT7E', genre_ids: ['G01'], actor_ids: [], director_ids: []
        });
    };
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[2000] p-4">
            <div className="bg-gray-900 w-full max-w-2xl rounded-lg border border-gray-700 p-6 overflow-y-auto max-h-[90vh]">
                <h3 className="text-xl font-bold mb-4 text-white">{media ? 'Edit' : 'Add'} Content</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input name="title" defaultValue={media?.title} className="bg-gray-800 border-gray-600 rounded p-2 text-white w-full" placeholder="Title" required />
                        <select name="type" defaultValue={media?.type || 'Movie'} className="bg-gray-800 border-gray-600 rounded p-2 text-white w-full"><option>Movie</option><option>Series</option></select>
                    </div>
                    <textarea name="description" defaultValue={media?.description} className="bg-gray-800 border-gray-600 rounded p-2 text-white w-full" placeholder="Description" required />
                    <div className="grid grid-cols-2 gap-4">
                        <input name="date" type="date" defaultValue={media?.release_date} className="bg-gray-800 border-gray-600 rounded p-2 text-white w-full" required />
                        <input name="rating" type="number" step="0.1" defaultValue={media?.rating} className="bg-gray-800 border-gray-600 rounded p-2 text-white w-full" placeholder="Rating" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input name="duration" type="number" defaultValue={media?.duration} className="bg-gray-800 border-gray-600 rounded p-2 text-white w-full" placeholder="Duration (min)" />
                        <input name="box_office" type="number" defaultValue={media?.box_office} className="bg-gray-800 border-gray-600 rounded p-2 text-white w-full" placeholder="Box Office ($)" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="relative group w-full h-32 bg-gray-800 border-2 border-dashed border-gray-600 rounded flex items-center justify-center overflow-hidden">{posterPreview ? <img src={posterPreview} className="w-full h-full object-cover"/> : <span className="text-gray-500">Poster</span>}<input type="file" onChange={e => handleImageChange(e, setPosterPreview)} className="absolute inset-0 opacity-0 cursor-pointer"/></div>
                        <div className="relative group w-full h-32 bg-gray-800 border-2 border-dashed border-gray-600 rounded flex items-center justify-center overflow-hidden">{backdropPreview ? <img src={backdropPreview} className="w-full h-full object-cover"/> : <span className="text-gray-500">Backdrop</span>}<input type="file" onChange={e => handleImageChange(e, setBackdropPreview)} className="absolute inset-0 opacity-0 cursor-pointer"/></div>
                    </div>
                    <div className="flex justify-end gap-3"><button type="button" onClick={onClose} className="px-4 py-2 bg-gray-700 rounded text-white">Cancel</button><button type="submit" className="px-4 py-2 bg-red-600 rounded text-white font-bold">Save</button></div>
                </form>
            </div>
        </div>
    );
};

const AdminDashboard = ({ mediaList, users, onMediaActions, onUserActions, onLogout }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [mediaModal, setMediaModal] = useState({ isOpen: false, data: null });
    const [userModal, setUserModal] = useState({ isOpen: false, data: null });

    return (
        <div className="flex min-h-screen bg-gray-900 text-white font-sans">
            <div className="w-64 bg-black border-r border-gray-800 flex flex-col p-4 space-y-4">
                <div className="flex items-center gap-2 mb-4"><img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" className="h-6" /><span className="bg-red-600 text-xs px-2 py-0.5 rounded font-bold">ADMIN</span></div>
                {['overview','media','users'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`capitalize w-full text-left p-3 rounded ${activeTab === tab ? 'bg-red-600' : 'hover:bg-gray-800'}`}>{tab}</button>
                ))}
                <button onClick={onLogout} className="mt-auto flex gap-2"><LogOut className="w-5 h-5"/> Sign Out</button>
            </div>
            <div className="flex-1 p-8 overflow-y-auto">
                {activeTab === 'overview' && <div className="grid grid-cols-3 gap-6"><div className="bg-gray-800 p-6 rounded border border-gray-700"><h3 className="text-gray-400">Movies</h3><p className="text-4xl font-bold">{mediaList.length}</p></div><div className="bg-gray-800 p-6 rounded border border-gray-700"><h3 className="text-gray-400">Users</h3><p className="text-4xl font-bold">{users.length}</p></div></div>}
                {activeTab === 'media' && (
                    <div>
                        <div className="flex justify-between mb-6"><h2 className="text-2xl font-bold">Media</h2><button onClick={()=>setMediaModal({isOpen:true, data:null})} className="bg-red-600 px-4 py-2 rounded flex items-center gap-2"><PlusCircle className="w-4 h-4"/> Add</button></div>
                        <div className="bg-gray-800 rounded overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-700 text-gray-300 text-xs uppercase"><tr><th className="p-4">Title</th><th className="p-4">Type</th><th className="p-4 text-right">Actions</th></tr></thead>
                                <tbody className="divide-y divide-gray-700">{mediaList.map(m=>(<tr key={m.media_ID}><td className="p-4 font-bold">{m.title}</td><td className="p-4">{m.type}</td><td className="p-4 text-right space-x-2"><button onClick={()=>setMediaModal({isOpen:true, data:m})} className="text-blue-400"><Edit2 className="w-4 h-4"/></button><button onClick={()=>onMediaActions.delete(m.media_ID)} className="text-red-400"><Trash2 className="w-4 h-4"/></button></td></tr>))}</tbody>
                            </table>
                        </div>
                    </div>
                )}
                {activeTab === 'users' && (
                    <div>
                        <div className="flex justify-between mb-6"><h2 className="text-2xl font-bold">Users</h2><button onClick={() => setUserModal({ isOpen: true, data: null })} className="bg-green-600 px-4 py-2 rounded flex gap-2"><UserPlus className="w-4 h-4" /> Add</button></div>
                        <div className="bg-gray-800 rounded overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-700 text-gray-300 text-xs uppercase"><tr><th className="p-4">User</th><th className="p-4">Role</th><th className="p-4 text-right">Actions</th></tr></thead>
                                <tbody className="divide-y divide-gray-700">{users.map(u => (<tr key={u.id}><td className="p-4">{u.username}</td><td className="p-4">{u.role}</td><td className="p-4 text-right space-x-2"><button className="text-red-400" onClick={() => onUserActions.delete(u.id)}><Trash2 className="w-4 h-4"/></button></td></tr>))}</tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
            {mediaModal.isOpen && <AdminMediaModal media={mediaModal.data} onClose={()=>setMediaModal({isOpen:false})} onSave={(d)=>{ if(mediaModal.data) onMediaActions.edit(d); else onMediaActions.add(d); setMediaModal({isOpen:false}) }} />}
            {userModal.isOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[2000]">
                    <div className="bg-gray-900 p-6 rounded w-96">
                        <h3 className="mb-4 font-bold">{userModal.data ? 'Edit' : 'Add'} User</h3>
                        <button onClick={() => setUserModal({isOpen:false})} className="bg-gray-600 px-4 py-2 rounded">Close (Demo Only)</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- APP & AUTH ---
const UserProfile = ({ user, onUpdateUser, onClose }) => {
    const [avatar, setAvatar] = useState(user.avatar || '');
    const [plan, setPlan] = useState(user.plan);
    const handleSave = () => { onUpdateUser({...user, avatar, plan}); onClose(); };
    return (
        <div className="pt-24 px-8 min-h-screen text-white flex justify-center">
            <div className="w-full max-w-3xl">
                <h1 className="text-3xl font-bold mb-6">Profile</h1>
                <div className="flex gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-32 h-32 bg-gray-800 rounded overflow-hidden relative group">
                            {avatar ? <img src={avatar} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center bg-blue-600 text-3xl font-bold">{user.username[0]}</div>}
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => { const r = new FileReader(); r.onload=()=>setAvatar(r.result); r.readAsDataURL(e.target.files[0]); }}/>
                        </div>
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="bg-gray-800 p-4 rounded">
                            <h3 className="font-bold mb-2">Plan</h3>
                            {Object.keys(DB_PLANS).map(pid => (
                                <div key={pid} onClick={()=>setPlan(pid)} className={`p-3 rounded border cursor-pointer mb-2 flex justify-between ${plan===pid?'border-red-600 bg-gray-700':'border-gray-600'}`}>
                                    <span>{DB_PLANS[pid].name} ({DB_PLANS[pid].resolution})</span><span>{DB_PLANS[pid].price.toLocaleString()}đ</span>
                                </div>
                            ))}
                        </div>
                        <button onClick={handleSave} className="px-6 py-2 bg-white text-black font-bold rounded hover:bg-red-600 hover:text-white">Save</button>
                        <button onClick={onClose} className="px-6 py-2 border border-gray-500 rounded ml-2">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AuthPage = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <div className="h-screen w-full bg-black flex items-center justify-center bg-[url('https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bcae-07a3f8dc141a/f6d7434e-d6de-4185-a6d4-c77a2d08737b/US-en-20220502-popsignuptwoweeks-perspective_alpha_website_medium.jpg')] bg-cover">
            <div className="bg-black/80 p-12 rounded w-96 text-white">
                <h1 className="text-3xl font-bold mb-8">Sign In</h1>

                <input
                    placeholder="Email or username"
                    className="w-full p-3 bg-[#333] rounded mb-4"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-3 bg-[#333] rounded mb-8"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />

                <button
                    onClick={() => onLogin({ email, password })}
                    className="w-full py-3 bg-red-600 rounded font-bold"
                >
                    Sign In
                </button>

                <div className="mt-4 text-gray-400 text-sm">
                    <p>Try <b>admin</b></p>
                    <p>Try <b>anna</b></p>
                </div>
            </div>
        </div>
    );
};


// --- APP ROOT ---
const App = () => {
    const [user, setUser] = useState(null);
    const [mediaList, setMediaList] = useState(INITIAL_MEDIA);
    const [users, setUsers] = useState(INITIAL_USERS);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [viewProfile, setViewProfile] = useState(false);

    useEffect(() => { 
        apiService.fetchMedia().then(d => {
            if (d && Array.isArray(d)) setMediaList(d);
        }); 
    }, []);

    const adminMediaActions = { add: m => setMediaList([...mediaList, m]), edit: m => setMediaList(mediaList.map(x => x.media_ID === m.media_ID ? m : x)), delete: id => setMediaList(mediaList.filter(x => x.media_ID !== id)) };
    const adminUserActions = { add: u => setUsers([...users, u]), edit: u => setUsers(users.map(x => x.id === u.id ? u : x)), delete: id => setUsers(users.filter(x => x.id !== id)) };
    
    if (!user) return <AuthPage onLogin={async creds => { const res = await apiService.login(creds.email, creds.password); if(res.success) setUser(res.user); else alert("Failed"); }} />;
    if (user.role === 'admin') return <AdminDashboard mediaList={mediaList} users={users} onMediaActions={adminMediaActions} onUserActions={adminUserActions} onLogout={() => setUser(null)} />;

    // USER VIEW
    const trendingMovies = mediaList.filter(m => parseInt(m.release_date.substring(0,4)) >= 2023);
    const topRatedMovies = [...mediaList].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 10);

    return (
        <div className="bg-[#141414] min-h-screen text-white font-sans">
            <nav className="fixed w-full z-[100] bg-gradient-to-b from-black/80 to-transparent px-8 py-4 flex justify-between">
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" className="h-7 cursor-pointer" onClick={() => setViewProfile(false)}/>
                <div className="flex gap-4 items-center">
                    <div className="cursor-pointer flex items-center gap-2" onClick={()=>setViewProfile(true)}>
                        {user.avatar ? <img src={user.avatar} className="w-8 h-8 rounded"/> : <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold">{user.username[0]}</div>}
                    </div>
                    <button onClick={() => setUser(null)}><LogOut className="w-5 h-5"/></button>
                </div>
            </nav>
            {viewProfile ? <UserProfile user={user} onUpdateUser={u => { setUser(u); setViewProfile(false); }} onClose={() => setViewProfile(false)} /> : (
                <>
                    <Billboard movie={mediaList[0]} onInfoClick={() => setSelectedMovie(mediaList[0])} onPlay={() => alert("Playing...")} />
                    <div className="pb-20 -mt-32 relative z-10 space-y-4">
                        <MovieRow title={`Continue Watching for ${user.username}`} movies={mediaList.filter(m => MOCK_USER_PROGRESS[m.media_ID])} onMovieClick={setSelectedMovie} useProgress={true} />
                        <MovieRow title="Trending Now" movies={trendingMovies} onMovieClick={setSelectedMovie} />
                        <RankedMovieRow title="Top 10 in Vietnam" movies={topRatedMovies} onMovieClick={setSelectedMovie} />
                        <MovieRow title="Sci-Fi & Fantasy" movies={mediaList.filter(m => m.genre_ids?.includes('G01'))} onMovieClick={setSelectedMovie} />
                    </div>
                </>
            )}
            <Modal media={selectedMovie} onClose={() => setSelectedMovie(null)} onPlay={() => alert("Playing...")} />
        </div>
    );
};

export default App;