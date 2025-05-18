
const path      = require('path');
const CryptoJS  = require('crypto-js');
const StreamZip = require('node-stream-zip');

const tmp    = require('tmp');
const https = require('https');
const fs    = require('fs');

const WORDPRESS_LAST_VERSION = '6.8.1';

async function downloadAndExtractZip(url, destFolder) {
    
    const tempFile = tmp.fileSync();
    
    require('child_process')
        .execFileSync(
            'curl', 
            ['--silent', '-L', url, '-o', tempFile.name], 
            {encoding: 'utf8'}
        );

    const zip = new StreamZip.async({ file: tempFile.name });
    await zip.extract(null, destFolder);
    await zip.close();
    
}

module.exports = async function run(destFolder) {
    
    await downloadAndExtractZip(
        `https://wordpress.org/wordpress-6.8.1.zip`,
        destFolder
    );
    
    await downloadAndExtractZip(
        `https://downloads.wordpress.org/plugin/sqlite-database-integration.latest-stable.zip`,
        path.join(destFolder, 'wordpress', 'wp-content', 'plugins')
    );
    
    await fs.copyFileSync(
        path.join(destFolder, 'wordpress', 'wp-config-sample.php'),
        path.join(destFolder, 'wordpress', 'wp-config.php')
    );
    
    let dbScript = fs.readFileSync(
        path.join(
            destFolder,
            'wordpress',
            'wp-content', 
            'plugins', 
            'sqlite-database-integration',
            'db.copy'
        )
    ).toString()
    
    dbScript = dbScript.replaceAll(
        "'{SQLITE_IMPLEMENTATION_FOLDER_PATH}'",
        "implode(DIRECTORY_SEPARATOR, [__DIR__, 'plugins', 'sqlite-database-integration'])"
    );
    
    dbScript = dbScript.replaceAll(
        "{SQLITE_PLUGIN}",
        "sqlite-database-integration"
    );
    
    fs.writeFileSync(
        path.join(
            destFolder,
            'wordpress',
            'wp-content', 
            'db.php'
        ), 
        dbScript
    );

}

