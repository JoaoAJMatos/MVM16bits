const createMemory = require('./create-memory');
const instructions = require('./instructions');

class CPU {
  constructor(memory) {
    this.memory = memory;

    this.registerNames = [
      'ip', 'acc', // IP = Instruction Pointer | ACC = acumulador
      // Registers multi-proposito
      'r1', 'r2', 'r3', 'r4',
      'r5', 'r6', 'r7', 'r8',
      // Registers do stack
      'sp', 'fp' // SP = Stack Pointer | FP = Frame Pointer
    ];

    this.registers = createMemory(this.registerNames.length * 2);

    this.registerMap = this.registerNames.reduce((map, name, i) => {
      map[name] = i * 2;
      return map;
    }, {});

    // Definir hardcoded addresses para os ponteiros do stack
    this.setRegister('sp', 0xffff - 1); 
    this.setRegister('fp', 0xffff - 1); 
    
    this.stackFrameSize = 0;
  }

  // Faz um log do conteudo das registers 
  debug() {
    this.registerNames.forEach(name => {
      console.log(`${name}: 0x${this.getRegister(name).toString(16).padStart(4, '0')}`);
    });
    console.log();
  }

  // Faz um log do conteudo da memoria em determinado address
  viewMemoryAt(address, n = 8) { // n simboliza o numero de bytes que vemos da memoria
    /* 
                              EXEMPLO DO LOG DA FUNCAO

          $ 0x0f01: 0x04 0x05 0xA3 0xFE 0x13 0x0D 0x44 0x0F ...
          
          0x0f01:        0x04   0x05   0xA3   0xFE   0x13   0x0D   0x44   0x0F ...
            ||                                   ||
          Address          Byte no Address + os 7 Bytes que vierem a seguir
    */

    // Criar um array com os 8 bytes que ocorrem naquele address
    const nextNBytes = Array.from({length: n}, (_, i) =>
      this.memory.getUint8(address + i) // Vai buscar o byte
    ).map(v => `0x${v.toString(16).padStart(2, '0')}`);

    console.log(`0x${address.toString(16).padStart(4, '0')}: ${nextNBytes.join(' ')}`); // Dar um log do mapa de bytes naquele address
  }

  // Retorna o valor contido numa register - retorna um erro se a register nao existir
  getRegister(name) {
    if (!(name in this.registerMap)) {
      throw new Error(`getRegister: A register '${name}' nao existe`);
    }
    return this.registers.getUint16(this.registerMap[name]);
  }

  // Coloca um valor numa register - retorna um erro se a register nao existir
  setRegister(name, value) {
    if (!(name in this.registerMap)) {
      throw new Error(`setRegister: A register '${name}' nao existe`);
    }
    return this.registers.setUint16(this.registerMap[name], value);
  }

  // Um fetch de 8 bits na memoria
  fetch() {
    const nextInstructionAddress = this.getRegister('ip');
    const instruction = this.memory.getUint8(nextInstructionAddress);
    this.setRegister('ip', nextInstructionAddress + 1);
    return instruction;
  }

  // Um fetch de 16 bits
  fetch16() {
    const nextInstructionAddress = this.getRegister('ip');
    const instruction = this.memory.getUint16(nextInstructionAddress);
    this.setRegister('ip', nextInstructionAddress + 2);
    return instruction;
  }

  // Da push a valores para dentro do Stack
  push(value) { // Recebe um valor e trata das partes "mecanicas" do stack
    const spAddress = this.getRegister('sp'); // Ir buscar o address atual do Stack Pointer 
    this.memory.setUint16(spAddress, value); // Colocar o valor a dar push no address especificado pelo SP 
    this.setRegister('sp', spAddress - 2); // Atualizar o Stack Pointer
    this.stackFrameSize += 2; // Incrementar a variavel do tamanho do stack
  }

