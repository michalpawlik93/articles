import { loadConfig } from "./config.js";
import { EncryptionService } from "./feature/envelope-encryption/EncryptionService.js";
import { EnvKeyService } from "./feature/envelope-encryption/EnvKeyService.js";

 const config = loadConfig();
 console.log(config.ENCRYPTION_KEY)

 const envKeyService = new EnvKeyService({base64MasterKey: config.ENCRYPTION_KEY});
 const encryptionService = new EncryptionService(envKeyService);

 const encyptedText = await encryptionService.encrypt("Hello, World!");
console.log("Encrypted text:", encyptedText);

 const decryptedText = await encryptionService.decrypt(encyptedText);
 console.log("Decrypted text:", decryptedText);