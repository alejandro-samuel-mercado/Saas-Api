const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'prisma/schema.prisma');
const schemaContent = fs.readFileSync(schemaPath, 'utf8');

const models = [];
let currentModel = null;
let hasTenantId = false;

const lines = schemaContent.split('\n');
for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('model ')) {
        if (currentModel && !hasTenantId) {
            models.push(currentModel);
        }
        currentModel = trimmed.split(' ')[1];
        hasTenantId = false;
    } else if (currentModel) {
        if (trimmed.startsWith('tenantId ')) {
            hasTenantId = true;
        } else if (trimmed === '}') {
            if (!hasTenantId) {
                models.push(currentModel);
            }
            currentModel = null;
            hasTenantId = false;
        }
    }
}

console.log('Models WITHOUT tenantId:');
console.log(models);
