const fs = require('fs');
const path = require('path');

const filePath = './backend/src/controllers/companyController.ts';

let content = fs.readFileSync(filePath, 'utf8');

// Replace all authentication checks
content = content.replace(
  /if \(!req\.user\) \{\s*return res\.status\(401\)\.json\(\{\s*error: 'Authentication required',\s*\}\);\s*\}/g,
  '// Skip authentication for now\n      // if (!req.user) {\n      //   return res.status(401).json({\n      //     error: \'Authentication required\',\n      //   });\n      // }'
);

// Replace req.user.userId with mock user ID
content = content.replace(/req\.user\.userId/g, "'mock-user-123'");

fs.writeFileSync(filePath, content);
console.log('Authentication checks removed from companyController.ts');
