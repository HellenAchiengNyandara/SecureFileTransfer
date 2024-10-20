'use client'
import { useState } from 'react';
import NodeRSA from 'node-rsa';
import CryptoJS from 'crypto-js';

interface FileUploadResponse {
  filepath: string; 
  name: string; 
}

const FileUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');

  const privateKey = `-----BEGIN RSA PRIVATE KEY-----
your private key here
-----END RSA PRIVATE KEY-----`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('Please select a file first.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result: FileUploadResponse = await response.json();
      console.log('File uploaded:', result);
      setMessage('File uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('Failed to upload the file.');
    }
  };

  const handleDownload = async () => {
    if (!fileName) {
      setMessage('No file selected for download.');
      return;
    }

    try {
      const key = new NodeRSA(privateKey);

      const response = await fetch(`/api/download?fileName=${encodeURIComponent(fileName)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch the file.');
      }

      const { encryptedData, encryptedAESKey } = await response.json();

      const aesKey = key.decrypt(encryptedAESKey, 'utf8');
      const decryptedData = CryptoJS.AES.decrypt(encryptedData, aesKey).toString(CryptoJS.enc.Utf8);

      const blob = new Blob([decryptedData], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMessage('File downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      setMessage('Failed to download the file.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-lg shadow-md">
      <h1 className="font-extrabold">Secure File Transfer App</h1>
      <input
        type="file"
        onChange={handleFileChange}
        className=" mt-4 block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer focus:outline-none focus:border-blue-500 p-2 mb-4"
      />
      <button onClick={handleUpload} className="mt-2 bg-blue-500 text-white p-2 rounded">
        Upload File
      </button>
      <button onClick={handleDownload} className="mt-2 bg-green-500 text-white p-2 rounded">
        Download File
      </button>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
};

export default FileUpload;
