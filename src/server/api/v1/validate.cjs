

module.exports = (app) => {
    const getColor = (suit) => {
        return ["hearts", "diamonds"].includes(suit) ? "red" : "black";
    };

    const validateMove = async (currentState, requestedMove) => {
        try {
            const { cards, src, dst } = requestedMove;
            console.log(`Source: ${src}, Destination: ${dst}, Cards:`, cards);
            // Find the index of the first card in the source pile
            const cardIndex = currentState[src].findIndex(card => card.suit === cards[0].suit && card.value === cards[0].value);
            // console.log(`Index: ${cardIndex}`);
            if (cardIndex === -1) {
                // If the card is not found in the source pile, return an error
                return { newState: currentState, error: "Invalid move: Card not found in source pile" };
            }
            // Call the appropriate function based on the destination pile
            switch (dst) {
                case "draw":
                   return { newState: currentState, error: "Invalid move: Cannot move to draw pile" };
                case "discard":
                    return updateGameStateFromDraw(requestedMove, currentState);
                case "stack1":
                case "stack2":
                case "stack3":
                case "stack4":
                    return updateGameStateToStack(requestedMove, currentState);
                default:
                    return updateGameStateToPile(requestedMove, currentState);
            }
        } catch (error) {
            console.error("Error validating move:", error);
            return { newState: null, error: "Error validating move" };
        }
    };

    const updateGameStateFromDraw = async (requestedMove, currentState) => {
        try {
            const { cards, src, dst } = requestedMove;
            if (src !== "draw") {
                return { newState: currentState, error: "Invalid move: Can only move from draw to discard" };
            }
            const cardIndex = currentState[src].findIndex(card => card.suit === cards[0].suit && card.value === cards[0].value);
            if (cardIndex === -1) {
                // If the card is not found in the source pile, return an error
                return { newState: currentState, error: "Invalid move: Card not found in source pile" };
            }

            // Slice the source pile to remove the moved cards
            const srcPile = currentState[src].slice(0, cardIndex);
            const movedCards = currentState[src].slice(cardIndex);
            const flippedCards = movedCards.map(card => ({ ...card, up: true }));

            // Add each flipped card to the destination pile
            const newState = {
                ...currentState,
                [src]: srcPile,
                [dst]: [...currentState[dst], ...flippedCards],
            };

            return { newState, error: null };
        } catch (error) {
            console.error("Error updating game state from draw:", error);
            return { newState: null, error: "Error updating game state from draw" };
        }
    };


    const updateGameStateToStack = async (requestedMove, currentState) => {
        try {
            const { cards, src, dst } = requestedMove;
            if (cards.length !== 1) {
                return { newState: currentState, error: "Invalid move: Can only move one card to stack at a time" };
            }
            const cardIndex = currentState[src].findIndex(card => card.suit === cards[0].suit && card.value === cards[0].value);

            const srcPile = currentState[src].slice(0, cardIndex);
            const movedCards = currentState[src].slice(cardIndex);
            if( currentState[dst].length === 0){
                if (cards[0].value !== "ace"){
                    return { newState: currentState, error: "Invalid move: First card on stack must be an ace" };
                }
            } else {
                const topCard = currentState[dst][currentState[dst].length - 1];
                if (topCard.suit !== cards[0].suit) {
                    // If the top card of the destination pile has the same color, return an error
                    return { newState: currentState, error: "Invalid move: Stack cards must be same suit" };
                }
                if (getLessValue(topCard.value) !== cards[0].value) {
                    // If the moved card is not one less value, return an error
                    return { newState: currentState, error: "Invalid move: Card value does not match sequence" };
                }
            }
            const newState = {
                ...currentState,
                [src]: srcPile,
                [dst]: currentState[dst].concat(movedCards),
            };

            // Set the 'up' attribute to true for the new top card in the destination pile
            if (newState[src].length > 0) {
                newState[src][newState[src].length - 1].up = true;
            }

            return { newState, error: null };
        } catch (error) {
            console.error("Error updating game state to stack:", error);
            return { newState: null, error: "Error updating game state to stack" };
        }
    };

    const updateGameStateToPile = async (requestedMove, currentState) => {
        try {
            const { cards, src, dst } = requestedMove;

            if (dst !== "discard" && currentState[dst].length === 0) {
                // If the destination pile is empty
                if (cards[0].value === "king") {
                    // Only kings can be moved to empty piles
                    const cardIndex = currentState[src].findIndex(card => card.suit === cards[0].suit && card.value === cards[0].value);
                    const srcPile = currentState[src].slice(0, cardIndex);
                    const movedCards = currentState[src].slice(cardIndex);
                    const newState = {
                        ...currentState,
                        [src]: srcPile,
                        [dst]: currentState[dst].concat(movedCards),
                    };
                    return { newState, error: null };
                } else {
                    // Other cards cannot be moved to empty piles
                    return { newState: currentState, error: "Invalid move: Only kings can be moved to empty piles" };
                }
            }

            const cardIndex = currentState[src].findIndex(card => card.suit === cards[0].suit && card.value === cards[0].value);
            const srcPile = currentState[src].slice(0, cardIndex);
            const movedCards = currentState[src].slice(cardIndex);
            const topCard = currentState[dst][currentState[dst].length - 1];

            // Check if the moved card is one less value than the top card of the destination pile
            if (topCard && getColor(topCard.suit) === getColor(cards[0].suit)) {
                // If the top card of the destination pile has the same color, return an error
                return { newState: currentState, error: "Invalid move: Cannot place card on top of same color" };
            }
            if (cards[0].value === "king" || topCard.value !== getLessValue(cards[0].value)) {
                // If the moved card is not one less value, return an error
                return { newState: currentState, error: "Invalid move: Card value does not match sequence" };
            }

            if (srcPile.length > 0) {
                srcPile[srcPile.length - 1].up = true;
            }
            const newState = {
                ...currentState,
                [src]: srcPile,
                [dst]: currentState[dst].concat(movedCards),
            };
            return { newState, error: null };
        } catch (error) {
            console.error("Error updating game state to pile:", error);
            return { newState: null, error: "Error updating game state to pile" };
        }
    };


    const getLessValue = (value) => {
        switch (value) {
            case "ace":
                return "2";
            case "2":
                return "3";
            case "3":
                return "4";
            case "4":
                return "5";
            case "5":
                return "6";
            case "6":
                return "7";
            case "7":
                return "8";
            case "8":
                return "9";
            case "9":
                return "10";
            case "10":
                return "jack";
            case "jack":
                return "queen";
            case "queen":
                return "king";
            case "king":
                return null; // There's no card value less than "king"
            default:
                return null; // Invalid input value
        }
    };



    /**
     * Validate a move in the game
     *
     * @param {req.body.currentState} Current state of the game
     * @param {req.body.requestedMove} Move requested by the user
     * @return {200 with { newState, error }} New state of the game or an error message
     */
    app.post("/v1/validate", async (req, res) => {
        try {
            // Extract currentState and requestedMove from the request body
            const { currentState, requestedMove } = req.body;

            // Validate the move
            const validationResult = await validateMove(currentState, requestedMove);
            console.log(validationResult.error);
            // Respond with the result (newState and error)
            res.status(200).json(validationResult);
        } catch (error) {
            console.error("Error validating move:", error);
            res.status(500).json({ error: "Error validating move" });
        }
    });
};
