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


### Detailed Explanations

#### Filtering/User Input

Previously there was no input validation on user account lookups.
src\server\api\v1\user.cjs
```javascript
  app.head("/v1/user/:username", async (req, res) => {
    let user = await app.models.User.findOne({
      username: req.params.username.toLowerCase(),
    });
    if (!user)
      res.status(404).send({ error: `unknown user: ${req.params.username}` });
    else res.status(200).end();
  });
```
User account lookups, while they do not modify any data, still involve passing user-supplied strings to the MongoDB server. This process can expose the application to various security risks, such as injection attacks. To mitigate these risks and adhere to secure coding practices, several key changes have been implemented to enhance the security of user account lookups. These changes align with recommendations from the OWASP (Open Web Application Security Project) and other security guidelines.

OWASP Input Validation Cheat Sheet: This cheat sheet emphasizes that all inputs should be validated to ensure they are within the expected format. It recommends using whitelists for validation, which only allows characters that are explicitly permitted .
```javascript
app.head("/v1/user/:username", async (req, res) => {
  try {
    // Validate username input
    const username = req.params.username.toLowerCase();
    if (!username.match(/^[a-zA-Z0-9]+$/)) {
      return res.status(400).send({ error: "Invalid username format" });
    }
    ...
```

#### Proper Error Handling

Proper error handling prevents the exposure of sensitive information and provides a better user experience. The code now uses a try-catch block to handle any errors that occur during the user lookup process. This ensures that internal error details are not exposed to the client, and meaningful error messages are returned instead.
```javascript
  app.get("/v1/user/:username", async (req, res) => {
    try {
      // Validate username input
      const username = req.params.username.toLowerCase();
      // CS6387 do not allow queries on non-alphanumeric strings.
      // See readme for full explanation
      if (!username.match(/^[a-zA-Z0-9]+$/)) {
        return res.status(400).send({ error: "Invalid username format" });
      }
      // CS6387 look on now validated string
      let user = await app.models.User.findOne({ username: username });

      if (!user) {
        return res.status(404).send({ error: `unknown user: ${req.params.username}` });
      } else {
        return res.status(200).end();
      }
    } catch (err) {
      // Log error for monitoring
      console.error('Error querying user:', err);
      // CS6387 OWASP recommends to not expose internal error details to the client
      return res.status(500).send({ error: "Internal server error" });
    }
  });
```


#### Countering Injection Attacks
TODO

#### Secure Coding Standards
TODO


### Conclusion
This enhanced version of the web-based solitaire game demonstrates an understanding of secure coding practices, user input validation, and error handling. By following established coding standards and implementing security measures, the application provides a more robust and secure user experience.

### Submission
The complete source code is included in this repository. Additions made for the Secure Programming assignment were prepended with a comment including an explanation as well as the string `CS6387`.

---

For any further questions or clarifications, feel free to contact me at [joshua.morgan@vanderbilt.edu].

### References
OWASP Input Validation Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
OWASP Error Handling, Logging, and Intrusion Detection Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html
OWASP Rate Limiting Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Rate_Limiting_Cheat_Sheet.html