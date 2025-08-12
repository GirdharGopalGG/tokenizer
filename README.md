# Tokenizer

This project implements a simple CLI where users can input sentences and see how they get tokenized.

<b> Special Tokens</b>: Handles `<UNK>` `<START>` and `<END>` tokens
<br><b>Vocabulary Learning:</b> Automatically builds vocabulary from training data<br><b>
Token Details:</b> Shows both token strings and their corresponding IDs

## Installation

### Clone this repository

- `git clone https://github.com/GirdharGopalGG/tokenizer.git`

- `cd tokenizer`

## Usage

### Run the tokenizer: `node index.js`

The program will:
- Train the tokenizer on built-in training data
- Launch an interactive CLI
- Wait for your input to tokenize sentences

CLI Commands:
- Enter any sentence to see its tokenization
- Type quit to exit the program

## Example
![demo](demo.png)
