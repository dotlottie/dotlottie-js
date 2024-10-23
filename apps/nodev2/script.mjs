/**
 * Copyright 2023 Design Barn Inc.
 */

import fs from 'fs';

import { DotLottie } from '@dotlottie/dotlottie-js';

function readZip(arrayBuffer) {
  const LFH_SIGNATURE = 0x04034b50; // Local File Header signature in little-endian
  const dataView = new DataView(arrayBuffer);
  let offset = 0;
  let filenames = [];

  while (offset < arrayBuffer.byteLength) {
    // Read the Local File Header signature (4 bytes, little-endian)
    const signature = dataView.getUint32(offset, true);

    // If we don't find the LFH signature, stop processing
    if (signature !== LFH_SIGNATURE) {
      console.log('No more LFH found or invalid ZIP file structure.');
      break;
    }

    offset += 4; // Move past the signature

    // Read Version Needed to Extract (2 bytes, little-endian)
    const versionNeeded = dataView.getUint16(offset, true);
    console.log('versionNeeded', versionNeeded);
    offset += 2;

    // Read General Purpose Bit Flag (2 bytes, little-endian)
    const generalPurposeBitFlag = dataView.getUint16(offset, true);
    console.log('generalPurposeBitFlag', generalPurposeBitFlag);
    offset += 2;

    // Read Compression Method (2 bytes, little-endian)
    const compressionMethod = dataView.getUint16(offset, true);
    console.log('compressionMethod', compressionMethod);
    offset += 2;

    // Read Last Mod File Time (2 bytes, little-endian)
    const lastModTime = dataView.getUint16(offset, true);
    console.log('lastModTime', lastModTime);
    offset += 2;

    // Read Last Mod File Date (2 bytes, little-endian)
    const lastModDate = dataView.getUint16(offset, true);
    console.log('lastModDate', lastModDate);
    offset += 2;

    // Read CRC-32 (4 bytes, little-endian)
    const crc32 = dataView.getUint32(offset, true);
    console.log('crc32', crc32);
    offset += 4;

    // Read Compressed Size (4 bytes, little-endian)
    const compressedSize = dataView.getUint32(offset, true);
    console.log('compressedSize', compressedSize);
    offset += 4;

    // Read Uncompressed Size (4 bytes, little-endian)
    const uncompressedSize = dataView.getUint32(offset, true);
    console.log('uncompressedSize', uncompressedSize);
    offset += 4;

    // Read File Name Length (2 bytes, little-endian)
    const fileNameLength = dataView.getUint16(offset, true);
    console.log('fileNameLength', fileNameLength);
    offset += 2;

    // Read Extra Field Length (2 bytes, little-endian)
    const extraFieldLength = dataView.getUint16(offset, true);
    console.log('extraFieldLength', extraFieldLength);
    offset += 2;

    // Now 'offset' points to the start of the filename
    // Extract the filename
    const filenameBytes = new Uint8Array(arrayBuffer, offset, fileNameLength);
    const filename = new TextDecoder('utf-8').decode(filenameBytes);

    console.log('filename', filename);

    // Move the offset past the filename and the extra field
    offset += fileNameLength + extraFieldLength;

    // Skip the file data (compressedSize bytes) to move to the next LFH
    offset += compressedSize;

    console.log('--------------------------------');
  }

  return filenames;
}

async function createDotLottieForTests() {
  const dotLottie = new DotLottie();

  await dotLottie
    .addAnimation({
      id: 'animation',
      url: 'https://lottie.host/071a2de9-52ca-4ce4-ba2f-a5befd220bdd/ECzVp4eaMa.json',
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then((value) => {
      readZip(value);

      fs.writeFileSync('testv2.zip', Buffer.from(value));
    });
}

createDotLottieForTests();
