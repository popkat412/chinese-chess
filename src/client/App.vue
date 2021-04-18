<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <router-view />
  </div>
</template>

<style>
/* ---------------
      GENERAL
   --------------- */
body {
  font-family: Arial, Helvetica, sans-serif;
  margin: 0px;
  padding: 0px;
  height: 100vh;
  width: 100vw;
}

#app {
  width: 100%;
  height: 100%;
}

.dimmed {
  filter: opacity(40%);
}

/* ---------------
       LANDING
   --------------- */
#landing-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}

@media (max-width: 800px) {
  .flex-container {
    flex-direction: column;
  }
}

.container {
  border: 1px solid black;
  border-radius: 10px;

  width: 30%;

  padding: 10px;
  margin: 10px;
}

.landing-button {
  width: 100%;
  box-sizing: border-box;
  margin-top: 10px;
}

/* ---------------
        GAME
   --------------- */

/* Grid */
#game-container {
  display: grid;
  grid-template-columns: 1fr 4fr 1fr;
  grid-template-areas:
    "header header  header"
    "left   canvas right"
    "left   canvas right"
    "footer footer  footer";
}

#game-container > header {
  grid-area: header;
  padding: 0px 10px 0px 10px;
  border-bottom: 1px solid gray;
}
#game-container > footer {
  grid-area: footer;
  padding: 0px 10px 0px 10px;
  border-top: 1px solid gray;
}
#left-sidebar {
  grid-area: left;
  padding: 10px;
  border-right: 1px solid gray;
}
#right-sidebar {
  grid-area: right;
  padding: 10px;
  border-left: 1px solid gray;
}
#canvas-container {
  grid-area: canvas;
}

/* Misc */
#game-container > header {
  display: flex;
  flex-direction: row;
}

/* Name labels */
#oppoennt-name {
  border-right: 1px solid gray;
  float: left;
  padding-right: 10px;
}

#my-name {
  border-left: 1px solid gray;
  float: right;
  padding-left: 10px;
}

/* Canvas */
#canvas-container {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
