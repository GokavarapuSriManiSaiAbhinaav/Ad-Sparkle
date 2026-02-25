/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const files = [
    'app/dashboard/page.tsx',
    'app/dashboard/[groupId]/page.tsx',
    'components/profile-dropdown.tsx'
];

const replaces = [
    { from: /bg-\[\#0F0F12\]/g, to: 'bg-background' },
    { from: /bg-\[\#18181B\]/g, to: 'bg-card' },
    { from: /bg-\[\#27272A\]/g, to: 'bg-muted' },
    { from: /bg-\[\#131316\]/g, to: 'bg-muted/30' },
    { from: /border-\[\#27272A\]/g, to: 'border-border' },
    { from: /text-\[\#A1A1AA\]/g, to: 'text-muted-foreground' },
    { from: /shadow-\[\#7C3AED\]\/10/g, to: 'shadow-primary/20' },
    { from: /border-\[\#7C3AED\]\/30/g, to: 'border-primary/30' },
    { from: /text-\[\#7C3AED\]/g, to: 'text-primary' },
    { from: /group-hover:text-\[\#7C3AED\]/g, to: 'group-hover:text-primary' },
    { from: /bg-white\/10/g, to: 'bg-foreground/10' },
    { from: /text-white\/70/g, to: 'text-muted-foreground' },
    { from: /text-white\/50/g, to: 'text-muted-foreground/70' },
    { from: /hover:text-white/g, to: 'hover:text-foreground' },
    { from: /group-hover:text-white/g, to: 'group-hover:text-foreground' },
    { from: /text-white/g, to: 'text-foreground' },
];

files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        replaces.forEach(r => {
            content = content.replace(r.from, r.to);
        });

        // Fix up specific places that should remain text-white (like gradient badges)
        // 1. Sparkles icon in dashboard page
        content = content.replace(/<Sparkles className="([^"]*) text-foreground"/g, '<Sparkles className="$1 text-white"');
        // 2. Avatar initals in gradient bg
        content = content.replace(/className="([^"]*) text-foreground font-bold text-lg shadow-md/g, 'className="$1 text-white font-bold text-lg shadow-md');
        // 3. Any element with the gradient inline style
        content = content.replace(/text-foreground([^>]*style={{[^}]*linear-gradient)/g, 'text-white$1');

        fs.writeFileSync(filePath, content);
        console.log(`Updated ${file}`);
    }
});
