const fs = require('fs');
const file = 'client/src/pages/lawyer/CalendarWorkspace.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\\\`/g, '`').replace(/\\\$/g, '$');

fs.writeFileSync(file, content);
console.log('Fixed backticks.');
