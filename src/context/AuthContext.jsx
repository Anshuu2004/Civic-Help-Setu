import { createContext, useContext, useMemo } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';

// Create the authentication context
const AuthContext = createContext(null);

/**
 * Inner provider that safely calls Clerk hooks (always rendered inside ClerkProvider).
 * Normalises Clerk user data into a simple shape the rest of the app consumes.
 */
const ClerkAuthProvider = ({ children }) => {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const clerk = useClerk();

  // Build a normalised user object every time Clerk state changes.
  const activeUser = useMemo(() => {
    if (!isSignedIn || !clerkUser) return null;

    const email = clerkUser.primaryEmailAddress?.emailAddress || '';
    const name =
      clerkUser.fullName ||
      (clerkUser.firstName
        ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim()
        : null) ||
      clerkUser.username ||
      email.split('@')[0] ||
      'Citizen';

    const defaultRole =
      clerkUser.publicMetadata?.role ||
      (email.toLowerCase().includes('admin') || clerkUser.username === 'esha'
        ? 'admin'
        : 'citizen');

    return {
      id: clerkUser.id,
      username: name,
      fullName: clerkUser.fullName || name,
      firstName: clerkUser.firstName || name,
      email,
      imageUrl: clerkUser.imageUrl,
      role: defaultRole,
      isClerk: true,
      raw: clerkUser,
    };
  }, [isSignedIn, clerkUser]);

  const logout = async () => {
    if (clerk) await clerk.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user: activeUser,
        loading: !isLoaded,
        logout,
        isClerkConfigured: true,
        isClerkLoaded: isLoaded,
        clerk,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * AuthProvider – wraps the app.
 * When no Clerk key is configured it still provides a safe empty context
 * so useAuth() never returns undefined.
 */
export const AuthProvider = ({ children }) => {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const isKeyConfigured = Boolean(
    publishableKey &&
      (publishableKey.startsWith('pk_test_') || publishableKey.startsWith('pk_live_'))
  );

  if (!isKeyConfigured) {
    // Provide a safe fallback context so useAuth() never crashes.
    return (
      <AuthContext.Provider
        value={{
          user: null,
          loading: false,
          logout: async () => {},
          isClerkConfigured: false,
          isClerkLoaded: true,
          clerk: null,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }

  return <ClerkAuthProvider>{children}</ClerkAuthProvider>;
};

// Hook for components to access auth state
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
};
