// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { Fields, Files } from 'formidable';
import fs from 'fs';
import CryptoJS from 'crypto-js';
import NodeRSA from 'node-rsa';

// Configuration for Next.js API routes to disable body parser
export const config = {
  api: {
    bodyParser: false, // Disables default body parsing for files
  },
};

// Create a new RSA key for encrypting the AES key
const receiverPublicKey = new NodeRSA({ b: 2048 });
// Generate key pair once and store the public key for use in production
const publicKey = receiverPublicKey.exportKey('public');

interface UploadedFile {
  filepath: string; // The temporary path created by formidable
  originalFilename: string; // The original name of the uploaded file
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const form = new formidable.IncomingForm();

  // Parse the form
  form.parse(req, async (err: Error | null, fields: Fields, files: Files) => {
    if (err) {
      console.error('Error parsing form:', err);
      return res.status(500).json({ message: 'Failed to parse form data.' });
    }

    // Access the uploaded file
    const file = files.file as unknown as UploadedFile; // Type assertion

    // Check if the file is valid and not an array
    if (!file || Array.isArray(file)) {
      return res.status(400).json({ message: 'No file uploaded or invalid file type.' });
    }

    // Read the file's content
    const filePath = file.filepath; // Use the temporary path created by formidable
    const originalFileName = file.originalFilename; // Get the original file name

    const outputDir = './uploads';
    if (!fs.existsSync(outputDir)){
      fs.mkdirSync(outputDir); // Create uploads directory if it doesn't exist
    }

    try {
      const fileData = await fs.promises.readFile(filePath); // Read the uploaded file data

      // Encrypt the file data using AES
      const aesKey = CryptoJS.lib.WordArray.random(32); // Generate AES key
      const encryptedFile = CryptoJS.AES.encrypt(fileData.toString(), aesKey.toString()).toString();

      // Encrypt the AES key using RSA public key
      const encryptedAESKey = receiverPublicKey.encrypt(aesKey.toString(), 'base64');

      // Write the encrypted file to disk
      const outputFilePath = `${outputDir}/encrypted_${originalFileName}`; // Make sure the uploads directory exists
      await fs.promises.writeFile(outputFilePath, encryptedFile, 'utf-8');

      
      res.status(200).json({
        message: 'File uploaded and encrypted successfully!',
        encryptedAESKey: encryptedAESKey,
      });
    } catch (readError) {
      console.error('Error reading file:', readError);
      res.status(500).json({ message: 'Error reading file data.' });
    }
  });
};

export default handler;
