// Move o cursor - Imprime uma escape sequence especial para o standard output 
const moveTo = (x, y) => {
    process.stdout.write(`\x1b[${y};${x}H`);
    // O escape code `\x1b[${y};${x}H` move o cursor no terminal
}

const createScreenDevice = () => {
    return {
        getUint16: () => 0,
        getUint8: () => 0,
        setUint16: (address, data) => {
            const characterValue = data & 0x00ff;

            // Transforma o address num par de coordenadas 2D para conseguirmos mostrar elementos nas posicoes corretas da grelha
            const x = (address % 16) + 1; // Adicionar uma unidade as coordenadas, visto que o sistema de coordenadas do terminal comeca em 1
            const y = Math.floor(address / 16) + 1;
            moveTo(x * 2, y); // Move o cursor para a posicao definida | Multipliquei o x por 2 porque a altura das linhas do terminal sao 2 vezes maiores do que os proprios caracteres
            const character = String.fromCharCode(characterValue); 
            process.stdout.write(character);
        }
    }
};

module.exports = createScreenDevice;