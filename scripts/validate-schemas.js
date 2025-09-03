#!/usr/bin/env node

/**
 * Schema Validation Script
 * Validates that all schemas have reasonable validation rules
 */

const fs = require('fs');
const path = require('path');

// Color codes for console output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// Schema validation rules
const schemaRules = {
    // Company schema rules
    company: {
        name: { min: 2, max: 100, reason: "Company names should be meaningful but not too long" },
        description: { min: 5, max: 500, reason: "Descriptions should be informative but concise" },
        industry: { min: 2, max: 50, reason: "Industry names should be specific but not verbose" }
    },
    
    // Business line schema rules
    businessLine: {
        name: { min: 2, max: 100, reason: "Business line names should be clear and concise" },
        description: { min: 5, max: 500, reason: "Descriptions should provide context without being excessive" }
    },
    
    // AI parameters schema rules
    aiParams: {
        tone: { min: 2, max: 50, reason: "Tone should be specific but not overly long" },
        characterType: { min: 2, max: 50, reason: "Character type should be descriptive but concise" },
        targetAudience: { min: 2, max: 100, reason: "Target audience should be specific but readable" },
        contentType: { min: 2, max: 50, reason: "Content type should be clear and concise" },
        socialNetwork: { min: 2, max: 50, reason: "Social network names should be standard" },
        contentFormat: { min: 2, max: 50, reason: "Content format should be specific but not verbose" },
        objective: { min: 2, max: 50, reason: "Objectives should be clear and actionable" },
        focus: { min: 0, max: 200, reason: "Focus should be optional but informative when provided" }
    }
};

function validateSchema(schemaPath, schemaName) {
    log(`\n🔍 Validating ${schemaName} schema...`, 'blue');
    
    if (!fs.existsSync(schemaPath)) {
        log(`❌ Schema file not found: ${schemaPath}`, 'red');
        return false;
    }
    
    const content = fs.readFileSync(schemaPath, 'utf8');
    const rules = schemaRules[schemaName];
    
    if (!rules) {
        log(`⚠️  No validation rules defined for ${schemaName}`, 'yellow');
        return true;
    }
    
    let isValid = true;
    
    for (const [field, rule] of Object.entries(rules)) {
        const minPattern = new RegExp(`${field}.*\\.min\\(${rule.min}\\)`);
        const maxPattern = new RegExp(`${field}.*\\.max\\(${rule.max}\\)`);
        
        if (!minPattern.test(content)) {
            log(`❌ ${field}: Expected min(${rule.min}), found different value`, 'red');
            log(`   Reason: ${rule.reason}`, 'yellow');
            isValid = false;
        } else {
            log(`✅ ${field}: min(${rule.min}) ✓`, 'green');
        }
        
        if (!maxPattern.test(content)) {
            log(`❌ ${field}: Expected max(${rule.max}), found different value`, 'red');
            log(`   Reason: ${rule.reason}`, 'yellow');
            isValid = false;
        } else {
            log(`✅ ${field}: max(${rule.max}) ✓`, 'green');
        }
    }
    
    return isValid;
}

function main() {
    log('🔍 Schema Validation Script', 'blue');
    log('============================', 'blue');
    
    const schemasDir = path.join(__dirname, '../backend/src/schemas');
    let allValid = true;
    
    // Validate company schema
    const companySchemaPath = path.join(schemasDir, 'company.ts');
    if (!validateSchema(companySchemaPath, 'company')) {
        allValid = false;
    }
    
    // Check for other schema files
    const schemaFiles = fs.readdirSync(schemasDir).filter(file => file.endsWith('.ts'));
    
    for (const file of schemaFiles) {
        if (file !== 'company.ts') {
            const schemaPath = path.join(schemasDir, file);
            const schemaName = file.replace('.ts', '');
            
            if (!validateSchema(schemaPath, schemaName)) {
                allValid = false;
            }
        }
    }
    
    log('\n📊 Validation Summary:', 'blue');
    log('=====================', 'blue');
    
    if (allValid) {
        log('✅ All schemas are valid!', 'green');
        log('🎉 Schema validation passed successfully', 'green');
        process.exit(0);
    } else {
        log('❌ Some schemas have validation issues', 'red');
        log('🔧 Please fix the issues above before deployment', 'yellow');
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { validateSchema, schemaRules };
