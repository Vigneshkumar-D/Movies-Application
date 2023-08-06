const express = require("express");
const app = express();

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname,"moviesData.db");
app.use(express.json());
let db = null;

const initializeDbAndServer = async () => {
 try {
    db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });
  app.listen(3000, () => {
    console.log("Server Running at http://localhost:3000/");
  });
}
    catch (error) {
      console.log(`BD Error: ${error.message}`);
      process.exit(1);
    }
};

initializeDbAndServer();


// get Movies API

app.get("/movies/", async (request, response) => {
    const getMoviesQuery = `
    SELECT movie_name AS movieName
    FROM 
    movie`

    const dbResponse = await db.all(getMoviesQuery);
    response.send(dbResponse);
})

app.post("/movies/", async (request, response) => {
    const {directorId,
            movieName,
            leadActor} = request.body;

    const addMoviesQuery =`
    INSERT INTO movie (director_id, movie_name,lead_actor)

        VALUES ('${directorId}', '${movieName}', '${leadActor}');`;
        
        await db.run(addMoviesQuery);
        response.send("Movie Successfully Added");
                    
})

// get Movie on Id API

app.get("/movies/:movieId/", async(request, response) => {
    const { movieId } = request.params;

    const getMovieQuery = `
    SELECT
    *
    FROM
    movie
    WHERE movie_id = '${movieId}';`;
    
    const dbResponse = await db.get(getMovieQuery);
    const movieObject = {
        movieId: dbResponse.movie_id,
        directorId: dbResponse.director_id,
        movieName: dbResponse.movie_name,
        leadActor: dbResponse.lead_actor
        }        
     response.send(movieObject);
   
})

// update movies API

app.put("/movies/:movieId/", async(request, response) => {
    const { movieId } = request.params;
    const { directorId,
            movieName,
            leadActor} = request.body;

    const updateMovieQuery = `
    UPDATE movie
    SET director_id = '${directorId}', movie_name = '${movieName}', lead_actor = '${leadActor}'
    WHERE movie_id = '${movieId}';`;

    await db.run(updateMovieQuery);
    response.send("Movie Details Updated");

})

// delete movie API

app.delete("/movies/:movieId/", async(request, response) => {
    const { movieId } = request.params;

    const deleteMovieQuery = `
    DELETE
    FROM
    movie
    WHERE movie_id = '${movieId}';`;


    await db.run(deleteMovieQuery);
    response.send("Movie Removed")
})

// 
app.get("/directors/", async(request, response) => {
    const getDirectorQuery = `
    SELECT 
    *
    FROM 
    director;`
    const dbResponse = await db.all(getDirectorQuery);

    const dirList = []
    for (let director of dbResponse){
        const directorObject = {
            directorId: director.director_id,
            directorName: director.director_name
                }
        dirList.push(directorObject)
    }
    response.send(dirList);
})


app.get("/directors/:directorId/movies/", async(request, response) => {
     const { directorId } = request.params;
     
     const getDirMoviesQuery = `
     SELECT
     movie_name AS movieName
     FROM movie
     INNER JOIN director ON movie.director_id = director.director_id
     WHERE director.director_id = '${directorId}';`;

     const dbResponse = await db.all(getDirMoviesQuery);
response.send(dbResponse);    
})
module.exports =app; 



