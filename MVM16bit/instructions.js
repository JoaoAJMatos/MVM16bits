// Instrucoes de Move 
const MOV_LIT_REG  = 0x10; // Move um valor literal para a register
const MOV_REG_REG  = 0x11; // Move a valor de uma register para outra
const MOV_REG_MEM  = 0x12; // Move o valor da register para a memoria
const MOV_MEM_REG  = 0x13; // Move da memoria para uma register

// Instrucoes aritmeticas
const ADD_REG_REG  = 0x14; // Adiciona duas registers

// Instrucoes de Jump
const JMP_NOT_EQ   = 0x15; // Compara um valor literal a register do acumulador (ACC) e salta para o address especificado se os valores nao forem iguais

// Instrucoes de manipulacao do Stack
const PSH_LIT      = 0x17; // Dar push a um valor literal para o stack
const PSH_REG      = 0x18; // Dar push ao conteudo de uma register para o stack
const POP          = 0x1A; // Remove um item do stack

// Instrucoes de subrotinas
const CAL_LIT      = 0x5E; // Chama uma subrotina ao usar o valor literal do address onde essa subrotina comeca
const CAL_REG      = 0x5F; // Chama uma subrotina ao usar o valor de um address guardado numa register para se referir ao address do comeco da subrotina
const RET          = 0x60; // Sai da subrotina e retorna o valor para a register do acumulador

// HALT do processador
const HLT          = 0xFF; // Envia uma ordem de HALT para o CPU e faz com que a computacao atual seja interrompida

module.exports = {
  MOV_LIT_REG,
  MOV_REG_REG,
  MOV_REG_MEM,
  MOV_MEM_REG,
  ADD_REG_REG,
  JMP_NOT_EQ,
  PSH_LIT,
  PSH_REG,
  POP,
  CAL_LIT,
  CAL_REG,
  RET,
  HLT,
};