  // Retira um elemento especificado do stack
  pop() {
    // Como o Stack Pointer e decrementado depois de um valor ser adicionado
    // precisamos de incrementar o Stack Pointer
    const nextSpAddress = this.getRegister('sp') + 2; // Guardar o proximo address numa constante
    this.setRegister('sp', nextSpAddress); // Atualizar o address do Stack Pointer
    this.stackFrameSize -= 2; // Decrementar a variavel do tamanho do stack
    return this.memory.getUint16(nextSpAddress); // Vai buscar o valor para o qual o SP passou a apontar
  }

  // Guarda o estado atual do CPU no Stack
  pushState() {
    // Colocar todas as registers no stack
    this.push(this.getRegister('r1'));
    this.push(this.getRegister('r2'));
    this.push(this.getRegister('r3'));
    this.push(this.getRegister('r4'));
    this.push(this.getRegister('r5'));
    this.push(this.getRegister('r6'));
    this.push(this.getRegister('r7'));
    this.push(this.getRegister('r8'));
    this.push(this.getRegister('ip')); // O IP funciona como o address de retorno da subrotina
    // ============================= //
    this.push(this.stackFrameSize + 2); // Adicionar o tamanho do stack ao stack | (O "+2" serve para tomar em concideracao o espaco que ocupamos a guardar esta informacao)
    
    // Mover o frame pointer para onde o stack esta a apontar
    this.setRegister('fp', this.getRegister('sp'));
    this.stackFrameSize = 0; // Colocar o valor do tamanho do stack de volta para 0, para que a nova stack frame possa ser rastreada da mesma forma
  }

  // Devolve o estado do CPU guardado no Stack para retornar da subrotina
  popState() {
    const framePointerAddress = this.getRegister('fp'); // Vai buscar o Address dentro do frame pointer
    this.setRegister('sp', framePointerAddress); // Atualizamos o Stack Pointer

    this.stackFrameSize = this.pop(); // Retorna o tamanho da stac frame antiga
    const stackFrameSize = this.stackFrameSize;

    // Damos pop as registers do stack - comecando pelo IP
    this.setRegister('ip', this.pop());
    this.setRegister('r8', this.pop());
    this.setRegister('r7', this.pop());
    this.setRegister('r6', this.pop());
    this.setRegister('r5', this.pop());
    this.setRegister('r4', this.pop());
    this.setRegister('r3', this.pop());
    this.setRegister('r2', this.pop());
    this.setRegister('r1', this.pop());

    const nArgs = this.pop();
    // Chamamos o "pop()" consoante o numero de argumentos que asubrotina leva, 
    // isto faz com que o SP se posicione no address em que estava antes de passarmos qualquer argumento
    for (let i = 0; i < nArgs; i++) {
      this.pop();
    }

    // Atualizar o frame pointer para o inicio da frame
    this.setRegister('fp', framePointerAddress + stackFrameSize);
  }

  // Vai encontrar o indice da register
  fetchRegisterIndex() {
    return (this.fetch() % this.registerNames.length) * 2;
  }

