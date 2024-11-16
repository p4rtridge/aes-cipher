const BLOCK_SIZE = 4;

const SUBSTITUTION_BOX = [
  0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,
  0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,
  0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,
  0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,
  0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,
  0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,
  0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,
  0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,
  0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,
  0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,
  0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,
  0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,
  0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,
  0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,
  0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,
  0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16
];

const ROUND_CONSTANTS = [ 
  [0x00, 0x00, 0x00, 0x00],
  [0x01, 0x00, 0x00, 0x00],
  [0x02, 0x00, 0x00, 0x00],
  [0x04, 0x00, 0x00, 0x00],
  [0x08, 0x00, 0x00, 0x00],
  [0x10, 0x00, 0x00, 0x00],
  [0x20, 0x00, 0x00, 0x00],
  [0x40, 0x00, 0x00, 0x00],
  [0x80, 0x00, 0x00, 0x00],
  [0x1b, 0x00, 0x00, 0x00],
  [0x36, 0x00, 0x00, 0x00]
];

function sub_word(w) {
  for (let i = 0; i < 4; i++) w[i] = SUBSTITUTION_BOX[w[i]];
  return w;
}

function rotate_word(w) {
  let tmp = w[0];
  
  for (let i=0; i<3; i++) w[i] = w[i+1];
  
  w[3] = tmp;
  
  return w;
}

function key_expansion(key) {
  let key_len = key.length / BLOCK_SIZE;
  let number_of_rounds = key_len + 6;

  let w = new Array(BLOCK_SIZE * (number_of_rounds + 1));
  let temp = new Array(4);
  
  for (let i=0; i < key_len; i++) {
      let r = [key[4 * i], key[4 * i + 1], key[4 * i + 2], key[4 * i + 3]];
      w[i] = r;
  }

  for (let i = key_len; i < BLOCK_SIZE * (number_of_rounds + 1); i++) {
      w[i] = new Array(4);

      for (let t = 0; t < 4; t++) temp[t] = w[i - 1][t];
      
      if (i % key_len == 0) {
          temp = sub_word(rotate_word(temp));

          for (let t = 0; t < 4; t++) temp[t] ^= ROUND_CONSTANTS[i / key_len][t];
      } else if (key_len > 6 && i % key_len == 4) {
          temp = sub_word(temp);
      }

      for (let t = 0; t < 4; t++) w[i][t] = w[i - key_len][t] ^ temp[t];
  }

  return w;
}

String.prototype.utf8Encode = function() {
    return unescape( encodeURIComponent( this ) );
};

String.prototype.utf8Decode = function() {
    try {
        return decodeURIComponent( escape( this ) );
    } catch (e) {
        return this;
    }
};

class AES {
  w;
  number_of_rounds;
  state = [
    [], 
    [], 
    [], 
    []
  ];

  constructor(input, w) {
    this.w = w;
    this.number_of_rounds = w.length / BLOCK_SIZE - 1;
    
    for (let i = 0; i < 4 * BLOCK_SIZE; i++) {
      this.state[i % 4][Math.floor(i / 4)] = input[i];
    }
  }

  cipher() {
    console.log("[ENCRYPTING / DECRYPTING] Starting AES cipher process");
    
    this.add_round_key(0);

    for (let round = 1; round < this.number_of_rounds; round++) {
      console.log(`\n[ENCRYPTING / DECRYPTING] Processing round ${round}`);
      this.sub_bytes();
      this.shift_rows();
      this.mix_columns();
      this.add_round_key(round);
    }

    this.sub_bytes();
    this.shift_rows();
    this.add_round_key(this.number_of_rounds);

    let result = new Array(4 * BLOCK_SIZE);
    
    console.log("\n[ENCRYPTING / DECRYPTING] Final state after encryption: ", this.state);
    for (let i = 0; i < 4 * BLOCK_SIZE; i++) result[i] = this.state[i % 4][Math.floor(i / 4)];
    
    return result;
  }

  add_round_key(rnd) {
    console.log(`\n[ADD_ROUND_KEY] Adding round key for round: ${rnd}`);
    
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < BLOCK_SIZE; c++) {
        this.state[r][c] ^= this.w[4 * rnd + c][r];
        console.log(`[ADD_ROUND_KEY] State[${r}][${c}]: ${this.state[r][c]}`);
      }
    }
  }

  sub_bytes() {
    console.log("\n[SUB_BYTES] Applying sub bytes transformation");

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < BLOCK_SIZE; c++) {
        this.state[r][c] = SUBSTITUTION_BOX[this.state[r][c]];

        console.log(`[SUB_BYTES] State[${r}][${c}]: ${this.state[r][c]}`);
      }
    }  
  }

  shift_rows() {
    console.log("\n[SHIFT_ROWS] Applying shift rows transformation");
    
    let temp = new Array(4);

    for (let r = 1; r < 4; r++) {
      for (let c = 0; c < 4; c++) temp[c] = this.state[r][(c + r) % BLOCK_SIZE];
      for (let c = 0; c < 4; c++) {
        this.state[r][c] = temp[c];

        console.log(`[SHIFT_ROWS] State[${r}][${c}]: ${this.state[r][c]}`);
      }
    }
  }

  mix_columns() {
    console.log("\n[MIX_COLUMNS] Applying mix columns transformation");

    for (let c = 0; c < 4; c++) {
      let a = new Array(4);
      let b = new Array(4);

      for (let i = 0; i < 4; i++) {
        a[i] = this.state[i][c];
        b[i] = this.state[i][c] & 0x80 ? this.state[i][c] << 1 ^ 0x11b : this.state[i][c] << 1;

        this.state[0][c] = b[0] ^ a[1] ^ b[1] ^ a[2] ^ a[3];
        this.state[1][c] = a[0] ^ b[1] ^ a[2] ^ b[2] ^ a[3];
        this.state[2][c] = a[0] ^ a[1] ^ b[2] ^ a[3] ^ b[3];
        this.state[3][c] = a[0] ^ b[0] ^ a[1] ^ a[2] ^ b[3];
      }

      console.log(`[MIX_COLUMNS] State[0][${c}]: ${this.state[0][c]}`);
      console.log(`[MIX_COLUMNS] State[1][${c}]: ${this.state[1][c]}`);
      console.log(`[MIX_COLUMNS] State[2][${c}]: ${this.state[2][c]}`);
      console.log(`[MIX_COLUMNS] State[3][${c}]: ${this.state[3][c]}`);
    }
  }
}

