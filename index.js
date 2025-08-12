const readline = require('readline');

class SimpleTokenizer {
    constructor() {
        this.vocab = {
            '<UNK>': 0,
            '<START>': 1,
            '<END>': 2
        };
        this.reverseVocab = { 0: '<UNK>', 1: '<START>', 2: '<END>' };
        this.nextTokenId = 3;
        this.merges = new Map();
    }

    train(texts) {
        console.log('Training tokenizer...');
        
        // Get all characters
        const chars = new Set();
        const words = new Map();
        
        texts.forEach(text => {
            const tokens = text.toLowerCase().match(/\w+/g) || [];
            tokens.forEach(word => {
                const wordWithEnd = Array.from(word).join(' ') + ' </w>';
                words.set(wordWithEnd, (words.get(wordWithEnd) || 0) + 1);
                Array.from(word).forEach(char => chars.add(char));
            });
        });

        // Add characters to vocab
        chars.forEach(char => {
            this.vocab[char] = this.nextTokenId;
            this.reverseVocab[this.nextTokenId] = char;
            this.nextTokenId++;
        });

        // Add end marker
        this.vocab['</w>'] = this.nextTokenId;
        this.reverseVocab[this.nextTokenId] = '</w>';
        this.nextTokenId++;

        for (let i = 0; i < 200; i++) {
            const pairs = new Map();
            
            words.forEach((freq, word) => {
                const symbols = word.split(' ');
                for (let j = 0; j < symbols.length - 1; j++) {
                    const pair = `${symbols[j]} ${symbols[j + 1]}`;
                    pairs.set(pair, (pairs.get(pair) || 0) + freq);
                }
            });

            if (pairs.size === 0) break;

            let bestPair = '';
            let maxCount = 0;
            pairs.forEach((count, pair) => {
                if (count > maxCount) {
                    maxCount = count;
                    bestPair = pair;
                }
            });

            if (maxCount < 2) break;

            const [first, second] = bestPair.split(' ');
            const merged = first + second;
            
            this.vocab[merged] = this.nextTokenId;
            this.reverseVocab[this.nextTokenId] = merged;
            this.merges.set(bestPair, merged);
            this.nextTokenId++;

            // Update words
            const newWords = new Map();
            words.forEach((freq, word) => {
                const newWord = word.replace(new RegExp(`${first} ${second}`, 'g'), merged);
                newWords.set(newWord, freq);
            });
            words.clear();
            newWords.forEach((freq, word) => words.set(word, freq));
        }
        console.log('Training complete!');
    }

    encode(text) {
        const words = text.toLowerCase().match(/\w+/g) || [];
        const tokens = [this.vocab['<START>']];
        
        words.forEach(word => {
            let symbols = Array.from(word).concat(['</w>']);
            
            // Apply merges
            this.merges.forEach((merged, pair) => {
                const [first, second] = pair.split(' ');
                let i = 0;
                while (i < symbols.length - 1) {
                    if (symbols[i] === first && symbols[i + 1] === second) {
                        symbols.splice(i, 2, merged);
                    } else {
                        i++;
                    }
                }
            });

            symbols.forEach(symbol => {
                const tokenId = this.vocab[symbol] || this.vocab['<UNK>'];
                tokens.push(tokenId);
            });
        });
        
        tokens.push(this.vocab['<END>']);
        return tokens;
    }

    getTokenDetails(text) {
        const tokens = this.encode(text);
        const details = tokens.map(id => ({
            id: id,
            token: this.reverseVocab[id]
        }));
        return details;
    }
}

const trainingTexts = [
    "the quick brown fox jumps over the lazy dog",
    "cat chases dog dog chases cat",
    "natural language processing is fascinating",
    "machine learning requires training data",
    "tokenization breaks text into tokens",
    "javascript is a programming language",
    "language models need vocabularies"
];

const tokenizer = new SimpleTokenizer();
tokenizer.train(trainingTexts);

// CLI Interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('\n Simple Tokenizer CLI ');
console.log('Enter a sentence to tokenize (or "quit" to exit):');

function promptUser() {
    rl.question('\n> ', (input) => {
        if (input.toLowerCase() === 'quit') {
            console.log('Bye');
            rl.close();
            return;
        }

        if (input.trim() === '') {
            console.log('Please enter a sentence.');
            promptUser();
            return;
        }

        const tokenDetails = tokenizer.getTokenDetails(input);
        
        console.log(`\nInput: "${input}"`);
        console.log('Tokens:');
        tokenDetails.forEach((detail, index) => {
            console.log(`  ${index + 1}. "${detail.token}" (ID: ${detail.id})`);
        });
        
        const tokenIds = tokenDetails.map(d => d.id);
        console.log(`Token IDs: [${tokenIds.join(', ')}]`);
        
        promptUser();
    });
}

promptUser();
