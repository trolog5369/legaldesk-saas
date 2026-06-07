const fs = require('fs');

const files = [
  'client/src/components/shared/Sidebar.jsx',
  'client/src/components/shared/Header.jsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace('import { logout } from \'../../store/slices/authSlice\';', 'import { logoutUser as logout } from \'../../store/slices/authSlice\';');
    fs.writeFileSync(file, content);
    console.log('Fixed export name in ' + file);
  }
});
