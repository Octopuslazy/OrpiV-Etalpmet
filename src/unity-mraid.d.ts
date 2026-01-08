// Unity Ads MRAID Type Declarations
declare global {
  interface Window {
    mraid?: {
      getState(): string;
      addEventListener(event: string, callback: (param?: any) => void): void;
      removeEventListener(event: string, callback: (param?: any) => void): void;
      isViewable(): boolean;
      open(url: string): void;
      getMaxSize(): { width: number; height: number };
      getCurrentPosition(): { x: number; y: number; width: number; height: number };
      getDefaultPosition(): { x: number; y: number; width: number; height: number };
      getScreenSize(): { width: number; height: number };
      close(): void;
      expand(url?: string): void;
      getExpandProperties(): any;
      setExpandProperties(properties: any): void;
      useCustomClose(useCustomClose: boolean): void;
    };
    GOOGLE_PLAY_URL?: string;
    APP_STORE_URL?: string;
    AD_NETWORK?: string;
    AD_PROTOCOL?: string;
  }
  
  const mraid: {
    getState(): string;
    addEventListener(event: string, callback: (param?: any) => void): void;
    removeEventListener(event: string, callback: (param?: any) => void): void;
    isViewable(): boolean;
    open(url: string): void;
    getMaxSize(): { width: number; height: number };
    getCurrentPosition(): { x: number; y: number; width: number; height: number };
    getDefaultPosition(): { x: number; y: number; width: number; height: number };
    getScreenSize(): { width: number; height: number };
    close(): void;
    expand(url?: string): void;
    getExpandProperties(): any;
    setExpandProperties(properties: any): void;
    useCustomClose(useCustomClose: boolean): void;
  } | undefined;
}

export {};