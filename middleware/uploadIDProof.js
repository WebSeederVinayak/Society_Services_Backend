// const multer = require("multer");
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/"); // fileSacing folder anme where files will be saved
//   },
//   filename: (req, file, cb) => {
//     const uniqueName = Date.now() + "-" + file.originalname; // To prevent the conflict as i hve faced it during AWS
//     req.body.uniqueName = uniqueName; // Store the unique name in req.file for later use
//     cb(null, uniqueName);
//   },
// });

// Multer instance
// const upload = multer({ storage });

// module.exports = upload.single("idProof");
// {The above code is for multipart formdata now i am taking base64 image string so make parsing it and saving in uploads folder}
const fs = require("fs");
const path = require("path");

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const uploadIdProof = (req, res, next) => {
  const { idProof } = req.body;
  if (!idProof) {
    next();
    return;
  }
  // Validate input
  if (!idProof || !idProof.imageBase64 || !idProof.name) {
    return res
      .status(400)
      .json({ success: false, message: "Missing idProof, base64 or name" });
  }

  const { imageBase64, name } = idProof;

  // Match base64 string and extract info
  const match = imageBase64.match(/^data:(.+);base64,(.+)$/);
  if (!match) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid base64 format" });
  }

  const mimeType = match[1]; // e.g., image/jpeg
  const base64Data = match[2];
  const extension = mimeType.split("/")[1]; // e.g., jpeg, png

  const fileName = `${Date.now()}-${name}`;
  const filePath = path.join(uploadsDir, fileName);

  fs.writeFile(filePath, base64Data, "base64", (err) => {
    if (err) {
      console.error("Error saving image:", err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to save image" });
    }

    // Attach file info to req for access in next middleware
    req.idProofFile = {
      filename: fileName,
      path: `/uploads/${fileName}`,
      fullPath: filePath,
      mimeType,
    };

    next(); // Call next middleware
  });
};

module.exports = uploadIdProof;
