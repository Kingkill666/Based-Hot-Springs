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
    let retryCount = 0;
    const maxRetries = 10; // Limit retries to prevent infinite loading
    const checkConnection = async () => {
      try {
        // Set loading state and clear any previous errors
        setIsLoading(true);
        setError(null);
        
        // Set a timeout to stop loading after 30 seconds
        const timeoutId = setTimeout(() => {
          console.log('⏰ Timeout reached, stopping wallet check');
          setIsLoading(false);
          setError('Wallet connection timed out. Please try manually.');
        }, 30000);
        
        console.log(`🔍 Checking for wallet connection... (attempt ${retryCount + 1}/${maxRetries})`);
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
            
            // Check for Warpcast wallet specifically
            const warpcast = (window as any).Warpcast;
            const farcasterSdk = (window as any).farcasterSdk;
            
            console.log('🔍 Checking for Warpcast wallet...');
            console.log('🔍 Available objects:', {
              Warpcast: !!warpcast,
              farcasterSdk: !!farcasterSdk,
              farcaster: !!(window as any).farcaster,
              ethereum: !!(window as any).ethereum
            });
            
            if (!warpcast && !farcasterSdk) {
              console.log('⚠️ Warpcast wallet not available');
              retryCount++;
              if (retryCount >= maxRetries) {
                console.log('❌ Max retries reached, stopping wallet check');
                setIsLoading(false);
                setError('Warpcast wallet not available after multiple attempts');
                return;
              }
              setTimeout(checkWallet, 3000);
              return;
            }

            console.log('✅ Warpcast wallet found:', warpcast);

            // Try to connect to Warpcast wallet
            try {
              console.log('🔗 Attempting to connect to Warpcast wallet...');
              
              // Try Warpcast wallet first
              if (warpcast && warpcast.wallet) {
                console.log('🎯 Using Warpcast wallet provider');
                
                try {
                  // Try to get current accounts
                  const accounts = await warpcast.wallet.request({ method: 'eth_accounts' });
                  console.log('📋 Current Warpcast wallet accounts:', accounts);
                  
                  if (accounts && accounts.length > 0) {
                    const walletAddress = accounts[0];
                    setAddress(walletAddress);
                    setIsConnected(true);
                    console.log('✅ Warpcast wallet connected:', walletAddress);
                    setIsLoading(false);
                    return;
                  } else {
                    // Request wallet connection
                    console.log('🔗 Requesting Warpcast wallet connection...');
                    const accounts = await warpcast.wallet.request({ 
                      method: 'eth_requestAccounts' 
                    });
                    console.log('📋 Requested Warpcast wallet accounts:', accounts);
                    
                    if (accounts && accounts.length > 0) {
                      const walletAddress = accounts[0];
                      setAddress(walletAddress);
                      setIsConnected(true);
                      console.log('✅ Warpcast wallet connected after request:', walletAddress);
                      setIsLoading(false);
                      return;
                    }
                  }
                } catch (warpcastError) {
                  console.log('⚠️ Warpcast wallet error:', warpcastError);
                  if ((warpcastError as any).code === 4001) {
                    console.log('❌ User rejected Warpcast wallet connection');
                    setIsLoading(false);
                    return;
                  }
                }
              }
              
              // Fallback to Farcaster SDK if Warpcast not available
              if (farcasterSdk && farcasterSdk.wallet) {
                console.log('🎯 Using Farcaster SDK wallet provider');
                
                try {
                  const provider = farcasterSdk.wallet.getEthereumProvider();
                  const accounts = await provider.request({ method: 'eth_accounts' });
                  console.log('📋 Current Farcaster SDK accounts:', accounts);
                  
                  if (accounts && accounts.length > 0) {
                    const walletAddress = accounts[0];
                    setAddress(walletAddress);
                    setIsConnected(true);
                    console.log('✅ Farcaster SDK wallet connected:', walletAddress);
                    setIsLoading(false);
                    return;
                  } else {
                    const accounts = await provider.request({ 
                      method: 'eth_requestAccounts' 
                    });
                    console.log('📋 Requested Farcaster SDK accounts:', accounts);
                    
                    if (accounts && accounts.length > 0) {
                      const walletAddress = accounts[0];
                      setAddress(walletAddress);
                      setIsConnected(true);
                      console.log('✅ Farcaster SDK wallet connected after request:', walletAddress);
                      setIsLoading(false);
                      return;
                    }
                  }
                } catch (sdkError) {
                  console.log('⚠️ Farcaster SDK wallet error:', sdkError);
                }
              }
              
              console.log('⚠️ No wallet connection available');
              
            } catch (error) {
              console.log('❌ Wallet connection failed:', error);
            }

            console.log('⚠️ Authentication/wallet not available, retrying...');
            retryCount++;
            if (retryCount >= maxRetries) {
              console.log('❌ Max retries reached, stopping wallet check');
              setIsLoading(false);
              setError('Unable to connect to Farcaster wallet after multiple attempts');
              return;
            }
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
      
      // Cleanup timeout on unmount
      return () => {
        // Timeout will be cleared automatically when component unmounts
      };
    }, []);

  const connect = async () => {
    console.log('🔗 Connect Warpcast wallet called');
    setIsLoading(true);
    setError(null);
    
    try {
      const warpcast = (window as any).Warpcast;
      const farcasterSdk = (window as any).farcasterSdk;
      
      if (!warpcast && !farcasterSdk) {
        throw new Error('Warpcast wallet not available');
      }

      // Try Warpcast wallet first
      if (warpcast && warpcast.wallet) {
        console.log('🎯 Using Warpcast wallet provider');
        
        const accounts = await warpcast.wallet.request({ 
          method: 'eth_requestAccounts' 
        });
        
        if (accounts && accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
          console.log('✅ Warpcast wallet connected via manual request:', accounts[0]);
          return;
        } else {
          throw new Error('No accounts returned from Warpcast wallet');
        }
      }
      
      // Fallback to Farcaster SDK
      if (farcasterSdk && farcasterSdk.wallet) {
        console.log('🎯 Using Farcaster SDK wallet provider');
        
        const provider = farcasterSdk.wallet.getEthereumProvider();
        const accounts = await provider.request({ 
          method: 'eth_requestAccounts' 
        });
        
        if (accounts && accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
          console.log('✅ Farcaster SDK wallet connected via manual request:', accounts[0]);
          return;
        } else {
          throw new Error('No accounts returned from Farcaster SDK wallet');
        }
      }
      
      throw new Error('No wallet provider available');
      
    } catch (error) {
      console.error('❌ Warpcast wallet connection failed:', error);
      if ((error as any).code === 4001) {
        setError('User rejected Warpcast wallet connection');
      } else {
        setError('Failed to connect to Warpcast wallet');
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
