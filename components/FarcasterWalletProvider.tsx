"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createConfig, WagmiConfig } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { http } from 'wagmi/transport';
import { FarcasterConnector } from '@farcaster/frame-wagmi-connector';

interface FarcasterWalletContextType {
  address: string | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

const FarcasterWalletContext = createContext<FarcasterWalletContextType>({
  address: null,
  isConnected: false,
  isLoading: true,
  error: null,
});

// Create wagmi config with Farcaster connector
const config = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
  connectors: [
    new FarcasterConnector({
      chains: [mainnet],
    }),
  ],
});

export const FarcasterWalletProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setIsLoading(true);
        
        // Check if we're in a Farcaster environment
        const isInFarcaster = window.location.href.includes('farcaster') || 
                             window.location.href.includes('warpcast') ||
                             window.location.href.includes('miniapp') ||
                             (window as any).farcaster ||
                             (window as any).farcasterSdk ||
                             (window as any).Warpcast;

        if (!isInFarcaster) {
          console.log('🌐 Not in Farcaster environment');
          setIsLoading(false);
          return;
        }

        console.log('🎮 Farcaster environment detected');

        // The FarcasterConnector will automatically handle the connection
        // We'll check the connection status after a short delay
        setTimeout(() => {
          // Check if wallet is connected
          if ((window as any).ethereum && (window as any).ethereum.selectedAddress) {
            setAddress((window as any).ethereum.selectedAddress);
            setIsConnected(true);
            console.log('✅ Farcaster wallet connected:', (window as any).ethereum.selectedAddress);
          } else {
            console.log('⚠️ No Farcaster wallet detected');
          }
          setIsLoading(false);
        }, 1000);

      } catch (err) {
        console.error('❌ Error connecting to Farcaster wallet:', err);
        setError(err instanceof Error ? err.message : 'Failed to connect wallet');
        setIsLoading(false);
      }
    };

    checkConnection();
  }, []);

  return (
    <WagmiConfig config={config}>
      <FarcasterWalletContext.Provider value={{
        address,
        isConnected,
        isLoading,
        error,
      }}>
        {children}
      </FarcasterWalletContext.Provider>
    </WagmiConfig>
  );
};

export const useFarcasterWallet = () => {
  const context = useContext(FarcasterWalletContext);
  if (!context) {
    throw new Error('useFarcasterWallet must be used within a FarcasterWalletProvider');
  }
  return context;
};
