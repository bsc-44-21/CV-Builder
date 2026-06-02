const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const docxConverter = require('docx-pdf');

const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

app.post('/api/generate', upload.single('template'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No template uploaded');
        }

        const data = JSON.parse(req.body.data);
        const format = req.body.format || 'docx'; // 'docx' or 'pdf'
        const templatePath = req.file.path;

        const content = fs.readFileSync(path.resolve(templatePath), 'binary');
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        // Map data to template tags
        // This spreads everything so users can use {fullName} or {experience[0].company} etc.
        doc.setData({
            ...data.personalInfo,
            summary: data.summary,
            experience: data.experience,
            education: data.education,
            skills: data.skills,
            certificates: data.certificates,
            referees: data.referees,
            attributes: data.attributes
        });

        doc.render();

        const buffer = doc.getZip().generate({ type: 'nodebuffer' });
        const timestamp = Date.now();
        const outputWordPath = path.join(__dirname, `cv-${timestamp}.docx`);
        const outputPdfPath = path.join(__dirname, `cv-${timestamp}.pdf`);

        fs.writeFileSync(outputWordPath, buffer);

        if (format === 'pdf') {
            docxConverter(outputWordPath, outputPdfPath, (err, result) => {
                if (err) {
                    console.error('PDF conversion error:', err);
                    return res.status(500).send('Error converting to PDF');
                }
                res.download(outputPdfPath, 'cv.pdf', () => {
                    // Cleanup files after download
                    try {
                        fs.unlinkSync(templatePath);
                        fs.unlinkSync(outputWordPath);
                        fs.unlinkSync(outputPdfPath);
                    } catch (e) {
                        console.error('Cleanup error:', e);
                    }
                });
            });
        } else {
            res.download(outputWordPath, 'cv.docx', () => {
                // Cleanup files after download
                try {
                    fs.unlinkSync(templatePath);
                    fs.unlinkSync(outputWordPath);
                } catch (e) {
                    console.error('Cleanup error:', e);
                }
            });
        }

    } catch (error) {
        console.error('Generation error:', error);
        res.status(500).send('Error generating CV: ' + error.message);
    }
});

const server = app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Try closing other programs or using a different port.`);
    } else {
        console.error('Server error:', error);
    }
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.error('There was an uncaught error', err);
    process.exit(1);
});
