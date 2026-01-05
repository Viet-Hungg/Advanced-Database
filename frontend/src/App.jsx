import React, { useState, useEffect } from 'react';
import { Play, Info, Plus, Check, X, ArrowLeft, Trash2, LogOut, Edit2, PlusCircle, UserPlus, Search } from 'lucide-react';

// ==========================================
// 1. CONFIG & SERVICES
// ==========================================

const API_URL = 'http://localhost:5000/api';
const USE_REAL_DB = true;

const DB_GENRES = { 'G01': 'Sci-Fi', 'G02': 'Drama', 'G05': 'Fantasy', 'G06': 'Drama', 'G07': 'Thriller', 'G09': 'Adventure', 'G10': 'Animation', 'G11': 'Action', 'G12': 'Horror', 'G15': 'Crime', 'G16': 'Thriller' };
const DB_ACTORS = { 'A001': { name: 'Henry Cavill' }, 'A014': { name: 'Millie Bobby Brown' }, 'A020': { name: 'Cillian Murphy' }, 'A030': { name: 'Bryan Cranston' }, 'A031': { name: 'Lee Jung-jae' } };
const DB_DIRECTORS = { 'D001': { name: 'Christopher Nolan' }, 'D002': { name: 'Denis Villeneuve' }, 'D003': { name: 'Damien Chazelle' }, 'D004': { name: 'Matt Reeves' }, 'D005': { name: 'Joon-ho Bong' }, 'D006': { name: 'Todd Phillips' }, 'D009': { name: 'David Benioff' }, 'D020': { name: 'Vince Gilligan' } };

const DB_PLANS = { 'P1': { name: 'Basic', price: 120000, resolution: '720p', screens: 1 }, 'P2': { name: 'Standard', price: 180000, resolution: '1080p', screens: 2 }, 'P3': { name: 'Premium', price: 260000, resolution: '4K', screens: 4 } };

const MOCK_USER_PROGRESS = { 'M011': 75, 'M202': 30, 'M001': 90 };

const INITIAL_USERS = [
    { id: 'U001', user_ID: 'U001', username: 'anna', email: 'anna@gmail.com', role: 'user', plan: 'P1', status: 'Active', avatar: '' },
    { id: 'U002', user_ID: 'U002', username: 'john', email: 'john@yahoo.com', role: 'admin', plan: 'P2', status: 'Active', avatar: '' },
    { id: 'U003', user_ID: 'U003', username: 'admin', email: 'admin@ssc.com', role: 'admin', plan: 'P3', status: 'Active', avatar: '' },
];

const MEDIA_ASSET_OVERRIDES = {
    M001: {
        poster: [
            'https://image.tmdb.org/t/p/w600_and_h900_bestv2/nBNZadXqJSdt05SHLqgT0HuC5Gm.jpg',
            'https://image.tmdb.org/t/p/w600_and_h900_bestv2/xu9zaAevzQ5nnrsXN6JcahLnG4i.jpg',
        ], // multiple sources to avoid broken images
        backdrop: [
            'https://image.tmdb.org/t/p/original/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg',
            'https://image.tmdb.org/t/p/original/sM33SANp9z6rXW8Itn7NnG1GOEs.jpg',
        ],
    },
};

const SAMPLE_RECOMMENDATIONS = [
    { media_ID: 'SAMPLE1', title: 'Runaway', rating: 6.5, description: 'A rookie officer faces off against rogue robots in a neon city.', poster: 'https://placehold.co/200x300/222/EEE?text=Runaway' },
    { media_ID: 'SAMPLE2', title: 'Man on Fire', rating: 9.0, description: 'An ex-operative protects a young girl against a cartel.', poster: 'https://placehold.co/200x300/333/EEE?text=Man+on+Fire' },
    { media_ID: 'SAMPLE3', title: 'City of Shadows', rating: 8.5, description: 'A hustler battles temptation in a relentless metropolis.', poster: 'https://placehold.co/200x300/111/EEE?text=City+of+Shadows' },
    { media_ID: 'SAMPLE4', title: 'Signal Lost', rating: 7.8, description: 'A stranded crew races to reconnect with home before time runs out.', poster: 'https://placehold.co/200x300/444/EEE?text=Signal+Lost' },
    { media_ID: 'SAMPLE5', title: 'Neon District', rating: 8.1, description: 'Detectives chase a faceless syndicate through rain-soaked alleys.', poster: 'https://placehold.co/200x300/555/EEE?text=Neon+District' },
    { media_ID: 'SAMPLE6', title: 'Last Encore', rating: 7.2, description: 'A fallen star fights for one final performance on the big stage.', poster: 'https://placehold.co/200x300/666/EEE?text=Last+Encore' },
];

