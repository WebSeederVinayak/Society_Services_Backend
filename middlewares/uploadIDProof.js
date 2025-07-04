const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // fileSacing folder anme where files will be saved
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname; // To prevent the conflict as i hve faced it during AWS
    req.body.uniqueName = uniqueName; // Store the unique name in req.file for later use
    cb(null, uniqueName);
  },
});

// Multer instance
const upload = multer({ storage });

module.exports = upload.single("idProof");
