UToken
========================

The project "utoken_api" is dedicated for building UToken's blockchain API. 
The following instructions detail how to clone the project in order to make modifications to it.

Requirements
------------
  * Node JS v12.16.2 or higher;
  * Express v4.17.1 or higher;
  * Web3 1.3.0 or higher;

Installation
------------
1. Fork, clone or download this repository.
2. Run `npm install` if its the initial setup or `npm update`.
```bash
$ cd utoken_api
$ npm install
```
3. Setup your DB with sequilize commands
```bash
$ npx sequelize-cli db:create 
$ npx sequelize-cli db:migrate 
```
    
4. Lunch the project with `nodemon index.js` or `node index.js`.
```bash
$ nodemon index.js
```