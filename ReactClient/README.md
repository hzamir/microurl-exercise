# ReactClient


## Build Instructions

The build for the client is triggered by the C# project. There is nothing else to do.

However, if you wish to build and run a live client interactively the following is necessary:
* `npm run dev` to start the development server (it will run in some other port)
* provide url prefix for all the api commands, (I was using this for development but removed it)
* the server's appsettings.yaml file must enable CORS (it's been disabled by default) to use server apis

> **Note:** Note the DockerFile is not complete. It has no section to guarantee npm builds.

## Accessing the Client
* Access the client by navigating to the server url (currently localhost:5000) until it changes.
* Currently, there is no UI screen to access the stats, it isn't exactly intended for end users

### How to get stats

The stats queries are available in the following flavors:
* http://localhost:5000/api/url/statistics - will retrieve all stats with no thought to ordering or grouping
* http://localhost:5000/api/url/statistics?sort=count - sorts aliases in descending order of access count
* http://localhost:5000/api/url/statistics?sort=alias - sorts aliases in alphabetical order
* http://localhost:5000/api/url/statistics?group=true - will consolidate all the aliases that point to the same url

## Tech Stack
* React: Per requirement. It uses React 18, the latest stable version of React
* Vite: The most popular and most current build system for lightweight react projects
* SWC Typescript: A Rust-built compiler, pulling in the fewest dependencies by far
* React-Router-Dom: 
   * a clean way to transition to alternate screens
   * works with browser history to go back to previous and next screens
* Styled-Components: 
   * encapsulates actual CSS scoped to React components
   * It isn't consistently used (for lack of time) there are some inline styles or declared object styles

> **Note:** React in general is about specifying components individually, 
> rather than creating layers that are determined by technology.
> For example, almost all idiomatic react code uses JSX syntax sugar to define component heirarchies.
> Styled-components merely completes the cycle for CSS, So components are encapsulated.

## Not used in this project
I have a system that I use for my own projects that I did not use here. Specifically, I did not use:
* Redux: I was concerned it would be overkill for the scope of the project, but I much prefer to use it than not
  * Specifically, my redux projects there is zero functionality to be found directly in any react code, it is all
    relegated to a separate purely functional layer
  * I can demonstrate in my redux based projects that:
     * the functional layer has no knowledge of either react or redux
     * the react layer has no knowledge of redux (a single file integrates the two)
     * the react layer has all of its non presentation logic injected as actions
