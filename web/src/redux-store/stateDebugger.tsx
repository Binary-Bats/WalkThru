// StateDebugger.tsx - Add this component to debug state
import React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from './docStore';

export const StateDebugger = () => {
    const fullState = useSelector((state: AppState) => state);

    React.useEffect(() => {
        console.log('Full Redux State:', fullState);
        console.log('Docs State:', fullState.docs);
        console.log('Session State:', fullState.session);
    }, [fullState]);

    return null;
};