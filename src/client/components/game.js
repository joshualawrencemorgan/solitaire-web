/* Copyright G. Hemingway, @2022 - All rights reserved */
"use strict";

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";

import { Pile } from "./pile.js";
import useHistory from './history.js';

const CardRow = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: flex-start;
  margin-bottom: 2em;
`;

const CardRowGap = styled.div`
  flex-grow: 2;
`;

const GameBase = styled.div`
  grid-row: 2;
  grid-column: sb / main;
`;

const HeaderBase = styled.div`
  grid-area: hd;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #000;
`;

const FoldButton = styled.button`
  background-color: #02810f;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin: auto;
`;

const GameHeader = ({ onFold, onUndo, onRedo }) => {
  return (
    <HeaderBase>
      <FoldButton onClick={onUndo}>Undo</FoldButton>
      <FoldButton onClick={onFold}>Fold</FoldButton>
      <FoldButton onClick={onRedo}>Redo</FoldButton>
    </HeaderBase>
  );
};


export const Game = () => {
  const { id } = useParams();
  let [state, setState] = useState({
    pile1: [],
    pile2: [],
    pile3: [],
    pile4: [],
    pile5: [],
    pile6: [],
    pile7: [],
    stack1: [],
    stack2: [],
    stack3: [],
    stack4: [],
    draw: [],
    discard: [],
  });
  let [target, setTarget] = useState(undefined);
  let [targetPile, setTargetPile] = useState(undefined);

  const history = useHistory();

  // let [startDrag, setStartDrag] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const getGameState = async () => {
      const response = await fetch(`/v1/game/${id}`);
      const data = await response.json();
      setState({
        pile1: data.pile1,
        pile2: data.pile2,
        pile3: data.pile3,
        pile4: data.pile4,
        pile5: data.pile5,
        pile6: data.pile6,
        pile7: data.pile7,
        stack1: data.stack1,
        stack2: data.stack2,
        stack3: data.stack3,
        stack4: data.stack4,
        draw: data.draw,
        discard: data.discard,
      });
    };
    getGameState();
  }, [id]);


  const onClick = async (clickedCard, clickedPile) => {
    if (!target) {
      if (clickedPile === "draw") {
        console.log('Drawing');
        const move = {
          cards: [clickedCard],
          src: "draw",
          dst: "discard"
        };
        await updateGameState(move, id);
      } else {
        setTarget(clickedCard);
        setTargetPile(clickedPile);
      }
    } else {
      if (targetPile === clickedPile) {
        setTarget(null);
        setTargetPile(null);
        return;
      }
      const move = {
        cards: [target],
        src: targetPile,
        dst: clickedPile
      };
      await updateGameState(move, id);
      setTarget(null);
      setTargetPile(null);
    }
  };

  const getLessValue = (value) => {
    switch (value) {
      case "2":
        return "ace";
      case "3":
        return "2";
      case "4":
        return "3";
      case "5":
        return "4";
      case "6":
        return "5";
      case "7":
        return "6";
      case "8":
        return "7";
      case "9":
        return "8";
      case "10":
        return "9";
      case "jack":
        return "10";
      case "queen":
        return "jack";
      case "king":
        return "queen";
      default:
        return null;
    }
  };

  const canMoveToStack = (stack, card) => {
    if (stack.length === 0) {
      if (card.value !== "ace") {
        return false;
      }
    } else {
      const topCard = stack[stack.length - 1];
      if (topCard.suit !== card.suit) {
        // If the top card of the destination pile has a different suit, return false
        return false;
      }
      if (topCard.value !== getLessValue(card.value)) {
        // If the moved card is not one less value, return false
        return false;
      }
    }
    return true;
  };

  const checkForValidMoves = (state) => {
    if(state.draw.length >= 1){
      return true;
    }
    const piles = ['pile1', 'pile2', 'pile3', 'pile4', 'pile5', 'pile6', 'pile7'];
    const stacks = ['stack1', 'stack2', 'stack3', 'stack4'];
    for (const pile of piles) {
      const topCard = state[pile][state[pile].length - 1];
      if (topCard && stacks.some(stack => canMoveToStack(state[stack], topCard))) {
        return true;
      }
    }
    return false;
  };

  const checkForWin = (state) => {
    const stacks = ['stack1', 'stack2', 'stack3', 'stack4'];

    for (const stack of stacks) {
      if (state[stack].length !== 13) {
        return false;
      }
    }

    return true;
  };

  const updateGameState = async (move, gameID) => {
    try {
      const { newState, error } = await validateMove(gameID, move);
      console.log(newState, error);
      if (error) {
        console.error("Invalid move:", error);
      } else if (newState) {
        if(checkForWin(newState)) {
          window.alert(`You win!!!`);
        }
        if (!checkForValidMoves(newState)) {
          console.log("Draw pile is empty!");
          window.alert(`You have run out of moves. Undo or fold`);
        }
        console.log(newState);
        setState(newState);
      }
    } catch (error) {
      console.error("Error updating game state:", error);
    }
  };

  const handleFold = async () => {
    try {
      const response = await fetch(`/v1/game/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ action: "fold" })
      });
      if (response.ok) {
        const gameUrl = `/results/${id}`;
        window.alert(`Fold action successful. Click OK to go to the game: ${gameUrl}`);
        // Redirect to the game page
        window.location.href = gameUrl;
      } else {
        console.error("Fold action failed");
      }
    } catch (error) {
      console.error("Error executing fold action:", error);
    }
  };

  const handleUndo = async () => {
    try {
      const response = await fetch(`/v1/game/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ action: "undo" })
      });
      if (response.ok) {
        const newState = await response.json();
        // Update the game state with the new state received from the server
        setState(newState);
      } else {
        const errorData = await response.json();
        console.error("Error undoing move:", errorData.error);
      }
    } catch (error) {
      console.error("Error undoing move:", error);
    }
  };

  const handleRedo = async () => {
    try {
      const response = await fetch(`/v1/game/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ action: "redo" })
      });
      if (response.ok) {
        const newState = await response.json();
        // Update the game state with the new state received from the server
        setState(newState);
      } else {
        const errorData = await response.json();
        console.error("Error redoing move:", errorData.error);
      }
    } catch (error) {
      console.error("Error redoing move:", error);
    }
  };

  let validateMove = async (gameID, moveData) => {
    try {
      const response = await fetch(`/v1/game/${gameID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(moveData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Move executed successfully:", result);
        return { newState: result, error: null };
      } else {
        const errorData = await response.json();
        console.error("Error executing move:", errorData.error);
        return { newState: null, error: errorData.error };
      }
    } catch (error) {
      console.error("Error executing move:", error);
      return { newState: null, error: "Error executing move" };
    }
  };

  return (
    <GameBase>
      <GameHeader onFold={handleFold} onUndo={handleUndo} onRedo={handleRedo} />
      <CardRow>
        <Pile cards={state.stack1} spacing={0} onClick={onClick} pile="stack1" />
        <Pile cards={state.stack2} spacing={0} onClick={onClick} pile="stack2" />
        <Pile cards={state.stack3} spacing={0} onClick={onClick} pile="stack3" />
        <Pile cards={state.stack4} spacing={0} onClick={onClick} pile="stack4" />
        <CardRowGap />
        <Pile cards={state.draw} spacing={0} onClick={onClick} pile="draw" />
        <Pile cards={state.discard} spacing={0} onClick={onClick} pile="discard" />
      </CardRow>
      <CardRow>
        <Pile cards={state.pile1} onClick={onClick} pile="pile1" />
        <Pile cards={state.pile2} onClick={onClick} pile="pile2" />
        <Pile cards={state.pile3} onClick={onClick} pile="pile3" />
        <Pile cards={state.pile4} onClick={onClick} pile="pile4" />
        <Pile cards={state.pile5} onClick={onClick} pile="pile5" />
        <Pile cards={state.pile6} onClick={onClick} pile="pile6" />
        <Pile cards={state.pile7} onClick={onClick} pile="pile7" />
      </CardRow>
    </GameBase>
  );
};

Game.propTypes = {};
