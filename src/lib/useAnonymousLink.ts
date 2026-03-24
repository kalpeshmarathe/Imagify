// lib/useAnonymousLink.ts
import { useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { getAppFunctions } from '@/lib/functions';

/**
 * Hook to link anonymous session to authenticated user
 * Call this in your login/signup flow
 */
export function useAnonymousLink() {
    const linkSessionToUser = async (uid: string) => {
        try {
            const functions = getAppFunctions();
            if (!functions) return;

            // Get the session ID from wherever you're storing it
            const sessionId = typeof window !== 'undefined'
                ? localStorage.getItem('picpop_session_id')
                : null;

            const anonymousId = typeof window !== 'undefined'
                ? sessionStorage.getItem('picpop_anon_id')
                : null;

            if (!sessionId && !anonymousId) {

                return;
            }

            const linkAnonymous = httpsCallable<
                { anonymousId?: string; sessionId?: string },
                { success: boolean; message: string }
            >(functions, 'linkAnonymousToUser');

            const result = await linkAnonymous({
                anonymousId: anonymousId || undefined,
                sessionId: sessionId || undefined,
            });



            // Clear the old session ID so we use UID-based queries now
            if (typeof window !== 'undefined') {
                localStorage.removeItem('picpop_session_id');
                sessionStorage.removeItem('picpop_anon_id');
            }

            return result.data;
        } catch (err) {
            console.error('Error linking session:', err);
        }
    };

    return { linkSessionToUser };
}