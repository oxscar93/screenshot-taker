
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const puppeteer = require('puppeteer');
const validUrl = require('./utils')

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
        },
    });

    mainWindow.loadFile('index.html');
    //mainWindow.webContents.openDevTools(); 
}

ipcMain.on('take-screenshot', async (event, formData) => {
    if (!validUrl(formData.url, ['http', 'https'])){
        event.reply('error', 'Invalid url entered.');
        return;
    }

    try {
        const browser = await puppeteer.launch({headless: false});
        const [page] = await browser.pages();

        page.setViewport({width: 1280, height: 800})
        await page.goto(formData.url);

        const title = await page.title();
        const screenShotFilename = `screenshot-${title}.${formData.fileFormat}`;

        const { filePath } = await dialog.showSaveDialog({
            title: 'Save Screenshot file',
            defaultPath: screenShotFilename,
            filters: [
                { name: 'Images', extensions: [formData.fileFormat] },
            ],
        });

        if (filePath) {           
            if (formData.fileFormat == 'pdf'){
                await page.pdf({ path: filePath, format: 'A4' });
            }
            else{
                await page.screenshot({ path: filePath }); 
            }
            event.reply('output', 'Screenshot saved successfully!');
        } else {
            event.reply('output', 'Canceled');
        }

        await browser.close();
    } catch (error) {
        console.error(error);
        event.reply('error', 'Error occurred: ' + error.message);
    }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
