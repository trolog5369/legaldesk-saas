const fs = require('fs');

const files = [
  'client/src/components/ui/SkeletonLoader.jsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/\\\`/g, '`').replace(/\\\$/g, '$');
    fs.writeFileSync(file, content);
    console.log('Fixed backticks in ' + file);
  }
});
