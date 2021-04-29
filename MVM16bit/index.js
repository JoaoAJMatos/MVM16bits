const readline = require('readline');
const createMemory = require('./create-memory');
const CPU = require('./cpu');
const instructions = require('./instructions');
const MemoryMapper = require('./memory-mapper');
const createScreenDevice = require('./screen-device');

const IP = 0; // Pointer da instrucao 
const ACC = 1; // Acumulador
const R1 = 2; // Register 1
const R2 = 3; // Register 2 
const R3 = 4; // Register 3
const R4 = 5; // Register 4 
const R5 = 6; // Register 5 
const R6 = 7; // Register 6 
const R7 = 8; // Register 7 
const R8 = 9; // Register 8 
const SP = 10; // Stack Pointer
const FP = 11; // Frame Pointer

const MM = new MemoryMapper(); // Cria uma nova instancia da class Memory Mapper

const memory = createMemory(256 * 256);
MM.map(memory, 0, 0xffff);

// Mapear 0xFF bytes do espaco de addresses para um "dispositivo de output"
MM.map(createScreenDevice(), 0x3000, 0x30ff, true);

const writableBytes = new Uint8Array(memory.buffer);

const cpu = new CPU(MM);
let i = 0;

    writableBytes[i++] = instructions.MOV_LIT_REG;
    writableBytes[i++] = 0x00;
    writableBytes[i++] = 'H'.charCodeAt(0);
    writableBytes[i++] = R1;

    writableBytes[i++] = instructions.MOV_REG_MEM;
    writableBytes[i++] = R1;
    writableBytes[i++] = 0x30;
    writableBytes[i++] = 0x00;

    writableBytes[i++] = instructions.MOV_LIT_REG;
    writableBytes[i++] = 0x00;
    writableBytes[i++] = 'E'.charCodeAt(0);
    writableBytes[i++] = R1;

    writableBytes[i++] = instructions.MOV_REG_MEM;
    writableBytes[i++] = R1;
    writableBytes[i++] = 0x30;
    writableBytes[i++] = 0x01;

/*"Hello World!".split('').forEach((char, index) => {
    writeCharToScreen(char, index);
});*/

writableBytes[i++] = instructions.HLT;

cpu.run();