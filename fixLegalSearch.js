const fs = require('fs');

const file = 'client/src/pages/lawyer/LegalSearch.jsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import SkeletonLoader')) {
  content = content.replace(
    "import { Select, SelectTrigger",
    "import SkeletonLoader from '../../components/ui/SkeletonLoader';\nimport { Select, SelectTrigger"
  );
}

// Replace the loading state
const loadingStateRegex = /\{\/\* LOADING STATE \*\/\}\s*\{isSearching && \([\s\S]*?\}\)/;
content = content.replace(loadingStateRegex, '{/* LOADING STATE */}\n        {isSearching && (\n          <SkeletonLoader variant="list" />\n        )}');

fs.writeFileSync(file, content);
console.log('Updated LegalSearch');
