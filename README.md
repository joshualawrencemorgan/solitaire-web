# CS 5288: Web-based System Architecture 
## Programming Assignment 6

## Overview

This is it!  In this assignment you will get to a complete web-based Klondike Solitaire application.  Let's get started...

You should submit a demo of your application as a video link (github, youtube, Brightspace, etc.) to Brightspace.

* 30% of your grade will be awarded based on a manual code review by the instructor
* 70% of your grade will be based on your demo and the application's functionality

* You are free to change, add or remove any code within your application.  All reused code (not recorded into package.json) must be attributed

### Here are the places to earn (or lose) points:

1. (30 points) Instructor code review.  Is it clean, well-structured, modular code.

1. (20 points) Enable modification of a user's profile.  Must be saved back to the DB and viewable immediately by anyone else the going to the user's profile page and within the user's own header component.

1. (30 points) Fully working "results" page.  Must display information for every move in a game.

1. (10 points) Recognize end of game, i.e. that there are no moves from piles to the stacks and that there are no useable moves from the discard pile to the stacks.  This recognition may ignore rearrangements of the piles that would result in new moves becoming available.  So, if end-of-game is recognized, prompt user if they want to end game.  The other possible end of game is that all cards have been successfully moved to the four foundation piles.

1. (10 points) Infinite undo and infinite redo.  Two UI buttons that let the user undo all moves back to the start of the game.  This will require new REST API endpoints to properly handle game state.  The redo stack should always be cleared if the user plays a new move.

1. (-10 points) Console is spewing any errors or warnings.  I like it clean people!


## Submission:

You must commit your code to your repo by the start of class on the due date.  Failure to do so will result in the loss of the 30 points from code review. 
