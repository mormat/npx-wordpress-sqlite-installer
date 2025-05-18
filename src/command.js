#!/usr/bin/env node

const instalLWordpress = require('./main');

async function run() {
    const destFolder = process.cwd();
    
    await instalLWordpress( destFolder );
    
    console.log(`wordpress with sqlite was installed at "${destFolder}"`);
    
}

run();