class CTR {
  block_size = 16;
  password;
  number_of_bits;

  constructor(password, number_of_bits) {
    if (!(number_of_bits == 128 || number_of_bits == 192 || number_of_bits == 256)) throw new Error("Expected 128, 192 or 256 bits");

    //this.password = String(password).utf8Encode();
    this.password = String(password);
    this.number_of_bits = number_of_bits;
  }

  encrypt(plaintext) {
    //plaintext = String(plaintext).utf8Encode();
    plaintext = String(plaintext);

    let number_of_bytes = this.number_of_bits / 8;
    let pw_bytes = new Array(number_of_bytes);
    
    for (let i = 0; i < number_of_bytes; i++) {
        pw_bytes[i] = isNaN(this.password.charCodeAt(i)) ? 0 : this.password.charCodeAt(i);
    }

    let key = new AES(pw_bytes, key_expansion(pw_bytes)).cipher();
    key = key.concat(key.slice(0, number_of_bytes - 16));

    let counter_block = new Array(this.block_size);

    let nonce = (new Date()).getTime();
    let nonce_ms = nonce % 1000;
    let nonce_sec = Math.floor(nonce / 1000);
    let nonce_rnd = Math.floor(Math.random() * 0xffff);

    for (let i = 0; i < 2; i++) counter_block[i] = (nonce_ms  >>> i * 8) & 0xff;
    for (let i = 0; i < 2; i++) counter_block[i + 2] = (nonce_rnd >>> i * 8) & 0xff;
    for (let i = 0; i < 4; i++) counter_block[i + 4] = (nonce_sec >>> i * 8) & 0xff;

    let ctr_txt = '';
    for (let i = 0; i < 8; i++) ctr_txt += String.fromCharCode(counter_block[i]);

    let key_schedule = key_expansion(key);

    let block_count = Math.ceil(plaintext.length / this.block_size);
    let ciphertxt = new Array(block_count);

    for (let b = 0; b < block_count; b++) {
      for (let c = 0; c<4; c++) counter_block[15 - c] = (b >>> c * 8) & 0xff;
      for (let c = 0; c<4; c++) counter_block[15 - c - 4] = (b / 0x100000000 >>> c * 8);

      console.log(`\n[ENCRYPTING] Processing block ${b}`);
      let cipher_cntr = new AES(counter_block, key_schedule).cipher();

      let block_length = b < block_count - 1 ? this.block_size : (plaintext.length - 1) % this.block_size + 1;
      let cipher_char = new Array(block_length);

      for (let i = 0; i < block_length; i++) {
          cipher_char[i] = cipher_cntr[i] ^ plaintext.charCodeAt(b * this.block_size + i);
          cipher_char[i] = String.fromCharCode(cipher_char[i]);
      }

      ciphertxt[b] = cipher_char.join('');
    }

    return btoa(ctr_txt + ciphertxt.join(''));
  }

  decrypt(ciphertext) {
    ciphertext = atob(ciphertext);
    let number_of_bytes = this.number_of_bits / 8;
    let pw_bytes = new Array(number_of_bytes);

    for (let i = 0; i < number_of_bytes; i++) {
        pw_bytes[i] = isNaN(this.password.charCodeAt(i)) ? 0 : this.password.charCodeAt(i);
    }

    let key = new AES(pw_bytes, key_expansion(pw_bytes)).cipher();
    key = key.concat(key.slice(0, number_of_bytes - 16));

    var counter_block = new Array(8);
    var ctr_txt = ciphertext.slice(0, 8);
    for (let i=0; i < 8; i++) counter_block[i] = ctr_txt.charCodeAt(i);

    var key_schedule = key_expansion(key);

    let number_of_blocks = Math.ceil((ciphertext.length-8) / this.block_size);
    let ct = new Array(number_of_blocks);

    for (let b = 0; b < number_of_blocks; b++) ct[b] = ciphertext.slice(8 + b * this.block_size, 8 + b * this.block_size + this.block_size);
    ciphertext = ct;

    var plaintxt = new Array(ciphertext.length);

    for (let b = 0; b < number_of_blocks; b++) {
      for (let c = 0; c < 4; c++) counter_block[15 - c] = (b >>> c*8) & 0xff;
      for (let c = 0; c < 4; c++) counter_block[15 - c -4] = (((b + 1) / 0x100000000 - 1) >>> c * 8) & 0xff;

      console.log(`\n[DECRYPTING] Processing block ${b}`);
      let cipher_cntr = new AES(counter_block, key_schedule).cipher();
      let plaintxt_byte = new Array(ciphertext[b].length);

      for (let i = 0; i < ciphertext[b].length; i++) {
          plaintxt_byte[i] = cipher_cntr[i] ^ ciphertext[b].charCodeAt(i);
          plaintxt_byte[i] = String.fromCharCode(plaintxt_byte[i]);
      }

      plaintxt[b] = plaintxt_byte.join('');
    }

    //return plaintxt.join('').utf8Decode();
    return plaintxt.join('');
  }
}

module.exports.AES = CTR;
