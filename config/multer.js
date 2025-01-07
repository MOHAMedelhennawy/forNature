import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join('public', 'images/products'));    // Define the path that files will saved in
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);    // create random name
        cb(null, uniqueSuffix + path.extname(file.originalname));   // Add file ext name '.png' at the end of random file name
        // For ex: if the file name is 'image.png' =(convert to)=> '1701111111111-523456789.png'
    }
});

const upload = multer({ storage });

export default upload;
