const { ipcMain, dialog } = require('electron');
const puppeteer = require('puppeteer');
const validUrl = require('../../utils/utils')
const { strategies} = require('./strategies/fileStrategy');

//setup of screenshot handler
const setupScreenshotHandler = () => {
    ipcMain.on('take-screenshot', async (event, formData) => {
        if (!validUrl(formData.url, ['http', 'https'])){
            event.reply('error', 'Invalid url entered.');
            return;
        }

        try {
            const browser = await puppeteer.launch({headless: false});
            const [page] = await browser.pages();

            await page.goto(formData.url);

            const fileFormat = formData.fileFormat;
            const filePath = await getFilePathFromDialog(fileFormat);
        
            if (!filePath){
                event.reply('output', 'Canceled');
                await browser.close();
                return;
            }
       
            await saveScreenShot(page, filePath, fileFormat);
            await browser.close();

            event.reply('output', 'Screenshot saved successfully!');         
        } catch (error) {
            console.error(error);
            event.reply('error', 'Error occurred: ' + error.message);
        }
    });

    const getFilePathFromDialog = async (fileFormat) => {
        const { filePath } = await dialog.showSaveDialog({
            title: 'Save Screenshot file',
            filters: [
                { name: 'Images', extensions: [fileFormat] },
            ],
        });

        return filePath;
    }
    
    const saveScreenShot = async (page, filePath, fileFormat) =>{
        await strategies.find(h => h.canHandle(fileFormat))
                .handle(page, filePath);
    }
}

module.exports = setupScreenshotHandler;