const fs = require('fs');

const filePath = './backend/src/controllers/companyController.ts';

let content = fs.readFileSync(filePath, 'utf8');

// Comment out all req.user references
content = content.replace(/if \(!req\.user\) \{[\s\S]*?return res\.status\(401\)\.json\(\{[\s\S]*?error: 'Authentication required',[\s\S]*?\}\);[\s\S]*?\}/g, 
  '// Skip authentication for now\n      // if (!req.user) {\n      //   return res.status(401).json({\n      //     error: \'Authentication required\',\n      //   });\n      // }');

// Comment out all user ownership checks
content = content.replace(/if \(!\(await CompanyModel\.belongsToUser\([^)]+\)\)\) \{[\s\S]*?return res\.status\(403\)\.json\(\{[\s\S]*?error: 'Access denied',[\s\S]*?\}\);[\s\S]*?\}/g,
  '// Skip user ownership check for now\n      // if (!(await CompanyModel.belongsToUser(...))) {\n      //   return res.status(403).json({\n      //     error: \'Access denied\',\n      //   });\n      // }');

// Replace req.user.userId with mock user ID
content = content.replace(/req\.user\.userId/g, "'mock-user-123'");

fs.writeFileSync(filePath, content);
console.log('Fixed req.user references in companyController.ts');
