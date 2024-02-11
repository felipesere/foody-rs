# Foody Attempt 2

* backend written in `Rust`
* frontend written in `Typescript`
* database in `PostgreSQL`


## Running

Make sure to install `just` (`brew intall just`).
Then you can run 

```sh
just pg-start # will start the dev and test databases

just pg-migrate development up
just pg-migrate test up 

just pg-seed test

just run # will launch the app
```
