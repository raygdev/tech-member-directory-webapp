# Casual_Coding_2.4. 
## What are we building?
This repository contains development code intended for the Member Profile Website of the Casual Coding Group.

The website intends to facilitate Casual Coding membership and collaboration for coding projects among members.

## Development
This App uses [NPM](https://www.npmjs.com/) Node Package Manager to manage it's dependencies and packages.

Developers should clone the repository and load the folder into Visual Studio Code.
To clone the master branch use ```git clone -b master [git url]```.

From the root directory run ```npm install``` to install all of the dependencies.

Remember to create a .env file and add ```node_modules``` along with any other values you might need.

A rudimentary deployment of the website is on the railway platform and can be accessed by https://casualcoding21-production.up.railway.app/.  

### Local Development with Docker

Instead of installing Node.js and MongoDB directly on your system, you can run the entire development environment inside **containers** using Docker.  

#### What Are Containers, and Why Use Them?  

Containers are lightweight, isolated environments that package everything your application needs to run—including code, dependencies, and configuration.  

**Benefits of using containers:**  
- **Consistency:** Ensures the app runs the same way on all systems, avoiding "it works on my machine" issues.  
- **Simplicity:** No need to manually install Node.js, MongoDB, or other dependencies on your machine.  
- **Easy Cleanup:** Containers can be stopped and removed without leaving behind system-wide changes.  

---

### Getting Started with Docker  

#### 1. Install Docker  
- The easiest way is to install **Docker Desktop**, which includes Docker Compose.  
- Alternatively, install Docker Engine and `docker-compose` separately.  

#### 2. (Optional) Install the VS Code Docker Extension  
- If you're using VS Code, this extension helps manage containers and images.  

#### 3. Run the Development Environment  
1. Follow the instructions in `docker-compose-local.yaml` to start and stop all containerized services.  
2. Once running:  
   - The Express server and MongoDB database will be containerized.  
   - Logs from both services will appear in the same terminal.  

#### 4. Stopping and Cleaning Up  
- To stop the containers:  
  ```sh
  docker-compose -f docker-compose-local.yaml down
  ```


### Docker Troubleshooting
If you think your code and configuration is correct, but the app or Mongo isn't working correctly, try one of the following: 
1. Run the following to rebuild Docker layers:
```
docker-compose up --build
```
2. Reset the environment volumes:
```
docker compose down -v
docker compose up
```


## Tech Stack
[mongoose]: https://mongoosejs.com/
[mongodb]: https://www.mongodb.com/atlas/database
[node.js]: http://nodejs.org
[express]: http://expressjs.com
[EJS]: http://ejs.co/
Authentication is implemented through the use of hashing, salting, Sessions, and Passport.
The website is built using Javascript and has a Mongo database, which stores three attributes for the user: email, project, and percent_done.

### GitHub workflow

- Creator: Create a new issue

- Dev: Pick an issue and assign it to themselves

- Dev: Make a branch named with the issue number and description

- Dev: Make and commit changes

- Dev: Create a pull request (PR)

- Creator: Review PR

- Creator: Request changes

- Dev: Complete requested changes, commit and submit PR

- Creator: Approve changes, request merge

- Dev: Merge PR

- Dev: Delete issue-specific branch

- Creator: Close issue

_Credit for list_ : **puffalo**
