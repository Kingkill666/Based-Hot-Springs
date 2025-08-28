"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

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

export const FarcasterWalletProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setIsLoading(true);
        
        console.log('🔍 Checking for wallet connection...');
        console.log('📍 Current URL:', window.location.href);
        console.log('🌐 Window objects:', {
          ethereum: !!(window as any).ethereum,
          farcaster: !!(window as any).farcaster,
          farcasterSdk: !!(window as any).farcasterSdk,
          Warpcast: !!(window as any).Warpcast,
        });

        // Check if we're in a Farcaster environment (more permissive)
        const isInFarcaster = window.location.href.includes('farcaster') || 
                             window.location.href.includes('warpcast') ||
                             window.location.href.includes('miniapp') ||
                             window.location.href.includes('vercel.app') || // Allow testing on deployment
                             (window as any).farcaster ||
                             (window as any).farcasterSdk ||
                             (window as any).Warpcast ||
                             (window as any).ethereum;

        console.log('🎮 Farcaster environment detected:', isInFarcaster);

                // Check for Farcaster authentication and wallet connection
        const checkWallet = async () => {
          try {
            console.log('🔍 Checking for Farcaster authentication...');
            
            // Check if Farcaster SDK is available
            if (!(window as any).farcasterSdk) {
              console.log('⚠️ Farcaster SDK not available');
              setTimeout(checkWallet, 3000);
              return;
            }

            console.log('✅ Farcaster SDK found');

            // First, check if user is authenticated with Farcaster
            try {
              const user = await (window as any).farcasterSdk.getCurrentUser();
              console.log('👤 Current Farcaster user:', user);
              
              if (user && user.fid) {
                console.log('✅ User authenticated with Farcaster, FID:', user.fid);
                
                // Now try to get wallet connection
                const provider = (window as any).farcasterSdk.wallet?.getEthereumProvider();
                if (provider) {
                  try {
                    const accounts = await provider.request({ method: 'eth_accounts' });
                    console.log('📋 Current wallet accounts:', accounts);
                    
                    if (accounts && accounts.length > 0) {
                      const walletAddress = accounts[0];
                      setAddress(walletAddress);
                      setIsConnected(true);
                      console.log('✅ Farcaster wallet connected:', walletAddress);
                      setIsLoading(false);
                      return;
                    } else {
                      // User is authenticated but wallet not connected
                      console.log('🔗 User authenticated, requesting wallet connection...');
                      try {
                        const accounts = await provider.request({ 
                          method: 'eth_requestAccounts' 
                        });
                        console.log('📋 Requested wallet accounts:', accounts);
                        
                        if (accounts && accounts.length > 0) {
                          const walletAddress = accounts[0];
                          setAddress(walletAddress);
                          setIsConnected(true);
                          console.log('✅ Farcaster wallet connected after request:', walletAddress);
                          setIsLoading(false);
                          return;
                        }
                      } catch (requestError) {
                        console.log('⚠️ Wallet request failed:', requestError);
                        if ((requestError as any).code === 4001) {
                          console.log('❌ User rejected wallet connection');
                          setIsLoading(false);
                          return;
                        }
                      }
                    }
                  } catch (walletError) {
                    console.log('⚠️ Wallet provider error:', walletError);
                  }
                }
              } else {
                // User not authenticated, need to sign in
                console.log('🔐 User not authenticated, requesting Farcaster sign-in...');
                try {
                  const user = await (window as any).farcasterSdk.signIn();
                  console.log('✅ Farcaster sign-in successful:', user);
                  
                  // After sign-in, try wallet connection
                  setTimeout(checkWallet, 1000);
                  return;
                } catch (signInError) {
                  console.log('❌ Farcaster sign-in failed:', signInError);
                  if ((signInError as any).code === 4001) {
                    console.log('❌ User rejected Farcaster sign-in');
                    setIsLoading(false);
                    return;
                  }
                }
              }
            } catch (authError) {
              console.log('⚠️ Authentication check failed:', authError);
            }

            console.log('⚠️ Authentication/wallet not available, retrying...');
            // Retry after a delay
            setTimeout(checkWallet, 3000);
            
          } catch (error) {
            console.error('❌ Error in checkWallet:', error);
            setTimeout(checkWallet, 3000);
          }
        };

        // Start checking for wallet
        checkWallet();

        // Listen for Farcaster wallet connection events
        if ((window as any).farcasterSdk?.wallet) {
          const provider = (window as any).farcasterSdk.wallet.getEthereumProvider();
          if (provider && provider.on) {
            provider.on('accountsChanged', (accounts: string[]) => {
              console.log('🔄 Farcaster accounts changed:', accounts);
              if (accounts && accounts.length > 0) {
                setAddress(accounts[0]);
                setIsConnected(true);
                setIsLoading(false);
              } else {
                setAddress(null);
                setIsConnected(false);
              }
            });
          }
        }

      } catch (err) {
        console.error('❌ Error connecting to Farcaster wallet:', err);
        setError(err instanceof Error ? err.message : 'Failed to connect wallet');
        setIsLoading(false);
      }
    };

    checkConnection();
  }, []);

  const connect = async () => {
    console.log('🔗 Connect Farcaster wallet called');
    setIsLoading(true);
    
    try {
      // Check if Farcaster SDK is available
      if (!(window as any).farcasterSdk) {
        throw new Error('Farcaster SDK not available');
      }

      // First, check if user is authenticated
      let user = await (window as any).farcasterSdk.getCurrentUser();
      
      if (!user || !user.fid) {
        console.log('🔐 User not authenticated, requesting Farcaster sign-in...');
        user = await (window as any).farcasterSdk.signIn();
        console.log('✅ Farcaster sign-in successful:', user);
      } else {
        console.log('✅ User already authenticated, FID:', user.fid);
      }

      // Now connect wallet
      const provider = (window as any).farcasterSdk.wallet?.getEthereumProvider();
      if (!provider) {
        throw new Error('Farcaster wallet provider not available');
      }

      const accounts = await provider.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts && accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
        console.log('✅ Farcaster wallet connected via manual request:', accounts[0]);
      } else {
        throw new Error('No accounts returned from Farcaster wallet');
      }
    } catch (error) {
      console.error('❌ Farcaster connection failed:', error);
      if ((error as any).code === 4001) {
        setError('User rejected Farcaster connection');
      } else {
        setError('Failed to connect to Farcaster');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FarcasterWalletContext.Provider value={{
      address,
      isConnected,
      isLoading,
      error,
      connect,
    }}>
      {children}
    </FarcasterWalletContext.Provider>
  );
};

export const useFarcasterWallet = () => {
  const context = useContext(FarcasterWalletContext);
  if (!context) {
    throw new Error('useFarcasterWallet must be used within a FarcasterWalletProvider');
  }
  return context;
};
