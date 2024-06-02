# README

## Secure Programming Assignment

### Overview
This repository contains a web-based solitaire game, originally developed as an assignment for a previous class. This project aims to enhance the original application by incorporating several security and coding standards. The updated application addresses the following requirements:
- Filtering/user input
- Countering injection attacks
- Implementing secure coding standards
- Proper error handling

### Features
1. **Filtering/User Input**: Ensures all user inputs are validated and sanitized to prevent any malicious data from being processed.
2. **Countering Injection Attacks**: Implements strategies to prevent various types of injection attacks, including SQL, HTML, and JavaScript injections.
3. **Secure Coding Standards**: Demonstrates secure coding practices by adhering to selected coding standards. Comments in the code highlight specific standards and practices used.
4. **Proper Error Handling**: Implements comprehensive error handling to manage exceptions and provide meaningful error messages without exposing sensitive information.

### Project Structure
```
├── src
│   ├── client
│   │   ├── components
│   │   │   ├── edit.js
│   │   │   ├── game-list.js
│   │   │   ├── game.js
│   │   │   ├── header.js
│   │   │   ├── history.js
│   │   │   ├── landing.js
│   │   │   ├── login.js
│   │   │   ├── logout.js
│   │   │   ├── pile.js
│   │   │   ├── profile.js
│   │   │   ├── register.js
│   │   │   ├── results.js
│   │   │   ├── shared.js
│   │   │   └── start.js
│   │   └── main.js
│   ├── server
│   │   ├── api
│   │   │   ├── index.cjs
│   │   │   └── v1
│   │   │       ├── game.cjs
│   │   │       ├── session.cjs
│   │   │       ├── user.cjs
│   │   │       └── validate.cjs
│   │   ├── base.pug
│   │   ├── index.cjs
│   │   ├── models
│   │   │   ├── card_state.cjs
│   │   │   ├── game.cjs
│   │   │   ├── move.cjs
│   │   │   └── user.cjs
│   │   └── solitare.cjs
│   └── shared
│       └── index.js
```

### How to Run
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/joshualawrencemorgan/solitaire-web
   ```
2. **Navigate to the Project Directory and Compile**:
   ```bash
   cd solitaire-web
   npm run build
   npm run start
   ```
3. **Open game in a browser**:
    ```txt
    navigate to the lookback address at port 8080 in any modern web browser to start playing the solitaire game.
    ```

*TODO
### Detailed Explanations

#### Filtering/User Input

#### Countering Injection Attacks


#### Secure Coding Standards


#### Proper Error Handling

### Conclusion
This enhanced version of the web-based solitaire game demonstrates an understanding of secure coding practices, user input validation, and error handling. By following established coding standards and implementing security measures, the application provides a more robust and secure user experience.

### Submission
The complete source code is included in this repository. Additions made for the Secure Programming assignment were prepended with a comment including an explanation as well as the string `CS6387`.

---

For any further questions or clarifications, feel free to contact me at [joshua.morgan@vanderbilt.edu].