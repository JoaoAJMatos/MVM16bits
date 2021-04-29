/*// Cria um mapa da memoria

// LINKS relevantes:

// https://en.wikipedia.org/wiki/Memory-mapped_I/O
// https://en.wikipedia.org/wiki/Address_space

// (Vai reservar addresses da memoria para determinados elementos. Por ex.: elementos de output)

class MemoryMapper {
    constructor() {
        this.regions = [] // Cria um array onde vao estar mapeadas as regioes da memoria
    }

    // Mapeia regioes para a memoria
    map(device, start, end, remap = true) {
        const region = {
            device,
            start,
            end,
            remap
        };
        this.regions.unshift(region); // Utilizei o unshift() ao inves do push() para quando procurar uma regiao no array encontrar as regioes que foram adicionadas mais recentemente
        
        // Retorna uma funcao, que quando chamada, vai remover o objeto da regiao do Array das regioes (Dando unmap desse objeto no espaco de addresses)
        return () => {
            this.regions = this.regions.filter(x => x !== region);
        };
    }

    // Encontra uma regiao da memoria
    findRegion(address) {
        // Procurar em cada regiao por meio do Array.find(), onde o address esta entre o inicio e o fim da regiao
        let region = this.regions.find(r => address >= r.start && address <= r.end);
        // Se nao encontrarmos uma regiao, retornamos um erro
        if (!region) {
            throw new Error(`Nenhuma regiao de memoria encontrada para o address ${address}`);
        }
        return region;
    }

    getUint16(address) {
        const region = this.findRegion(address);
        const finalAddress = region.remap ? address - region.start : address;

        return region.device.getUint16(finalAddress);
    }

    getUint8(address) {
        const region = this.findRegion(address);
        const finalAddress = region.remap ? address - region.start : address;

        return region.device.getUint8(finalAddress);
    }

    setUint16(address) {
        const region = this.findRegion(address);
        const finalAddress = region.remap ? address - region.start : address;
        
        return region.device.setUint16(finalAddress);
    }

    setUint8(address) {
        const region = this.findRegion(address);
        const finalAddress = region.remap ? address - region.start : address;
        
        return region.device.setUint8(finalAddress);
    }
}

module.exports = MemoryMapper; */

class MemoryMapper {
    constructor() {
      this.regions = [];
    }
  
    map(device, start, end, remap = true) {
      const region = {
        device,
        start,
        end,
        remap
      };
      this.regions.unshift(region);
  
      return () => {
        this.regions = this.regions.filter(x => x !== region);
      };
    }
  
    findRegion(address) {
      let region = this.regions.find(r => address >= r.start && address <= r.end);
      if (!region) {
        throw new Error(`No memory region found for address ${address}`);
      }
      return region;
    }
  
    getUint16(address) {
      const region = this.findRegion(address);
      const finalAddress = region.remap
        ? address - region.start
        : address;
      return region.device.getUint16(finalAddress);
    }
  
    getUint8(address) {
      const region = this.findRegion(address);
      const finalAddress = region.remap
        ? address - region.start
        : address;
      return region.device.getUint8(finalAddress);
    }
  
    setUint16(address, value) {
      const region = this.findRegion(address);
      const finalAddress = region.remap
        ? address - region.start
        : address;
      return region.device.setUint16(finalAddress, value);
    }
  
    setUint8(address, value) {
      const region = this.findRegion(address);
      const finalAddress = region.remap
        ? address - region.start
        : address;
      return region.device.setUint8(finalAddress, value);
    }
  }
  
  module.exports = MemoryMapper;