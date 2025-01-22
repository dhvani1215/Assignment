import crypto from 'crypto';

export interface Transaction {
  sender: string;
  recipient: string;
  amount: number;
  timestamp: number;
}

export interface Block {
  index: number;
  timestamp: number;
  transactions: Transaction[];
  previousHash: string;
  hash: string;
  nonce: number;
}

export class Blockchain {
  private chain: Block[];
  private difficulty: number;
  private pendingTransactions: Transaction[];

  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 3; // Number of leading zeros required in hash
    this.pendingTransactions = [];
  }

  private createGenesisBlock(): Block {
    return {
      index: 0,
      timestamp: Date.now(),
      transactions: [],
      previousHash: '0',
      hash: '0',
      nonce: 0
    };
  }

  private calculateHash(block: Omit<Block, 'hash'>): string {
    return crypto
      .createHash('sha256')
      .update(
        block.index +
          block.timestamp +
          JSON.stringify(block.transactions) +
          block.previousHash +
          block.nonce
      )
      .digest('hex');
  }

  private mineBlock(block: Omit<Block, 'hash'>): Block {
    let nonce = 0;
    let hash = '';
    
    while (true) {
      hash = this.calculateHash({ ...block, nonce });
      if (hash.substring(0, this.difficulty) === '0'.repeat(this.difficulty)) {
        break;
      }
      nonce++;
    }

    return {
      ...block,
      nonce,
      hash
    };
  }

  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  addTransaction(sender: string, recipient: string, amount: number): void {
    this.pendingTransactions.push({
      sender,
      recipient,
      amount,
      timestamp: Date.now()
    });
  }

  minePendingTransactions(): void {
    const block: Omit<Block, 'hash'> = {
      index: this.chain.length,
      timestamp: Date.now(),
      transactions: [...this.pendingTransactions],
      previousHash: this.getLatestBlock().hash,
      nonce: 0
    };

    const newBlock = this.mineBlock(block);
    this.chain.push(newBlock);
    this.pendingTransactions = [];
  }

  isChainValid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Verify current block's hash
      const blockWithoutHash: Omit<Block, 'hash'> = {
        index: currentBlock.index,
        timestamp: currentBlock.timestamp,
        transactions: currentBlock.transactions,
        previousHash: currentBlock.previousHash,
        nonce: currentBlock.nonce
      };
      
      if (currentBlock.hash !== this.calculateHash(blockWithoutHash)) {
        return false;
      }

      // Verify link to previous block
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  getChain(): Block[] {
    return this.chain;
  }

  // Method to simulate tampering
  tamperWithBlock(index: number, newData: Partial<Transaction>): void {
    if (index > 0 && index < this.chain.length) {
      const block = this.chain[index];
      if (block.transactions.length > 0) {
        block.transactions[0] = { ...block.transactions[0], ...newData };
      }
    }
  }
}