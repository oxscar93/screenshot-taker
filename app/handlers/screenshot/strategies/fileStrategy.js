//creation of two handlers to handle file formats and their actions 

const pdfStrategy = {
    canHandle: (fileFormat) => fileFormat === 'pdf',
    handle: async (page, filePath) => {
        await page.pdf({ path: filePath, format: 'A4' });
    }
};

const pngStrategy = {
    canHandle: (fileFormat) => fileFormat === 'png',
    handle: async (page, filePath) => {
        await page.screenshot({ path: filePath });
    }
};

const strategies = [pdfStrategy, pngStrategy ];

module.exports = { strategies};