const isBadImage = (url) => {
    if (!url) return true;
    const trimmed = String(url).trim();
    if (trimmed === '') return true;
    if (trimmed.includes('picsum.photos')) return true;
    if (!/^https?:\/\//i.test(trimmed)) return true;
    return false;
};

function applyMediaFallbacks(items) {
    return items.map(item => {
        const fallback = INITIAL_MEDIA.find(m => m.media_ID === item.media_ID) || {};
        const overrides = MEDIA_ASSET_OVERRIDES[item.media_ID] || {};
        const poster = isBadImage(item.poster)
            ? (overrides.poster || fallback.poster || `https://placehold.co/600x900/111/EEE?text=${encodeURIComponent(item.title || 'Poster')}`)
            : item.poster;
        const backdrop = isBadImage(item.backdrop)
            ? (overrides.backdrop || fallback.backdrop || `https://placehold.co/1280x720/111/EEE?text=${encodeURIComponent(item.title || 'Backdrop')}`)
            : item.backdrop;
        return { ...item, poster, backdrop, quality: item.quality || fallback.quality || 'HD' };
    });
}

const INITIAL_MEDIA = [
  { media_ID: 'M001', title: 'Interstellar', type: 'Movie', release_date: '2014-11-07', description: 'Sci-fi space journey', duration: 169, box_office: 677000000, rating: 10, genre_ids: ['G01', 'G02'], actor_ids: ['A001'], director_ids: ['D001'], poster: ['https://image.tmdb.org/t/p/w600_and_h900_bestv2/nBNZadXqJSdt05SHLqgT0HuC5Gm.jpg','https://image.tmdb.org/t/p/w600_and_h900_bestv2/xu9zaAevzQ5nnrsXN6JcahLnG4i.jpg'], backdrop: ['https://image.tmdb.org/t/p/original/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg','https://image.tmdb.org/t/p/original/sM33SANp9z6rXW8Itn7NnG1GOEs.jpg'], video_id: 'zSWdZVtXT7E', quality: 'HD' },
  { media_ID: 'M101', title: 'Oppenheimer', type: 'Movie', release_date: '2023-07-21', description: 'The story of American scientist J. Robert Oppenheimer.', duration: 180, box_office: 950000000, rating: 9.2, genre_ids: ['G02'], actor_ids: ['A020'], director_ids: ['D001'], poster: 'https://image.tmdb.org/t/p/original/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', backdrop: 'https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg', video_id: 'uYPbbksJxIg', quality: '4K' },
  { media_ID: 'M011', title: 'Stranger Things', type: 'Series', release_date: '2016-07-15', description: 'When a young boy vanishes, a small town uncovers a mystery.', total_seasons: 4, rating: 9.0, genre_ids: ['G01', 'G11', 'G12'], actor_ids: ['A014'], director_ids: ['D005'], poster: 'https://image.tmdb.org/t/p/original/49WJfeN0moxb9IPfGn8AIqMGskD.jpg', backdrop: 'https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYkOD8VG4OW.jpg', video_id: 'b9EkMc79ZSU', quality: 'HD' },
  { media_ID: 'M205', title: 'Breaking Bad', type: 'Series', release_date: '2008-01-20', description: 'A high school chemistry teacher diagnosed with lung cancer turns to meth.', total_seasons: 5, rating: 9.9, genre_ids: ['G15', 'G02'], actor_ids: ['A030'], director_ids: ['D020'], poster: 'https://image.tmdb.org/t/p/original/ggFHVNu6YYI5L9pCfOacjizRGt.jpg', backdrop: 'https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7Z.jpg', video_id: 'HhesaQXLuRY', quality: 'HD' },
  { media_ID: 'M202', title: 'Squid Game', type: 'Series', release_date: '2021-09-17', description: 'Hundreds of cash-strapped players accept a strange invitation.', total_seasons: 1, rating: 9.0, genre_ids: ['G11', 'G15', 'G16'], actor_ids: ['A031'], director_ids: [], poster: 'https://image.tmdb.org/t/p/original/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg', backdrop: 'https://image.tmdb.org/t/p/original/oaGvjB0DvdhXhOKs7.jpg', video_id: 'oqxAJKy0ii4', quality: 'Full HD' },
  { media_ID: 'M300', title: 'Arcane', type: 'Series', release_date: '2021-11-06', description: 'Set in Utopian Piltover and the oppressed underground of Zaun.', total_seasons: 2, rating: 9.8, genre_ids: ['G10', 'G11'], actor_ids: [], director_ids: [], poster: 'https://image.tmdb.org/t/p/original/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg', backdrop: 'https://image.tmdb.org/t/p/original/2Fk3AB8E9d7CntNR3zduqi9Zsu0.jpg', video_id: 'fXmAurh012s', quality: '4K' },
  { media_ID: 'M004', title: 'The Dark Knight', type: 'Movie', release_date: '2008-07-18', description: 'Batman faces the Joker in Gotham.', duration: 152, box_office: 1006000000, rating: 9.0, genre_ids: ['G02', 'G07'], actor_ids: [], director_ids: ['D001'], poster: 'https://image.tmdb.org/t/p/original/qJ2tW6WMUDux911r6m7haRef0WH.jpg', backdrop: 'https://image.tmdb.org/t/p/original/hZth9NCeXvvO7Xi98d8q34e1Ier.jpg', video_id: 'EXeTwQWrcwY', quality: 'HD' },
  { media_ID: 'M005', title: 'Dune', type: 'Movie', release_date: '2021-10-22', description: 'House Atreides fights for Arrakis.', duration: 155, box_office: 402000000, rating: 8.3, genre_ids: ['G01', 'G09'], actor_ids: [], director_ids: ['D002'], poster: 'https://image.tmdb.org/t/p/original/d5NXSklXo0qyIYkgV94XAgMIckC.jpg', backdrop: 'https://image.tmdb.org/t/p/original/jYeNj3zqCgyg8bMduHBH2zCGgU5.jpg', video_id: 'n9xhJrPXop4', quality: '4K' },
  { media_ID: 'M006', title: 'Arrival', type: 'Movie', release_date: '2016-11-11', description: 'First contact with mysterious aliens.', duration: 118, box_office: 203000000, rating: 8.5, genre_ids: ['G01', 'G07'], actor_ids: [], director_ids: ['D002'], poster: 'https://image.tmdb.org/t/p/original/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg', backdrop: 'https://image.tmdb.org/t/p/original/8yuyuu8UmH7z4UYLA7bWgklz2t6.jpg', video_id: 'tFMo3UJ4B4g', quality: 'HD' },
  { media_ID: 'M007', title: 'Whiplash', type: 'Movie', release_date: '2014-10-10', description: 'A drummer pushed to his limits.', duration: 107, box_office: 49000000, rating: 8.6, genre_ids: ['G06'], actor_ids: [], director_ids: ['D003'], poster: 'https://image.tmdb.org/t/p/original/7fn624j5lj3xTme2SgiLCeuedmO.jpg', backdrop: 'https://image.tmdb.org/t/p/original/9PbtCo5IIkd26WPQfZUpPyn6fTz.jpg', video_id: '7d_jQycdQGo', quality: 'HD' },
  { media_ID: 'M008', title: 'Gladiator', type: 'Movie', release_date: '2000-05-05', description: 'A betrayed general seeks revenge.', duration: 155, box_office: 503000000, rating: 8.5, genre_ids: ['G09', 'G02'], actor_ids: [], director_ids: ['D004'], poster: 'https://image.tmdb.org/t/p/original/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg', backdrop: 'https://image.tmdb.org/t/p/original/8uO0gUM8aNqYLs1OsTBQiXu0fEv.jpg', video_id: 'owK1qxDselE', quality: 'HD' },
  { media_ID: 'M009', title: 'Parasite', type: 'Movie', release_date: '2019-05-30', description: 'A poor family infiltrates a wealthy household.', duration: 132, box_office: 266000000, rating: 8.6, genre_ids: ['G06', 'G07'], actor_ids: [], director_ids: ['D005'], poster: 'https://image.tmdb.org/t/p/original/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', backdrop: 'https://image.tmdb.org/t/p/original/AfyuI3glMCBDFmNPj9PY6DwbgGp.jpg', video_id: '5xH0HfJHsaY', quality: 'HD' },
  { media_ID: 'M010', title: 'Joker', type: 'Movie', release_date: '2019-10-04', description: 'Arthur Fleck becomes the Joker.', duration: 122, box_office: 1074000000, rating: 8.4, genre_ids: ['G06', 'G07'], actor_ids: ['A020'], director_ids: ['D006'], poster: 'https://image.tmdb.org/t/p/original/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg', backdrop: 'https://image.tmdb.org/t/p/original/jMWkd0fuwbG39eJpzycJzPWMCww.jpg', video_id: 'zAGVQLHvwOY', quality: 'HD' },
  { media_ID: 'M012', title: 'The Witcher', type: 'Series', release_date: '2019-12-20', description: 'Geralt of Rivia battles monsters and destiny.', total_seasons: 3, rating: 8.0, genre_ids: ['G05', 'G02'], actor_ids: ['A001'], director_ids: ['D004'], poster: 'https://image.tmdb.org/t/p/original/zrPpUlehQaBf8YX2NrVrKK8IEpf.jpg', backdrop: 'https://image.tmdb.org/t/p/original/h5lqcbgL7y3k0EJHdC1mUYO8BO4.jpg', video_id: 'ndl1W4ltcmg', quality: 'HD' },
  { media_ID: 'M014', title: 'Game of Thrones', type: 'Series', release_date: '2011-04-17', description: 'Noble families vie for control of the Iron Throne.', total_seasons: 8, rating: 9.3, genre_ids: ['G05', 'G02'], actor_ids: [], director_ids: ['D009'], poster: 'https://image.tmdb.org/t/p/original/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg', backdrop: 'https://image.tmdb.org/t/p/original/gwPSoYUHAKmdyVywgLpKKA4BjRr.jpg', video_id: 'KPLWWIOCOOQ', quality: 'HD' },
  { media_ID: 'M401', title: 'Inception', type: 'Movie', release_date: '2010-07-16', description: 'A thief who steals corporate secrets through dream-sharing technology.', duration: 148, box_office: 836000000, rating: 8.8, genre_ids: ['G01', 'G07'], actor_ids: [], director_ids: ['D001'], poster: 'https://image.tmdb.org/t/p/original/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg', backdrop: 'https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg', video_id: 'YoHD9XEInc0', quality: 'HD' },
  { media_ID: 'M402', title: 'Mad Max: Fury Road', type: 'Movie', release_date: '2015-05-15', description: 'Max teams up with Furiosa to flee a tyrant across the wasteland.', duration: 120, box_office: 374000000, rating: 8.1, genre_ids: ['G07', 'G09'], actor_ids: [], director_ids: [], poster: 'https://image.tmdb.org/t/p/original/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg', backdrop: 'https://image.tmdb.org/t/p/original/phszHPFVhPHhMZgo0fWTKBDQsJA.jpg', video_id: 'hEJnMQG9ev8', quality: '4K' },
  { media_ID: 'M403', title: 'Blade Runner 2049', type: 'Movie', release_date: '2017-10-06', description: 'A new blade runner discovers a secret that could plunge society into chaos.', duration: 164, box_office: 259000000, rating: 8.0, genre_ids: ['G01', 'G07'], actor_ids: [], director_ids: ['D002'], poster: 'https://image.tmdb.org/t/p/original/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg', backdrop: 'https://image.tmdb.org/t/p/original/54PmeEzQMvpojpJBku61ZGQnWUX.jpg', video_id: 'gCcx85zbxz4', quality: '4K' },
  { media_ID: 'M404', title: 'The Martian', type: 'Movie', release_date: '2015-10-02', description: 'An astronaut is stranded on Mars and must survive alone.', duration: 144, box_office: 630000000, rating: 8.0, genre_ids: ['G01', 'G09'], actor_ids: [], director_ids: [], poster: 'https://image.tmdb.org/t/p/original/5aGhaIHYuQbqlHWvWYqMCnj40y2.jpg', backdrop: 'https://image.tmdb.org/t/p/original/ojLceN5Zt5qy1ic00FBK3K8aj3F.jpg', video_id: 'ej3ioOneTy8', quality: 'HD' },
  { media_ID: 'M405', title: 'The Prestige', type: 'Movie', release_date: '2006-10-20', description: 'Two rival magicians engage in a battle to create the ultimate illusion.', duration: 130, box_office: 109000000, rating: 8.5, genre_ids: ['G06', 'G07'], actor_ids: [], director_ids: ['D001'], poster: 'https://image.tmdb.org/t/p/original/5MXyQfz8xUP3dIFPTubhTsbFY6N.jpg', backdrop: 'https://image.tmdb.org/t/p/original/rdPGnZsrrRnttK1vR8VbxjabO9W.jpg', video_id: 'o4gHCmTQDVI', quality: 'HD' },
  { media_ID: 'M406', title: 'Avatar: The Way of Water', type: 'Movie', release_date: '2022-12-16', description: 'Jake Sully and Neytiri protect their family on Pandora.', duration: 192, box_office: 2320000000, rating: 8.2, genre_ids: ['G10', 'G09'], actor_ids: [], director_ids: [], poster: 'https://image.tmdb.org/t/p/original/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg', backdrop: 'https://image.tmdb.org/t/p/original/94xxm5701CzOdJdUEdIuwqZaowx.jpg', video_id: 'd9MyW72ELq0', quality: '4K' },
  { media_ID: 'S101', title: 'The Boys', type: 'Series', release_date: '2019-07-26', description: 'A group of vigilantes set out to take down corrupt superheroes.', total_seasons: 4, rating: 8.7, genre_ids: ['G11', 'G07'], actor_ids: [], director_ids: [], poster: 'https://image.tmdb.org/t/p/original/stTEycfG9928HYGEISBFaG1ngjM.jpg', backdrop: 'https://image.tmdb.org/t/p/original/7NxHqegY7bYEDTy0yE7MQi9uGTs.jpg', video_id: '06rueu_fh30', quality: 'Full HD' },
  { media_ID: 'S102', title: 'The Mandalorian', type: 'Series', release_date: '2019-11-12', description: 'A lone gunfighter makes his way through the galaxy.', total_seasons: 3, rating: 8.5, genre_ids: ['G05', 'G10'], actor_ids: [], director_ids: [], poster: 'https://image.tmdb.org/t/p/original/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg', backdrop: 'https://image.tmdb.org/t/p/original/9ijMGlJKqcslswWUzTEwScm82Gs.jpg', video_id: 'aOC8E8z_ifw', quality: '4K' },
  { media_ID: 'S103', title: 'The Crown', type: 'Series', release_date: '2016-11-04', description: 'Chronicles the reign of Queen Elizabeth II.', total_seasons: 6, rating: 8.6, genre_ids: ['G02'], actor_ids: [], director_ids: [], poster: 'https://image.tmdb.org/t/p/original/6P3c80EOm7BodndGBUAJHHsHKrp.jpg', backdrop: 'https://image.tmdb.org/t/p/original/nrSaXF39nDfAAeLKksRCyvSzI2a.jpg', video_id: 'JWtnJjn6ng0', quality: 'HD' },
  { media_ID: 'S104', title: 'Peaky Blinders', type: 'Series', release_date: '2013-09-12', description: 'A gangster family epic set in 1900s England.', total_seasons: 6, rating: 8.8, genre_ids: ['G15', 'G02'], actor_ids: [], director_ids: ['D020'], poster: 'https://image.tmdb.org/t/p/original/jeWoeUQyHdxGFNZCrzbOUP78FIa.jpg', backdrop: 'https://image.tmdb.org/t/p/original/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg', video_id: 'oVzVdvGIC7U', quality: 'HD' },
  { media_ID: 'S105', title: 'Narcos', type: 'Series', release_date: '2015-08-28', description: 'The rise of the cocaine trade and notorious kingpins.', total_seasons: 3, rating: 8.8, genre_ids: ['G15', 'G02'], actor_ids: [], director_ids: [], poster: 'https://image.tmdb.org/t/p/original/rTmal9fDbwh5F0waol2hq35U4ah.jpg', backdrop: 'https://image.tmdb.org/t/p/original/6GF36ES23d0n9ndxhoDnMD6URmm.jpg', video_id: 'xl8zdCY-abw', quality: 'Full HD' },
  { media_ID: 'S106', title: 'Loki', type: 'Series', release_date: '2021-06-09', description: 'The God of Mischief steps out of his brother’s shadow.', total_seasons: 2, rating: 8.3, genre_ids: ['G05', 'G01'], actor_ids: [], director_ids: [], poster: 'https://image.tmdb.org/t/p/original/kEl2t3OhXc3Zb9FBh1AuYzRTgZp.jpg', backdrop: 'https://image.tmdb.org/t/p/original/jQNOzoiaN6cH5qHTklH3X581e5v.jpg', video_id: 'nW948Va-l10', quality: '4K' },
];

const INITIAL_MEDIA_SANITIZED = applyMediaFallbacks(INITIAL_MEDIA);

const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
};

