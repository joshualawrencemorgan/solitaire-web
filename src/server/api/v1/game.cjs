/* Copyright G. Hemingway, @2022 - All rights reserved */
"use strict";

const Joi = require("joi");
const {
  initialState,
  shuffleCards,
  filterGameForProfile,
  filterMoveForResults,
} = require("../../solitare.cjs");

module.exports = (app) => {
  /**
   * Create a new game
   *
   * @param {req.body.game} Type of game to be played
   * @param {req.body.color} Color of cardsa
   * @param {req.body.draw} Number of cards to draw
   * @return {201 with { id: ID of new game }}
   */
  app.post("/v1/game", async (req, res) => {
    try {
      if (!req.session.user) return res.status(401).send({ error: "unauthorized" });
      const schema = Joi.object({
        game: Joi.string().lowercase().required(),
        color: Joi.string().lowercase().required(),
        draw: Joi.any(),
      });
      const data = await schema.validateAsync(req.body, { stripUnknown: true });
      let newGame = {
        owner: req.session.user,
        active: true,
        cards_remaining: 52,
        color: data.color,
        game: data.game,
        score: 0,
        start: Date.now(),
        winner: "",
        state: [],
      };
      newGame.drawCount = data.draw === "Draw 3" ? 3 : 1;
      newGame.state.push(initialState());
      const game = new app.models.Game(newGame);
      await game.save();
      await app.models.User.findByIdAndUpdate(req.session.user._id, { $push: { games: game._id } });
      res.status(201).send({ id: game._id });
    } catch (err) {
      console.error("Error creating game:", err);
      res.status(400).send({ error: "failure creating game" });
    }
  });
  /**
   * Fetch game information
   *
   * @param (req.params.id} Id of game to fetch
   * @return {200} Game information
   */
  app.get("/v1/game/:id", async (req, res) => {
    try {
      let game = await app.models.Game.findById(req.params.id);
      if (!game) return res.status(404).send({ error: `Unknown game: ${req.params.id}` });

      // Convert game state to JSON
      const state = game.state.length > 0 ? game.state[game.state.length - 1].toJSON() : {};
      // Include additional game information
      let results = filterGameForProfile(game);
      results.start = Date.parse(results.start);
      results.cards_remaining = 52 - (state.stack1.length + state.stack2.length + state.stack3.length + state.stack4.length);

      // Check if moves are requested
      if (req.query.moves === "true") {
        // Fetch moves associated with the game
        const moves = await app.models.Move.find({ game: req.params.id });
        // Map moves to appropriate format
        state.moves = moves.map((move) => filterMoveForResults(move));
      }

      // Send response with combined game information
      res.status(200).send(Object.assign({}, results, state));
    } catch (err) {
      console.error("Error fetching game:", err);
      res.status(404).send({ error: `Unknown game: ${req.params.id}` });
    }
  });

  app.get("/v1/cards/shuffle", (req, res) => {
    res.send(shuffleCards(false));
  });
  app.get("/v1/cards/initial", (req, res) => {
    res.send(initialState());
  });

  /**
   * Execute a move in the game
   *
   * @param {req.params.id} ID of the game
   * @param {req.body.move} Move data
   * @return {200 with { newState, error }} New state of the game or an error message
   */
  app.put("/v1/game/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const move = req.body;
      const action = move.action;

      // Fetch the current state of the game
      let game = await app.models.Game.findById(id).populate('owner');
      if (!game) {
        return res.status(404).send({ error: `Unknown game: ${id}` });
      }
      if (!game.active) {
        return res.status(404).send({ error: `Game over: ${id}` });
      }

      // If the action is FOLD, handle it accordingly
      if (action === "fold") {
        game.active = false;
        await game.save();
        console.error("Fold move:", game.owner.username);
        return res.status(200).send({ success: true });
      }

      // If the action is UNDO, handle it accordingly
      if (action === "undo") {
        if (game.state.length <= 1) {
          return res.status(400).send({ error: "No moves to undo" });
        }
        game.undostate.push(game.state.pop());
        await game.save();
        return res.status(200).json(game.state[game.state.length - 1]);
      }

      // If the action is REDO, handle it accordingly
      if (action === "redo") {
        if (game.undostate.length === 0) {
          return res.status(400).send({ error: "No moves to redo" });
        }
        const nextState = game.undostate.pop();
        game.state.push(nextState);
        game.moves.push(game.moves.pop()); // Move the undone move back to moves array
        await game.save();
        return res.status(200).json(nextState);
      }
      // Otherwise, execute the move and update the game state
      const currentState = JSON.parse(JSON.stringify(game.state[game.state.length - 1]));
      const validationResult = await validateMove(currentState, move);
      if (validationResult.error) {
        return res.status(400).send({ error: validationResult.error });
      }

      // Update the game state in the database
      game.undostate = [];
      game.state.push(validationResult.newState);
      game.moves.push(move);
      await game.save();

      // Respond with the new state of the game
      res.status(200).json(game.state[game.state.length - 1]);
    } catch (error) {
      console.error("Error executing move:", error);
      res.status(500).json({ error: "Error executing move" });
    }
  });

  const getColor = (suit) => {
    return ["hearts", "diamonds"].includes(suit) ? "red" : "black";
  };

  const validateMove = async (currentState, requestedMove) => {
    // console.log(currentState);
    try {
      const { cards, src, dst } = requestedMove;
      console.log(`Source: ${src}, Destination: ${dst}, Cards:`, cards);
      // Find the index of the first card in the source pile
      const cardIndex = currentState[src].findIndex(card => card.suit === cards[0].suit && card.value === cards[0].value);
      // console.log(`Index: ${cardIndex}`);
      if (cardIndex === -1) {
        // If the card is not found in the source pile, return an error
        return { newState: null, error: "Invalid move: Card not found in source pile" };
      }
      // Call the appropriate function based on the destination pile
      switch (dst) {
        case "draw":
          return { newState: null, error: "Invalid move: Cannot move to draw pile" };
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
        return { newState: null, error: "Invalid move: Card not found in source pile" };
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
      if (currentState[dst].length === 0) {
        if (cards[0].value !== "ace") {
          return { newState: null, error: "Invalid move: First card on stack must be an ace" };
        }
      } else {
        const topCard = currentState[dst][currentState[dst].length - 1];
        if (topCard.suit !== cards[0].suit) {
          // If the top card of the destination pile has the same color, return an error
          return { newState: null, error: "Invalid move: Stack cards must be same suit" };
        }
        if (getLessValue(topCard.value) !== cards[0].value) {
          // If the moved card is not one less value, return an error
          return { newState: null, error: "Invalid move: Card value does not match sequence" };
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
          if (srcPile.length > 0) {
            srcPile[srcPile.length - 1].up = true;
          }
          const newState = {
            ...currentState,
            [src]: srcPile,
            [dst]: currentState[dst].concat(movedCards),
          };
          return { newState, error: null };
        } else {
          // Other cards cannot be moved to empty piles
          return { newState: null, error: "Invalid move: Only kings can be moved to empty piles" };
        }
      }

      const cardIndex = currentState[src].findIndex(card => card.suit === cards[0].suit && card.value === cards[0].value);
      const srcPile = currentState[src].slice(0, cardIndex);
      const movedCards = currentState[src].slice(cardIndex);
      const topCard = currentState[dst][currentState[dst].length - 1];

      // Check if the moved card is one less value than the top card of the destination pile
      if (topCard && getColor(topCard.suit) === getColor(cards[0].suit)) {
        // If the top card of the destination pile has the same color, return an error
        return { newState: null, error: "Invalid move: Cannot place card on top of same color" };
      }
      if (cards[0].value === "king" || topCard.value !== getLessValue(cards[0].value)) {
        // If the moved card is not one less value, return an error
        return { newState: null, error: "Invalid move: Card value does not match sequence" };
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

  app.put("/v1/game/:id/undo", async (req, res) => {
    try {
      const { id } = req.params;
      let game = await app.models.Game.findById(id).populate('owner');
      if (!game) {
        return res.status(404).send({ error: `Unknown game: ${id}` });
      }
      if (!game.active) {
        return res.status(404).send({ error: `Game over: ${id}` });
      }
      // Check if there are moves to undo
      if (game.moves.length > 0) {
        // Pop the last move from the moves array
        const undoneMove = game.moves.pop();
        // Push the undone move to the undostate array
        game.undostate.push(undoneMove);
        // Update the game state to the previous state
        game.state = game.states.pop();
        await game.save();
        res.status(200).json(game.state);
      } else {
        res.status(400).send({ error: "No moves to undo" });
      }
    } catch (error) {
      console.error("Error undoing move:", error);
      res.status(500).json({ error: "Error undoing move" });
    }
  });

  app.put("/v1/game/:id/redo", async (req, res) => {
    try {
      const { id } = req.params;
      let game = await app.models.Game.findById(id).populate('owner');
      if (!game) {
        return res.status(404).send({ error: `Unknown game: ${id}` });
      }
      if (!game.active) {
        return res.status(404).send({ error: `Game over: ${id}` });
      }
      // Check if there are states to redo
      if (game.undostate.length > 0) {
        // Pop the last state from the undostate array
        const nextState = game.undostate.pop();
        // Push the next state to the states array
        game.states.push(nextState);
        // Update the game state to the next state
        game.state = nextState;
        await game.save();
        res.status(200).json(game.state);
      } else {
        res.status(400).send({ error: "No moves to redo" });
      }
    } catch (error) {
      console.error("Error redoing move:", error);
      res.status(500).json({ error: "Error redoing move" });
    }
  });

  const cardValues = {
    ace: "2",
    "2": "3",
    "3": "4",
    "4": "5",
    "5": "6",
    "6": "7",
    "7": "8",
    "8": "9",
    "9": "10",
    "10": "jack",
    jack: "queen",
    queen: "king",
    king: null, // There's no card value less than "king"
  };

  const getLessValue = (value) => {
    return cardValues[value] || null;
  };


};
