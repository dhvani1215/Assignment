import React, { useState, useEffect } from 'react';
import { Blockchain, Block, Transaction } from './types/blockchain';
import { ArrowRight, Shield, ShieldAlert, Plus, Minimize as Mining } from 'lucide-react';

function App() {
  const [blockchain] = useState(new Blockchain());
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isValid, setIsValid] = useState(true);
  const [sender, setSender] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isMining, setIsMining] = useState(false);

  useEffect(() => {
    updateBlockchain();
  }, []);

  const updateBlockchain = () => {
    setBlocks(blockchain.getChain());
    setIsValid(blockchain.isChainValid());
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (sender && recipient && amount) {
      blockchain.addTransaction(sender, recipient, parseFloat(amount));
      setSender('');
      setRecipient('');
      setAmount('');
      updateBlockchain();
    }
  };

  const handleMineBlock = async () => {
    setIsMining(true);
    // Simulate mining delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    blockchain.minePendingTransactions();
    setIsMining(false);
    updateBlockchain();
  };

  const handleTamper = () => {
    if (blocks.length > 1) {
      blockchain.tamperWithBlock(1, { amount: 999999 });
      updateBlockchain();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Blockchain Simulator</h1>
          <div className="flex items-center justify-center gap-2">
            {isValid ? (
              <Shield className="text-green-500" />
            ) : (
              <ShieldAlert className="text-red-500" />
            )}
            <p className={`text-lg ${isValid ? 'text-green-600' : 'text-red-600'}`}>
              Chain is {isValid ? 'valid' : 'invalid'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Add Transaction</h2>
          <form onSubmit={handleAddTransaction} className="flex gap-4 flex-wrap">
            <input
              type="text"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              placeholder="Sender"
              className="flex-1 min-w-[200px] p-2 border rounded"
            />
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Recipient"
              className="flex-1 min-w-[200px] p-2 border rounded"
            />
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              className="flex-1 min-w-[200px] p-2 border rounded"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
            >
              <Plus size={20} /> Add
            </button>
          </form>
        </div>

        <div className="flex gap-4 mb-8">
          <button
            onClick={handleMineBlock}
            disabled={isMining}
            className={`${
              isMining ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'
            } text-white px-6 py-2 rounded flex items-center gap-2`}
          >
            <Mining className={isMining ? 'animate-spin' : ''} />
            {isMining ? 'Mining...' : 'Mine Block'}
          </button>
          <button
            onClick={handleTamper}
            className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
          >
            Simulate Tampering
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {blocks.map((block, index) => (
            <div key={block.hash} className="relative">
              {index > 0 && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <ArrowRight className="transform rotate-90 text-gray-400" />
                </div>
              )}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold">Block #{block.index}</h3>
                    <p className="text-sm text-gray-600">
                      Timestamp: {new Date(block.timestamp).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Nonce: {block.nonce}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 break-all">
                      Hash: {block.hash}
                    </p>
                    <p className="text-sm text-gray-600 break-all">
                      Previous Hash: {block.previousHash}
                    </p>
                  </div>
                </div>
                {block.transactions.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Transactions</h4>
                    <div className="space-y-2">
                      {block.transactions.map((tx, i) => (
                        <div
                          key={i}
                          className="text-sm bg-gray-50 p-2 rounded"
                        >
                          {tx.sender} → {tx.recipient}: {tx.amount} coins
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;