const formatSeasons = (seasons) => {
    if (!seasons) return '1 season';
    return `${seasons} season${seasons > 1 ? 's' : ''}`;
};

const RatingStars = ({ value = 0, onSelect }) => {
    const stars = [1, 2, 3, 4, 5];
    return (
        <div className="flex items-center gap-1">
            {stars.map(i => (
                <button
                    key={i}
                    type="button"
                    onClick={() => onSelect && onSelect(i)}
                    className="text-yellow-400"
                    aria-label={`Rate ${i} star`}
                >
                    {i <= value ? '★' : '☆'}
                </button>
            ))}
        </div>
    );
};

const apiService = {
    fetchMedia: async (userId) => {
        if (USE_REAL_DB) {
            try {
                const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
                const res = await fetch(`${API_URL}/media${query}`);
                const data = await res.json();
                return Array.isArray(data) ? applyMediaFallbacks(data) : INITIAL_MEDIA_SANITIZED;
            } catch (error) { 
                console.warn("DB Connection failed, using mock data."); 
                return INITIAL_MEDIA_SANITIZED; 
            }
        }
        return INITIAL_MEDIA_SANITIZED;
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
    const placeholder = `https://placehold.co/600x900/111/EEE?text=${encodeURIComponent(alt || 'Image')}`;
    const [attempts, setAttempts] = useState(0);
    const sources = Array.isArray(src) ? src.filter(Boolean) : [src].filter(Boolean);
    const currentSrc = sources[attempts] || placeholder;

    return (
        <img
            src={currentSrc}
            alt={alt}
            className={className}
            loading="lazy"
            onError={() => setAttempts(prev => prev + 1)}
        />
    );
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

const MovieCard = ({ movie, onMovieClick, progress, onToggleWatchlist, isInWatchlist, onRemoveContinue }) => (
    <div onClick={() => onMovieClick(movie)} className="group relative w-[200px] h-[300px] flex-none cursor-pointer transition-transform duration-300 hover:scale-105 hover:-translate-y-1 hover:z-50">
        <SafeImage src={movie.poster} alt={movie.title} className="w-full h-full object-cover rounded-md" />
        <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 text-white text-[11px] rounded-md border border-white/20">{movie.quality || 'HD'}</div>
        {onRemoveContinue && (
            <button
                onClick={(e) => { e.stopPropagation(); onRemoveContinue(movie.media_ID); }}
                className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
                title="Remove from Continue Watching"
            >
                ✕
            </button>
        )}
        {progress && (<div className="absolute bottom-4 left-4 right-4 h-1 bg-gray-600 rounded-full overflow-hidden z-10 group-hover:hidden"><div className="h-full bg-red-600" style={{ width: `${progress}%` }}></div></div>)}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 rounded-md">
            <h3 className="text-white text-sm font-bold">{movie.title}</h3>
            <p className="text-[11px] text-gray-200 line-clamp-2 mt-1">{movie.description}</p>
            <div className="text-[11px] text-gray-300 flex flex-wrap gap-1 mt-2">
                <span>{(movie.genres && movie.genres.length ? movie.genres.slice(0, 2) : (movie.genre_ids || []).map(id => DB_GENRES[id]).filter(Boolean).slice(0, 2)).join(' • ') || 'Mixed'}</span>
                <span>•</span>
                <span>{movie.type === 'Movie' ? formatDuration(movie.duration) : formatSeasons(movie.total_seasons)}</span>
                <span>•</span>
                <span>{movie.quality || 'HD'}</span>
            </div>
            <div className="flex items-center gap-2 mt-3">
                <button className="p-2 bg-white rounded-full hover:bg-gray-200"><Play className="w-3 h-3 fill-black text-black" /></button>
                <button className="p-2 border border-gray-400 rounded-full hover:bg-gray-800 text-white"><Info className="w-3 h-3" /></button>
                {onToggleWatchlist && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleWatchlist(movie.media_ID); }}
                        className={`p-2 rounded-full border ${isInWatchlist ? 'bg-green-600 border-green-400' : 'border-gray-400 hover:bg-gray-800 text-white'}`}
                        title={isInWatchlist ? 'Remove from My List' : 'Add to My List'}
                    >
                        {isInWatchlist ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    </button>
                )}
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

const MovieRow = ({ title, movies, onMovieClick, useProgress, onToggleWatchlist, watchlistIds, onRemoveContinue }) => {
    if (!movies || movies.length === 0) return null;
    const wlSet = new Set(watchlistIds || []);
    return (
        <div className="px-4 md:px-6 lg:px-8 mt-4 space-y-2 mb-8">
            <h2 className="text-white text-lg font-bold">{title}</h2>
            <div className="flex flex-row overflow-x-auto gap-3 scrollbar-hide scroll-smooth py-2 pr-4">
                {movies.map(m => (
                    <div key={m.media_ID} className="relative">
                        <MovieCard
                            movie={m}
                            onMovieClick={onMovieClick}
                            progress={useProgress ? MOCK_USER_PROGRESS[m.media_ID] : null}
                            onToggleWatchlist={onToggleWatchlist}
                            isInWatchlist={wlSet.has(m.media_ID)}
                            onRemoveContinue={onRemoveContinue}
                        />
                        {onRemoveContinue && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onRemoveContinue(m.media_ID); }}
                                className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-90 hover:opacity-100"
                                title="Remove from Continue Watching"
                            >
                                X
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const RankedMovieRow = ({ title, movies, onMovieClick }) => {
    if (!movies || movies.length === 0) return null;
    return (
        <div className="px-4 md:px-6 lg:px-8 mt-4 space-y-2 mb-12">
          <h2 className="text-white text-md md:text-xl font-bold">{title}</h2>
          <div className="flex flex-row overflow-x-auto gap-12 scrollbar-hide py-8 px-8">
            {movies.slice(0, 10).map((movie, idx) => (<RankedMovieCard key={movie.media_ID} index={idx} movie={movie} onMovieClick={onMovieClick} />))}
          </div>
      </div>
    );
};

const MediaGrid = ({ title, items, onMovieClick, onToggleWatchlist, watchlistIds }) => {
    if (!items || items.length === 0) return null;
    const wlSet = new Set(watchlistIds || []);
    return (
        <div className="px-4 md:px-8 lg:px-10 pt-20 space-y-3 mb-10">
            <h2 className="text-white text-lg md:text-xl font-bold mb-2">{title}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {items.map(m => (
                    <MovieCard key={m.media_ID} movie={m} onMovieClick={onMovieClick} onToggleWatchlist={onToggleWatchlist} isInWatchlist={wlSet.has(m.media_ID)} />
                ))}
            </div>
        </div>
    );
};

const Modal = ({ media, onClose, onPlay, onToggleWatchlist, isInWatchlist, comments = [], onAddComment, recommendations = [] }) => {
    if (!media) return null;
    const castNames = (media.actor_ids || []).map(id => DB_ACTORS[id]?.name).join(', ');
    const directorName = (media.director_ids || []).map(id => DB_DIRECTORS[id]?.name || id).join(', ');
    const matchScore = Math.min(99, Math.round((media.rating || 8) * 10));
    const recs = (recommendations && recommendations.length > 0) ? recommendations : SAMPLE_RECOMMENDATIONS;

    const [commentText, setCommentText] = useState('');
    const [commentRating, setCommentRating] = useState(5);

    const handleSubmitComment = () => {
        if (!commentText.trim()) return;
        onAddComment && onAddComment(media.media_ID, commentRating, commentText.trim());
        setCommentText('');
        setCommentRating(5);
    };
    
    return (
        <div className="fixed inset-0 z-[1000] bg-black/80 flex justify-center overflow-y-auto pt-10 pb-10 px-4">
            <button onClick={onClose} className="fixed top-4 right-8 z-[1100] w-10 h-10 rounded-full bg-[#181818] border border-gray-600 flex items-center justify-center hover:bg-white/20 transition shadow-lg"><X className="w-6 h-6 text-white" /></button>
            <div className="relative w-full max-w-4xl bg-[#141414] rounded-lg shadow-2xl flex flex-col min-h-min mb-10 mt-6">
                <div className="relative h-[45vh] md:h-[55vh] shrink-0 w-full">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-black/40 to-transparent z-[1]" />
                    <SafeImage src={media.backdrop || media.poster} alt={media.title} className="w-full h-full object-cover rounded-t-lg" />
                    <div className="absolute bottom-10 left-8 right-8 z-[2] flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <h2 className="text-4xl md:text-5xl font-bold text-white">{media.title}</h2>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <button onClick={() => onPlay(media)} className="flex items-center gap-2 bg-white text-black px-5 py-2 rounded font-bold hover:bg-white/90"><Play className="w-5 h-5 fill-black" /> Play</button>
                            {onToggleWatchlist && (
                                <button onClick={() => onToggleWatchlist(media.media_ID)} className={`px-4 py-2 rounded flex items-center gap-2 text-sm border ${isInWatchlist ? 'bg-green-600 border-green-400 text-white' : 'bg-white text-black border-white'}`}>
                                    {isInWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />} My List
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <div className="p-6 md:p-10 space-y-6">
                    <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-white">
                        <span className="text-green-400">{matchScore}% Match</span>
                        <span>{media.release_date?.substring(0, 4)}</span>
                        <span className="border border-gray-500 px-1 text-xs">{media.quality || 'HD'}</span>
                        {media.type === 'Movie' && <span className="text-gray-300">{formatDuration(media.duration)}</span>}
                        {media.type === 'Series' && <span className="text-gray-300">{formatSeasons(media.total_seasons)}</span>}
                        <RatingStars value={Math.round((media.rating || 4) / 2)} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
                        <div className="md:col-span-2 space-y-4">
                            <p className="text-lg leading-relaxed">{media.description}</p>
                            {media.type === 'Movie' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-gray-800 rounded border border-gray-700">
                                        <p className="text-xs text-gray-400">Box Office</p>
                                        <p className="font-mono text-green-400">${Number(media.box_office || 0).toLocaleString()}</p>
                                    </div>
                                    <div className="p-3 bg-gray-800 rounded border border-gray-700">
                                        <p className="text-xs text-gray-400">Duration</p>
                                        <p className="font-mono text-white">{media.duration} mins</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="space-y-3 text-sm">
                            <div><span className="text-gray-500">Cast: </span>{castNames || 'N/A'}</div>
                            <div><span className="text-gray-500">Director: </span>{directorName || 'N/A'}</div>
                            <div><span className="text-gray-500">Genres: </span>{(media.genres && media.genres.length ? media.genres : (media.genre_ids || []).map(id => DB_GENRES[id])).join(', ')}</div>
                        </div>
                    </div>

                    {recs && recs.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-lg font-semibold text-white">More Like This</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {recs.slice(0, 6).map(rec => (
                                    <div key={rec.media_ID} className="bg-gray-900 border border-gray-800 rounded overflow-hidden flex gap-3 p-2">
                                        <div className="w-20 h-28 overflow-hidden rounded">
                                            <SafeImage src={rec.poster} alt={rec.title} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 text-white text-sm space-y-1">
                                            <div className="font-semibold line-clamp-1">{rec.title}</div>
                                            <div className="text-green-400 text-xs">{Math.min(99, Math.round((rec.rating || 8) * 10))}% Match</div>
                                            <div className="text-gray-300 text-xs line-clamp-2">{rec.description}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        <h4 className="text-lg font-semibold">Comments & Ratings</h4>
                        <div className="flex items-center gap-3">
                            <RatingStars value={commentRating} onSelect={setCommentRating} />
                            <span className="text-sm text-gray-300">{commentRating} / 5</span>
                        </div>
                        <textarea
                            className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white"
                            rows={3}
                            placeholder="Share your thoughts..."
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                        />
                        <button onClick={handleSubmitComment} className="px-4 py-2 bg-red-600 rounded text-white font-bold w-fit">Post Comment</button>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {comments.length === 0 && <p className="text-gray-400 text-sm">No comments yet.</p>}
                            {comments.map((c, idx) => (
                                <div key={idx} className="bg-gray-800 border border-gray-700 rounded p-3">
                                    <div className="flex items-center justify-between text-sm text-gray-300">
                                        <span className="font-semibold text-white">{c.user || 'Guest'}</span>
                                        <RatingStars value={c.rating} />
                                    </div>
                                    <p className="text-sm text-gray-200 mt-1">{c.text}</p>
                                </div>
                            ))}
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

// --- ADMIN (kept minimal, same behavior) ---
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


const AdminDashboard = ({ mediaList, users, actors, directors, genres, onMediaActions, onUserActions, onCastActions, onGenreActions, onLogout }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [mediaModal, setMediaModal] = useState({ isOpen: false, data: null });
    const [userModal, setUserModal] = useState({ isOpen: false, data: null });
    const [castModal, setCastModal] = useState({ isOpen: false, data: null, type: 'actor' });
    const [genreModal, setGenreModal] = useState({ isOpen: false, data: null });
    const [dateRange, setDateRange] = useState('7d');
    const [quickSearch, setQuickSearch] = useState('');

    const totalMedia = mediaList.length;
    const genreCount = genres.length;
    const castCount = actors.length + directors.length;
    const avgRating = (mediaList.reduce((s, m) => s + (Number(m.rating) || 0), 0) / (mediaList.length || 1)).toFixed(1);
    const mockReviews = 132;
    const mockPending = 5;
    const mockFlagged = 2;
    const mockNewUsers = { '7d': 3, '30d': 9 };
    const ratingDistribution = [
        { stars: 5, count: 58 }, { stars: 4, count: 42 }, { stars: 3, count: 20 }, { stars: 2, count: 8 }, { stars: 1, count: 4 },
    ];
    const topGenres = (genres || []).slice(0, 5);
    const mediaAdded = ['Day -6','Day -5','Day -4','Day -3','Day -2','Day -1','Today'].map((label, idx) => ({ label, count: [4,6,3,8,5,7,6][idx] }));
    const userRegistrations = ['Day -6','Day -5','Day -4','Day -3','Day -2','Day -1','Today'].map((label, idx) => ({ label, count: [2,1,3,4,2,5,2][idx] }));
    const alerts = [
        { label: 'Missing posters/trailers', count: 3, color: 'bg-yellow-600' },
        { label: 'Duplicate title warning', count: 1, color: 'bg-amber-500' },
        { label: 'Inactive/blocked users', count: 2, color: 'bg-blue-600' },
        { label: 'Flagged reviews awaiting moderation', count: 2, color: 'bg-red-600' },
    ];
    const recentMedia = mediaList.slice(-4).reverse();
    const recentUsers = users.slice(-4).reverse();
    const recentReviews = mediaList.slice(0, 4).map((m, idx) => ({ id: `R${idx}`, title: m.title, user: users[idx % users.length]?.username || 'guest', rating: m.rating, status: idx % 2 === 0 ? 'Pending' : 'Published' }));

    return (
        <div className="flex min-h-screen bg-gray-900 text-white font-sans">
            <div className="w-64 bg-black border-r border-gray-800 flex flex-col p-4 space-y-4">
                <div className="flex items-center gap-2 mb-4"><img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" className="h-6" /><span className="bg-red-600 text-xs px-2 py-0.5 rounded font-bold">ADMIN</span></div>
                {['overview','media','users','cast','genres','analytics'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`capitalize w-full text-left p-3 rounded ${activeTab === tab ? 'bg-red-600' : 'hover:bg-gray-800'}`}>{tab}</button>
                ))}
                <button onClick={onLogout} className="mt-auto flex gap-2"><LogOut className="w-5 h-5"/> Sign Out</button>
            </div>

            <div className="flex-1 p-8 overflow-y-auto">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            <div className="bg-gray-800 p-4 rounded border border-gray-700"><p className="text-gray-400 text-xs uppercase">Total Media</p><p className="text-3xl font-bold">{totalMedia}</p><p className="text-sm text-gray-400">Movies + Series</p></div>
                            <div className="bg-gray-800 p-4 rounded border border-gray-700"><p className="text-gray-400 text-xs uppercase">Users</p><p className="text-3xl font-bold">{users.length}</p><p className="text-sm text-gray-400">New (7d): {mockNewUsers['7d']}</p></div>
                            <div className="bg-gray-800 p-4 rounded border border-gray-700"><p className="text-gray-400 text-xs uppercase">Genres</p><p className="text-3xl font-bold">{genreCount}</p></div>
                            <div className="bg-gray-800 p-4 rounded border border-gray-700"><p className="text-gray-400 text-xs uppercase">Cast/Crew</p><p className="text-3xl font-bold">{castCount}</p></div>
                            <div className="bg-gray-800 p-4 rounded border border-gray-700"><p className="text-gray-400 text-xs uppercase">Avg Rating</p><p className="text-3xl font-bold">{avgRating}</p></div>
                            <div className="bg-gray-800 p-4 rounded border border-gray-700"><p className="text-gray-400 text-xs uppercase">Reviews</p><p className="text-3xl font-bold">{mockReviews}</p><p className="text-sm text-gray-400">{mockPending} pending • {mockFlagged} flagged</p></div>
                            <div className="bg-gray-800 p-4 rounded border border-gray-700"><p className="text-gray-400 text-xs uppercase">Active titles</p><p className="text-3xl font-bold">{Math.max(1, totalMedia - 1)}</p><p className="text-sm text-gray-400">In catalog</p></div>
                            <div className="bg-gray-800 p-4 rounded border border-gray-700"><p className="text-gray-400 text-xs uppercase">New signups (30d)</p><p className="text-3xl font-bold">{mockNewUsers['30d']}</p><p className="text-sm text-gray-400">Last month</p></div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {[
                                { label: '+ Add Movie/Series', action: () => setMediaModal({ isOpen: true, data: null }), color: 'bg-red-600' },
                                { label: '+ Add Genre', action: () => setGenreModal({ isOpen: true, data: null }), color: 'bg-purple-600' },
                                { label: '+ Add Cast', action: () => setCastModal({ isOpen: true, data: null, type: 'actor' }), color: 'bg-blue-600' },
                                { label: 'Create User/Admin', action: () => setUserModal({ isOpen: true, data: null }), color: 'bg-green-600' },
                                { label: 'Go to Analytics', action: () => setActiveTab('analytics'), color: 'bg-gray-700' },
                            ].map(btn => (
                                <button key={btn.label} onClick={btn.action} className={`${btn.color} px-3 py-2 rounded text-sm font-semibold hover:opacity-90`}>{btn.label}</button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div className="bg-gray-800 p-4 rounded border border-gray-700">
                                <div className="flex justify-between items-center mb-2"><h3 className="font-bold">Rating distribution</h3><span className="text-gray-400 text-sm">1-5 stars</span></div>
                                <div className="space-y-2">
                                    {ratingDistribution.map(s => (
                                        <div key={s.stars} className="flex items-center gap-2">
                                            <span className="w-10 text-xs text-gray-400">{s.stars}★</span>
                                            <div className="flex-1 bg-gray-900 rounded h-2 overflow-hidden"><div className="bg-yellow-400 h-2" style={{width:`${Math.min(100, s.count)}%`}}></div></div>
                                            <span className="text-xs text-gray-300">{s.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-gray-800 p-4 rounded border border-gray-700">
                                <div className="flex justify-between items-center mb-2"><h3 className="font-bold">Top Genres</h3><span className="text-gray-400 text-sm">Top 5</span></div>
                                <div className="space-y-2">
                                    {topGenres.length ? topGenres.map(g => (
                                        <div key={g.id} className="flex items-center gap-3">
                                            <span className="w-24 text-sm text-gray-200">{g.name}</span>
                                            <div className="flex-1 bg-gray-900 rounded h-2 overflow-hidden"><div className="bg-blue-500 h-2" style={{width:'60%'}}></div></div>
                                        </div>
                                    )) : <p className="text-sm text-gray-400">No data</p>}
                                </div>
                            </div>
                            <div className="bg-gray-800 p-4 rounded border border-gray-700">
                                <div className="flex justify-between items-center mb-2"><h3 className="font-bold">Alerts / Tasks</h3><span className="text-gray-400 text-sm">custom</span></div>
                                <div className="space-y-2">
                                    {alerts.map(a => (
                                        <div key={a.label} className="flex items-center justify-between bg-gray-900 rounded px-3 py-2 border border-gray-700">
                                            <span className="text-sm">{a.label}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${a.color}`}>{a.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="bg-gray-800 p-4 rounded border border-gray-700">
                                <div className="flex justify-between items-center mb-3"><h3 className="font-bold">Recent activity (media)</h3><span className="text-xs text-gray-400">Newest first</span></div>
                                <div className="space-y-2">
                                    {recentMedia.map(m => (
                                        <div key={m.media_ID} className="flex justify-between text-sm bg-gray-900 border border-gray-700 rounded px-3 py-2">
                                            <span className="font-semibold">{m.title}</span>
                                            <span className="text-gray-400">{m.release_date || '---'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-gray-800 p-4 rounded border border-gray-700">
                                <div className="flex justify-between items-center mb-3"><h3 className="font-bold">Recent signups</h3><span className="text-xs text-gray-400">Last few users</span></div>
                                <div className="space-y-2">
                                    {recentUsers.map(u => (
                                        <div key={u.id} className="flex justify-between text-sm bg-gray-900 border border-gray-700 rounded px-3 py-2">
                                            <span className="font-semibold">{u.username}</span>
                                            <span className="text-gray-400 uppercase">{u.role}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

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

                {activeTab === 'cast' && (
                    <div className="space-y-8">
                        <div>
                            <div className="flex justify-between mb-4">
                                <h2 className="text-2xl font-bold">Actors</h2>
                                <button onClick={() => setCastModal({ isOpen: true, data: null, type: 'actor' })} className="bg-blue-600 px-3 py-1 rounded text-sm">Add Actor</button>
                            </div>
                            <div className="bg-gray-800 rounded overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-700 text-gray-300 text-xs uppercase"><tr><th className="p-3">ID</th><th className="p-3">Name</th><th className="p-3 text-right">Actions</th></tr></thead>
                                    <tbody className="divide-y divide-gray-700">{actors.map(a => (<tr key={a.id}><td className="p-3">{a.id}</td><td className="p-3">{a.name}</td><td className="p-3 text-right space-x-2"><button className="text-blue-400" onClick={() => setCastModal({ isOpen: true, data: a, type: 'actor' })}><Edit2 className="w-4 h-4" /></button><button className="text-red-400" onClick={() => onCastActions.deleteActor(a.id)}><Trash2 className="w-4 h-4" /></button></td></tr>))}</tbody>
                                </table>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-4">
                                <h2 className="text-2xl font-bold">Directors</h2>
                                <button onClick={() => setCastModal({ isOpen: true, data: null, type: 'director' })} className="bg-blue-600 px-3 py-1 rounded text-sm">Add Director</button>
                            </div>
                            <div className="bg-gray-800 rounded overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-700 text-gray-300 text-xs uppercase"><tr><th className="p-3">ID</th><th className="p-3">Name</th><th className="p-3 text-right">Actions</th></tr></thead>
                                    <tbody className="divide-y divide-gray-700">{directors.map(d => (<tr key={d.id}><td className="p-3">{d.id}</td><td className="p-3">{d.name}</td><td className="p-3 text-right space-x-2"><button className="text-blue-400" onClick={() => setCastModal({ isOpen: true, data: d, type: 'director' })}><Edit2 className="w-4 h-4" /></button><button className="text-red-400" onClick={() => onCastActions.deleteDirector(d.id)}><Trash2 className="w-4 h-4" /></button></td></tr>))}</tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'genres' && (
                    <div>
                        <div className="flex justify-between mb-6"><h2 className="text-2xl font-bold">Genres</h2><button onClick={() => setGenreModal({ isOpen: true, data: null })} className="bg-purple-600 px-4 py-2 rounded text-sm">Add Genre</button></div>
                        <div className="bg-gray-800 rounded overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-700 text-gray-300 text-xs uppercase"><tr><th className="p-4">ID</th><th className="p-4">Name</th><th className="p-4 text-right">Actions</th></tr></thead>
                                <tbody className="divide-y divide-gray-700">{genres.map(g => (<tr key={g.id}><td className="p-4">{g.id}</td><td className="p-4">{g.name}</td><td className="p-4 text-right space-x-2"><button className="text-blue-400" onClick={() => setGenreModal({ isOpen: true, data: g })}><Edit2 className="w-4 h-4" /></button><button className="text-red-400" onClick={() => onGenreActions.delete(g.id)}><Trash2 className="w-4 h-4" /></button></td></tr>))}</tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm">
                                    <option value="today">Today</option>
                                    <option value="7d">Last 7 days</option>
                                    <option value="30d">Last 30 days</option>
                                    <option value="custom">Custom</option>
                                </select>
                                <input value={quickSearch} onChange={e => setQuickSearch(e.target.value)} placeholder="Quick search (media/user)" className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm w-56" />
                            </div>
                            <button onClick={()=>alert('Report exported (demo)')} className="px-3 py-2 border border-gray-500 rounded text-sm">Export report</button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div className="bg-gray-800 p-4 rounded border border-gray-700">
                                <div className="flex justify-between items-center mb-2"><h3 className="font-bold">Media added (custom)</h3><span className="text-gray-400 text-sm">Last 7 pts</span></div>
                                <div className="space-y-2">
                                    {mediaAdded.map(item => (
                                        <div key={item.label} className="flex items-center gap-2">
                                            <span className="w-12 text-xs text-gray-400">{item.label}</span>
                                            <div className="flex-1 bg-gray-900 rounded h-2 overflow-hidden"><div className="bg-red-500 h-2" style={{width:`${Math.min(100, item.count*12)}%`}}></div></div>
                                            <span className="text-xs text-gray-300">{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-gray-800 p-4 rounded border border-gray-700">
                                <div className="flex justify-between items-center mb-2"><h3 className="font-bold">User registrations</h3><span className="text-gray-400 text-sm">Last 7 pts</span></div>
                                <div className="space-y-2">
                                    {userRegistrations.map(item => (
                                        <div key={item.label} className="flex items-center gap-2">
                                            <span className="w-12 text-xs text-gray-400">{item.label}</span>
                                            <div className="flex-1 bg-gray-900 rounded h-2 overflow-hidden"><div className="bg-green-500 h-2" style={{width:`${Math.min(100, item.count*15)}%`}}></div></div>
                                            <span className="text-xs text-gray-300">{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-gray-800 p-4 rounded border border-gray-700">
                                <div className="flex justify-between items-center mb-2"><h3 className="font-bold">Rating distribution</h3><span className="text-gray-400 text-sm">1–5 stars</span></div>
                                <div className="space-y-2">
                                    {ratingDistribution.map(s => (
                                        <div key={s.stars} className="flex items-center gap-2">
                                            <span className="w-10 text-xs text-gray-400">{s.stars}★</span>
                                            <div className="flex-1 bg-gray-900 rounded h-2 overflow-hidden"><div className="bg-yellow-400 h-2" style={{width:`${Math.min(100, s.count)}%`}}></div></div>
                                            <span className="text-xs text-gray-300">{s.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800 p-4 rounded border border-gray-700">
                            <div className="flex justify-between items-center mb-2"><h3 className="font-bold">Top Genres by content count</h3><span className="text-gray-400 text-sm">Top 5</span></div>
                            <div className="space-y-2">
                                {topGenres.length ? topGenres.map(g => (
                                    <div key={g.id} className="flex items-center gap-3">
                                        <span className="w-24 text-sm text-gray-200">{g.name}</span>
                                        <div className="flex-1 bg-gray-900 rounded h-2 overflow-hidden"><div className="bg-blue-500 h-2" style={{width:'60%'}}></div></div>
                                    </div>
                                )) : <p className="text-sm text-gray-400">No data</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="bg-gray-800 p-4 rounded border border-gray-700">
                                <div className="flex justify-between items-center mb-3"><h3 className="font-bold">Recent activity (media)</h3><span className="text-xs text-gray-400">Newest first</span></div>
                                <div className="space-y-2">
                                    {recentMedia.map(m => (
                                        <div key={m.media_ID} className="flex justify-between text-sm bg-gray-900 border border-gray-700 rounded px-3 py-2">
                                            <span className="font-semibold">{m.title}</span>
                                            <span className="text-gray-400">{m.release_date || '---'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-gray-800 p-4 rounded border border-gray-700">
                                <div className="flex justify-between items-center mb-3"><h3 className="font-bold">Recent signups</h3><span className="text-xs text-gray-400">Last few users</span></div>
                                <div className="space-y-2">
                                    {recentUsers.map(u => (
                                        <div key={u.id} className="flex justify-between text-sm bg-gray-900 border border-gray-700 rounded px-3 py-2">
                                            <span className="font-semibold">{u.username}</span>
                                            <span className="text-gray-400 uppercase">{u.role}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800 p-4 rounded border border-gray-700">
                            <div className="flex justify-between items-center mb-3"><h3 className="font-bold">Recent reviews & ratings</h3><span className="text-xs text-gray-400">Moderation queue</span></div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {recentReviews.map(r => (
                                    <div key={r.id} className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm space-y-1">
                                        <div className="font-semibold">{r.title}</div>
                                        <div className="text-gray-300 flex items-center justify-between">
                                            <span>{r.user}</span>
                                            <span className="text-yellow-400">{r.rating}★</span>
                                        </div>
                                        <div className="text-xs text-gray-400 uppercase">{r.status}</div>
                                        <button className="text-xs text-blue-400 mt-1">View / Moderate</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {mediaModal.isOpen && <AdminMediaModal media={mediaModal.data} onClose={()=>setMediaModal({isOpen:false})} onSave={(d)=>{ if(mediaModal.data) onMediaActions.edit(d); else onMediaActions.add(d); setMediaModal({isOpen:false}) }} />}
            {userModal.isOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[2000]">
                    <div className="bg-gray-900 p-6 rounded w-96 space-y-3">
                        <h3 className="mb-2 font-bold text-lg">{userModal.data ? 'Edit' : 'Add'} User</h3>
                        <input id="user-username" defaultValue={userModal.data?.username} placeholder="Username" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white" />
                        <input id="user-email" defaultValue={userModal.data?.email} placeholder="Email" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white" />
                        <select id="user-role" defaultValue={userModal.data?.role || 'user'} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white">
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                        <div className="flex justify-end gap-2 pt-2">
                            <button onClick={() => setUserModal({isOpen:false})} className="px-4 py-2 bg-gray-700 rounded">Cancel</button>
                            <button onClick={() => {
                                const username = document.getElementById('user-username').value.trim();
                                const email = document.getElementById('user-email').value.trim();
                                const role = document.getElementById('user-role').value;
                                if (!username || !email) return;
                                const payload = {
                                    id: userModal.data?.id || `U${Date.now()}`,
                                    user_ID: userModal.data?.user_ID || `U${Date.now()}`,
                                    username,
                                    email,
                                    role,
                                    plan: userModal.data?.plan || 'P1',
                                    status: userModal.data?.status || 'Active',
                                    avatar: userModal.data?.avatar || '',
                                };
                                userModal.data ? onUserActions.edit(payload) : onUserActions.add(payload);
                                setUserModal({isOpen:false, data:null});
                            }} className="px-4 py-2 bg-green-600 rounded text-white">Save</button>
                        </div>
                    </div>
                </div>
            )}
            {castModal.isOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[2000]">
                    <div className="bg-gray-900 p-6 rounded w-96 space-y-4">
                        <h3 className="text-xl font-bold">Edit {castModal.type === 'actor' ? 'Actor' : 'Director'}</h3>
                        <input defaultValue={castModal.data?.id} placeholder="ID" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white" onChange={()=>{}} disabled={!!castModal.data} id="cast-id" />
                        <input defaultValue={castModal.data?.name} placeholder="Name" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white" id="cast-name" />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setCastModal({ isOpen: false, data: null, type: 'actor' })} className="px-4 py-2 bg-gray-700 rounded">Cancel</button>
                            <button onClick={() => {
                                const id = castModal.data?.id || document.getElementById('cast-id').value.trim();
                                const name = document.getElementById('cast-name').value.trim();
                                if (!id || !name) return;
                                const payload = { id, name };
                                if (castModal.type === 'actor') {
                                    castModal.data ? onCastActions.editActor(payload) : onCastActions.addActor(payload);
                                } else {
                                    castModal.data ? onCastActions.editDirector(payload) : onCastActions.addDirector(payload);
                                }
                                setCastModal({ isOpen: false, data: null, type: 'actor' });
                            }} className="px-4 py-2 bg-blue-600 rounded text-white">Save</button>
                        </div>
                    </div>
                </div>
            )}
            {genreModal.isOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[2000]">
                    <div className="bg-gray-900 p-6 rounded w-96 space-y-4">
                        <h3 className="text-xl font-bold">{genreModal.data ? 'Edit Genre' : 'Add Genre'}</h3>
                        <input defaultValue={genreModal.data?.id} placeholder="ID" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white" onChange={()=>{}} disabled={!!genreModal.data} id="genre-id" />
                        <input defaultValue={genreModal.data?.name} placeholder="Name" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white" id="genre-name" />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setGenreModal({ isOpen: false, data: null })} className="px-4 py-2 bg-gray-700 rounded">Cancel</button>
                            <button onClick={() => {
                                const id = genreModal.data?.id || document.getElementById('genre-id').value.trim();
                                const name = document.getElementById('genre-name').value.trim();
                                if (!id || !name) return;
                                const payload = { id, name };
                                genreModal.data ? onGenreActions.edit(payload) : onGenreActions.add(payload);
                                setGenreModal({ isOpen: false, data: null });
                            }} className="px-4 py-2 bg-purple-600 rounded text-white">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
// --- APP & AUTH ---
const UserProfile = ({ user, onUpdateUser, onClose }) => {
    const [username, setUsername] = useState(user.username || '');
    const [avatar, setAvatar] = useState(user.avatar || '');
    const [plan, setPlan] = useState(user.plan);
    const handleSave = () => {
        const nextUsername = username.trim() || user.username;
        onUpdateUser({ ...user, avatar, plan, username: nextUsername });
        onClose();
    };
    const initials = (username || user.username || 'U')[0];
    return (
        <div className="pt-24 px-8 min-h-screen text-white flex justify-center">
            <div className="w-full max-w-3xl">
                <h1 className="text-3xl font-bold mb-6">Profile</h1>
                <div className="flex gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-32 h-32 bg-gray-800 rounded overflow-hidden relative group">
                            {avatar ? <img src={avatar} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center bg-blue-600 text-3xl font-bold">{initials}</div>}
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => { const r = new FileReader(); r.onload=()=>setAvatar(r.result); r.readAsDataURL(e.target.files[0]); }}/>
                        </div>
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="bg-gray-800 p-4 rounded space-y-2">
                            <h3 className="font-bold">Account</h3>
                            <label className="text-sm text-gray-400" htmlFor="profile-username">Username</label>
                            <input
                                id="profile-username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-red-500 focus:outline-none"
                                placeholder="Enter username"
                            />
                        </div>
                        <div className="bg-gray-800 p-4 rounded">
                            <h3 className="font-bold mb-2">Plan</h3>
                            {Object.keys(DB_PLANS).map(pid => (
                                <div key={pid} onClick={()=>setPlan(pid)} className={`p-3 rounded border cursor-pointer mb-2 flex justify-between ${plan===pid?'border-red-600 bg-gray-700':'border-gray-600'}`}>
                                    <span>{DB_PLANS[pid].name} ({DB_PLANS[pid].resolution})</span><span>{DB_PLANS[pid].price.toLocaleString()}₫</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleSave} className="px-6 py-2 bg-white text-black font-bold rounded hover:bg-red-600 hover:text-white">Save</button>
                            <button onClick={onClose} className="px-6 py-2 border border-gray-500 rounded">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AuthPage = ({ onLogin, onRegister }) => {
    const [mode, setMode] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    const handleSubmit = () => {
        if (mode === 'login') {
            onLogin({ email, password });
        } else {
            if (!username.trim() || !email.trim()) return alert('Please fill username and email');
            onRegister({ email: email.trim(), username: username.trim(), password });
        }
    };

    return (
        <div className="h-screen w-full bg-black flex items-center justify-center bg-[url('https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bcae-07a3f8dc141a/f6d7434e-d6de-4185-a6d4-c77a2d08737b/US-en-20220502-popsignuptwoweeks-perspective_alpha_website_medium.jpg')] bg-cover">
            <div className="bg-black/80 p-12 rounded w-96 text-white space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">{mode === 'login' ? 'Sign In' : 'Register'}</h1>
                    <button className="text-sm text-red-400 hover:text-red-300" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
                        {mode === 'login' ? 'Create account' : 'Have an account? Sign in'}
                    </button>
                </div>

                {mode === 'register' && (
                    <input
                        placeholder="Username"
                        className="w-full p-3 bg-[#333] rounded"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />
                )}

                <input
                    placeholder="Email or username"
                    className="w-full p-3 bg-[#333] rounded"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-3 bg-[#333] rounded"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />

                <button
                    onClick={handleSubmit}
                    className="w-full py-3 bg-red-600 rounded font-bold"
                >
                    {mode === 'login' ? 'Sign In' : 'Register'}
                </button>

            </div>
        </div>
    );
};

// --- APP ROOT ---
const App = () => {
    const [user, setUser] = useState(null);
    const [mediaList, setMediaList] = useState(INITIAL_MEDIA_SANITIZED);
    const [users, setUsers] = useState(INITIAL_USERS);
    const [actors, setActors] = useState(Object.entries(DB_ACTORS).map(([id, v]) => ({ id, name: v.name })));
    const [directors, setDirectors] = useState(Object.entries(DB_DIRECTORS).map(([id, v]) => ({ id, name: v.name })));
    const [genres, setGenres] = useState(Object.entries(DB_GENRES).map(([id, name]) => ({ id, name })));
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [viewProfile, setViewProfile] = useState(false);
    const [activeTab, setActiveTab] = useState('home');
    const [watchlistIds, setWatchlistIds] = useState([]);
    const [comments, setComments] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [continueIds, setContinueIds] = useState(Object.keys(MOCK_USER_PROGRESS).filter(id => id !== 'M001'));

    useEffect(() => { 
        if (!user) { 
            setMediaList(INITIAL_MEDIA_SANITIZED); 
            setWatchlistIds([]);
            setContinueIds(Object.keys(MOCK_USER_PROGRESS).filter(id => id !== 'M001'));
            return; 
        }
        apiService.fetchMedia(user.user_ID).then(d => {
            if (d && Array.isArray(d)) {
                setMediaList(d.map(item => ({ ...item, quality: item.quality || 'HD' })));
                setWatchlistIds(d.filter(m => m.in_watchlist).map(m => m.media_ID));
            }
        }); 
    }, [user]);

    const adminMediaActions = { add: m => setMediaList(prev => [...prev, m]), edit: m => setMediaList(prev => prev.map(x => x.media_ID === m.media_ID ? m : x)), delete: id => setMediaList(prev => prev.filter(x => x.media_ID !== id)) };
    const adminUserActions = { add: u => setUsers(prev => [...prev, u]), edit: u => setUsers(prev => prev.map(x => x.id === u.id ? u : x)), delete: id => setUsers(prev => prev.filter(x => x.id !== id)) };
    const adminCastActions = {
        addActor: a => setActors(prev => [...prev, a]),
        editActor: a => setActors(prev => prev.map(x => x.id === a.id ? a : x)),
        deleteActor: id => setActors(prev => prev.filter(x => x.id !== id)),
        addDirector: d => setDirectors(prev => [...prev, d]),
        editDirector: d => setDirectors(prev => prev.map(x => x.id === d.id ? d : x)),
        deleteDirector: id => setDirectors(prev => prev.filter(x => x.id !== id)),
    };
    const adminGenreActions = {
        add: g => setGenres(prev => [...prev, g]),
        edit: g => setGenres(prev => prev.map(x => x.id === g.id ? g : x)),
        delete: id => setGenres(prev => prev.filter(x => x.id !== id)),
    };

    const toggleWatchlist = (id) => {
        setWatchlistIds(prev => {
            const set = new Set(prev);
            if (set.has(id)) set.delete(id); else set.add(id);
            return Array.from(set);
        });
    };

    const removeFromContinue = (id) => {
        setContinueIds(prev => prev.filter(x => x !== id));
    };

    const addComment = (mediaId, rating, text) => {
        setComments(prev => {
            const next = { ...(prev || {}) };
            next[mediaId] = [...(next[mediaId] || []), { user: user.username, rating, text }];
            return next;
        });
    };
    
    if (!user) return <AuthPage onLogin={async creds => { 
        const local = users.find(u => (u.email === creds.email || u.username === creds.email));
        if (local) { setUser(local); return; }
        const res = await apiService.login(creds.email, creds.password); 
        if(res.success) setUser(res.user); else alert("Failed"); 
    }} onRegister={({ email, username }) => { 
        const newUser = { id: `U${Date.now()}`, user_ID: `U${Date.now()}`, username, email, role: 'user', plan: 'P1', status: 'Active', avatar: '' };
        setUsers(prev => [...prev, newUser]);
        setUser(newUser);
    }} />;
    if (user.role === 'admin') return <AdminDashboard mediaList={mediaList} users={users} actors={actors} directors={directors} genres={genres} onMediaActions={adminMediaActions} onUserActions={adminUserActions} onCastActions={adminCastActions} onGenreActions={adminGenreActions} onLogout={() => setUser(null)} />;

    const filteredBySearch = (items) => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return items;
        return items.filter(m => {
            const byTitle = m.title?.toLowerCase().includes(term);
            const byDirector = (m.directors || []).join(' ').toLowerCase().includes(term);
            return byTitle || byDirector;
        });
    };

    const sortAZ = (items) => [...items].sort((a, b) => a.title.localeCompare(b.title));

    const trendingMovies = (() => {
        const year = (m) => (m.release_date ? parseInt(m.release_date.substring(0,4)) : 0);
        const primary = mediaList.filter(m => year(m) >= 2019);
        if (primary.length >= 6) return primary.slice(0, 12);
        const fill = mediaList
            .filter(m => !primary.includes(m))
            .sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
        return [...primary, ...fill].slice(0, 12);
    })();
    const topRatedMovies = [...mediaList].sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0)).slice(0, 10);
    const moviesOnly = sortAZ(filteredBySearch(mediaList.filter(m => m.type === 'Movie')));
    const tvShows = sortAZ(filteredBySearch(mediaList.filter(m => m.type === 'Series')));
    const myList = sortAZ(filteredBySearch(mediaList.filter(m => new Set(watchlistIds).has(m.media_ID))));
    const continueWatching = mediaList.filter(m => continueIds.includes(m.media_ID));

    return (
        <div className="bg-[#141414] min-h-screen text-white font-sans">
            <nav className="fixed w-full z-[100] bg-gradient-to-b from-black/80 to-transparent px-8 py-4 flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" className="h-7 cursor-pointer" onClick={() => { setViewProfile(false); setActiveTab('home'); }}/>
                    <div className="hidden md:flex gap-4 text-sm">
                        {['home','movies','tv','mylist'].map(tab => (
                            <button key={tab} onClick={() => { setActiveTab(tab); setViewProfile(false); }} className={`${activeTab === tab ? 'text-white font-bold' : 'text-gray-300'} hover:text-white capitalize`}>{tab === 'mylist' ? 'My List' : tab === 'tv' ? 'TV Shows' : tab}</button>
                        ))}
                    </div>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="hidden md:flex items-center gap-2 relative">
                        <button
                            className="p-2 bg-black/40 rounded hover:bg-black/60 text-white"
                            title="Search"
                            onClick={() => setShowSearch(prev => !prev)}
                        >
                            <Search className="w-4 h-4" />
                        </button>
                        {showSearch && (
                            <div className="flex items-center gap-2 bg-black/70 px-2 py-1 rounded absolute top-10 right-0 shadow-lg">
                                <input
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    placeholder="Search title or director..."
                                    className="bg-transparent text-sm focus:outline-none placeholder:text-gray-400 w-44"
                                    autoFocus
                                />
                            </div>
                        )}
                    </div>
                    <div className="cursor-pointer flex items-center gap-2" onClick={()=>setViewProfile(true)}>
                        {user.avatar ? <img src={user.avatar} className="w-8 h-8 rounded"/> : <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold">{user.username[0]}</div>}
                    </div>
                    <button onClick={() => { setUser(null); setActiveTab('home'); }}><LogOut className="w-5 h-5"/></button>
                </div>
            </nav>
            {viewProfile ? (
                <UserProfile
                    user={user}
                    onUpdateUser={u => {
                        setUser(u);
                        setUsers(prev => prev.map(x => (x.id === u.id || x.user_ID === u.user_ID) ? { ...x, ...u } : x));
                        setViewProfile(false);
                    }}
                    onClose={() => setViewProfile(false)}
                />
            ) : (
                <>
                    {activeTab === 'home' && (
                        <>
                            <Billboard movie={mediaList[0]} onInfoClick={() => setSelectedMovie(mediaList[0])} onPlay={() => alert("Playing...")} />
                            <div className="pb-20 -mt-32 relative z-10 space-y-4">
                                <MovieRow title={`Continue Watching for ${user.username}`} movies={continueWatching} onMovieClick={setSelectedMovie} useProgress={true} onToggleWatchlist={toggleWatchlist} watchlistIds={watchlistIds} onRemoveContinue={removeFromContinue} />
                                <MovieRow title="Trending Now" movies={trendingMovies} onMovieClick={setSelectedMovie} onToggleWatchlist={toggleWatchlist} watchlistIds={watchlistIds} />
                                <RankedMovieRow title="Top 10 in Vietnam" movies={topRatedMovies} onMovieClick={setSelectedMovie} />
                                <MovieRow title="Sci-Fi & Fantasy" movies={mediaList.filter(m => m.genre_ids?.includes('G01'))} onMovieClick={setSelectedMovie} onToggleWatchlist={toggleWatchlist} watchlistIds={watchlistIds} />
                                <MovieRow title="Drama Picks" movies={mediaList.filter(m => m.genre_ids?.includes('G02'))} onMovieClick={setSelectedMovie} onToggleWatchlist={toggleWatchlist} watchlistIds={watchlistIds} />
                                <MovieRow title="Thrillers" movies={mediaList.filter(m => m.genre_ids?.some(g => ['G07','G16'].includes(g)))} onMovieClick={setSelectedMovie} onToggleWatchlist={toggleWatchlist} watchlistIds={watchlistIds} />
                                <MovieRow title="Animation & Family" movies={mediaList.filter(m => m.genre_ids?.includes('G10'))} onMovieClick={setSelectedMovie} onToggleWatchlist={toggleWatchlist} watchlistIds={watchlistIds} />
                                <MovieRow title="Crime Stories" movies={mediaList.filter(m => m.genre_ids?.includes('G15'))} onMovieClick={setSelectedMovie} onToggleWatchlist={toggleWatchlist} watchlistIds={watchlistIds} />
                            </div>
                        </>
                    )}
                    {activeTab === 'movies' && <MediaGrid title="All Movies" items={moviesOnly} onMovieClick={setSelectedMovie} onToggleWatchlist={toggleWatchlist} watchlistIds={watchlistIds} />}
                    {activeTab === 'tv' && <MediaGrid title="TV Shows" items={tvShows} onMovieClick={setSelectedMovie} onToggleWatchlist={toggleWatchlist} watchlistIds={watchlistIds} />}
                    {activeTab === 'mylist' && (
                        myList.length > 0 
                            ? <MediaGrid title="My List" items={myList} onMovieClick={setSelectedMovie} onToggleWatchlist={toggleWatchlist} watchlistIds={watchlistIds} />
                            : <div className="pt-28 px-8 text-gray-300">My List is empty. Add some titles to start watching.</div>
                    )}
                </>
            )}
            <Modal
                media={selectedMovie}
                onClose={() => setSelectedMovie(null)}
                onPlay={() => alert("Playing...")}
                onToggleWatchlist={toggleWatchlist}
                isInWatchlist={selectedMovie ? watchlistIds.includes(selectedMovie.media_ID) : false}
                comments={selectedMovie ? (comments[selectedMovie.media_ID] || []) : []}
                onAddComment={addComment}
                recommendations={selectedMovie ? mediaList.filter(m => m.media_ID !== selectedMovie.media_ID && m.genre_ids?.some(g => selectedMovie.genre_ids?.includes(g))) : []}
            />
        </div>
    );
};

export default App;
