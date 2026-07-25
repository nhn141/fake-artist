const fs = require('fs');
const path = require('path');

const files = [
  'apps/web/app/layout.tsx',
  'apps/web/components/Lobby.tsx',
  'apps/web/components/CanvasView.tsx',
  'apps/web/components/VotingView.tsx',
  'apps/web/components/GuessingView.tsx',
  'apps/web/components/ResultsView.tsx',
];

const replacements = [
  { from: /bg-gray-900/g, to: 'bg-stone-50' },
  { from: /bg-gray-800\/50/g, to: 'bg-white/50' },
  { from: /bg-gray-800\/80/g, to: 'bg-white/80' },
  { from: /bg-gray-800/g, to: 'bg-white' },
  { from: /bg-gray-700\/50/g, to: 'bg-stone-100' },
  { from: /bg-gray-700/g, to: 'bg-stone-100' },
  { from: /hover:bg-gray-700/g, to: 'hover:bg-stone-200' },
  { from: /hover:bg-gray-600/g, to: 'hover:bg-stone-300' },
  { from: /border-gray-700\/50/g, to: 'border-stone-200/50' },
  { from: /border-gray-700/g, to: 'border-stone-200' },
  { from: /border-gray-600/g, to: 'border-stone-300' },
  { from: /text-white/g, to: 'text-stone-800' },
  { from: /text-gray-400/g, to: 'text-stone-500' },
  { from: /text-gray-300/g, to: 'text-stone-600' },
  { from: /text-gray-500/g, to: 'text-stone-400' },
  { from: /from-pink-500 to-violet-500/g, to: 'from-rose-400 to-sky-400' },
  { from: /from-pink-400 to-violet-400/g, to: 'from-rose-400 to-sky-400' },
  { from: /from-pink-500 to-rose-500/g, to: 'from-rose-400 to-orange-400' },
  { from: /from-green-400 to-emerald-500/g, to: 'from-teal-400 to-emerald-400' },
  { from: /bg-violet-600/g, to: 'bg-sky-400 text-white' },
  { from: /hover:bg-violet-700/g, to: 'hover:bg-sky-500' },
  { from: /text-pink-400/g, to: 'text-rose-500' },
  { from: /text-red-500/g, to: 'text-rose-500' },
  { from: /text-red-400/g, to: 'text-rose-600' },
  { from: /text-green-400/g, to: 'text-teal-600' },
  { from: /bg-black\/30/g, to: 'bg-stone-200/50' },
  { from: /shadow-\[0_0_15px_rgba\(124,58,237,0\.5\)\]/g, to: 'shadow-lg shadow-sky-200' },
  { from: /shadow-\[0_0_20px_rgba\(236,72,153,0\.4\)\]/g, to: 'shadow-xl shadow-rose-200' },
  { from: /shadow-\[0_0_20px_rgba\(52,211,153,0\.4\)\]/g, to: 'shadow-xl shadow-emerald-200' },
  { from: /shadow-\[0_0_15px_rgba\(52,211,153,0\.4\)\]/g, to: 'shadow-lg shadow-emerald-200' },
  { from: /shadow-\[0_0_20px_rgba\(139,92,246,0\.4\)\]/g, to: 'shadow-xl shadow-fuchsia-200' },
  { from: /shadow-\[0_0_15px_rgba\(124,58,237,0\.4\)\]/g, to: 'shadow-lg shadow-sky-200' },
  { from: /shadow-2xl/g, to: 'shadow-xl shadow-stone-200/50' },
  { from: /bg-pink-500/g, to: 'bg-rose-300' },
  { from: /bg-violet-500/g, to: 'bg-sky-300' },
  { from: /bg-red-500/g, to: 'bg-rose-400' },
  { from: /bg-green-500/g, to: 'bg-teal-400' },
  { from: /bg-gray-900\/50/g, to: 'bg-stone-50/50' },
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    replacements.forEach(rep => {
      content = content.replace(rep.from, rep.to);
    });
    
    // Fix any text-stone-800 inside buttons that should be white
    content = content.replace(/text-stone-800 font-bold/g, 'text-white font-bold');
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});
