const fs = require('fs');

const content = fs.readFileSync('C:/Users/MEDIA INFOPLUS/.gemini/antigravity-ide/brain/2bc4aaae-2b95-4b78-9f98-6fc11440e0a3/.system_generated/steps/373/content.md', 'utf8');

// Match all h2 tags
const h2Regex = /<h2[^>]*id="([^"]+)"[^>]*>(.*?)<\/h2>/g;
let match;
const trends = [];
while ((match = h2Regex.exec(content)) !== null) {
  trends.push({ id: match[1], title: match[2].replace(/<[^>]+>/g, '').replace(/&#x27;/g, "'").replace(/&amp;/g, '&') });
}

// Match all h3 tags
const h3Regex = /<h3[^>]*id="([^"]+)"[^>]*>(.*?)<\/h3>/g;
const subheadings = [];
while ((match = h3Regex.exec(content)) !== null) {
  subheadings.push({ id: match[1], title: match[2].replace(/<[^>]+>/g, '').replace(/&#x27;/g, "'").replace(/&amp;/g, '&') });
}

console.log('=== TRENDS (H2) ===');
console.log(JSON.stringify(trends, null, 2));

console.log('=== SUBHEADINGS (H3) ===');
console.log(JSON.stringify(subheadings, null, 2));
