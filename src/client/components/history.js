import { useState } from 'react';

// Function to maintain a stack of game states
const useHistory = (initialState) => {
    const [stateStack, setStateStack] = useState([initialState]);

    // Function to push a new state onto the stack
    const pushState = (newState) => {
        setStateStack((prevStateStack) => [...prevStateStack, newState]);
    };

    // Function to pop the last state from the stack
    const popState = () => {
        if (stateStack.length <= 1) {
            // If there's only one state in the stack, return the current state
            return stateStack[0];
        } else {
            // Pop the last state from the stack
            setStateStack((prevStateStack) => prevStateStack.slice(0, -1));
            // Return the previous state
            return stateStack[stateStack.length - 2];
        }
    };

    return [stateStack[stateStack.length - 1], pushState, popState];
};

export default useHistory;
