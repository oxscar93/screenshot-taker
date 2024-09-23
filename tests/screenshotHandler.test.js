const setupScreenshotHandler = require('../app/handlers/screenshot/screenshot');
const { ipcMain } = require('electron');
const puppeteer = require('puppeteer');

jest.mock('puppeteer');

describe('Screenshot Handler', () => {
    beforeAll(() => {
        setupScreenshotHandler();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should reply with error for invalid URL', () => {
        const event = { reply: jest.fn() };
        const formData = { url: 'invalid-url', fileFormat: 'png' };

        ipcMain.emit('take-screenshot', event, formData);

        expect(event.reply).toHaveBeenCalledWith('error', 'Invalid url entered.');
    });

    test.each([
        ['png'],
        ['pdf']
    ])('should call dialog and save %s screenshot', async (fileFormat) => {
        const event = { reply: jest.fn() };
        const formData = { url: 'http://example.com', fileFormat: fileFormat };

        const mockPage = {
            goto: jest.fn().mockResolvedValue(),
            screenshot: jest.fn().mockResolvedValue(),
            close: jest.fn(),
        };

        const mockBrowser = {
            launch: jest.fn().mockResolvedValue({
                pages: jest.fn().mockResolvedValue([mockPage]),
                close: jest.fn(),
            }),
        };

        puppeteer.launch.mockImplementation(mockBrowser.launch);

        ipcMain.once('take-screenshot-response', () => {
            expect(event.reply).toHaveBeenCalledWith('output', 'Screenshot saved successfully!');
            expect(mockBrowser.launch).toHaveBeenCalled();
            expect(mockPage.goto).toHaveBeenCalledWith(formData.url);
            expect(mockPage.screenshot).toHaveBeenCalled();
            done();
        });
    
        ipcMain.emit('take-screenshot', event, formData);
    });
});
