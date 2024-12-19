import React, { useState } from "react";
import { Connection, PublicKey, SystemProgram, LAMPORTS_PER_SOL, Transaction, TransactionSignature } from "@solana/web3.js";

export default function WalletHandler() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  const transactionConfig: TransactionConfig = {
    recipientAddress: "",
    amountToSend: 0.01,
  };

  const connect = async (): Promise<void> => {
    if (window.solana?.isPhantom) {
      try {
        const response: WalletResponse = await window.solana.connect();
        setWalletAddress(response.publicKey.toString());
        setWalletConnected(true);
        console.log(response.publicKey.toString());
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        setConnectError(errorMessage);
        console.error(err);
      }
    } else {
      setConnectError("Solana wallet not found. Please install Phantom or another Solana wallet.");
    }
  };

  const send = async (): Promise<void> => {
    if (walletConnected && window.solana && walletAddress) {
      try {
        const connection = new Connection("https://api.devnet.solana.com");
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: new PublicKey(walletAddress),
            toPubkey: new PublicKey(transactionConfig.recipientAddress),
            lamports: transactionConfig.amountToSend * LAMPORTS_PER_SOL,
          })
        );

        transaction.feePayer = new PublicKey(walletAddress);

        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;

        const signedTransaction = await window.solana.signTransaction(transaction);
        const signature: TransactionSignature = await connection.sendRawTransaction(signedTransaction.serialize());
        console.log("Transaction signature", signature);

        await connection.confirmTransaction(signature);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error("Error sending transaction:", errorMessage);
      }
    } else {
      console.log("Wallet not connected");
    }
  };

  return (
    <div className="space-x-4 z-50">
      <button onClick={connect} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors" type="button">
        Connect
      </button>
      <button
        onClick={send}
        disabled={!walletConnected}
        className={`px-4 py-2 rounded transition-colors ${walletConnected ? "bg-green-500 text-white hover:bg-green-600" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
        type="button"
      >
        Send
      </button>
      {connectError && <p className="mt-2 text-red-500">{connectError}</p>}
    </div>
  );
};

interface PhantomWindow extends Window {
  solana?: {
    isPhantom?: boolean;
    connect(): Promise<{ publicKey: PublicKey }>;
    disconnect(): Promise<void>;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
    request(params: any): Promise<any>;
  };
}

declare const window: PhantomWindow;

interface WalletResponse {
  publicKey: PublicKey;
}

interface TransactionConfig {
  recipientAddress: string;
  amountToSend: number;
}