declare module 'node-rsa' {
    class NodeRSA {
      constructor(options?: any);
      generateKeyPair(bits?: number, exponent?: number): void;
      encrypt(data: any, encoding: string): any;
      decrypt(encryptedData: any, encoding: string): any;
      exportKey(format: string): string;
      importKey(keyData: any, format: string): void;
      sign(data: any, encoding: string): any;
      verify(data: any, signature: any, encoding: string): boolean;
    }
  
    export = NodeRSA;
  }
  