/* Copyright G. Hemingway, @2022 - All rights reserved */
"use strict";

import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import styled from "styled-components";
import PropTypes from "prop-types";
import { ErrorMessage, InfoBlock, InfoData, InfoLabels } from "./shared.js";

const Move = ({ move, index }) => {
  const duration = Date.now() - move.date;
  return (
    <tr>
      <th>{move.id ? move.id : index + 1}</th>
      <th>{duration} seconds</th>
      <th>
        <Link to={`/profile/${move.player}`}>{move.player}</Link>
      </th>
      <th>{move.move}</th>
    </tr>
  );
};

Move.propTypes = {
  move: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
};

const MovesListTable = styled.table`
  margin: 1em;
  width: 90%;
  min-height: 4em;
  border: 1px solid black;
  text-align: center;
  @media (max-width: 499px) {
    & > tbody > tr > td:nth-of-type(2),
    & > thead > tr > th:nth-of-type(2) {
      display: none;
    }
  }
`;

const MovesList = ({ moves }) => {
  return (
    <MovesListTable>
      <thead>
        <tr>
          <th>Move</th>
          <th>Card</th>
          <th>Source</th>
          <th>Destination</th>
        </tr>
      </thead>
      <tbody>
        {moves.map((move, index) => (
          <tr key={index}>
            <td>{index}</td>
            <td>{move.cards[0].value} of {move.cards[0].suit}</td>
            <td>{move.src}</td>
            <td>{move.dst}</td>
          </tr>
        ))}
      </tbody>
    </MovesListTable>
  );
};



const GameDetail = ({ start, moves, score, cards_remaining, active }) => {
  const duration = start ? (Date.now() - start) / 1000 : "--";
  const currentScore = (52 - cards_remaining) * 2 - moves.length;
  return (
    <InfoBlock>
      <InfoLabels>
        <p>Duration:</p>
        <p>Number of Moves:</p>
        <p>Points:</p>
        <p>Cards Remaining:</p>
        <p>Able to Move:</p>
      </InfoLabels>
      <InfoData>
        <p>{duration} seconds</p>
        <p>{moves.length}</p>
        <p>{currentScore}</p>
        <p>{cards_remaining}</p>
        <p>{active ? "Active" : "Complete"}</p>
      </InfoData>
    </InfoBlock>
  );
};

GameDetail.propTypes = {
  start: PropTypes.number.isRequired,
  score: PropTypes.number.isRequired,
  cards_remaining: PropTypes.number.isRequired,
  active: PropTypes.bool.isRequired,
};

const ResultsBase = styled.div`
  grid-area: main;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const Results = () => {
  const { id } = useParams();
  // Initialize the state
  let [game, setGame] = useState({
    start: 0,
    score: 0,
    cards_remaining: 0,
    active: true,
    moves: 0,
  });
  let [error, setError] = useState("");
  // Fetch data on load
  useEffect(() => {
    fetch(`/v1/game/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setGame(data);
      })
      .catch((err) => console.log(err));
  }, [id]);

  return (
    <ResultsBase>
      <ErrorMessage msg={error} hide={true} />
      <h4>Game Detail</h4>
      <GameDetail {...game} />
      {typeof game.moves === "number" ? (
        <div>No Moves</div>
      ) : (
        <MovesList moves={game.moves} />
      )}
    </ResultsBase>
  );
};
