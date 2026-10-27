"use strict";
exports.__esModule = true;
exports.matchesMapFilterText = exports.MAP_FILTER_KEYWORDS = exports.MAP_FILTERS = void 0;
exports.MAP_FILTERS = [
    { label: "All", key: "all" },
    { label: "Café ☕", key: "cafe" },
    { label: "Dating 💕", key: "dating" },
    // { label: "Gaming 🎮", key: "gaming" },
    // { label: "Sports 🏃", key: "sports" },
    { label: "Side Events 🎟️", key: "side-events" },
    { label: "Views 🌅", key: "views" },
    { label: "Landmarks 🏛️", key: "landmarks" },
    { label: "Local Eats 🍜", key: "local-eats" },
    // { label: "Hidden Gems 💎", key: "hidden-gems" },
    // { label: "Community 🤝", key: "community" },
    { label: "Ethereum ⟠", key: "ethereum" },
    // { label: "AI 🤖", key: "ai" },
    // { label: "DeFi 💸", key: "defi" },
    // { label: "ZK 🔐", key: "zk" },
    { label: "Hackathons 💻", key: "hackathons" },
    // { label: "Networking 🫂", key: "networking" },
    { label: "Coworking 🧑‍💻", key: "coworking" },
    { label: "Explore Mumbai 🌆", key: "explore-mumbai" },
    { label: "Chill 🌙", key: "chill" },
];
exports.MAP_FILTER_KEYWORDS = {
    cafe: ["coffee", "chai", "boba", "tea", "ramen", "food", "eat", "matcha", "latte", "café", "cafe", "brunch", "lunch", "dinner", "cook", "☕", "🍵", "🧋", "🍜", "🍕"],
    dating: ["date", "dating", "love", "crush", "vibe", "connection", "hangout", "chill", "flirt", "coffee date", "sunset", "romantic", "💕", "✨", "🔥"],
    gaming: ["game", "gaming", "chess", "board", "cards", "esport", "valorant", "minecraft", "ps5", "xbox", "pubg", "bgmi", "cod", "fortnite", "dice", "ludo", "🎮", "🎲", "🎯"],
    movies: ["movie", "film", "cinema", "netflix", "anime", "watch", "series", "binge", "popcorn", "marvel", "bollywood", "horror", "comedy", "thriller", "🍿", "🎬", "🎌"],
    study: ["study", "code", "coding", "book", "exam", "learn", "grind", "library", "homework", "project", "hackathon", "dsa", "leetcode", "🎒", "📚", "💻"],
    music: ["guitar", "jam", "music", "vinyl", "sing", "beat", "lofi", "karaoke", "concert", "piano", "rap", "podcast", "spotify", "🎸", "🎧", "🎤"],
    sports: ["gym", "run", "walk", "bike", "swim", "sport", "workout", "yoga", "cricket", "football", "basketball", "badminton", "trek", "hike", "🛹", "🏋️", "🚴", "🏃", "🧘"],
    "side-events": ["side event", "side-event", "community event", "meetup", "conference", "devcon", "event", "🎟️"],
    views: ["view", "views", "sunset", "skyline", "scenic", "sea view", "🌅"],
    landmarks: ["landmark", "museum", "monument", "gateway", "heritage", "temple", "fort", "🏛️"],
    "local-eats": ["local eats", "street food", "food walk", "thali", "vada pav", "misal", "biryani", "restaurant", "🍜"],
    "hidden-gems": ["hidden gem", "hidden-gems", "secret spot", "lesser known", "offbeat", "💎"],
    community: ["community", "builders", "community meetup", "🤝"],
    ethereum: ["ethereum", "eth", "web3", "solidity", "smart contract", "account abstraction", "⟠"],
    ai: ["ai", "artificial intelligence", "machine learning", "agents", "ai agents", "🤖"],
    defi: ["defi", "decentralized finance", "yield", "liquidity", "💸"],
    zk: ["zk", "zero knowledge", "zero-knowledge", "snark", "stark", "privacy", "🔐"],
    hackathons: ["hackathon", "hackathons", "build", "building", "hack", "💻"],
    networking: ["networking", "network", "founders", "cofounders", "connect", "🫂"],
    coworking: ["coworking", "co-working", "work session", "work together", "🧑‍💻"],
    "explore-mumbai": ["explore", "mumbai", "city walk", "city exploration", "wander", "roam", "🌆"],
    chill: ["chill", "vibe", "hangout", "drive", "explore", "roam", "wander", "sunset", "night", "midnight", "smoke", "terrace", "rooftop", "🎨", "⚡", "📷", "🌿", "🍳", "🚗", "🌙"]
};
function matchesWord(text, keyword) {
    var isAlphaNum = /^[a-zA-Z0-9]+$/.test(keyword);
    if (isAlphaNum) {
        var escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return new RegExp("\\b" + escaped + "\\b", "i").test(text);
    }
    return text.includes(keyword);
}
function matchesMapFilterText(text, key) {
    if (key === "all")
        return true;
    var keywords = exports.MAP_FILTER_KEYWORDS[key];
    if (!keywords)
        return true;
    var normalizedText = text.toLowerCase();
    return keywords.some(function (keyword) { return matchesWord(normalizedText, keyword); });
}
exports.matchesMapFilterText = matchesMapFilterText;
