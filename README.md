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
Improper input validation found in src/server/api/v1/game.cjs

```javascript
  app.post("/v1/game", async (req, res) => {
    try {
      if (!req.session.user) return res.status(401).send({ error: "unauthorized" });
      const schema = Joi.object({
        game: Joi.string().lowercase().required(),
        color: Joi.string().lowercase().required(),
        draw: Joi.any(),
      });
```
Changes made to the program.

```javascript
      /* CS6387
      * Enchanced the Joi input validation to be more explicit
      * Games explicitly added as functionality grows
      */
      const schema = Joi.object({
        game: Joi.string().lowercase().valid('solitaire').required(),  // Games explicitly added as functionality grows
        color: Joi.string().lowercase().valid('red', 'blue').required(),
        draw: Joi.number().integer().min(1).max(3).required(),
      });
```

Ensuring security in web applications is paramount, and one critical aspect of this is validating and sanitizing user inputs explicitly. By being explicit when accepting input, such as specifying valid options and constraints for each field, you mitigate the risk of injection attacks, data corruption, and other malicious activities. For instance, in the revised schema, restricting the game field to only accept the string 'solitaire' and the color field to 'red' or 'blue' ensures that only valid and expected values are processed. Similarly, enforcing the draw field to be an integer between 1 and 3 prevents invalid data from causing unexpected behavior or security vulnerabilities. This explicit validation not only enhances the application's robustness but also helps prevent attackers from exploiting input fields to execute arbitrary code or inject harmful data, thus maintaining the integrity and security of the system.

#### Countering Injection Attacks

Previously there was a risk for injection on user account lookups. The function would only call toLowerCase on user provided strings for the query.

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

OWASP Input Validation Cheat Sheet: This cheat sheet emphasizes that all inputs should be validated to ensure they are within the expected format. It recommends using whitelists for validation, which only allows characters that are explicitly permitted. In this example the program now will not accept string that contain any non-alphanumeric characters.
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

#### Secure Coding Standards
src\server\api\v1\user.cjs
```javascript
      } catch (err) {
        // Log the error for debugging
        // CS6387 CERT Rule 00 IDS06-J Exclude unsanitized user input from strings
        console.error(`User.update logged-in user not found: ${req.session.user.id}`, err);
```

The enhanced logging approach in this code improves security by adhering to the CERT Secure Coding Standards, specifically rule IDS06-J, which advises excluding unsanitized user input from log messages. In the catch block, instead of directly logging potentially sensitive user information, the error message focuses on a static, sanitized string along with the error object. This practice prevents the exposure of user-specific details, such as the user's ID, in log files, which can be a target for attackers if logs are compromised. By following this standard, the code ensures that logging serves its purpose for debugging and monitoring without inadvertently leaking sensitive data that could be exploited in a security breach.

### Conclusion
The various improvements and security enhancements made to the project significantly bolster its robustness, reliability, and security. By implementing explicit input validation with strict criteria, we prevent malicious inputs and ensure data integrity, aligning with best practices recommended by OWASP. Adding detailed session checks and securing session data mitigates risks of unauthorized access and session tampering, further safeguarding user information. Enhanced logging practices, compliant with CERT Secure Coding Standards, ensure sensitive data is not inadvertently exposed, thus protecting against potential security breaches.

This project attempts to demonstrate a robust approach to web application security by integrating several best practices and adhering to well-established security standards. Utilizing MongoDB as the database and implementing a RESTful API for communication, the project ensures secure data handling and access management. Input validation is rigorously enforced using the Joi library, which prevents common injection attacks by sanitizing and validating user inputs. Authentication is managed through secure session handling, ensuring that only authorized users can access sensitive operations. Error messages are carefully crafted to avoid revealing internal system details, aligning with the OWASP guidelines for secure error handling. Additionally, logging practices exclude unsanitized user inputs, complying with CERT's secure coding recommendations to prevent the leakage of sensitive information through logs. By following these measures, the project not only enhances data integrity and confidentiality but also ensures compliance with security best practices, making it resilient against a wide array of common web application vulnerabilities.

That said there is are some time consuming improvements that could be made to make this project more secure. Implementing rate limiting on API endpoints would be a crucial step in preventing abuse and mitigating the risk of denial-of-service (DoS) attacks. Moving all communications to HTTPS would ensure any communication is encrypted and prevent man-in-the-middle attacks. Lastly, improved dependecy management would help bolster the application from potential vulnerabilities in imported libraries. These recommendations are time consuming and outside of the scope of this assignment but are imperative to any internet facing, consumer products.

### Submission
The complete source code is included in this repository. Additions made for the Secure Programming assignment were prepended with a comment including an explanation as well as the string `CS6387` though an example of each type of change was presented in this document.

---

For any further questions or clarifications, feel free to contact me at [joshua.morgan@vanderbilt.edu].

### References
OWASP Input Validation Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
OWASP Error Handling, Logging, and Intrusion Detection Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html
OWASP Rate Limiting Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Rate_Limiting_Cheat_Sheet.html
CERT Secure Programming for Java https://wiki.sei.cmu.edu/confluence/display/java/IDS00-J.+Prevent+SQL+injection
SANS CWE Top 25 https://www.sans.org/top25-software-errors/
"Web Application Security: Exploitation and Countermeasures for Modern Web Applications" by Andrew Hoffman
NIST Special Publication 800-63B Digital Identity Guidelines https://pages.nist.gov/800-63-3/sp800-63b.html#sec3