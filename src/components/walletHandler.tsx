import React, { useState } from "react";
import { Connection, PublicKey, SystemProgram, LAMPORTS_PER_SOL, Transaction, TransactionSignature } from "@solana/web3.js";
import { TextButton } from "./textButton";

export default function WalletHandler() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [tipAmount, setTipAmount] = useState<string>("0.001");

  const transactionConfig: TransactionConfig = {
    recipientAddress: "E8kuexmdYrtSh1WNw2nLsgh4uKzvf31vAp4waL6TcBP6",
    amountToSend: parseFloat(tipAmount),
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

  const disconnect = async (): Promise<void> => {
    if (window.solana) {
      try {
        await window.solana.disconnect();
        setWalletAddress(null);
        setWalletConnected(false);
        setConnectError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        setConnectError(errorMessage);
        console.error(err);
      }
    }
  };

  const handleTip = async (): Promise<void> => {
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
        setShowModal(false);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error("Error sending transaction:", errorMessage);
      }
    } else {
      console.log("Wallet not connected");
    }
  };

  return (
    <>
      <div className="fixed bg-white p-3 rounded-lg shadow-md z-[5000] top-0 right-0">
        {!walletConnected ? (
          <TextButton 
            onClick={connect} 
            className="mr-2"
            type="button"
          >
            Connect
          </TextButton>
        ) : (
          <>
            <TextButton 
              onClick={disconnect}
              className="mr-2"
              type="button"
            >
              Disconnect
            </TextButton>
            <TextButton
              onClick={() => setShowModal(true)}
              type="button"
            >
              Tip
            </TextButton>
          </>
        )}
        {connectError && <p className="text-red-600 mt-2">{connectError}</p>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8">
            <h3 className="text-lg font-semibold mb-4 text-black">Enter Tip Amount</h3>
            <input
              type="number"
              value={tipAmount}
              onChange={(e) => setTipAmount(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded mb-4 text-black"
              step="0.0000001"
              min="0"
            />
            <div className="flex justify-evenly">
              <TextButton
                onClick={handleTip}
              >
                Confirm
              </TextButton>
              <TextButton
                onClick={() => setShowModal(false)}
              >
                Cancel
              </TextButton>
            </div>
          </div>
        </div>
      )}
    </>
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