import React, { useState } from "react";
import { Connection, PublicKey, SystemProgram, LAMPORTS_PER_SOL, Transaction, TransactionSignature } from "@solana/web3.js";
import { TextButton } from "./textButton";
import { IconButton } from "./iconButton";
import { useTipStore } from "@/stores/tipStore";

export default function WalletHandler() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [tipAmount, setTipAmount] = useState<string>("0.001");
  const [transactionStatus, setTransactionStatus] = useState<string | React.ReactNode>("");
  const [isTransacting, setIsTransacting] = useState<boolean>(false);

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
        setIsTransacting(true);
        setTransactionStatus("Initiating transaction...");
        
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

        setTransactionStatus("Please confirm the transaction in your wallet...");
        const signedTransaction = await window.solana.signTransaction(transaction);
        
        setTransactionStatus("Sending transaction...");
        const signature: TransactionSignature = await connection.sendRawTransaction(signedTransaction.serialize());
        
        const explorerLink = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
        
        handleCloseModal();
        
        setTransactionStatus(
          <span>
            Transaction sent! <a href={explorerLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View in Explorer</a>
          </span>
        );
        
        await connection.confirmTransaction(signature);
        
        setTransactionStatus(
          <span>
            Transaction successful! <a href={explorerLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View in Explorer</a>
          </span>
        );

        // Update tip store after successful transaction
        useTipStore.getState().setLastTipAmount(transactionConfig.amountToSend);
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        setTransactionStatus(`Error: ${errorMessage}`);
        console.error("Error sending transaction:", errorMessage);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setTransactionStatus("");
    setIsTransacting(false);
  };

  return (
    <>
      <div className="absolute z-10 m-24 right-0">
        <div className="grid grid-flow-col gap-[8px]">
          {!walletConnected ? (
            <TextButton onClick={connect}>Connect</TextButton>
          ) : (
            <>
              <TextButton onClick={() => setShowModal(true)}>Tip</TextButton>
              <TextButton onClick={disconnect}>Disconnect</TextButton>
            </>
          )}
        </div>
        {connectError && (
          <div className="mt-2 px-16 py-8 bg-white rounded-8">
            <div className="typography-16 font-bold text-secondary">{connectError}</div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="absolute z-40 w-full h-full bg-black/30 backdrop-blur flex items-center justify-center font-M_PLUS_2">
          <div className="mx-auto max-w-sm p-24 bg-white rounded-16">
            <div className="my-16 typography-20 font-bold">Enter Tip Amount</div>
            <input
              type="number"
              value={tipAmount}
              onChange={(e) => setTipAmount(e.target.value)}
              className="px-16 py-8 w-full bg-surface1 hover:bg-surface1-hover rounded-8 text-text-primary typography-16 font-bold border-2 border-black"
              step="0.0000001"
              min="0"
              disabled={isTransacting}
            />
            {transactionStatus && (
              <div className={`mt-16 typography-16 text-center ${
                typeof transactionStatus === 'string' && transactionStatus.includes("Error")
                  ? "text-red-500"
                  : "text-blue-500"
              }`}>
                {transactionStatus}
              </div>
            )}
            <div className="mt-24 grid grid-flow-col gap-[8px]">
              <TextButton onClick={handleTip} disabled={isTransacting}>
                {isTransacting ? "Processing..." : "Confirm"}
              </TextButton>
              <TextButton onClick={handleCloseModal}>
                {isTransacting ? "Close" : "Cancel"}
              </TextButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

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
