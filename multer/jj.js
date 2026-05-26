import express from 'express';
import multer from 'multer';
import path from 'path';

const app = express();
const PORT = 2005;
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb){
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const uploadWithValidation = multer({
    storage: storage,
    limits:{
        fileSize: 1024 * 1024 * 10
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = allowedTypes.test(file.mimetype);

        if(extName && mimeType){
            return cb(null, true);
        } else {
            cb(new Error('Error: Only images (jpeg, jpg, png, gif) are allowed!'));
        }
    }
});

app.post('/upload-secure', (req,  res) => {
    uploadWithValidation.single('profilePic')(req, res, (err) => {
        if(err){
            return res.status(400).send({ error: err.message });
        }
        
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        
        res.send({
            message: "File uploaded successfully!",
            imageUrl: imageUrl,
            fileDetails: req.file
        });
    });
});

app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
);