  execute(instruction) {
    switch (instruction) {
      // Move um valor literal para uma register
      case instructions.MOV_LIT_REG: {
        const literal = this.fetch16(); // Vai buscar o valor literal
        const register = this.fetchRegisterIndex(); // Encontra a register de destino
        this.registers.setUint16(register, literal); // Guarda o valor literal na register de destino
        return;
      }

      // Move register para outra register
      case instructions.MOV_REG_REG: {
        const registerFrom = this.fetchRegisterIndex(); // Register da origem do valor
        const registerTo = this.fetchRegisterIndex(); // Register do destino do valor
        const value = this.registers.getUint16(registerFrom); // Guardar o valor 
        this.registers.setUint16(registerTo, value); // Colocar o valor na register
        return;
      }

      // Move de uma register para a memoria
      case instructions.MOV_REG_MEM: {
        const registerFrom = this.fetchRegisterIndex(); // Register da origem do valor
        const address = this.fetch16(); // Vai buscar o address de 16 bits onde queremos guardar o valor
        const value = this.registers.getUint16(registerFrom); // Vai buscar o valor
        this.memory.setUint16(address, value); // Guardar o valor no address correto
        return;
      }
      
      // Move da memoria para uma register
      case instructions.MOV_MEM_REG: {
        const address = this.fetch16(); // Vai buscar o address de 16 bits
        const registerTo = this.fetchRegisterIndex(); // Register onde vai ser guardado o valor
        const value = this.memory.getUint16(address); // Vai buscar o valor naquele address da memoria
        this.registers.setUint16(registerTo, value); // Guarda o valor na register de destino
        return;
      }

      // Adiciona uma regisster a outra 
      case instructions.ADD_REG_REG: {
        //  ======== Vai buscar os valores das registers ======= //
        const r1 = this.fetch(); 
        const r2 = this.fetch();
        const registerValue1 = this.registers.getUint16(r1);
        const registerValue2 = this.registers.getUint16(r2);
        // ===================================================== //
        this.setRegister('acc', registerValue1 + registerValue2); // Guarda o valor do resultado na register do acumulador
        return;
      }

      // Jump se nao for igual (JNE -> Jump if not equal)
      case instructions.JMP_NOT_EQ: {
        const value = this.fetch16(); // Valor que queremos comparar
        const address = this.fetch16(); // Address para o qual queremos saltar se os numeros nao forem iguais

        if (value !== this.getRegister('acc')) { // Compara o valor com a register do acumulador
          this.setRegister('ip', address); // Salta para o address especificado se nao forem iguais
        }

        return; // Retorna sem saltar se forem iguais
      }

      // Push de um valor literal para o Stack
      case instructions.PSH_LIT: {
        const value = this.fetch16(); // Ir buscar o valor de 16 bits
        this.push(value); // Adiciona o valor literal ao stack
        return;
      }

      // Push de um valor guardado numa register para o Stack
      case instructions.PSH_REG: {
        const registerIndex = this.fetchRegisterIndex(); // Vai buscar o indice da register onde esta guardado o valor que vai ser pushed para o Stack
        this.push(this.registers.getUint16(registerIndex)); // Adiciona o valor guardado na register ao stack
        return;
      }

      // Dar POP a um item do stack
      case instructions.POP: {
        const registerIndex = this.fetchRegisterIndex(); // Indice da register onde vai ser guardado o valor que vai ser retirado do Stack
        const value = this.pop(); // Remove o valor especificado do stack
        this.registers.setUint16(registerIndex, value); // Coloca o valor na register especificada
        return;
      }

      // Chama uma subrotina atraves do valor literal do Address
      case instructions.CAL_LIT: {
        const address = this.fetch16(); // Vai buscar o address de 16 bits
        this.pushState(); // Guarda o estado do CPU no Stack
        // Depois de salvarmos o estado do CPU, podemos atualizar o IP para o address do inicio da subrotina
        this.setRegister('ip', address);
        return;
      }

      // Chama uma subrotina atraves do valor do address guardado numa register
      case instructions.CAL_REG: {
        const registerIndex = this.fetchRegisterIndex(); // Vai buscar a register onde se encontra o Address
        const address = this.registers.getUint16(registerIndex); // Vai buscar o address de 16 bits
        this.pushState(); // Guarda o estado do CPU no stack
        this.setRegister('ip', address); // Atualiza o IP
        return;
      }

      // Retornar de subrotina
      case instructions.RET: {
        this.popState(); // Devolve o estado do CPU do stack
        return;
      }

      // Halt no CPU
      case instructions.HLT: {
        return true; // Se uma instrucao de HALT for detetada, retornamos true e o CPU para a computacao
      }
    }
  }

  // Metodo que salta de instrucao em instrucao
  step() {
    const instruction = this.fetch();
    return this.execute(instruction);
  }

  // Correr o programa
  run() {
    // Funciona como uma chamada recursiva que da step() nas instrucoes e usa o valor retornado para saber se deve dar "halt" no CPU ou nao
    const halt = this.step(); 
    if (!halt) {
      setImmediate(() => this.run());
    }
  }
}

module.exports = CPU;