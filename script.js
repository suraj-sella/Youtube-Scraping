// Use Strict Mode
'use strict';

// Requiring puppeteer
const puppeteer = require('puppeteer');

// Requiring youtube-dl
const youtubedl = require('youtube-dl');

// Requiring fs
const fs = require('fs');

// Requiring path
const path = require('path');

// Donwload Function To Implement youtube-dl
const download = function(link){
    
    return new Promise((resolve, reject) => {

        // Defining size, pos, percent & output
        var size = 0;
        var pos = 0;
        var percent = 0;
        var output;
    
        // Hoist youtubedl to video
        const video = youtubedl(link);
    
        // Will be called when the download starts.
        video.on('info', function (info) {
            
            // process.stdout.write('Download Started...');
            // process.stdout.write('Filename: ' + info._filename);
            // process.stdout.write('Total Size: ' + info.size);
            
            // Updating Size Of File
            size = info.size;
    
            // Defining Path
            output = path.join(__dirname + '/videos/', info._filename + '.mp4');
            
            // Creating Write Stream
            video.pipe(fs.createWriteStream(output));
        });
    
        // Called When Data Is Being Received
        video.on('data', function data(chunk) {
            
            // Appending Remaining Chunk Length to Pos
            pos += chunk.length;
    
            // `size` should not be 0 here.
            if (size) {
                
                // Calculating Percentage
                percent = (pos / size * 100).toFixed(2);
                
                // Printing It Out
                process.stdout.cursorTo(0);
                process.stdout.clearLine(1);
                process.stdout.write("Downloading: " + percent + '%');
            }
        });
    
        // Called When Download End
        video.on('end', function () {
            process.stdout.cursorTo(0);
            process.stdout.clearLine(1);
            process.stdout.write('Finished Downloading!');
            size = 0;
            pos = 0;
            process = 0;
            output = null;
            resolve(true);
        });
    });
};

// Self Calling Main Async Function For Awaiting The Code Inside
(async () => {

    // Launching Browser
    process.stdout.write("Launching Browser...");
    const browser = await puppeteer.launch({
        args: ['--start-maximized'], // Full Screen
        devtools: true // Enables Dev Tools & Marks Headless False
    });

    // Getting The Current Page
    process.stdout.write("\r\nGetting Current Page...");
    const page = (await browser.pages())[0];

    // Setting The Size Of Viewport To Size Of Browser
    // await page.setViewport({
    //     width: 0,
    //     height: 0
    // });

    // Navigating To Youtube
    process.stdout.write("\r\nNavigating To Youtube...");
    await page.goto('https://www.youtube.com/');

    // Wait For Google Sign In Selector
    process.stdout.write("\r\nWaiting For Sign In Button...");
    await page.waitForSelector('#buttons > ytd-button-renderer > a', {
        visible: true
    });

    // Click On Google Sign In
    process.stdout.write("\r\nClicking...");
    await page.click('#buttons > ytd-button-renderer > a');

    // Wait For Email Field
    process.stdout.write("\r\nWaiting For Email Field Selector...");
    await page.waitForSelector('#identifierId', {
        visible: true
    });

    // Type In Email Field
    process.stdout.write("\r\nEntering EmailId...");
    await page.type('#identifierId', 'abcd@gmail.com');

    // Click On Next
    process.stdout.write("\r\nClicking Next...");
    await page.click('#identifierNext');

    // Wait For Password Field
    process.stdout.write("\r\nWaiting For Password Field...");
    await page.waitForSelector('input[type="password"]', {
        visible: true
    });

    // Type In Password Field
    process.stdout.write("\r\nTyping Password...");
    await page.type('input[type="password"]', 'abcd@123', {
        delay: 10
    });

    // Show Password
    // await page.$eval(
    //     'input[type="password"]', 
    //     e => e.setAttribute("type", "text")
    // );

    // Click On Next
    process.stdout.write("\r\nClicking Next...");
    await page.click('#passwordNext');

    // Wait For Subscriptions Tab Selector
    process.stdout.write("\r\nWaiting For Subscriptions Tab...");
    await page.waitForSelector('#endpoint[title="Subscriptions"]');

    // Click Subscriptions Tab
    process.stdout.write("\r\nClicking...");
    await page.click('#endpoint[title="Subscriptions"]');

    // Wait For Today Tabs To Load
    process.stdout.write("\r\nWaiting For The Videos Elements...");
    await page.waitForSelector('ytd-browse[page-subtype="subscriptions"] ytd-two-column-browse-results-renderer #primary #contents ytd-item-section-renderer:nth-child(1) #contents ytd-grid-renderer #items ytd-grid-video-renderer');

    // Fetch All The Video Elements
    process.stdout.write("\r\nFetching All The Videos Elements...");
    const videos = await page.$$('ytd-browse[page-subtype="subscriptions"] ytd-two-column-browse-results-renderer #primary #contents ytd-item-section-renderer:nth-child(1) #contents ytd-grid-renderer #items ytd-grid-video-renderer');

    // Array To Store The Links
    process.stdout.write("\r\nPreparing urls array...");
    const urls = await Array();

    // Fetching Links & Accumulating Them
    process.stdout.write("\r\nFetching Links & Accumulating in urls array...");
    for (const video of videos) {
        await urls.push(await (await (await video.$('a')).getProperty('href')).jsonValue());
    }

    // Loop Through Links & Downloads
    process.stdout.write("\r\nStarting Download Process...");
    for (const url of urls) {
        
        // Call Download Function
        process.stdout.write("\r\nDownloading Link: " + url + " ...");
        await download(url);
    }

    // Logout From Account
    // Close Browser
    process.stdout.write("\r\nClosing Browser!");
    await browser.close();
})();