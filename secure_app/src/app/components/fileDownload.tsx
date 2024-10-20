// components/FileDownload.tsx
import { useState } from 'react';
import NodeRSA from 'node-rsa';

const FileDownload: React.FC = () => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');

  // Replace with your actual private key
  const privateKey = `-----BEGIN RSA PRIVATE KEY-----
your private key here
-----END RSA PRIVATE KEY-----`;

  const handleDownload = async () => {
    if (!fileName) {
      setMessage('No file selected for download.');
      return;
    }

    try {
      // Initialize RSA with the private key
      const key = new NodeRSA(privateKey);
      
      // Fetch the encrypted file from the server (modify URL as needed)
      const response = await fetch(`/api/download?fileName=${encodeURIComponent(fileName)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch the file.');
      }

      const { encryptedData, encryptedAESKey } = await response.json();

      // Decrypt the AES key with the RSA private key
      const aesKey = key.decrypt(encryptedAESKey, 'utf8');

      // Decrypt the file data with the AES key
      const decryptedData = CryptoJS.AES.decrypt(encryptedData, aesKey).toString(CryptoJS.enc.Utf8);

      // Create a Blob from the decrypted data
      const blob = new Blob([decryptedData], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);

      // Create a link and trigger the download
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName; // Use the file name from your state
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
    <div>
      <input
        type="text"
        placeholder="Enter file name"
        value={fileName || ''}
        onChange={(e) => setFileName(e.target.value)}
      />
      <button onClick={handleDownload} className="mt-2 bg-blue-500 text-white p-2 rounded">
        Download File
      </button>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
};

export default FileDownload;
