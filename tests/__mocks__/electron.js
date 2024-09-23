const { EventEmitter } = require('events');

const ipcMain = new EventEmitter();

const dialog = {
    showSaveDialog: jest.fn().mockResolvedValue({ filePath: 'mocked/path/to/screenshot.png' }),
};

module.exports = {
    ipcMain,
    dialog,
};