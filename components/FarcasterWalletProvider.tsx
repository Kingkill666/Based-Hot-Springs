"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createConfig, WagmiConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { http } from 'wagmi/transport';
import { farcasterMiniApp as miniAppConnector } from '@farcaster/miniapp-wagmi-connector';
import { useAccount, useConnect } from 'wagmi';

interface FarcasterWalletContextType {
  address: string | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  connect: () => void;
}

const FarcasterWalletContext = createContext<FarcasterWalletContextType>({
  address: null,
  isConnected: false,
  isLoading: true,
  error: null,
  connect: () => {},
});

// Create wagmi config with Farcaster Mini App connector
const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  connectors: [
    miniAppConnector()
  ]
});

export const FarcasterWalletProvider = ({ children }: { children: ReactNode }) => {
  const [error, setError] = useState<string | null>(null);

  return (
    <WagmiConfig config={config}>
      <FarcasterWalletContext.Provider value={{
        address: null,
        isConnected: false,
        isLoading: false,
        error,
        connect: () => {},
      }}>
        {children}
      </FarcasterWalletContext.Provider>
    </WagmiConfig>
  );
};

export const useFarcasterWallet = () => {
  const { isConnected, address } = useAccount();
  const { connect, connectors, isLoading } = useConnect();

  const connectWallet = () => {
    if (connectors.length > 0) {
      connect({ connector: connectors[0] });
    }
  };

  return {
    address: address || null,
    isConnected,
    isLoading,
    error: null,
    connect: connectWallet,
  };
};
