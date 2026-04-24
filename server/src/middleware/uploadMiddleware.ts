import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination(req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
        cb(null, 'uploads/');
    },
    filename(req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

function checkFileType(file: Express.Multer.File, cb: FileFilterCallback) {
    const filetypes = /mp4|mov|avi|mkv/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Videos only!'));
    }
}

const upload = multer({
    storage,
    fileFilter: function (req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
        checkFileType(file, cb);
    },
});

export default upload;

// Config for CSV memory upload
export const uploadCsv = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
            cb(null, true);
        } else {
            cb(new Error('CSV files only!'));
        }
    }
});
