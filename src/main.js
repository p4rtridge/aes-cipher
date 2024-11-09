const { AES } = require("./aes");
const { Command } = require("commander");
const program = new Command();

program
  .name("aes-cipher")
  .version("1.0.0")
  .description("AES cipher CLI tool");

// Encrypt
program.command("encrypt")
  .description("encrypt targeted plaintext")
  .argument("<plaintext>", "plaintext")
  .argument("<password>", "password")
  .argument("<bits>", "key size")
  .action((plaintext, password, bits) => {
    console.log(`[INPUT] plaintext: ${plaintext}\n[INPUT] password: ${password}\n[INPUT] key size: ${bits}\n\n`);
    
    const aes = new AES(password, bits);
    
    console.log("##### ENCRYPTING #####");
    let encrypted_text = aes.encrypt(plaintext);
    console.log(`\n[ENCRYPTED] encrypted text: ${encrypted_text}`);
  });

// Decrypt
program.command("decrypt")
  .description("decrypt targeted cipher")
  .argument("<encrypted_text>", "encrypted_text")
  .argument("<password>", "password")
  .argument("<bits>", "key size")
  .action((encrypted_text, password, bits) => {
    console.log(`[INPUT] encrypted_text: ${encrypted_text}\n[INPUT] password: ${password}\n[INPUT] key size: ${bits}\n\n`);
    
    const aes = new AES(password, bits);
    
    console.log("##### DECRYPTING #####");
    let decrypted_text = aes.decrypt(encrypted_text);
    console.log(`\n[DECRYPTED] decrypted text text: ${decrypted_text}`);
  });

// Both
program.command("en-de")
  .description("encrypt and decrypt")
  .argument("<plaintext>", "plaintext")
  .argument("<password>", "password")
  .argument("<bits>", "key size")
  .action((plaintext, password, bits) => {
    console.log(`[INPUT] plaintext: ${plaintext}\n[INPUT] password: ${password}\n[INPUT] key size: ${bits}\n\n`);
    
    const aes = new AES(password, bits);
    
    console.log("##### ENCRYPTING #####");
    let encrypted_text = aes.encrypt(plaintext);
    console.log(`\n[ENCRYPTED] encrypted text: ${encrypted_text}\n\n`);
    
    console.log("##### DECRYPTING #####");
    let decrypted_text = aes.decrypt(encrypted_text);
    console.log(`\n[DECRYPTED] decrypted text text: ${decrypted_text}`);
  });


program.parse(process.argv);
