import { create } from "zustand";

interface AccessTokenState {
  accessToken: string | null;
  setAccessToken: (accessToken: string | null) => void;
  clearAccessToken: () => void;
}

const useAccessToken = create<AccessTokenState>()((set) => ({
  accessToken: null,
  setAccessToken: (accessToken) => set({ accessToken }),
  clearAccessToken: () => set({ accessToken: null }),
}));

export default useAccessToken;
